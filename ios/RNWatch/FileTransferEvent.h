//
// Created by Michael Ford on 20/06/2020.
// Copyright (c) 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>



@class FileTransferInfo;

static NSString *FILE_EVENT_PROGRESS = @"progress";
static NSString *FILE_EVENT_STARTED  = @"started";
static NSString *FILE_EVENT_FINISHED  = @"finished";
static NSString *FILE_EVENT_ERROR  = @"error";

@interface FileTransferEvent : NSObject

@property(nonatomic, strong) NSNumber *bytesTransferred;
@property(nonatomic, strong) NSNumber *estimatedTimeRemaining;
@property(nonatomic, strong) NSString *id;
@property(nonatomic, strong) NSNumber *fractionCompleted;
@property(nonatomic, strong) NSNumber *throughput;
@property(nonatomic, strong) NSNumber *bytesTotal;
@property(nonatomic, strong) NSString *uri;
@property(nonatomic, strong) NSError *error;
@property(nonatomic, strong) NSDictionary *metadata;
@property(nonatomic, strong) NSNumber *startTime;
@property(nonatomic, strong) NSNumber *endTime;

- (NSDictionary *)serialize;

- (NSDictionary *)serializeWithEventType: (NSString*) type;

- (FileTransferEvent *)initWithTransferInfo:(FileTransferInfo *)info;

@end
