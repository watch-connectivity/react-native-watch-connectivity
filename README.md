**THIS IS A WORK IN PROGRESS - DO NOT ATTEMPT TO USE**

# React Native Watch Bridge

Communicate with your apple watch over over the react native bridge

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
