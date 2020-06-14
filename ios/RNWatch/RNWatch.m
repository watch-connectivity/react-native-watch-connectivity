#import "RNWatch.h"

// import RCTConvert.h
#if __has_include("RCTConvert.h")
#import "RCTConvert.h"
#elif __has_include(<React/RCTConvert.h>)

#import <React/RCTConvert.h>

#else
#import "React/RCTConvert.h"
#endif

// import RCTEventDispatcher.h
#if __has_include("RCTEventDispatcher.h")
#import "RCTEventDispatcher.h"
#elif __has_include(<React/RCTEventDispatcher.h>)

#import <React/RCTEventDispatcher.h>

#else
#import "React/RCTEventDispatcher.h"
#endif

static NSString *EVENT_FILE_TRANSFER_ERROR = @"WatchFileTransferError";
static NSString *EVENT_FILE_TRANSFER_FINISHED = @"WatchFileTransferFinished";
static NSString *EVENT_FILE_TRANSFER_STARTED = @"WatchFileTransferStarted";
static NSString *EVENT_FILE_TRANSFER_PROGRESS = @"WatchFileTransferProgress";
static NSString *EVENT_RECEIVE_MESSAGE = @"WatchReceiveMessage";
static NSString *EVENT_RECEIVE_MESSAGE_DATA = @"WatchReceiveMessageData";
static NSString *EVENT_WATCH_STATE_CHANGED = @"WatchStateChanged";
static NSString *EVENT_ACTIVATION_ERROR = @"WatchActivationError";
static NSString *EVENT_WATCH_REACHABILITY_CHANGED = @"WatchReachabilityChanged";
static NSString *EVENT_WATCH_USER_INFO_RECEIVED = @"WatchUserInfoReceived";
static NSString *EVENT_APPLICATION_CONTEXT_RECEIVED = @"WatchApplicationContextReceived";
static NSString *EVENT_SESSION_DID_DEACTIVATE = @"WatchSessionDidDeactivate";
static NSString *EVENT_SESSION_BECAME_INACTIVE = @"WatchSessionBecameInactive";

static RNWatch *sharedInstance;

@implementation RNWatch

RCT_EXPORT_MODULE()

////////////////////////////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////////////////////////////

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

+ (RNWatch *)sharedInstance {
    return sharedInstance;
}

- (instancetype)init {
    sharedInstance = [super init];
    self.replyHandlers = [NSCache new];
    self.transfers = [NSMutableDictionary new];
    self.userInfo = [NSMutableDictionary new];

    if ([WCSession isSupported]) {
        WCSession *session = [WCSession defaultSession];
        session.delegate = self;
        self.session = session;
        [self.session activateSession];
    }

    return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
      EVENT_FILE_TRANSFER_ERROR,
      EVENT_FILE_TRANSFER_FINISHED,
      EVENT_FILE_TRANSFER_PROGRESS,
      EVENT_FILE_TRANSFER_STARTED,
      EVENT_RECEIVE_MESSAGE,
      EVENT_RECEIVE_MESSAGE_DATA,
      EVENT_WATCH_STATE_CHANGED,
      EVENT_ACTIVATION_ERROR,
      EVENT_WATCH_REACHABILITY_CHANGED,
      EVENT_WATCH_USER_INFO_RECEIVED,
      EVENT_APPLICATION_CONTEXT_RECEIVED
    ];
}

////////////////////////////////////////////////////////////////////////////////
// Session State
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getSessionState:
    (RCTResponseSenderBlock) callback) {
    WCSessionActivationState state = self.session.activationState;
    NSString *stateString = [self _getStateString:state];
    callback(@[stateString]);
}

////////////////////////////////////////////////////////////////////////////////

- (void)sessionWatchStateDidChange:(WCSession *)session {
    WCSessionActivationState state = session.activationState;
    [self _sendStateEvent:state];
}

////////////////////////////////////////////////////////////////////////////////

- (void)               session:(WCSession *)session
activationDidCompleteWithState:(WCSessionActivationState)activationState
                         error:(NSError *)error {
    if (error) {
        [self dispatchEventWithName:EVENT_ACTIVATION_ERROR body:@{@"error": error}];
    }
    [self _sendStateEvent:session.activationState];
}

- (void)sessionDidDeactivate:(WCSession *)session {
    [self dispatchEventWithName:EVENT_SESSION_DID_DEACTIVATE body:@{}];
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
    [self dispatchEventWithName:EVENT_SESSION_BECAME_INACTIVE body:@{}];
}

////////////////////////////////////////////////////////////////////////////////

