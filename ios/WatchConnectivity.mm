#import "WatchConnectivity.h"
#import "FileTransferInfo.h"
#import "FileTransferEvent.h"
#import "util.h"

#import <WatchConnectivity/WCSession.h>
#import <WatchConnectivity/WCSessionFile.h>
#import <WatchConnectivity/WCSessionUserInfoTransfer.h>
#import <React/RCTConvert.h>
#import <WatchConnectivitySpec/WatchConnectivitySpec.h>

@interface WatchConnectivity () <NativeWatchConnectivitySpec, WCSessionDelegate>
@end

static NSString *EVENT_FILE_TRANSFER = @"WatchFileTransfer";
static NSString *EVENT_WATCH_FILE_RECEIVED = @"WatchFileReceived";
static NSString *EVENT_WATCH_FILE_ERROR = @"WatchFileError";
static NSString *EVENT_RECEIVE_MESSAGE = @"WatchReceiveMessage";
static NSString *EVENT_RECEIVE_MESSAGE_DATA = @"WatchReceiveMessageData";
static NSString *EVENT_ACTIVATION_ERROR = @"WatchActivationError";
static NSString *EVENT_WATCH_REACHABILITY_CHANGED = @"WatchReachabilityChanged";
static NSString *EVENT_WATCH_USER_INFO_RECEIVED = @"WatchUserInfoReceived";
static NSString *EVENT_APPLICATION_CONTEXT_RECEIVED = @"WatchApplicationContextReceived";
static NSString *EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR = @"WatchApplicationContextReceivedError";
static NSString *EVENT_SESSION_DID_DEACTIVATE = @"WatchSessionDidDeactivate";
static NSString *EVENT_SESSION_BECAME_INACTIVE = @"WatchSessionBecameInactive";
static NSString *EVENT_PAIR_STATUS_CHANGED = @"WatchPairStatusChanged";
static NSString *EVENT_INSTALL_STATUS_CHANGED = @"WatchInstallStatusChanged";
static NSString *EVENT_WATCH_USER_INFO_ERROR = @"WatchUserInfoError";
static NSString *EVENT_WATCH_APPLICATION_CONTEXT_ERROR = @"WatchApplicationContextError";

static WatchConnectivity *sharedInstance;

@implementation WatchConnectivity {
  BOOL hasObservers;
  NSMutableArray<NSDictionary *> *pendingEvents;
}

+ (NSString *)moduleName
{
  return @"WatchConnectivity";
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

+ (WatchConnectivity *)sharedInstance {
  return sharedInstance;
}

- (instancetype)init {
  sharedInstance = [super init];
  self.replyHandlers = [NSCache new];
  self.fileTransfers = [NSMutableDictionary new];
  self.queuedFiles = [NSMutableDictionary new];
  self.queuedUserInfo = [NSMutableDictionary new];

  hasObservers = NO;
  pendingEvents = [NSMutableArray array];

  if ([WCSession isSupported]) {
    WCSession *session = [WCSession defaultSession];
    session.delegate = self;
    self.session = session;
    [self.session activateSession];
    [self.session addObserver:self forKeyPath:@"paired" options:NSKeyValueObservingOptionNew context:nil];
    [self.session addObserver:self forKeyPath:@"watchAppInstalled" options:NSKeyValueObservingOptionNew context:nil];
  }

  return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    EVENT_FILE_TRANSFER,
    EVENT_WATCH_FILE_RECEIVED,
    EVENT_WATCH_FILE_ERROR,
    EVENT_RECEIVE_MESSAGE,
    EVENT_RECEIVE_MESSAGE_DATA,
    EVENT_ACTIVATION_ERROR,
    EVENT_WATCH_REACHABILITY_CHANGED,
    EVENT_WATCH_USER_INFO_RECEIVED,
    EVENT_APPLICATION_CONTEXT_RECEIVED,
    EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR,
    EVENT_PAIR_STATUS_CHANGED,
    EVENT_INSTALL_STATUS_CHANGED,
    EVENT_SESSION_BECAME_INACTIVE,
    EVENT_SESSION_DID_DEACTIVATE,
    EVENT_WATCH_USER_INFO_ERROR,
    EVENT_WATCH_APPLICATION_CONTEXT_ERROR
  ];
}

