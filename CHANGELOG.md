# Changelog

All notable changes to this project will be documented in this file.

## [3.0.1] - 2026-11-21

[Compare with 3.0.0](https://github.com/mtford90/react-native-watch-connectivity/compare/3.0.0...3.0.1)

### Added

- `Encoding` and `FileTransferEventType` are exported, so `sendMessageData`'s encoding and file-transfer event types can be named. `QueuedFile` is exported as a type.

### Fixed

- The README gives the real minimum iOS version, 15.1 (React Native's own), not 13.4.

## [3.0.0] - 2026-11-21

[Compare with 2.0.0](https://github.com/mtford90/react-native-watch-connectivity/compare/2.0.0...3.0.0)

### Breaking changes
- `useApplicationContext` now returns the context the watch sent. It used to return the context this phone last sent.
- Promise rejections, the `sendMessage` error callback and error events now give a `WatchError`. Its `code` is a stable `WatchErrorCode` string such as `'not-reachable'`. It used to be a bare native code such as `'7007'`, which never matched `ERROR_CODE_SESSION_UNREACHABLE`.
- Error events have new payloads:
  - `activation-error`: `{ error }`
  - `application-context-error`: `{ context, error }`
  - `user-info-error`: `{ userInfo, error }`
  - `file-received-error`: `{ fileInfo, error }`
- `session-became-inactive` and `session-did-deactivate` listeners now take no arguments.
- A failed file transfer's `error` is now a `WatchError`.
- `ERROR_CODE_SESSION_UNREACHABLE` is now `'not-reachable'` and is deprecated. Compare `error.code` with `'not-reachable'` instead.
- `updateApplicationContext` now returns a promise. It rejects with a `WatchError` when the system refuses the context, for example `payload-unsupported-types` for a `null` value. Callers that do not await it or attach a `catch` now get an unhandled promise rejection when it fails. The `application-context-error` event still fires.
- `paired`, `installed` and `reachability` events now fire each time the session activates, including at every launch and after a watch switch, even when the value has not changed.
- A buffered event is now delivered only when JS listens to that event. Events used to be delivered all together to the first listener of any kind.
- `getApplicationContext` now resolves `null` when this phone has not sent a context. It used to resolve `{}`.
- The `application-context-received-error` event is removed. It reported failures of the echo described under Fixed.
- `_getMissedUserInfo` is no longer exported. It was internal.
- On Android, the web and other platforms the package exports the full API as a no-op implementation. `isSupported()` returns `false`, sends reject with `session-not-supported`, and state queries resolve `false`, `0`, `null` or `{}`. Android used to export only the four hooks.

### Added
- `isSupported()`: a synchronous check. It is `false` where WatchConnectivity is unavailable, such as iPads.
- `getReceivedApplicationContext()`: the context the watch last sent, including one that arrived while the app was not running.
- `getIsComplicationEnabled()` and `getRemainingComplicationUserInfoTransfers()`.
- `WatchError`, `isWatchError(error, code?)`, `WATCH_ERROR_CODES` and the `WatchErrorCode` type.
- Jest tests for the JS API, and XCTest tests for the native module in the example app.

### Fixed
- A context received from the watch is no longer sent back to the watch. The module used to call `updateApplicationContext` with every received context, which also replaced the context this phone sends.
- Sends no longer hang on devices without WatchConnectivity. `sendMessage`, `sendMessageData`, `startFileTransfer` and `updateApplicationContext` reject with `session-not-supported`.
- The session reactivates after the user switches to another paired watch. Paired, installed and reachability events then report the new watch.
- Importing the package on the web no longer crashes.
- The Android module builds. It implements the spec and reports that WatchConnectivity is not supported.
- Error events and failed file transfers no longer send an `NSError` object, which the bridge cannot serialise.
- The event buffer, received queues and reply handlers are thread-safe. WCSession calls the module on a background queue, and a message arriving while JS added its first listener could crash the app.
- `getQueuedUserInfo` and `getQueuedFiles` no longer resolve `{}`. They emptied the queue before JS received it.
- Reply handlers for messages from the watch are no longer evicted under memory pressure, and each is released after it replies.
- Importing the package outside Metro, for example in Node or a web bundler, loads the no-op implementation instead of failing to resolve `./RNWatch`.

---

## [2.0.0] - 2026-03-20

[Compare with 1.1.0](https://github.com/mtford90/react-native-watch-connectivity/compare/1.1.0...2.0.0)

### Changed
- Modernised project scaffold

---

## [1.1.0] - 2022-09-29

[Compare with 1.0.11](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.11...1.1.0)

### Added
- Receiving files from the watch is now supported on the JS side

---

## [1.0.11] - 2022-06-29

[Compare with 1.0.10](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.10...1.0.11)

### Fixed
- Corrected Android type exports

---

## [1.0.10] - 2022-06-27

[Compare with 1.0.9](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.9...1.0.10)

### Added
- Android stubs for hooks so they no longer crash on Android

### Fixed
- Hooks now correctly return an unsubscribe function

---

## [1.0.9] - 2022-06-27

[Compare with 1.0.8](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.8...1.0.9)

### Fixed
- `use-paired` hook updated to handle session state correctly

---

## [1.0.8] - 2022-06-13

[Compare with 1.0.7](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.7...1.0.8)

### Fixed
- Propagate `userInfo` dictionary from `NSError` rather than the full error object
- Propagate `userInfo` dictionary from `WCUserInfoTransfer` rather than the full transfer object

---

## [1.0.7] - 2022-06-09

[Compare with 1.0.6](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.6...1.0.7)

### Fixed
- Corrected event name for connectivity error events

---

## [1.0.6] - 2022-06-08

[Compare with 1.0.5](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.5...1.0.6)

### Added
- Native connectivity errors are now propagated across the bridge as discrete JS events
- Added Expo support documentation

### Fixed
- Added missing event strings to `supportedEvents` on the native side

---

## [1.0.5] - 2022-05-18

[Compare with 1.0.4](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.4...1.0.5)

### Fixed
- Fixed endless user info event loop
- Warn when a user info transfer encounters an error
- Various dependency security updates

---

## [1.0.4] - 2021-08-22

[Compare with 1.0.3](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.3...1.0.4)

### Fixed
- Fixed crash caused by reply handler being purged from the cache prematurely
- Events are now delayed until a listener is registered to prevent missed events

---

## [1.0.3] - 2020-11-03

[Compare with 1.0.2](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.2...1.0.3)

### Fixed
- Remove observers on dealloc to prevent memory issues
- Fixed example app compatibility with iOS 14 and Apple Watch Series 7

---

## [1.0.2] - 2020-07-13

[Compare with 1.0.1](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.1...1.0.2)

### Fixed
- `util.h` was not included in the npm distribution

---

## [1.0.1] - 2020-07-13

[Compare with 1.0.0](https://github.com/mtford90/react-native-watch-connectivity/compare/1.0.0...1.0.1)

### Fixed
- `FileTransferEvent` was missing from the npm distribution

---

## [1.0.0] - 2020-07-12

[Compare with 0.5.0](https://github.com/mtford90/react-native-watch-connectivity/compare/0.5.0...1.0.0)

### Added
- `watchEvents.once` for single-use event subscriptions
- `on` as an alias to `addListener`
- Reply handler support when using `message.once`
- `after` callbacks for integration tests across messages, user info, and file transfers

### Changed
- All native callbacks replaced with promises (except messages, which remain callback-based due to reply handlers)
- Overhauled events system — significantly simplified and more consistent
- `watchState` renamed to `sessionActivationState`
- File events consolidated into a single event with a `status` field
- User info dequeueing and consumption logic greatly simplified
- Session activation state eliminated from public API

### Removed
- Deprecated hook methods removed
- Pointless error events removed

---

## [0.5.0] - 2020-06-17

[Compare with 0.4.2](https://github.com/mtford90/react-native-watch-connectivity/compare/0.4.2...0.5.0)

### Added
- Full TypeScript rewrite with exported types and hooks
- React hooks API (`useWatchState`, `useReachability`, etc.)
- Example app rewritten in TypeScript with functional components and hooks
- Resolved session unreachable error handling

### Changed
- Message payload types simplified for ease of use
- File transfer payload renamed and refactored
- Various naming and API refinements across the library

---

## [0.4.2] - 2019-12-04

[Compare with 0.4.1](https://github.com/mtford90/react-native-watch-connectivity/compare/0.4.1...0.4.2)

### Fixed
- `getIsPaired` moved back to native side to restore correct behaviour

---

## [0.4.1] - 2019-11-11

[Compare with 0.4.0](https://github.com/mtford90/react-native-watch-connectivity/compare/0.4.0...0.4.1)

### Changed
- Podspec renamed to `RNWatch.podspec` for consistency

---

## [0.4.0] - 2019-11-10

[Compare with 0.3.2](https://github.com/mtford90/react-native-watch-connectivity/compare/0.3.2...0.4.0)

### Added
- Support for sending complication user info

---

## [0.3.2] - 2019-10-06

[Compare with 0.3.1](https://github.com/mtford90/react-native-watch-connectivity/compare/0.3.1...0.3.2)

### Fixed
- Fixed `getReceiveApplicationContext` and a bug with `getApplicationContext`
- Fixed incorrect function name `getIsWatchApInstalled` in README
- Fixed bad README reference and branding (iWatch → Apple Watch)
- Moved podspec to repo root; added missing description field to fix `pod install` errors

---

## [0.3.1] - 2019-10-05

[Compare with 0.3.0](https://github.com/mtford90/react-native-watch-connectivity/compare/0.3.0...0.3.1)

### Fixed
- Added missing LICENSE file

---

## [0.3.0] - 2019-10-05

[Compare with 0.2.0](https://github.com/mtford90/react-native-watch-connectivity/compare/0.2.0...0.3.0)

### Changed
- Renamed native module to `RNWatch`
- Restructured project — library at root, example app in `/example`
- Switched to `RCTEventEmitter` for JS events
- Methods bound correctly to avoid context loss

---

## [0.2.0] - 2018-03-30

[Compare with 0.1.8](https://github.com/mtford90/react-native-watch-connectivity/compare/0.1.8...0.2.0)

### Added
- `isPaired` and `isWatchAppInstalled` support on both native and JS sides

---

## [0.1.8] - 2018-03-29

[Compare with 0.1.7](https://github.com/mtford90/react-native-watch-connectivity/compare/0.1.7...0.1.8)

### Added
- CocoaPods podspec support

### Fixed
- Corrected `watchState` and `watchReachability` callback signatures in documentation
- Updated import statement in `WatchBridge` for React Native 0.40.0

---

## [0.1.7] - 2017-01-28

[Compare with 0.1.6](https://github.com/mtford90/react-native-watch-connectivity/compare/0.1.6...0.1.7)

### Fixed
- Default values for callback parameters

---

## [0.1.6] - 2017-01-21

[Compare with 0.1.4](https://github.com/mtford90/react-native-watch-connectivity/compare/0.1.4...0.1.6)

### Changed
- Upgraded to React Native 0.40.0
- Added missing header search path for compilation

---

## [0.1.4] - 2016-08-20

[Initial release](https://github.com/mtford90/react-native-watch-connectivity/tree/0.1.4)

### Added
- Send and receive messages with reply handler support
- File transfer support (send files to watch)
- Application context (get, update, subscribe)
- User info transfer (send, get, subscribe)
- Watch reachability and pairing state
- Ping/pong demo example app