- (NSString *)_getStateString:(WCSessionActivationState)state {
    NSString *stateString;
    switch (state) {
        case WCSessionActivationStateNotActivated:
            stateString = @"WCSessionActivationStateNotActivated";
            break;
        case WCSessionActivationStateInactive:
            stateString = @"WCSessionActivationStateInactive";
            break;
        case WCSessionActivationStateActivated:
            stateString = @"WCSessionActivationStateActivated";
            break;
    }
    return stateString;
}

////////////////////////////////////////////////////////////////////////////////

- (void)_sendStateEvent:(WCSessionActivationState)state {
    NSString *stateString = [self _getStateString:state];
    [self dispatchEventWithName:EVENT_WATCH_STATE_CHANGED body:@{@"state": stateString}];
}

////////////////////////////////////////////////////////////////////////////////
// Complication User Info
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(transferCurrentComplicationUserInfo:
    (NSDictionary<NSString *, id> *) userInfo) {
    [self.session transferCurrentComplicationUserInfo:userInfo];
}



////////////////////////////////////////////////////////////////////////////////
// Reachability
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getReachability:
    (RCTResponseSenderBlock) callback) {
    callback(@[@(self.session.reachable)]);
}

////////////////////////////////////////////////////////////////////////////////

- (void)sessionReachabilityDidChange:(WCSession *)session {
    BOOL reachable = session.reachable;
    [self dispatchEventWithName:EVENT_WATCH_REACHABILITY_CHANGED body:@{@"reachability": @(reachable)}];
}

////////////////////////////////////////////////////////////////////////////////
// isPaired
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getIsPaired:
    (RCTResponseSenderBlock) callback) {
    callback(@[@(self.session.isPaired)]);
}

////////////////////////////////////////////////////////////////////////////////
// isWatchAppInstalled
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getIsWatchAppInstalled:
    (RCTResponseSenderBlock) callback) {
    callback(@[@(self.session.isWatchAppInstalled)]);
}

////////////////////////////////////////////////////////////////////////////////
// Messages
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(sendMessage:
    (NSDictionary *) message
            reply:
            (RCTResponseSenderBlock) replyCallback
            error:
            (RCTResponseErrorBlock) errorCallback) {
    __block BOOL replied = false;
    [self.session
          sendMessage:message
           replyHandler:^(NSDictionary<NSString *, id> *_Nonnull replyMessage) {
                         if (!replied) { // prevent Illegal callback invocation
                             replyCallback(@[replyMessage]);
                             replied = true;
                         }
                     }
                   errorHandler:^(NSError *_Nonnull error) {
                         if (!replied) { // prevent Illegal callback invocation
                             errorCallback(error);
                             replied = true;
                         }
                     }
        ];
}

////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(replyToMessageWithId:
    (NSString *) messageId
            withMessage:
            (NSDictionary<NSString *, id> *) message) {
    void (^replyHandler)(NSDictionary<NSString *, id> *_Nonnull)
    = [self.replyHandlers objectForKey:messageId];
    replyHandler(message);
}

////////////////////////////////////////////////////////////////////////////////

- (void)  session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *, id> *)message {
    [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE body:message];
}

////////////////////////////////////////////////////////////////////////////////

- (void)  session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *, id> *)message
     replyHandler:(void (^)(NSDictionary<NSString *, id> *_Nonnull))replyHandler {
    NSString *messageId = [self uuidString];
    NSMutableDictionary *mutableMessage = [message mutableCopy];
    mutableMessage[@"id"] = messageId;
    [self.replyHandlers setObject:replyHandler forKey:messageId];
    [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE body:mutableMessage];
}

////////////////////////////////////////////////////////////////////////////////
// Message Data
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(sendMessageData:
    (NSString *) str
            encoding:
            (nonnull NSNumber*)encoding
        replyCallback:(RCTResponseSenderBlock)replyCallback
        error:(RCTResponseErrorBlock) errorCallback) {
    NSData *data = [str dataUsingEncoding:(NSStringEncoding) [encoding integerValue]];
    [self.session sendMessageData:data replyHandler:^(NSData *_Nonnull replyMessageData) {
        NSString *responseData = [replyMessageData base64EncodedStringWithOptions:0];
        replyCallback(@[responseData]);
    }                errorHandler:^(NSError *_Nonnull error) {
        errorCallback(error);
    }];
}

////////////////////////////////////////////////////////////////////////////////

- (void)      session:(WCSession *)session
didReceiveMessageData:(NSData *)messageData
         replyHandler:(void (^)(NSData *_Nonnull))replyHandler {
    [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE_DATA body:@{@"data": messageData}];
}

