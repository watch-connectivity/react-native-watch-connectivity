# React Native Watch Connectivity

Communicate with your Apple Watch apps over the React Native bridge.

**Note:** This library does not allow you to write your Apple Watch apps in React Native but rather allows your RN iOS app to communicate with a watch app written in Obj-C/Swift.

<img height=600 src="https://github.com/mtford90/react-native-watch-connectivity/blob/06001bb1d15bcdb9607c35d75c7c7ab463c71e86/assets/screenshot.png?raw=true"/>

## Demo

The featured screenshot is from the example app. To run the example:

```
git clone https://github.com/mtford90/react-native-watch-connectivity.git
cd react-native-watch-connectivity
npm install
open example/ios/RNWatchExample.xcodeproj
```

And then run the app!

## Install

```bash
npm install react-native-watch-connectivity --save
# or
yarn add react-native-watch-connectivity
```

### Link

Note: this library now supports autolinking for RN 0.60+

First of all you'll need to link the library to your iOS project. You can do this automatically by using:

```bash
react-native link
```

#### Manual Linking

Or you can link the library manually by adding `node_modules/react-native-watch-connectivity/ios/RNWatch.xcodeproj` to your project and ensuring that `libRNWatch.a` is present in the **Link Binary With Libraries** build phase.

Alternatively, if you're using CocoaPods, you can add the following to your Podfile:

```
pod 'RNWatch', :path => '../node_modules/react-native-watch-connectivity'
```

and run `pod install`.

## Usage

### WatchOS

Use Apple's Watch API as usual. See the <a href="example/ios/WatchExtension">example WatchOS Swift code</a> for how to do this.

### iOS

Unlike with previous versions of this library, a `WCSession` is now activated automatically when you include this library. No code in `AppDelegate.m` is needed.

### React Native

**ES6**

```js
import * as Watch from 'react-native-watch-connectivity'
```

**ES5**

```js
var Watch = require('react-native-watch-connectivity')
```

#### Reachability

```js
// Monitor reachability
this.unsubscribeWatchReachability = Watch.subscribeToWatchReachability(
  (err, watchIsReachable) => {
    if (!err) {
      this.setState({ watchIsReachable })
    }
  }
)

// somewhere in componentWillUnmount()
this.unsubscribeWatchReachability()

// Get current reachability
Watch.getWatchReachability((err, watchIsReachable) => {
  // ...
})
```

#### Install & Pairing Status

```js
Watch.getIsWatchAppInstalled((err, isAppInstalled) => {
  // ...
})
Watch.getIsPaired((err, isPaired) => {
  // ...
})
```

#### Install & Pairing Status

```js
watch.getIsWatchAppInstalled((err, isAppInstalled) => {
  // ...
})

watch.getIsPaired((err, isPaired) => {
  // ...
})
```

#### Watch State

```js
// Monitor watch state
this.unsubscribeWatchState = Watch.subscribeToWatchState((err, watchState) => {
  if (!err) {
    console.log('watchState', watchState) // NotActivated, Inactive, Activated
  }
})

// Get current watch state
Watch.getWatchState((err, watchState) => {
  if (!err) {
    console.log('watchState', watchState) // NotActivated, Inactive, Activated
  }
})
```

#### User Info

```js
this.unsubscribeUserInfo = Watch.subscribeToUserInfo((err, info) => {
  // ...
})
```

```js
Watch.sendUserInfo({ name: 'Mike', id: 5 })
```

```js
watch
  .getUserInfo()
  .then(info => {
    // ...
  })
  .catch(err => {
    // ...
  })
```

```js
Watch.sendComplicationUserInfo({ name: 'Mike' }, (err, replyMessage) => {
  console.log('Received reply from watch', replyMessage)
})
```

#### Application Context

```js
this.unsubscribeApplicationContext = Watch.subscribeToApplicationContext(
  (err, info) => {
    // ...
  }
)

Watch.updateApplicationContext({ foo: 'bar' })

Watch.getApplicationContext().then(context => {
  // ...
})
```

#### Messages

##### Send Message

Send messages and receive replies

```js
Watch.sendMessage({ text: 'Hi watch!' }, (err, replyMessage) => {
  console.log('Received reply from watch', replyMessage)
})
```

##### Receive Message

Recieve messages and send responses

```js
this.unsubscribeMessages = Watch.subscribeToMessages((err, message, reply) => {
  if (!err) reply({ text: 'message received!' })
})
```

#### Files

##### Send Files

```js
const uri = 'file://...' // e.g. a photo/video obtained using react-native-image-picker

watch
  .transferFile(uri)
  .then(() => {
    // ...
  })
  .catch(err => {
    // ... handle error
  })
```

##### Receive Files

TODO: Not implemented or documented

## Troubleshooting

Note that communication between the iOS simulator and Apple Watch simulator can be ridiculously slow - it's much faster when using actual devices. I've seen response times of up to 2 minutes when using the simulator & have no idea why.

If the issue is not related to the above, compare your app and the example app, ensuring everything is configured the same - otherwise raise an issue and i'll be happy to help.
