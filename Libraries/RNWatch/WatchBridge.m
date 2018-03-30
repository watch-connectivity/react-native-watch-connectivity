#import "WatchBridge.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"

static const NSString* EVENT_FILE_TRANSFER_ERROR            = @"WatchFileTransferError";
static const NSString* EVENT_FILE_TRANSFER_FINISHED         = @"WatchFileTransferFinished";
static const NSString* EVENT_RECEIVE_MESSAGE                = @"WatchReceiveMessage";
static const NSString* EVENT_RECEIVE_MESSAGE_DATA           = @"WatchReceiveMessageData";
static const NSString* EVENT_WATCH_STATE_CHANGED            = @"WatchStateChanged";
static const NSString* EVENT_ACTIVATION_ERROR               = @"WatchActivationError";
static const NSString* EVENT_WATCH_REACHABILITY_CHANGED     = @"WatchReachabilityChanged";
static const NSString* EVENT_WATCH_USER_INFO_RECEIVED       = @"WatchUserInfoReceived";
static const NSString* EVENT_APPLICATION_CONTEXT_RECEIVED   = @"WatchApplicationContextReceived";

@implementation WatchBridge

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

////////////////////////////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////////////////////////////

+ (WatchBridge*) shared {
  static WatchBridge *sharedMyManager = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedMyManager = [[self alloc] init];
  });
  return sharedMyManager;
}

- (instancetype)init {
  self = [super init];
  if ([WCSession isSupported]) {
    WCSession* session = [WCSession defaultSession];
    session.delegate = self;
    self.session = session;
    self.transfers = [NSMutableDictionary new];
    self.replyHandlers = [NSMutableDictionary new];
    self.userInfo = [NSDictionary<NSString*, id> new];
    [session activateSession];
  }
  return self;
}

////////////////////////////////////////////////////////////////////////////////
// Session State
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getSessionState: (RCTResponseSenderBlock) callback) {
  WCSessionActivationState state = self.session.activationState;
  NSString* stateString = [self _getStateString:state];
  callback(@[stateString]);
}

////////////////////////////////////////////////////////////////////////////////

- (void)sessionWatchStateDidChange:(WCSession *)session {
  WCSessionActivationState state = session.activationState;
  NSLog(@"sessionWatchStateDidChange: %ld", (long)state);
  [self _sendStateEvent:state];
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
activationDidCompleteWithState:(WCSessionActivationState)activationState
          error:(NSError *)error {
  if (error) {
    NSLog(@"sessionActivationDidCompleteWithState error: %@", error.localizedDescription);
    [self dispatchEventWithName:EVENT_ACTIVATION_ERROR body:@{@"error": error}];
  }
  else {
    NSLog(@"sessionActivationDidCompleteWithState: %ld", (long)activationState);
  }
  [self _sendStateEvent:session.activationState];
}

////////////////////////////////////////////////////////////////////////////////

- (NSString*) _getStateString: (WCSessionActivationState) state
{
  NSString* stateString;
  switch(state) {
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

- (void) _sendStateEvent: (WCSessionActivationState) state
{
  NSString* stateString = [self _getStateString:state];
  [self dispatchEventWithName:EVENT_WATCH_STATE_CHANGED body:@{@"state": stateString}];
}

////////////////////////////////////////////////////////////////////////////////
// Reachability
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getReachability: (RCTResponseSenderBlock) callback) {
  callback(@[[NSNumber numberWithBool:self.session.reachable]]);
}

////////////////////////////////////////////////////////////////////////////////

- (void)sessionReachabilityDidChange:(WCSession *)session {
  BOOL reachable = session.reachable;
  NSLog(@"sessionReachabilityDidChange: %@",  reachable ? @"YES" : @"NO");
  [self dispatchEventWithName:EVENT_WATCH_REACHABILITY_CHANGED body:@{@"reachability": [NSNumber numberWithBool:reachable]}];
}
    
////////////////////////////////////////////////////////////////////////////////
// isWatchAppInstalled
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getIsWatchAppInstalled: (RCTResponseSenderBlock) callback) {
  callback(@[[NSNumber numberWithBool:self.session.isWatchAppInstalled]]);
}

////////////////////////////////////////////////////////////////////////////////
// isPaired
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getIsPaired: (RCTResponseSenderBlock) callback) {
  callback(@[[NSNumber numberWithBool:self.session.isPaired]]);
}