////////////////////////////////////////////////////////////////////////////////
// Files
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(transferFile:
    (NSString *) url
            metaData:
            (nullable NSDictionary<NSString *, id> *)metaData
        callback:(RCTResponseSenderBlock) callback) {
    double startTime = [self getJavascriptStyleTimestamp];

    NSMutableDictionary *mutableMetaData;
    if (metaData) {
        mutableMetaData = [metaData mutableCopy];
    } else {
        mutableMetaData = [NSMutableDictionary new];
    }
    NSString *uuid = [self uuidString];
    mutableMetaData[@"id"] = uuid;
    WCSessionFileTransfer *transfer = [self.session transferFile:[NSURL URLWithString:url] metadata:mutableMetaData];

    NSDictionary *transferInfo = [NSMutableDictionary dictionaryWithDictionary:@{
            @"transfer": transfer,
            @"id": uuid, @"uri": url,
            @"metadata": metaData,
            @"startTime": @(startTime),
            @"endTime": [NSNull null],
            @"error": [NSNull null]
    }];

    self.transfers[uuid] = transferInfo;

    [self observeTransferProgress:transfer];

    NSDictionary *eventBody = [self getProgressPayload:transfer];

    [self dispatchEventWithName:EVENT_FILE_TRANSFER_STARTED body:eventBody];

    callback(@[eventBody]);
}

- (void)observeTransferProgress:(WCSessionFileTransfer *)transfer {
    [transfer addObserver:self forKeyPath:@"progress.fractionCompleted" options:NSKeyValueObservingOptionNew context:nil];
    [transfer addObserver:self forKeyPath:@"progress.completedUnitCount" options:NSKeyValueObservingOptionNew context:nil];
    [transfer addObserver:self forKeyPath:@"progress.estimatedTimeRemaining" options:NSKeyValueObservingOptionNew context:nil];
    [transfer addObserver:self forKeyPath:@"progress.throughput" options:NSKeyValueObservingOptionNew context:nil];
}

RCT_EXPORT_METHOD(getFileTransfers:
    (RCTResponseSenderBlock) callback) {
    NSMutableDictionary *transfers = self.transfers;
    NSMutableDictionary *payload = [NSMutableDictionary new];

    for (NSString *transferId in transfers) {
        NSDictionary *transferInfo = transfers[transferId];
        WCSessionFileTransfer *fileTransfer = transferInfo[@"transfer"];
        NSDictionary *progressPayload = [self getProgressPayload:fileTransfer];
        payload[transferId] = progressPayload;
    }

    callback(@[payload]);
}

- (NSDictionary *)getProgressPayload:(WCSessionFileTransfer *)transfer {
    NSString *uuid = transfer.file.metadata[@"id"];

    NSDictionary *transferInfo = self.transfers[uuid];

    NSNumber *_Nonnull completedUnitCount = @(transfer.progress.completedUnitCount);

    NS_REFINED_FOR_SWIFT NSNumber *estimatedTimeRemaining = transfer.progress.estimatedTimeRemaining;

    NSNumber *_Nonnull fractionCompleted = @(transfer.progress.fractionCompleted);

    NS_REFINED_FOR_SWIFT NSNumber *throughput = transfer.progress.throughput;

    NSNumber *_Nonnull totalUnitCount = @(transfer.progress.totalUnitCount);

    NSDictionary *body = @{
            @"completedUnitCount": completedUnitCount,
            @"estimatedTimeRemaining": estimatedTimeRemaining == nil ? [NSNull null] : estimatedTimeRemaining,
            @"id": uuid,
            @"fractionCompleted": fractionCompleted,
            @"throughput": throughput == nil ? [NSNull null] : throughput,
            @"totalUnitCount": totalUnitCount,
            @"uri": transferInfo[@"uri"],
            @"error": transferInfo[@"error"],
            @"metadata": transferInfo[@"metadata"],
            @"startTime": transferInfo[@"startTime"],
            @"endTime": transferInfo[@"endTime"]
    };
    return body;
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey, id> *)change context:(void *)context {

    if ([keyPath hasPrefix:@"progress"]) {
        WCSessionFileTransfer *transfer = object;

        NSDictionary *body = [self getProgressPayload:transfer];

        [self dispatchEventWithName:EVENT_FILE_TRANSFER_PROGRESS body:body];
    }
}

- (void)session:(WCSession *)session
 didReceiveFile:(WCSessionFile *)file {
    // TODO
}

