# React Native Watch Connectivity

Communicate with your apple watch apps over the react native bridge.

**Note:** This library does not allow you to write your iWatch apps in React Native but rather allows your RN iOS app to communicate with a watch app written in Obj-C/Swift.

<img height=600 src="https://github.com/mtford90/react-native-watch-connectivity/blob/06001bb1d15bcdb9607c35d75c7c7ab463c71e86/assets/screenshot.png?raw=true"/>

## Demo

The featured screenshot is from the demo app. To get the demo app going:

```
git clone https://github.com/mtford90/react-native-watch-connectivity.git
cd react-native-watch-connectivity
npm install
open ios/rnwatch.xcworkspace
```

And then run the app!

## Install

```bash
npm install react-native-watch-connectivity
```

Then add `node_modules/react-native-watch-connectivity/RNWatch.xcodeproj` to your project and ensure that libRNWatch.a is present in the **Link Binary With Libraries** build phase

## Usage

### WatchOS

Use Apple's watch API as normal. See the demo app for examples of this - the WatchOS code in swift can be seen [here](https://github.com/mtford90/react-native-watch-connectivity/tree/master/ios)

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
const unsubscribe = watch.subscribeToWatchReachability(watchIsReachable => {
    this.setState({watchIsReachable})
})

// Get current reachability
watch.getReachability(watchIsReachable => {
  // ...
})
```

#### Watch State

```js
// Monitor watch state
const unsubscribe = watch.subscribeToWatchState(watchState => {
    console.log('watchState', watchState) // NotActivated, Inactive, Activated
})

// Get current watch state
watch.getWatchState(watchState => {
    console.log('watchState', watchState) // NotActivated, Inactive, Activated
})
```

### User Info

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

### Application Context

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