- (void)startObserving {
  hasObservers = YES;

  for (NSDictionary *event in pendingEvents) {
    [self sendEventWithName:[event objectForKey:@"name"] body:[event objectForKey:@"body"]];
  }
  [pendingEvents removeAllObjects];
}

- (void)stopObserving {
  hasObservers = NO;
}

- (void)dealloc {
  if ([WCSession isSupported]) {
    [self.session removeObserver:self forKeyPath:@"paired" context:nil];
    [self.session removeObserver:self forKeyPath:@"watchAppInstalled" context:nil];
  }
}

#pragma mark - TurboModule

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeWatchConnectivitySpecJSI>(params);
}

#pragma mark - WCSessionDelegate

- (void)               session:(WCSession *)session
activationDidCompleteWithState:(WCSessionActivationState)activationState
                         error:(NSError *)error {
  if (error) {
    [self dispatchEventWithName:EVENT_ACTIVATION_ERROR body:@{@"error": dictionaryFromError(error)}];
  }
}

- (void)sessionDidDeactivate:(WCSession *)session {
  [self dispatchEventWithName:EVENT_SESSION_DID_DEACTIVATE body:@{}];
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
  [self dispatchEventWithName:EVENT_SESSION_BECAME_INACTIVE body:@{}];
}

#pragma mark - Complication User Info

- (void)transferCurrentComplicationUserInfo:(NSDictionary *)userInfo {
  [self.session transferCurrentComplicationUserInfo:userInfo];
}

#pragma mark - Reachability

- (void)getReachability:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  resolve(@(self.session.reachable));
}

- (void)sessionReachabilityDidChange:(WCSession *)session {
  BOOL reachable = session.reachable;
  [self dispatchEventWithName:EVENT_WATCH_REACHABILITY_CHANGED body:@{@"reachability": @(reachable)}];
}

#pragma mark - isPaired

- (void)getIsPaired:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  resolve(@(self.session.isPaired));
}

#pragma mark - isWatchAppInstalled

- (void)getIsWatchAppInstalled:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  resolve(@(self.session.isWatchAppInstalled));
}

#pragma mark - Messages

- (void)sendMessage:(NSDictionary *)message
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [self.session
      sendMessage:message
     replyHandler:^(NSDictionary<NSString *, id> *_Nonnull replyMessage) {
       resolve(replyMessage);
     }
     errorHandler:^(NSError *_Nonnull error) {
       reject([@(error.code) stringValue], error.localizedDescription, error);
     }
  ];
}

- (void)replyToMessageWithId:(NSString *)messageId
                     message:(NSDictionary *)message {
  void (^replyHandler)(NSDictionary<NSString *, id> *_Nonnull)
      = [self.replyHandlers objectForKey:messageId];
  if (replyHandler != nil) {
    replyHandler(message);
  }
}

- (void)  session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *, id> *)message {
  [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE body:message];
}

- (void)  session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *, id> *)message
     replyHandler:(void (^)(NSDictionary<NSString *, id> *_Nonnull))replyHandler {
  NSString *messageId = uuid();
  NSMutableDictionary *mutableMessage = [message mutableCopy];
  mutableMessage[@"id"] = messageId;
  [self.replyHandlers setObject:replyHandler forKey:messageId];

  [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE body:mutableMessage];
}

#pragma mark - Message Data

- (void)sendMessageData:(NSString *)str
               encoding:(double)encoding
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  NSData *data = [str dataUsingEncoding:(NSStringEncoding)[@(encoding) integerValue]];
  [self.session sendMessageData:data
                   replyHandler:^(NSData *_Nonnull replyMessageData) {
                     NSString *responseData = [replyMessageData base64EncodedStringWithOptions:0];
                     resolve(responseData);
                   }
                   errorHandler:^(NSError *_Nonnull error) {
                     reject([@(error.code) stringValue], error.localizedDescription, error);
                   }];
}

