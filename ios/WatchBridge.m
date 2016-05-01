#import "WatchBridge.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"

static const NSString* EVENT_FILE_TRANSFER_ERROR        = @"WatchFileTransferError";
static const NSString* EVENT_FILE_TRANSFER_FINISHED     = @"WatchFileTransferFinished";
static const NSString* EVENT_RECEIVE_MESSAGE            = @"WatchReceiveMessage";
static const NSString* EVENT_WATCH_STATE_CHANGED        = @"WatchStateChanged";
static const NSString* EVENT_ACTIVATION_ERROR           = @"WatchActivationError";
static const NSString* EVENT_WATCH_REACHABILITY_CHANGED = @"WatchReachabilityChanged";

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
                  withMessage:(NSDictionary<NSString *,id> *)message
                  success:(RCTResponseSenderBlock)callback
                  error:(RCTResponseErrorBlock)error {
  void (^replyHandler)(NSDictionary<NSString *,id> * _Nonnull) =  self.replyHandlers[messageId];
  if (replyHandler) {
    replyHandler(message);
  }
  else {
    NSError* err = [[NSError alloc] initWithDomain:@"com.mtford.watchbridge" code:0 userInfo:@{@"missing_id": messageId}];
    error(err);
  }
})

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
  [self dispatchEventWithName:EVENT_RECEIVE_MESSAGE body:message];
}

////////////////////////////////////////////////////////////////////////////////
// Files
////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
 didReceiveFile:(WCSessionFile *)file {
  NSLog(@"sessionDidReceiveFile: %@", @{@"url": file.fileURL, @"metadata": file.metadata});
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didFinishFileTransfer:(WCSessionFileTransfer *)fileTransfer
          error:(NSError *)error {
  if (error) {
    NSLog(@"sessionDidFinishFileTransfer error: %@", error);
  }
  else {
    WCSessionFile* file = fileTransfer.file;
    NSLog(@"sessionDidFinishFileTransfer %@", @{@"url": file.fileURL, @"metadata": file.metadata});
  }
}

////////////////////////////////////////////////////////////////////////////////
// Context
////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didReceiveApplicationContext:(NSDictionary<NSString *,id> *)applicationContext {
  NSLog(@"sessionDidReceiveApplicationContext %@", applicationContext);
}

////////////////////////////////////////////////////////////////////////////////

- (void)session:(WCSession *)session
didReceiveUserInfo:(NSDictionary<NSString *,id> *)userInfo {
  NSLog(@"sessionDidReceiveUserInfo %@", userInfo);
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