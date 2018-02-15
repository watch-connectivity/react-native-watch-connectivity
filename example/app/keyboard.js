import {Keyboard} from 'react-native'

const EVENT_KEYBOARD_SHOW = 'keyboardWillShow'
const EVENT_KEYBOARD_HIDE = 'keyboardWillHide'

export function listenToKeyboard (fn) {
  const subscriptions = [
    Keyboard.addListener(EVENT_KEYBOARD_SHOW, e => fn(e.endCoordinates.height, e)),
    Keyboard.addListener(EVENT_KEYBOARD_HIDE, e => fn(0, e))
  ]
  return () => subscriptions.forEach(fn => fn())
}
