// RNCookieManagerIOS.h
#import "RCTBridgeModule.h"

@import WatchConnectivity;


@interface WatchBridge : NSObject <RCTBridgeModule, WCSessionDelegate>

@property (nonatomic, strong) WCSession* session;
@property (nonatomic, strong) NSMutableDictionary* replyHandlers;

+ (WatchBridge*) shared;

@end