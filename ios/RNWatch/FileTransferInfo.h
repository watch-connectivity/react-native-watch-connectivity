//
// Created by Michael Ford on 20/06/2020.
// Copyright (c) 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@import WatchConnectivity;

@interface FileTransferInfo : NSObject
    @property (nonatomic, strong) WCSessionFileTransfer *transfer;
    @property (nonatomic, strong) NSString* id;
    @property (nonatomic, strong) NSString* uri;
    @property (nonatomic, strong) NSDictionary* metaData;
    @property (nonatomic, strong) NSNumber* startTime;
    @property (nonatomic, strong) NSNumber* endTime;
    @property (nonatomic, strong) NSError* error;
@end