// import RCTBridgeModule.h
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#elif __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else
#import "React/RCTBridgeModule.h"
#endif

// import RCTEventEmitter.h
#if __has_include("RCTEventEmitter.h")
#import "RCTEventEmitter.h"
#elif __has_include(<React/RCTEventEmitter.h>)
#import <React/RCTEventEmitter.h>
#else
#import "React/RCTEventEmitter.h"
#endif

@import WatchConnectivity;

@interface RNWatch : RCTEventEmitter <RCTBridgeModule, WCSessionDelegate>

+ (RNWatch*) sharedInstance;
@property (nonatomic, strong) WCSession* session;
@property (nonatomic, strong) NSCache* replyHandlers;
@property (nonatomic, strong) NSMutableDictionary* transfers;
@property (nonatomic, strong) NSDictionary<NSString*, id>* userInfo;

@end
