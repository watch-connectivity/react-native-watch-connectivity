// RNCookieManagerIOS.h
#import <React/RCTBridgeModule.h>

@import WatchConnectivity;


@interface WatchBridge : NSObject <RCTBridgeModule, WCSessionDelegate>

@property (nonatomic, strong) WCSession* session;
@property (nonatomic, strong) NSMutableDictionary* replyHandlers;
@property (nonatomic, strong) NSMutableDictionary* transfers;
@property (nonatomic, strong) NSDictionary<NSString*, id>* userInfo;

+ (WatchBridge*) shared;

@end