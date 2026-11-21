#import <XCTest/XCTest.h>
#import <WatchConnectivity/WatchConnectivity.h>
#import <objc/runtime.h>

// The module's header is private to its pod, so the tests reach the module through the runtime. These are the
// selectors under test.
typedef void (^ResolveBlock)(id result);
typedef void (^RejectBlock)(NSString *code, NSString *message, NSError *error);

@interface NSObject (WatchConnectivityModule)
- (NSNumber *)isSupported;
- (void)sessionDidDeactivate:(id)session;
- (void)session:(id)session activationDidCompleteWithState:(WCSessionActivationState)state error:(NSError *)error;
- (void)session:(id)session didReceiveApplicationContext:(NSDictionary *)applicationContext;
- (void)sendMessage:(NSDictionary *)message resolve:(ResolveBlock)resolve reject:(RejectBlock)reject;
- (void)sendMessageData:(NSString *)str encoding:(double)encoding resolve:(ResolveBlock)resolve reject:(RejectBlock)reject;
- (void)transferFile:(NSString *)url metaData:(NSDictionary *)metaData resolve:(ResolveBlock)resolve reject:(RejectBlock)reject;
- (void)updateApplicationContext:(NSDictionary *)context resolve:(ResolveBlock)resolve reject:(RejectBlock)reject;
- (void)getApplicationContext:(ResolveBlock)resolve reject:(RejectBlock)reject;
- (void)getReceivedApplicationContext:(ResolveBlock)resolve reject:(RejectBlock)reject;
- (void)addListener:(NSString *)eventName;
- (void)removeListeners:(double)count;
- (void)session:(id)session didReceiveMessage:(NSDictionary *)message;
- (void)session:(id)session didReceiveMessage:(NSDictionary *)message replyHandler:(void (^)(NSDictionary *))replyHandler;
- (void)replyToMessageWithId:(NSString *)messageId message:(NSDictionary *)message;
- (void)session:(id)session didReceiveUserInfo:(NSDictionary *)userInfo;
- (void)session:(id)session didReceiveFile:(id)file;
- (void)getQueuedUserInfo:(ResolveBlock)resolve reject:(RejectBlock)reject;
- (void)getQueuedFiles:(ResolveBlock)resolve reject:(RejectBlock)reject;
@end

// Stands in for WCSessionFile.
@interface FakeSessionFile : NSObject
@property (nonatomic, strong) NSURL *fileURL;
@property (nonatomic, copy) NSDictionary *metadata;
@end

@implementation FakeSessionFile
@end

static const void *kSentEventsKey = &kSentEventsKey;

// A subclass of the module that records the events it sends to JS. RCTEventEmitter asserts without a JS runtime.
static Class RecordingModuleClass(void) {
  static Class recordingClass;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    recordingClass = objc_allocateClassPair(NSClassFromString(@"WatchConnectivity"), "RecordingWatchConnectivity", 0);
    IMP send = imp_implementationWithBlock(^(id module, NSString *name, id body) {
      NSMutableArray *sent = objc_getAssociatedObject(module, kSentEventsKey);
      @synchronized(sent) {
        [sent addObject:@{@"name": name, @"body": body ?: [NSNull null]}];
      }
    });
    class_addMethod(recordingClass, @selector(sendEventWithName:body:), send, "v@:@@");
    objc_registerClassPair(recordingClass);
  });
  return recordingClass;
}

// Stands in for WCSession, which cannot be paired with a watch in a test.
@interface FakeSession : NSObject
@property (nonatomic) NSInteger activateCount;
@property (nonatomic) NSInteger updateApplicationContextCount;
@property (nonatomic, copy) NSDictionary *applicationContext;
@property (nonatomic, copy) NSDictionary *receivedApplicationContext;
@property (nonatomic, strong) NSError *updateError;
@property (nonatomic, strong) NSError *sendMessageError;
@property (nonatomic, getter=isPaired) BOOL paired;
@property (nonatomic, getter=isWatchAppInstalled) BOOL watchAppInstalled;
@property (nonatomic, getter=isReachable) BOOL reachable;
@end

@implementation FakeSession

- (void)activateSession {
  self.activateCount += 1;
}

- (BOOL)updateApplicationContext:(NSDictionary *)context error:(NSError **)error {
  self.updateApplicationContextCount += 1;
  if (self.updateError) {
    *error = self.updateError;
    return NO;
  }
  self.applicationContext = context;
  return YES;
}

