#import "WatchBridge.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"

@implementation WatchBridge

@synthesize bridge = _bridge;

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

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(sendMessage:(NSDictionary *)message success:(RCTResponseSenderBlock)callback error:(RCTResponseErrorBlock) errorCallback) {
  [self.session sendMessage:message replyHandler:^(NSDictionary<NSString *,id> * _Nonnull replyMessage) {
    callback(@[replyMessage]);
  } errorHandler:^(NSError * _Nonnull error) {
    errorCallback(error);
  }];
}

RCT_EXPORT_METHOD(getSessionState: (RCTResponseSenderBlock) callback) {
  WCSessionActivationState state = self.session.activationState;
  NSString* stateString = [self _getStateString:state];
  callback(@[stateString]);
}

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

- (void) _sendStateEvent: (WCSessionActivationState) state
{
  NSString* stateString = [self _getStateString:state];
  [self dispatchEventWithName:@"WatchStateChanged" body:@{@"state": stateString}];
}

- (void)sessionWatchStateDidChange:(WCSession *)session {
  WCSessionActivationState state = session.activationState;
  NSLog(@"sessionWatchStateDidChange: %ld", (long)state);
  [self _sendStateEvent:state];
}

- (void)sessionReachabilityDidChange:(WCSession *)session {
  NSLog(@"sessionReachabilityDidChange: %@", session.reachable ? @"YES" : @"NO");
}

- (void)sessionDidDeactivate:(WCSession *)session {
  NSLog(@"sessionDidDeactivate");
}

-(void)dispatchEventWithName: (NSString*) name body:(NSDictionary<NSString *,id> *)body {
  NSLog(@"dispatch %@: %@", name, body);
  [self.bridge.eventDispatcher sendAppEventWithName:name
                                               body:body];
}

- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *,id> *)message {
  NSLog(@"sessionDidReceiveMessage %@", message);
  [self dispatchEventWithName:@"WatchReceiveMessage" body:message];
}

- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *,id> *)message replyHandler:(void (^)(NSDictionary<NSString *,id> * _Nonnull))replyHandler
{
  
}

- (void)session:(WCSession *)session didReceiveUserInfo:(NSDictionary<NSString *,id> *)userInfo {
  NSLog(@"sessionDidReceiveUserInfo %@", userInfo);
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
  NSLog(@"sessionDidBecomeInactive");
}

- (void)session:(WCSession *)session didReceiveFile:(WCSessionFile *)file {
  NSLog(@"sessionDidReceiveFile: %@", @{@"url": file.fileURL, @"metadata": file.metadata});
}

- (void)session:(WCSession *)session didReceiveMessageData:(NSData *)messageData {
  NSLog(@"sessionDidReceiveMessageData %@", messageData);
}

- (void)session:(WCSession *)session didReceiveApplicationContext:(NSDictionary<NSString *,id> *)applicationContext {
  NSLog(@"sessionDidReceiveApplicationContext %@", applicationContext);
}

- (void)session:(WCSession *)session activationDidCompleteWithState:(WCSessionActivationState)activationState error:(NSError *)error {
  if (error) {
    NSLog(@"sessionActivationDidCompleteWithState error: %@", error.localizedDescription);
  }
  else {
    [self _sendStateEvent:activationState];
    NSLog(@"sessionActivationDidCompleteWithState: %ld", (long)activationState);
  }
}

- (void)session:(WCSession *)session didFinishFileTransfer:(WCSessionFileTransfer *)fileTransfer error:(NSError *)error {
  if (error) {
    NSLog(@"sessionDidFinishFileTransfer error: %@", error);
  }
  else {
    WCSessionFile* file = fileTransfer.file;
    NSLog(@"sessionDidFinishFileTransfer %@", @{@"url": file.fileURL, @"metadata": file.metadata});
  }
}

@end