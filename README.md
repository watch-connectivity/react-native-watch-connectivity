# React Native Watch Connectivity

Communicate with your Apple Watch apps over the React Native bridge.

**Note:** This library does not allow you to write your Apple Watch apps in React Native but rather allows your RN iOS app to communicate with a watch app written in Obj-C/Swift.

## Documentation

http://mtford.co.uk/react-native-watch-connectivity/

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
