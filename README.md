# React Native Watch Connectivity

Communicate with your Apple Watch apps over the React Native bridge.

**Note:** This library does not allow you to write your Apple Watch apps in React Native but rather allows your RN iOS app to communicate with a watch app written in Obj-C/Swift.

## Documentation

[https://watch-connectivity.github.io/react-native-watch-connectivity/](https://watch-connectivity.github.io/react-native-watch-connectivity/)

## Install

```bash
npm install react-native-watch-connectivity
# or
yarn add react-native-watch-connectivity
```

### iOS

```bash
cd ios && pod install
```

### Requirements

- React Native 0.76+
- iOS 13.4+

## Quick Start

```tsx
import {
  sendMessage,
  useReachability,
  usePaired,
  useInstalled,
} from 'react-native-watch-connectivity';

function App() {
  const reachable = useReachability();
  const paired = usePaired();
  const installed = useInstalled();

  const onPress = () => {
    sendMessage({ text: 'Hello from React Native!' }, (reply) => {
      console.log('Watch replied:', reply);
    });
  };

  return (
    // ...
  );
}
```

## API

Everything is imported from `react-native-watch-connectivity`. On Android, the web and iPads, `isSupported()` returns `false`: sends reject with `session-not-supported` and state queries resolve empty values, so the same code runs on every platform.

### Support and state

| Function | Returns |
| --- | --- |
| `isSupported()` | `boolean`, synchronously. `false` where WatchConnectivity is unavailable. |
| `getIsPaired()` | `Promise<boolean>` |
| `getIsWatchAppInstalled()` | `Promise<boolean>` |
| `getReachability()` | `Promise<boolean>`: whether the watch app can receive messages now |
| `usePaired()`, `useInstalled()`, `useReachability()` | `boolean`, kept up to date |

### Messages

```ts
sendMessage(
  { text: 'hello' },
  (reply) => console.log(reply),
  (error) => console.warn(error.code)
);

const reply = await sendMessageData('hello');
```

### Application context

The phone and the watch each keep the latest context the other sent.

| Function | Does |
| --- | --- |
| `updateApplicationContext(context)` | Sends `context` to the watch. `Promise<void>`; rejects with a `WatchError`. |
| `getApplicationContext()` | The context this phone last sent, or `null` |
| `getReceivedApplicationContext()` | The context the watch last sent, or `null`, including one that arrived while the app was closed |
| `useApplicationContext()` | The context the watch last sent, kept up to date |

### User info and complications

| Function | Does |
| --- | --- |
| `transferUserInfo(info)` | Queues `info` for the watch; it arrives even if the watch app is closed |
| `transferCurrentComplicationUserInfo(info)` | Sends complication data; the watch wakes to update its complication |
| `getIsComplicationEnabled()` | `Promise<boolean>`: whether the complication is on the active watch face |
| `getRemainingComplicationUserInfoTransfers()` | `Promise<number>`: how many more complication transfers the system will deliver at once today. At 0 they arrive as ordinary user info. |

### Files

| Function | Does |
| --- | --- |
| `startFileTransfer(uri, metadata?)` | Starts sending a file. Resolves with the transfer id. |
| `getFileTransfers()` | The transfers this session started, by id |

### Events

`watchEvents.on(event, callback)` returns an unsubscribe function. `watchEvents.once(event)` without a callback returns a promise.

| Event | Callback receives |
| --- | --- |
| `message` | `(message, reply)`; `reply` is `null` when the watch expects none |
| `application-context` | The context the watch sent |
| `user-info` | An array of user info dictionaries |
| `file` | A file transfer progress event |
| `file-received` | An array of received files |
| `reachability`, `paired`, `installed` | `boolean` |
| `session-became-inactive`, `session-did-deactivate` | Nothing. The session reactivates itself for the newly selected watch. |
| `activation-error` | `{ error }` |
| `application-context-error` | `{ context, error }` |
| `user-info-error` | `{ userInfo, error }` |
| `file-received-error` | `{ fileInfo, error }` |

### Errors

Every error is a `WatchError` with a stable `code`:

```ts
import { isWatchError } from 'react-native-watch-connectivity';

try {
  await updateApplicationContext({ token });
} catch (error) {
  if (isWatchError(error, 'not-reachable')) {
    // try again later
  }
}
```

`WatchErrorCode` is a union of string literals, one for each Apple `WCErrorCode`: `generic-error`, `session-not-supported`, `session-missing-delegate`, `session-not-activated`, `device-not-paired`, `watch-app-not-installed`, `not-reachable`, `invalid-parameter`, `payload-too-large`, `payload-unsupported-types`, `message-reply-failed`, `message-reply-timed-out`, `file-access-denied`, `delivery-failed`, `insufficient-space`, `session-inactive`, `transfer-timed-out`, `companion-app-not-installed` and `watch-only-app`. Anything else is `unknown`. `WATCH_ERROR_CODES` lists them at runtime. `error.nativeCode` and `error.domain` keep the original `NSError` values.

## Example App

```bash
git clone https://github.com/mtford90/react-native-watch-connectivity.git
cd react-native-watch-connectivity/example
yarn install
cd ios && pod install && cd ..
yarn ios
```

To run the watch app, open `example/ios/WatchConnectivityExample.xcworkspace` in Xcode.

## Expo Support

This library has been successfully used in Expo apps (Bare Workflow with EAS Build).

## Sponsors

<a href="https://www.tiwtor.app">
  <img src="https://www.tiwtor.app/landing/parrot-app-icon-gears.svg" alt="Tiwtor — learn Welsh your way" width="120" />
</a>

Development of this library is currently sponsored by [Tiwtor](https://www.tiwtor.app) - a language learning toolkit for self-driven learners, currently focused on Welsh
