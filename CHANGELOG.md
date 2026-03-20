# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-03-20

[Compare with 1.1.0](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.1.0...2.0.0)

### Changed
- Modernised project scaffold

---

## [1.1.0] - 2022-09-29

[Compare with 1.0.11](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.11...1.1.0)

### Added
- Receiving files from the watch is now supported on the JS side

---

## [1.0.11] - 2022-06-29

[Compare with 1.0.10](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.10...1.0.11)

### Fixed
- Corrected Android type exports

---

## [1.0.10] - 2022-06-27

[Compare with 1.0.9](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.9...1.0.10)

### Added
- Android stubs for hooks so they no longer crash on Android

### Fixed
- Hooks now correctly return an unsubscribe function

---

## [1.0.9] - 2022-06-27

[Compare with 1.0.8](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.8...1.0.9)

### Fixed
- `use-paired` hook updated to handle session state correctly

---

## [1.0.8] - 2022-06-13

[Compare with 1.0.7](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.7...1.0.8)

### Fixed
- Propagate `userInfo` dictionary from `NSError` rather than the full error object
- Propagate `userInfo` dictionary from `WCUserInfoTransfer` rather than the full transfer object

---

## [1.0.7] - 2022-06-09

[Compare with 1.0.6](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.6...1.0.7)

### Fixed
- Corrected event name for connectivity error events

---

## [1.0.6] - 2022-06-08

[Compare with 1.0.5](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.5...1.0.6)

### Added
- Native connectivity errors are now propagated across the bridge as discrete JS events
- Added Expo support documentation

### Fixed
- Added missing event strings to `supportedEvents` on the native side

---

## [1.0.5] - 2022-05-18

[Compare with 1.0.4](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.4...1.0.5)

### Fixed
- Fixed endless user info event loop
- Warn when a user info transfer encounters an error
- Various dependency security updates

---

## [1.0.4] - 2021-08-22

[Compare with 1.0.3](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.3...1.0.4)

### Fixed
- Fixed crash caused by reply handler being purged from the cache prematurely
- Events are now delayed until a listener is registered to prevent missed events

---

## [1.0.3] - 2020-11-03

[Compare with 1.0.2](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.2...1.0.3)

### Fixed
- Remove observers on dealloc to prevent memory issues
- Fixed example app compatibility with iOS 14 and Apple Watch Series 7

---

## [1.0.2] - 2020-07-13

[Compare with 1.0.1](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.1...1.0.2)

### Fixed
- `util.h` was not included in the npm distribution

---

## [1.0.1] - 2020-07-13

[Compare with 1.0.0](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/1.0.0...1.0.1)

### Fixed
- `FileTransferEvent` was missing from the npm distribution

---

## [1.0.0] - 2020-07-12

[Compare with 0.5.0](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.5.0...1.0.0)

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

[Compare with 0.4.2](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.4.2...0.5.0)

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

[Compare with 0.4.1](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.4.1...0.4.2)

### Fixed
- `getIsPaired` moved back to native side to restore correct behaviour

---

## [0.4.1] - 2019-11-11

[Compare with 0.4.0](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.4.0...0.4.1)

### Changed
- Podspec renamed to `RNWatch.podspec` for consistency

---

## [0.4.0] - 2019-11-10

[Compare with 0.3.2](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.3.2...0.4.0)

### Added
- Support for sending complication user info

---

## [0.3.2] - 2019-10-06

[Compare with 0.3.1](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.3.1...0.3.2)

### Fixed
- Fixed `getReceiveApplicationContext` and a bug with `getApplicationContext`
- Fixed incorrect function name `getIsWatchApInstalled` in README
- Fixed bad README reference and branding (iWatch → Apple Watch)
- Moved podspec to repo root; added missing description field to fix `pod install` errors

---

## [0.3.1] - 2019-10-05

[Compare with 0.3.0](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.3.0...0.3.1)

### Fixed
- Added missing LICENSE file

---

## [0.3.0] - 2019-10-05

[Compare with 0.2.0](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.2.0...0.3.0)

### Changed
- Renamed native module to `RNWatch`
- Restructured project — library at root, example app in `/example`
- Switched to `RCTEventEmitter` for JS events
- Methods bound correctly to avoid context loss

---

## [0.2.0] - 2018-03-30

[Compare with 0.1.8](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.1.8...0.2.0)

### Added
- `isPaired` and `isWatchAppInstalled` support on both native and JS sides

---

## [0.1.8] - 2018-03-29

[Compare with 0.1.7](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.1.7...0.1.8)

### Added
- CocoaPods podspec support

### Fixed
- Corrected `watchState` and `watchReachability` callback signatures in documentation
- Updated import statement in `WatchBridge` for React Native 0.40.0

---

## [0.1.7] - 2017-01-28

[Compare with 0.1.6](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.1.6...0.1.7)

### Fixed
- Default values for callback parameters

---

## [0.1.6] - 2017-01-21

[Compare with 0.1.4](https://github.com/watch-connectivity/react-native-watch-connectivity/compare/0.1.4...0.1.6)

### Changed
- Upgraded to React Native 0.40.0
- Added missing header search path for compilation

---

## [0.1.4] - 2016-08-20

[Initial release](https://github.com/watch-connectivity/react-native-watch-connectivity/tree/0.1.4)

### Added
- Send and receive messages with reply handler support
- File transfer support (send files to watch)
- Application context (get, update, subscribe)
- User info transfer (send, get, subscribe)
- Watch reachability and pairing state
- Ping/pong demo example app
