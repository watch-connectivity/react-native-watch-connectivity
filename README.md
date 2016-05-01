**THIS IS A WORK IN PROGRESS - DO NOT ATTEMPT TO USE**

# React Native Watch Bridge

Communicate with your apple watch apps over the react native bridge.

**Note:** This library does not allow you to write your iWatch apps in React Native but rather allows your RN iOS app to communicate with a watch app written in Obj-C/Swift.

<img height=600 src="https://raw.githubusercontent.com/mtford90/react-native-iwatch-bridge/master/assets/screenshot.png"/>

## Demo

The featured screenshot is from the demo app. To get the demo app going:

```
git clone https://github.com/mtford90/react-native-iwatch-bridge.git
cd react-native-iwatch-bridge
npm install
cd ios
pod install
open buff.xcworkspace
```

And then run the app!

## Install

```bash
npm install react-native-watch-bridge
```

* Include WatchBridge.swift in your watch extension target
* Include WatchBridge.h/WatchBridge.m in your app target

## Usage

### import

```js
import * as watchBridge from 'react-native-watch-bridge'
```

```js
var watchBridge = require('react-native-watch-bridge')
```

### api

#### sendMessage

```js
sendMessage(
    {
        key: 'value'
    },
    (err, reply) => {
      // ...
    }
)
```

#### subscribeToFileTransfers

```js
const unsubscribe = subscribeToFileTransfers(
    (err, res) => {
      const {fileURL, metadata} = res
    }
)
```

#### subscribeToWatchReachability

NOTE: Reachability is VERY buggy in the simulator. See [this](https://forums.developer.apple.com/thread/14518) thread.

