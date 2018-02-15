# React Native Watch Connectivity

Communicate with your Apple Watch apps over the React Native bridge.

**Note:** This library does not allow you to write your iWatch apps in React Native but rather allows your RN iOS app to communicate with a watch app written in Obj-C/Swift.

<img height=600 src="https://github.com/mtford90/react-native-watch-connectivity/blob/06001bb1d15bcdb9607c35d75c7c7ab463c71e86/assets/screenshot.png?raw=true"/>

## Demo

The featured screenshot is from the example app. To run the example:

```
git clone https://github.com/mtford90/react-native-watch-connectivity.git
cd react-native-watch-connectivity
npm install
open example/ios/rnwatch.xcodeproj
```

And then run the app!

## Install

```bash
npm install react-native-watch-connectivity
```

### Link

First of all you'll need to link the library to your iOS project. You can do this automatically by using:

```bash
react-native link
```

#### Manual Linking

Or you can link the library manually by adding  `node_modules/react-native-watch-connectivity/ios/RNWatch.xcodeproj` to your project and ensuring that libRNWatch.a is present in the **Link Binary With Libraries** build phase.

Alternatively, if you're using CocoaPods, you can add the following to your Podfile:

```
pod 'RNWatch', :path => '../node_modules/react-native-watch-connectivity'
```

and run ``pod install``.

## Usage

### WatchOS

Use Apple's Watch API as usual. See the [example WatchOS Swift code](https://github.com/mtford90/react-native-watch-connectivity/tree/master/example/ios/watch Extension) for how to do this.

### React Native

**ES6**

```js
import * as watch from 'react-native-watch-connectivity'
```

**ES5**

```js
var watch = require('react-native-watch-connectivity')
```

#### Reachability

```js
// Monitor reachability
const unsubscribe = watch.subscribeToWatchReachability((err, watchIsReachable) => {
  if (!err) {
    this.setState({watchIsReachable})
  }
})

// Get current reachability
watch.getWatchReachability((err, watchIsReachable) => {
  // ...
})
```

#### Watch State

```js
// Monitor watch state
const unsubscribe = watch.subscribeToWatchState((err, watchState) => {
  if (!err) {
    console.log('watchState', watchState) // NotActivated, Inactive, Activated
  }
})

// Get current watch state
watch.getWatchState((err, watchState) => {
    if (!err) {
      console.log('watchState', watchState) // NotActivated, Inactive, Activated
    }
})
```

#### User Info

```js
const unsubscribe = watch.subscribeToUserInfo((err, info) => {
    // ...
})
```

```js
watch.sendUserInfo({name: 'Mike', id: 5})
```

```js
watch.getUserInfo().then(info => {
    // ...
}).catch(err => {
    // ...
})
```

#### Application Context

```js
const unsubscribe = watch.subscribeToApplicationContext((err, info) => {
    // ...
})

watch.updateApplicationContext({foo: 'bar'})

watch.getApplicationContext().then(context => {
  // ...
})
```

#### Messages

##### Send Message

Send messages and receive replies

```js
watch.sendMessage({text: "Hi watch!"}, (err, replyMessage) => {
    console.log("Received reply from watch", replyMessage)
})
```

##### Receive Message

Recieve messages and send responses

```js
const unsubscribe = watch.subscribeToMessages((err, message, reply) => {
    if (!err) reply({text: "message received!"})
})
```

#### Files

##### Send Files

```js
const uri = 'file://...' // e.g. a photo/video obtained using react-native-image-picker

watch.transferFile(uri).then(() => {
  // ...
}).catch(err => {
  // ... handle error
})
```

##### Receive Files

TODO: Not implemented or documented

## Troubleshooting

Note that communication between the iOS simulator and iWatch simulator can be ridiculously slow - it's much faster when using actual devices. I've seen response times of up to 2 minutes when using the simulator & have no idea why.

If the issue is not related to the above, compare your app and the example app, ensuring everything is configured the same - otherwise raise an issue and i'll be happy to help.
