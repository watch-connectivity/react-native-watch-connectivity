#import <Foundation/Foundation.h>
#import "util.h"

double jsTimestamp(void) {
  return floor([[NSDate date] timeIntervalSince1970] * 1000);
}

NSString *uuid(void) {
  CFUUIDRef uuidRef = CFUUIDCreate(kCFAllocatorDefault);
  NSString *uuidString = (__bridge_transfer NSString *)CFUUIDCreateString(kCFAllocatorDefault, uuidRef);
  CFRelease(uuidRef);
  return uuidString;
}

NSDictionary *dictionaryFromError(NSError *error) {
  NSMutableDictionary *result = NSMutableDictionary.new;
  result[@"code"] = @(error.code);
  result[@"domain"] = error.domain;
  if (error.userInfo) {
    result[@"userInfo"] = error.userInfo;
  }
  return (NSDictionary *)result;
}