- (void)      session:(WCSession *)session
didReceiveMessageData:(NSData *)messageData
         replyHandler:(void (^)(NSData *_Nonnull))replyHandler {
  [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE_DATA body:@{@"data": messageData}];
}

#pragma mark - Files

- (void)transferFile:(NSString *)url
            metaData:(NSDictionary *)metaData
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  double startTime = jsTimestamp();

  NSMutableDictionary *mutableMetaData;
  if (metaData) {
    mutableMetaData = [metaData mutableCopy];
  } else {
    mutableMetaData = [NSMutableDictionary new];
  }
  NSString *transferId = uuid();
  mutableMetaData[@"id"] = transferId;
  WCSessionFileTransfer *transfer = [self.session transferFile:[NSURL URLWithString:url] metadata:mutableMetaData];

  [self initialiseTransferInfoWithURL:url metaData:metaData startTime:startTime id:transferId transfer:transfer];

  FileTransferEvent *event = [self getFileTransferEvent:transfer];

  [self dispatchEventWithName:EVENT_FILE_TRANSFER body:[event serializeWithEventType:FILE_EVENT_STARTED]];

  resolve(transferId);
}

- (void)initialiseTransferInfoWithURL:(NSString *)url metaData:(NSDictionary *)metaData startTime:(double)startTime id:(NSString *)transferId transfer:(WCSessionFileTransfer *)transfer {
  FileTransferInfo *info = [FileTransferInfo new];

  info.transfer = transfer;
  info.id = transferId;
  info.uri = url;
  info.metaData = metaData;
  info.startTime = @(startTime);

  self.fileTransfers[transferId] = info;

  [self observeTransferProgress:transfer];
}

- (void)observeTransferProgress:(WCSessionFileTransfer *)transfer {
  [transfer addObserver:self forKeyPath:@"progress.fractionCompleted" options:NSKeyValueObservingOptionNew context:nil];
  [transfer addObserver:self forKeyPath:@"progress.completedUnitCount" options:NSKeyValueObservingOptionNew context:nil];
  [transfer addObserver:self forKeyPath:@"progress.estimatedTimeRemaining" options:NSKeyValueObservingOptionNew context:nil];
  [transfer addObserver:self forKeyPath:@"progress.throughput" options:NSKeyValueObservingOptionNew context:nil];
}

- (void)getFileTransfers:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *transfers = self.fileTransfers;
  NSMutableDictionary *payload = [NSMutableDictionary new];

  for (NSString *transferId in transfers) {
    FileTransferInfo *transferInfo = transfers[transferId];
    WCSessionFileTransfer *fileTransfer = transferInfo.transfer;
    FileTransferEvent *event = [self getFileTransferEvent:fileTransfer];
    payload[transferId] = [event serialize];
  }

  resolve(payload);
}

- (void)getQueuedFiles:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  resolve(self.queuedFiles);
  [self.queuedFiles removeAllObjects];
}

- (void)clearFilesQueue:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  self.queuedFiles = [NSMutableDictionary new];
  resolve([NSNull null]);
}

- (void)dequeueFile:(NSArray<NSString *> *)ids {
  for (NSString *fileId in ids) {
    [self.queuedFiles removeObjectForKey:fileId];
  }

  if (!ids || !ids.count) {
    [self dispatchEventWithName:EVENT_WATCH_FILE_RECEIVED body:self.queuedFiles];
  }
}

