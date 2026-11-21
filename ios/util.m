#import <Foundation/Foundation.h>
#import <WatchConnectivity/WCError.h>
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

// The full userInfo can hold values the bridge cannot serialise (URLs, nested
// errors), so events carry only what JS needs to build a WatchError.
NSDictionary *dictionaryFromError(NSError *error) {
  return @{
    @"code": @(error.code),
    @"domain": error.domain,
    @"message": error.localizedDescription ?: @""
  };
}

NSError *sessionNotSupportedError(void) {
  return [NSError errorWithDomain:WCErrorDomain
                             code:WCErrorCodeSessionNotSupported
                         userInfo:@{NSLocalizedDescriptionKey: @"WatchConnectivity is not supported on this device"}];
}
