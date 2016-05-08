import {DeviceEventEmitter} from 'react-native'

const EVENT_KEYBOARD_SHOW = 'keyboardWillShow'
const EVENT_KEYBOARD_HIDE = 'keyboardWillHide'

export function listenToKeyboard (fn) {
  const subscriptions = [
    DeviceEventEmitter.addListener(EVENT_KEYBOARD_SHOW, e => fn(e.endCoordinates.height, e)),
    DeviceEventEmitter.addListener(EVENT_KEYBOARD_HIDE, e => fn(0, e))
  ]
  return () => subscriptions.forEach(fn => fn())
}