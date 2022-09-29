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

@class FileTransferInfo;

@interface RNWatch : RCTEventEmitter <RCTBridgeModule, WCSessionDelegate>

+ (RNWatch*) sharedInstance;
@property (nonatomic, strong) WCSession* session;
@property (nonatomic, strong) NSCache* replyHandlers;
@property (nonatomic, strong) NSMutableDictionary<NSString*, FileTransferInfo*>* fileTransfers;
@property (nonatomic, strong) NSMutableDictionary<NSString*, NSDictionary<NSString *,id> *>* queuedFiles;
@property (nonatomic, strong) NSMutableDictionary<NSString*, NSDictionary<NSString *,id> *>* queuedUserInfo;

@end
