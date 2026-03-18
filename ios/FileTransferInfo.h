#import <Foundation/Foundation.h>

@class WCSessionFileTransfer;

@interface FileTransferInfo : NSObject
@property (nonatomic, strong) WCSessionFileTransfer *transfer;
@property (nonatomic, strong) NSString *id;
@property (nonatomic, strong) NSString *uri;
@property (nonatomic, strong) NSDictionary *metaData;
@property (nonatomic, strong) NSNumber *startTime;
@property (nonatomic, strong) NSNumber *endTime;
@property (nonatomic, strong) NSError *error;
@end
