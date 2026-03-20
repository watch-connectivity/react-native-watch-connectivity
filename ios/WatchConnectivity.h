#import <React/RCTEventEmitter.h>

@class WCSession;
@class FileTransferInfo;

@interface WatchConnectivity : RCTEventEmitter

+ (WatchConnectivity *)sharedInstance;
@property (nonatomic, strong) WCSession *session;
@property (nonatomic, strong) NSCache *replyHandlers;
@property (nonatomic, strong) NSMutableDictionary<NSString *, FileTransferInfo *> *fileTransfers;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSDictionary<NSString *, id> *> *queuedFiles;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSDictionary<NSString *, id> *> *queuedUserInfo;

@end