- (void)      session:(WCSession *)session
didFinishFileTransfer:(WCSessionFileTransfer *)fileTransfer
                error:(NSError *)error {
    double endTime = [self getJavascriptStyleTimestamp];

    WCSessionFile *file = fileTransfer.file;
    NSDictionary<NSString *, id> *metadata = file.metadata;
    NSString *transferId = metadata[@"id"];
    if (transferId) {
        NSMutableDictionary *transferInfo = self.transfers[transferId];

        transferInfo[@"endTime"] = @(endTime);

        if (transferInfo) {
            if (error) {
                transferInfo[@"error"] = error;
                NSDictionary *payload = [self getProgressPayload:fileTransfer];
                [self dispatchEventWithName:EVENT_FILE_TRANSFER_ERROR body:payload];
            } else {
                NSDictionary *payload = [self getProgressPayload:fileTransfer];
                [self dispatchEventWithName:EVENT_FILE_TRANSFER_FINISHED body:payload];
            }

            WCSessionFileTransfer *transfer = transferInfo[@"transfer"];
            [transfer removeObserver:self forKeyPath:@"progress.fractionCompleted"];
            [transfer removeObserver:self forKeyPath:@"progress.completedUnitCount"];
            [transfer removeObserver:self forKeyPath:@"progress.estimatedTimeRemaining"];
            [transfer removeObserver:self forKeyPath:@"progress.throughput"];
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
// Context
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(updateApplicationContext:
    (NSDictionary<NSString *, id> *) context) {
    [self.session updateApplicationContext:context error:nil];
}

////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getApplicationContext:
    (RCTResponseSenderBlock) callback) {
    NSDictionary<NSString *, id> *applicationContext = self.session.applicationContext;
    if (applicationContext == nil) {
        callback(@[[NSNull null]]);
    } else {
        callback(@[applicationContext]);
    }
}

////////////////////////////////////////////////////////////////////////////////

- (void)             session:(WCSession *)session
didReceiveApplicationContext:(NSDictionary<NSString *, id> *)applicationContext {
    [self.session updateApplicationContext:applicationContext error:nil];
    [self dispatchEventWithName:EVENT_APPLICATION_CONTEXT_RECEIVED body:applicationContext];
}

////////////////////////////////////////////////////////////////////////////////
// User Info
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getUserInfo:
    (RCTResponseSenderBlock) callback) {
    callback(@[self.userInfo]);
}

RCT_EXPORT_METHOD(transferUserInfo:
    (NSDictionary<NSString *, id> *) userInfo) {
    [self.session transferUserInfo:userInfo];
}

RCT_EXPORT_METHOD(clearUserInfoQueue:
    (RCTResponseSenderBlock) callback) {
    self.userInfo = [NSMutableDictionary new];
    [self dispatchEventWithName:EVENT_WATCH_USER_INFO_RECEIVED body:self.userInfo];
    callback(@[self.userInfo]);
}

RCT_EXPORT_METHOD(dequeueUserInfo:
    (NSArray<NSString *> *) ids withCallback:
    (RCTResponseSenderBlock) callback) {
    for (NSString *ident in ids) {
        [self.userInfo removeObjectForKey:ident];
    }
    [self dispatchEventWithName:EVENT_WATCH_USER_INFO_RECEIVED body:self.userInfo];
    callback(@[self.userInfo]);
}

- (void)session:(WCSession *)session didFinishUserInfoTransfer:(WCSessionUserInfoTransfer *)userInfoTransfer error:(NSError *)error {
    // TODO
}

- (double)getJavascriptStyleTimestamp {
    double ts = floor([[NSDate date] timeIntervalSince1970] * 1000);
    return ts;
}

- (void)   session:(WCSession *)session
didReceiveUserInfo:(NSDictionary<NSString *, id> *)userInfo {
    double ts = [self getJavascriptStyleTimestamp]; // javascript style timestamp (ms since epoch)
    NSString *timestamp = [@(ts) stringValue];
    [self.userInfo setValue:userInfo forKey:timestamp];
    [self dispatchEventWithName:EVENT_WATCH_USER_INFO_RECEIVED body:@{@"userInfo": userInfo, @"timestamp": @(ts), @"id": timestamp}];
}

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

- (void)dispatchEventWithName:(NSString *)name
                         body:(NSDictionary<NSString *, id> *)body {
    [self sendEventWithName:name body:body];
}

////////////////////////////////////////////////////////////////////////////////

- (NSString *)uuidString {
    CFUUIDRef uuid = CFUUIDCreate(kCFAllocatorDefault);
    NSString *uuidString = (__bridge_transfer NSString *) CFUUIDCreateString(kCFAllocatorDefault, uuid);
    CFRelease(uuid);
    return uuidString;
}

////////////////////////////////////////////////////////////////////////////////



@end
