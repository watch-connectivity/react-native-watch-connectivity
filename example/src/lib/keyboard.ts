import {Keyboard} from 'react-native';
import {useEffect} from 'react';

const EVENT_KEYBOARD_SHOW = 'keyboardWillShow';
const EVENT_KEYBOARD_HIDE = 'keyboardWillHide';

type KeyboardListener = (height: number, e: KeyboardEvent) => void;

export function listenToKeyboard(fn: KeyboardListener) {
  const subscriptions = [
    Keyboard.addListener(EVENT_KEYBOARD_SHOW, (e) =>
      fn(e.endCoordinates.height, e),
    ),
    Keyboard.addListener(EVENT_KEYBOARD_HIDE, (e) => fn(0, e)),
  ];

  return () =>
    subscriptions.forEach((cancelSubscription) => cancelSubscription.remove());
}

export function useKeyboardListener(fn: KeyboardListener) {
  useEffect(() => listenToKeyboard(fn));
}