- (void)sendMessage:(NSDictionary *)message
       replyHandler:(void (^)(NSDictionary *))replyHandler
       errorHandler:(void (^)(NSError *))errorHandler {
  if (self.sendMessageError) {
    errorHandler(self.sendMessageError);
  } else {
    replyHandler(@{@"ok": @YES});
  }
}

@end

@interface WatchConnectivityTests : XCTestCase
@property (nonatomic, strong) id module;
@property (nonatomic, strong) id realSession;
@property (nonatomic, strong) FakeSession *fakeSession;
@end

@implementation WatchConnectivityTests

- (void)setUp {
  XCTAssertNotNil(NSClassFromString(@"WatchConnectivity"), @"The WatchConnectivity module is not linked");
  self.module = [RecordingModuleClass() new];
  objc_setAssociatedObject(self.module, kSentEventsKey, [NSMutableArray array], OBJC_ASSOCIATION_RETAIN);
  self.realSession = [self.module valueForKey:@"session"];
  self.fakeSession = [FakeSession new];
  [self.module setValue:self.fakeSession forKey:@"session"];
}

- (void)tearDown {
  // The module removes its KVO observers from its session when it deallocates, so give the real one back.
  [self.module setValue:self.realSession forKey:@"session"];
  self.module = nil;
}

- (NSArray<NSDictionary *> *)pendingEvents {
  return [[self.module valueForKey:@"pendingEvents"] copy];
}

- (NSArray<NSString *> *)sentEventNames {
  NSMutableArray *sent = objc_getAssociatedObject(self.module, kSentEventsKey);
  @synchronized(sent) {
    return [[sent valueForKey:@"name"] copy];
  }
}

- (NSArray<NSString *> *)pendingEventNames {
  return [[self pendingEvents] valueForKey:@"name"];
}

- (NSError *)watchError:(WCErrorCode)code {
  return [NSError errorWithDomain:WCErrorDomain code:code userInfo:nil];
}

#pragma mark - isSupported

- (void)testIsSupportedMatchesWCSession {
  XCTAssertEqualObjects([self.module isSupported], @([WCSession isSupported]));
}

- (void)testSendsRejectInsteadOfHangingWhenUnsupported {
  [self.module setValue:nil forKey:@"session"];
  NSMutableArray<NSError *> *errors = [NSMutableArray array];
  RejectBlock reject = ^(NSString *code, NSString *message, NSError *error) {
    XCTAssertEqualObjects(code, @"7002");
    [errors addObject:error];
  };
  ResolveBlock resolve = ^(id result) {
    XCTFail(@"A send resolved without a session");
  };

  [self.module sendMessage:@{} resolve:resolve reject:reject];
  [self.module sendMessageData:@"a" encoding:4 resolve:resolve reject:reject];
  [self.module transferFile:@"file:///tmp/a" metaData:nil resolve:resolve reject:reject];
  [self.module updateApplicationContext:@{} resolve:resolve reject:reject];

  XCTAssertEqual(errors.count, 4u);
  for (NSError *error in errors) {
    XCTAssertEqualObjects(error.domain, WCErrorDomain);
    XCTAssertEqual(error.code, WCErrorCodeSessionNotSupported);
  }
}

#pragma mark - Application context

- (void)testReceivedContextIsReportedButNotSentBack {
  NSDictionary *context = @{@"from": @"watch"};

  [self.module session:self.fakeSession didReceiveApplicationContext:context];

  XCTAssertEqual(self.fakeSession.updateApplicationContextCount, 0);
  XCTAssertEqualObjects([self pendingEvents].lastObject, (@{@"name": @"WatchApplicationContextReceived", @"body": context}));
}

- (void)testReceivedContextIsReadFromTheReceivedProperty {
  self.fakeSession.applicationContext = @{@"from": @"phone"};
  self.fakeSession.receivedApplicationContext = @{@"from": @"watch"};
  __block id received;

  [self.module getReceivedApplicationContext:^(id result) { received = result; } reject:nil];

  XCTAssertEqualObjects(received, (@{@"from": @"watch"}));
}

- (void)testEmptyContextsResolveAsNull {
  self.fakeSession.applicationContext = @{};
  self.fakeSession.receivedApplicationContext = @{};
  __block id sent;
  __block id received;

  [self.module getApplicationContext:^(id result) { sent = result; } reject:nil];
  [self.module getReceivedApplicationContext:^(id result) { received = result; } reject:nil];

  XCTAssertEqualObjects(sent, [NSNull null]);
  XCTAssertEqualObjects(received, [NSNull null]);
}