- (FileTransferEvent *)getFileTransferEvent:(WCSessionFileTransfer *)transfer {
  NSString *transferUuid = transfer.file.metadata[@"id"];

  FileTransferInfo *transferInfo = self.fileTransfers[transferUuid];

  NSNumber *_Nonnull completedUnitCount = @(transfer.progress.completedUnitCount);
  NSNumber *estimatedTimeRemaining = transfer.progress.estimatedTimeRemaining;
  NSNumber *_Nonnull fractionCompleted = @(transfer.progress.fractionCompleted);
  NSNumber *throughput = transfer.progress.throughput;
  NSNumber *_Nonnull totalUnitCount = @(transfer.progress.totalUnitCount);

  FileTransferEvent *event = [[FileTransferEvent alloc] initWithTransferInfo:transferInfo];

  event.bytesTransferred = completedUnitCount;
  event.estimatedTimeRemaining = estimatedTimeRemaining;
  event.id = transferUuid;
  event.fractionCompleted = fractionCompleted;
  event.throughput = throughput;
  event.bytesTotal = totalUnitCount;

  return event;
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey, id> *)change context:(void *)context {
  if ([keyPath hasPrefix:@"progress"]) {
    WCSessionFileTransfer *transfer = object;
    FileTransferEvent *event = [self getFileTransferEvent:transfer];
    [self dispatchEventWithName:EVENT_FILE_TRANSFER body:[event serializeWithEventType:FILE_EVENT_PROGRESS]];
  } else if ([keyPath isEqualToString:@"paired"]) {
    [self dispatchEventWithName:EVENT_PAIR_STATUS_CHANGED body:@{@"paired": change[NSKeyValueChangeNewKey]}];
  } else if ([keyPath isEqualToString:@"watchAppInstalled"]) {
    [self dispatchEventWithName:EVENT_INSTALL_STATUS_CHANGED body:@{@"installed": change[NSKeyValueChangeNewKey]}];
  }
}

- (void)session:(WCSession *)session didReceiveFile:(WCSessionFile *)file {
  NSFileManager *fileManager = NSFileManager.defaultManager;
  NSURL *directoryURL = [[fileManager URLsForDirectory:NSDocumentDirectory
                                             inDomains:NSUserDomainMask][0] URLByAppendingPathComponent:@"FilesReceived"];
  if (![fileManager fileExistsAtPath:directoryURL.path]) {
    [fileManager createDirectoryAtURL:directoryURL withIntermediateDirectories:YES attributes:nil error:nil];
  }

  NSURL *destinationURL = [directoryURL URLByAppendingPathComponent:file.fileURL.lastPathComponent];
  NSError *error;
  [fileManager copyItemAtPath:file.fileURL.path
                       toPath:destinationURL.path
                        error:&error];

  NSNumber *timestamp = @(jsTimestamp());
  NSString *fileId = [timestamp stringValue];

  NSDictionary *fileInfo = @{
    @"id": fileId,
    @"timestamp": timestamp,
    @"url": destinationURL.absoluteString,
    @"metadata": file.metadata != nil ? file.metadata : [NSNull null]
  };

  if (error) {
    NSLog(@"Copying received file error: %@ %@", error, error.userInfo);
    [self dispatchEventWithName:EVENT_WATCH_FILE_ERROR body:@{@"fileInfo": fileInfo, @"error": error, @"errorUserInfo": error.userInfo}];
    return;
  }

  [self.queuedFiles setValue:fileInfo forKey:fileId];
  [self dispatchEventWithName:EVENT_WATCH_FILE_RECEIVED body:fileInfo];
}

- (void)      session:(WCSession *)session
didFinishFileTransfer:(WCSessionFileTransfer *)fileTransfer
                error:(NSError *)error {
  double endTime = jsTimestamp();

  WCSessionFile *file = fileTransfer.file;
  NSDictionary<NSString *, id> *metadata = file.metadata;
  NSString *transferId = metadata[@"id"];
  if (transferId) {
    FileTransferInfo *transferInfo = self.fileTransfers[transferId];

    transferInfo.endTime = @(endTime);

    if (transferInfo) {
      if (error) {
        transferInfo.error = error;
        FileTransferEvent *event = [self getFileTransferEvent:fileTransfer];
        [self dispatchEventWithName:EVENT_FILE_TRANSFER
                               body:[event serializeWithEventType:FILE_EVENT_ERROR]];
      } else {
        FileTransferEvent *event = [self getFileTransferEvent:fileTransfer];
        [self dispatchEventWithName:EVENT_FILE_TRANSFER body:[event serializeWithEventType:FILE_EVENT_FINISHED]];
      }

      WCSessionFileTransfer *transfer = transferInfo.transfer;
      [transfer removeObserver:self forKeyPath:@"progress.fractionCompleted"];
      [transfer removeObserver:self forKeyPath:@"progress.completedUnitCount"];
      [transfer removeObserver:self forKeyPath:@"progress.estimatedTimeRemaining"];
      [transfer removeObserver:self forKeyPath:@"progress.throughput"];
    }
  }
}

