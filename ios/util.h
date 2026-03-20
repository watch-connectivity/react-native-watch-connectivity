#import <Foundation/Foundation.h>

#ifdef __cplusplus
extern "C" {
#endif

double jsTimestamp(void);
NSString *uuid(void);
NSDictionary *dictionaryFromError(NSError *error);

#ifdef __cplusplus
}
#endif