- (void)testUpdatingTheContextResolves {
  __block BOOL isResolved = NO;

  [self.module updateApplicationContext:@{@"token": @"abc"}
                                resolve:^(id result) { isResolved = YES; }
                                 reject:^(NSString *code, NSString *message, NSError *error) {
                                   XCTFail(@"Rejected: %@", code);
                                 }];

  XCTAssertTrue(isResolved);
  XCTAssertEqualObjects(self.fakeSession.applicationContext, (@{@"token": @"abc"}));
}

- (void)testUpdatingTheContextRejectsWithTheSystemError {
  self.fakeSession.updateError = [self watchError:WCErrorCodePayloadUnsupportedTypes];
  __block NSString *rejectedCode;
  __block NSError *rejectedError;

  [self.module updateApplicationContext:@{@"token": @"abc"}
                                resolve:^(id result) { XCTFail(@"Resolved despite an error"); }
                                 reject:^(NSString *code, NSString *message, NSError *error) {
                                   rejectedCode = code;
                                   rejectedError = error;
                                 }];

  XCTAssertEqualObjects(rejectedCode, @"7010");
  XCTAssertEqualObjects(rejectedError.domain, WCErrorDomain);
  XCTAssertEqualObjects([self pendingEventNames].lastObject, @"WatchApplicationContextError");
}

#pragma mark - Typed errors

- (void)testSendMessageRejectsWithTheWatchConnectivityCodeAndDomain {
  self.fakeSession.sendMessageError = [self watchError:WCErrorCodeNotReachable];
  __block NSString *rejectedCode;
  __block NSError *rejectedError;

  [self.module sendMessage:@{}
                   resolve:^(id result) { XCTFail(@"Resolved despite an error"); }
                    reject:^(NSString *code, NSString *message, NSError *error) {
                      rejectedCode = code;
                      rejectedError = error;
                    }];

  XCTAssertEqualObjects(rejectedCode, @"7007");
  XCTAssertEqualObjects(rejectedError.domain, WCErrorDomain);
}

- (void)testActivationErrorsAreSentAsSerialisableDictionaries {
  [self.module session:self.fakeSession
      activationDidCompleteWithState:WCSessionActivationStateNotActivated
                               error:[self watchError:WCErrorCodeDeviceNotPaired]];

  NSDictionary *event = [self pendingEvents].lastObject;
  XCTAssertEqualObjects(event[@"name"], @"WatchActivationError");
  XCTAssertEqualObjects(event[@"body"][@"error"][@"code"], @(WCErrorCodeDeviceNotPaired));
  XCTAssertEqualObjects(event[@"body"][@"error"][@"domain"], WCErrorDomain);
  XCTAssertTrue([event[@"body"][@"error"][@"message"] isKindOfClass:[NSString class]]);
}

#pragma mark - Watch switching

- (void)testDeactivationReactivatesTheSessionForTheNewWatch {
  [self.module sessionDidDeactivate:self.fakeSession];

  XCTAssertEqual(self.fakeSession.activateCount, 1);
  XCTAssertEqualObjects([self pendingEventNames].lastObject, @"WatchSessionDidDeactivate");
}

- (void)testActivationReportsTheNewWatchState {
  self.fakeSession.paired = YES;
  self.fakeSession.watchAppInstalled = NO;
  self.fakeSession.reachable = NO;
  NSUInteger before = [self pendingEvents].count;

  [self.module session:self.fakeSession activationDidCompleteWithState:WCSessionActivationStateActivated error:nil];

  NSArray *events = [[self pendingEvents] subarrayWithRange:NSMakeRange(before, [self pendingEvents].count - before)];
  XCTAssertEqualObjects(events, (@[
    @{@"name": @"WatchPairStatusChanged", @"body": @{@"paired": @YES}},
    @{@"name": @"WatchInstallStatusChanged", @"body": @{@"installed": @NO}},
    @{@"name": @"WatchReachabilityChanged", @"body": @{@"reachability": @NO}},
  ]));
}

#pragma mark - Event buffering

- (void)testBufferedEventsWaitForAListenerOfTheirOwnName {
  [self.module session:self.fakeSession didReceiveMessage:@{@"hello": @"phone"}];

  [self.module addListener:@"WatchReachabilityChanged"];
  XCTAssertFalse([[self sentEventNames] containsObject:@"WatchReceiveMessage"]);
  XCTAssertTrue([[self pendingEventNames] containsObject:@"WatchReceiveMessage"]);

  [self.module addListener:@"WatchReceiveMessage"];
  XCTAssertEqualObjects([self sentEventNames], @[@"WatchReceiveMessage"]);
  XCTAssertFalse([[self pendingEventNames] containsObject:@"WatchReceiveMessage"]);
}

