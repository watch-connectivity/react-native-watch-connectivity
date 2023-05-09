#import <Foundation/Foundation.h>
#import "util.h"

/**
 * Generates a javascript style timestamp
 */
double jsTimestamp() {
    return floor([[NSDate date] timeIntervalSince1970] * 1000);
}


NSString* uuid() {
    CFUUIDRef uuid = CFUUIDCreate(kCFAllocatorDefault);
    NSString *uuidString = (__bridge_transfer NSString *) CFUUIDCreateString(kCFAllocatorDefault, uuid);
    CFRelease(uuid);
    return uuidString;
}

NSDictionary* dictionaryFromError(NSError *error) {
  NSMutableDictionary *result = NSMutableDictionary.new;
  result[@"code"] = @(error.code);
  result[@"domain"] = error.domain;
  if (error.userInfo) {
    result[@"userInfo"] = error.userInfo;
  }
  return (NSDictionary *) result;
}