////////////////////////////////////////////////////////////////////////////////
// Messages
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(sendMessage:(NSDictionary *)message
                  replyCallback:(RCTResponseSenderBlock)replyCallback
                  error:(RCTResponseErrorBlock) errorCallback)
{
  [self.session sendMessage:message
               replyHandler:^(NSDictionary<NSString *,id> * _Nonnull replyMessage) {
    replyCallback(@[replyMessage]);
  } errorHandler:^(NSError * _Nonnull error) {
    errorCallback(error);
  }];
}

////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(replyToMessageWithId:(NSString*) messageId
                  withMessage:(NSDictionary<NSString *,id> *)message) {
  void (^replyHandler)(NSDictionary<NSString *,id> * _Nonnull) =  self.replyHandlers[messageId];
  replyHandler(message);
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *,id> *)message {
  NSLog(@"sessionDidReceiveMessage %@", message);
  [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE body:message];
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *,id> *)message
   replyHandler:(void (^)(NSDictionary<NSString *,id> * _Nonnull))replyHandler
{
  
  NSLog(@"sessionDidReceiveMessageReplyHandler %@", message);
  NSString* messageId = [self uuidString];
  NSMutableDictionary* mutableMessage = [message mutableCopy];
  mutableMessage[@"id"] = messageId;
  self.replyHandlers[messageId] = replyHandler;
  [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE body:mutableMessage];
}