- (void)testEventsWithAListenerAreSentAtOnce {
  [self.module addListener:@"WatchReceiveMessage"];

  [self.module session:self.fakeSession didReceiveMessage:@{@"hello": @"phone"}];

  XCTAssertEqualObjects([self sentEventNames], @[@"WatchReceiveMessage"]);
  XCTAssertEqual([self pendingEvents].count, 0u);
}

- (void)testEventsBufferAgainOnceEveryListenerIsRemoved {
  [self.module addListener:@"WatchReceiveMessage"];
  [self.module removeListeners:1];

  [self.module session:self.fakeSession didReceiveMessage:@{@"hello": @"phone"}];

  XCTAssertEqual([self sentEventNames].count, 0u);
  XCTAssertEqualObjects([self pendingEventNames], @[@"WatchReceiveMessage"]);
}

- (void)testEventsFromTheSessionQueueDuringTheFirstListenerAreNeitherLostNorACrash {
  NSInteger count = 500;
  dispatch_group_t group = dispatch_group_create();
  dispatch_group_async(group, dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    for (NSInteger i = 0; i < count; i++) {
      [self.module session:self.fakeSession didReceiveMessage:@{@"n": @(i)}];
    }
  });
  dispatch_group_async(group, dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    for (NSInteger i = 0; i < 200; i++) {
      [self.module addListener:@"WatchReachabilityChanged"];
    }
    [self.module addListener:@"WatchReceiveMessage"];
  });
  dispatch_group_wait(group, DISPATCH_TIME_FOREVER);

  NSUInteger delivered = [[self sentEventNames] filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"SELF == 'WatchReceiveMessage'"]].count;
  NSUInteger stillBuffered = [[self pendingEventNames] filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"SELF == 'WatchReceiveMessage'"]].count;
  XCTAssertEqual(delivered, (NSUInteger)count);
  XCTAssertEqual(stillBuffered, 0u);
}

#pragma mark - Queues

- (void)testQueuedUserInfoResolvesTheItemsBeforeClearingThem {
  [self.module session:self.fakeSession didReceiveUserInfo:@{@"n": @1}];
  __block NSDictionary *queued;

  [self.module getQueuedUserInfo:^(id result) { queued = result; } reject:nil];

  XCTAssertEqual(queued.count, 1u);
  XCTAssertEqualObjects(queued.allValues.firstObject, (@{@"n": @1}));
}

- (void)testUserInfoReceivedInTheSameMillisecondIsAllQueued {
  for (NSInteger n = 0; n < 100; n++) {
    [self.module session:self.fakeSession didReceiveUserInfo:@{@"n": @(n)}];
  }
  __block NSDictionary *queued;

  [self.module getQueuedUserInfo:^(id result) { queued = result; } reject:nil];

  XCTAssertEqual(queued.count, 100u);
}

- (void)testQueuedFilesResolveTheItemsBeforeClearingThem {
  NSURL *url = [[NSURL fileURLWithPath:NSTemporaryDirectory()] URLByAppendingPathComponent:[NSUUID UUID].UUIDString];
  [@"hello" writeToURL:url atomically:YES encoding:NSUTF8StringEncoding error:nil];
  FakeSessionFile *file = [FakeSessionFile new];
  file.fileURL = url;
  file.metadata = @{@"kind": @"test"};
  [self.module session:self.fakeSession didReceiveFile:file];
  __block NSDictionary *queued;

  [self.module getQueuedFiles:^(id result) { queued = result; } reject:nil];

  XCTAssertEqual(queued.count, 1u);
  XCTAssertEqualObjects(queued.allValues.firstObject[@"metadata"], (@{@"kind": @"test"}));
}

#pragma mark - Reply handlers

- (void)testReplyHandlersAnswerOnceAndAreThenReleased {
  __block NSInteger replies = 0;
  [self.module session:self.fakeSession
     didReceiveMessage:@{@"q": @"?"}
          replyHandler:^(NSDictionary *reply) { replies += 1; }];
  NSString *messageId = [self pendingEvents].lastObject[@"body"][@"id"];

  [self.module replyToMessageWithId:messageId message:@{@"a": @"!"}];
  [self.module replyToMessageWithId:messageId message:@{@"a": @"!"}];

  XCTAssertEqual(replies, 1);
  XCTAssertEqual([[self.module valueForKey:@"replyHandlers"] count], 0u);
}

@end