#pragma mark - Context

- (void)updateApplicationContext:(NSDictionary *)context {
  NSError *error = nil;
  [self.session updateApplicationContext:context error:&error];
  if (error) {
    NSLog(@"Application context update error: %@ %@", error, [error userInfo]);
    [self dispatchEventWithName:EVENT_WATCH_APPLICATION_CONTEXT_ERROR body:@{@"context": context, @"error": dictionaryFromError(error)}];
  }
}

- (void)getApplicationContext:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  NSDictionary<NSString *, id> *applicationContext = self.session.applicationContext;
  if (applicationContext == nil) {
    resolve([NSNull null]);
  } else {
    resolve(applicationContext);
  }
}

- (void)             session:(WCSession *)session
didReceiveApplicationContext:(NSDictionary<NSString *, id> *)applicationContext {
  NSError *error = nil;
  [self.session updateApplicationContext:applicationContext error:&error];

  if (error) {
    NSLog(@"Application context receive error: %@", error);
    [self dispatchEventWithName:EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR body:@{@"error": dictionaryFromError(error)}];
  } else {
    [self dispatchEventWithName:EVENT_APPLICATION_CONTEXT_RECEIVED body:applicationContext];
  }
}

#pragma mark - User Info

- (void)getQueuedUserInfo:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  resolve(self.queuedUserInfo);
  [self.queuedUserInfo removeAllObjects];
}

- (void)transferUserInfo:(NSDictionary *)userInfo {
  [self.session transferUserInfo:userInfo];
}

- (void)clearUserInfoQueue:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  self.queuedUserInfo = [NSMutableDictionary new];
  resolve([NSNull null]);
}

- (void)dequeueUserInfo:(NSArray<NSString *> *)ids {
  for (NSString *ident in ids) {
    [self.queuedUserInfo removeObjectForKey:ident];
  }

  if (!ids || !ids.count) {
    [self dispatchEventWithName:EVENT_WATCH_USER_INFO_RECEIVED body:self.queuedUserInfo];
  }
}

- (void)session:(WCSession *)session didFinishUserInfoTransfer:(WCSessionUserInfoTransfer *)userInfoTransfer error:(NSError *)error {
  if (error) {
    NSLog(@"User info transfer error: %@ %@", error, [error userInfo]);
    [self dispatchEventWithName:EVENT_WATCH_USER_INFO_ERROR body:@{@"userInfo": [userInfoTransfer userInfo], @"error": dictionaryFromError(error)}];
  }
}

- (void)   session:(WCSession *)session
didReceiveUserInfo:(NSDictionary<NSString *, id> *)userInfo {
  double ts = jsTimestamp();
  NSString *timestamp = [@(ts) stringValue];
  [self.queuedUserInfo setValue:userInfo forKey:timestamp];
  [self dispatchEventWithName:EVENT_WATCH_USER_INFO_RECEIVED body:@{@"userInfo": userInfo, @"timestamp": @(ts), @"id": timestamp}];
}

#pragma mark - Events

- (void)dispatchEventWithName:(NSString *)name
                         body:(NSDictionary<NSString *, id> *)body {
  if (!hasObservers) {
    [pendingEvents addObject:@{@"name": name, @"body": body}];
  } else {
    [self sendEventWithName:name body:body];
  }
}

@end