////////////////////////////////////////////////////////////////////////////////
// Message Data
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(sendMessageData:(NSString *)str
                  encoding:(nonnull NSNumber*)encoding
                  replyCallback:(RCTResponseSenderBlock)replyCallback
                  error:(RCTResponseErrorBlock) errorCallback)
{
  NSData* data = [str dataUsingEncoding:(NSStringEncoding)[encoding integerValue]];
  [self.session sendMessageData:data replyHandler:^(NSData * _Nonnull replyMessageData) {
    NSString* responseData = [replyMessageData base64EncodedStringWithOptions:0];
    replyCallback(@[responseData]);
  } errorHandler:^(NSError * _Nonnull error) {
    NSLog(@"Error sending message data %@", error);
    errorCallback(error);
  }];
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didReceiveMessageData:(NSData *)messageData
   replyHandler:(void (^)(NSData * _Nonnull))replyHandler
{
  [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE_DATA body:@{@"data": messageData}];
}

////////////////////////////////////////////////////////////////////////////////
// Files
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(transferFile:(NSString *)url
                  metaData:(nullable NSDictionary<NSString *,id> *)metaData
                  callback:(RCTResponseSenderBlock) callback
                  error:(RCTResponseErrorBlock)error)
{
  
  NSMutableDictionary* mutableMetaData;
  if (metaData) {
    mutableMetaData = [metaData mutableCopy];
  }
  else {
    mutableMetaData = [NSMutableDictionary new];
  }
  NSString* uuid = [self uuidString];
  mutableMetaData[@"id"] = uuid;
  WCSessionFileTransfer* transfer = [self.session transferFile:[NSURL URLWithString:url] metadata:mutableMetaData];
  NSDictionary* transferInfo = @{@"transfer": transfer, @"callback": callback, @"errorCallback": error};
  [self.transfers setObject:transferInfo forKey:uuid];
  NSLog(@"Creating transfer with uuid %@: %@", uuid, self.transfers);
}

////////////////////////////////////////////////////////////////////////////////


- (void)session:(WCSession *)session
 didReceiveFile:(WCSessionFile *)file {
  NSLog(@"sessionDidReceiveFile: %@", @{@"url": file.fileURL, @"metadata": file.metadata});
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didFinishFileTransfer:(WCSessionFileTransfer *)fileTransfer
          error:(NSError *)error {
  WCSessionFile* file = fileTransfer.file;
  NSDictionary<NSString*, id>* metadata = file.metadata;
  NSString* transferId = metadata[@"id"];
  if (transferId) {
    NSURL* fileURL = file.fileURL;
    NSDictionary* transferInfo = self.transfers[transferId];
    if (transferInfo) {
      if (error) {
        NSLog(@"sessionDidFinishFileTransfer error: %@", error);
        [self dispatchEventWithName:EVENT_FILE_TRANSFER_ERROR body:@{@"error": error}];
        RCTResponseErrorBlock callback = transferInfo[@"errorCallback"];
        callback(error);
      }
      else {
        NSMutableDictionary* dict = [NSMutableDictionary new];
        if (fileURL) {
          NSString* uri = [fileURL absoluteString];
          assert(uri);
          dict[@"uri"] = uri;
        }
        if (metadata) dict[@"metadata"] = metadata;
        if (transferId) dict[@"id"] = transferId;
        NSLog(@"sessionDidFinishFileTransfer %@", dict);
        [self dispatchEventWithName:EVENT_FILE_TRANSFER_FINISHED body:dict];
        RCTResponseSenderBlock callback = transferInfo[@"callback"];
        callback(@[dict]);
      }
      [self.transfers removeObjectForKey:transferId];
    }
    else {
      NSLog(@"Warning: Transfer ID %@ has no transfer info", transferId);
    }
  }
  else {
    NSLog(@"Warning: Received transfer without Transfer ID");
  }
}

////////////////////////////////////////////////////////////////////////////////
// Context
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(updateApplicationContext:(NSDictionary<NSString *,id> *)context) {
  [self.session updateApplicationContext:context error:nil];
  [self dispatchEventWithName:EVENT_APPLICATION_CONTEXT_RECEIVED body:context];
}

////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getApplicationContext:(RCTResponseSenderBlock)callback) {
  callback(@[self.session.applicationContext]);
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didReceiveApplicationContext:(NSDictionary<NSString *,id> *)applicationContext {
  NSLog(@"sessionDidReceiveApplicationContext %@", applicationContext);
  [self dispatchEventWithName:EVENT_APPLICATION_CONTEXT_RECEIVED body:self.session.applicationContext];
}

////////////////////////////////////////////////////////////////////////////////
// User Info
////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(sendUserInfo:(NSDictionary<NSString *,id> *)userInfo) {
  [self.session transferUserInfo:userInfo];
}

////////////////////////////////////////////////////////////////////////////////

RCT_EXPORT_METHOD(getUserInfo:(RCTResponseSenderBlock)callback) {
  callback(@[self.userInfo]);
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didReceiveUserInfo:(NSDictionary<NSString *,id> *)userInfo {
  NSLog(@"sessionDidReceiveUserInfo %@", userInfo);
  self.userInfo = userInfo;
  [self dispatchEventWithName:EVENT_WATCH_USER_INFO_RECEIVED body:userInfo];
}

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

-(void)dispatchEventWithName:(const NSString*) name
                        body:(NSDictionary<NSString *,id> *)body {
  NSLog(@"dispatch %@: %@", name, body);
  [self.bridge.eventDispatcher sendAppEventWithName:(NSString*)name
                                               body:body];
}

////////////////////////////////////////////////////////////////////////////////

- (NSString *)uuidString {
  CFUUIDRef uuid = CFUUIDCreate(kCFAllocatorDefault);
  NSString *uuidString = (__bridge_transfer NSString *)CFUUIDCreateString(kCFAllocatorDefault, uuid);
  CFRelease(uuid);
  return uuidString;
}

////////////////////////////////////////////////////////////////////////////////

@end
