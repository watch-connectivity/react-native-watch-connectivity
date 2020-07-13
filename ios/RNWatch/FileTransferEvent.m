//
// Created by Michael Ford on 20/06/2020.
// Copyright (c) 2020 Facebook. All rights reserved.
//

#import "FileTransferEvent.h"
#import "FileTransferInfo.h"

@implementation FileTransferEvent

- (id)nullify:(id)anything {
    return anything == nil ? [NSNull null] : anything;
}

- (NSDictionary<NSString *, id> *)serialize {
    return @{
            @"bytesTransferred": [self nullify:self.bytesTransferred],
            @"estimatedTimeRemaining": [self nullify:self.estimatedTimeRemaining],
            @"id": [self nullify:self.id],
            @"fractionCompleted": [self nullify:self.fractionCompleted],
            @"throughput": [self nullify:self.throughput],
            @"bytesTotal": [self nullify:self.bytesTotal],
            @"uri": [self nullify:self.uri],
            @"error": [self nullify:self.error],
            @"metadata": [self nullify:self.metadata],
            @"startTime": [self nullify:self.startTime],
            @"endTime": [self nullify:self.endTime],
    };
}

- (NSDictionary *)serializeWithEventType:(NSString*)type {
    NSMutableDictionary * serialised = [[self serialize] mutableCopy];
    serialised[@"type"] = type;
    return serialised;
}

- (FileTransferEvent *)initWithTransferInfo:(FileTransferInfo *)info {
    self.uri = info.uri;
    self.error = info.error;
    self.metadata = info.metaData;
    self.startTime = info.startTime;
    self.endTime = info.endTime;
    return self;
}

@end
