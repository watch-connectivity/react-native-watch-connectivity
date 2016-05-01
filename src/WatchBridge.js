import {NativeModules, NativeAppEventEmitter, keymirror} from 'react-native'
const watchBridge = NativeModules.WatchBridge

const EVENT_FILE_TRANSFER_ERROR    = 'WatchFileTransferError'
const EVENT_FILE_TRANSFER_FINISHED = 'WatchFileTransferFinished'
const EVENT_RECEIVE_MESSAGE        = 'WatchReceiveMessage'
const EVENT_WATCH_STATE_CHANGED    = 'WatchStateChanged'

export const WatchState = {
  WCSessionActivationStateNotActivated: 'WCSessionActivationStateNotActivated',
  WCSessionActivationStateInactive:     'WCSessionActivationStateInactive',
  WCSessionActivationStateActivated:    'WCSessionActivationStateActivated'
}

/**
 * Callback used in subscribeToFileTransfers
 *
 * @callback fileTransferCallback
 * @param {Error} error
 * @param {object} res
 * @param {string} fileURL
 * @param {object} metaData
 */

/**
 * Callback used in sendMessage
 *
 * @callback sendMessageCallback
 * @param {Error} error
 * @param {object} reply
 */

/**
 * Send a message to the watch over the bridge
 * @param {object} message
 * @param {sendMessageCallback} [cb]
 */
export function sendMessage (message, cb) {
  return watchBridge.sendMessage(message, reply => cb(null, reply), err => cb(err))
}

/**
 * Add listener to event
 * @param {string} event
 * @param {function} cb
 * @return {function} unsubscribe
 * @private
 */
export function _subscribe (event, cb) {
  return ::NativeAppEventEmitter.addListener(event, cb).remove
}

/**
 *
 * @param {fileTransferCallback} cb
 * @return {function} unsubscribe
 */
export function subscribeToFileTransfers (cb) {
  const subscriptions = [
    _subscribe(EVENT_FILE_TRANSFER_FINISHED, res => cb(null, res)),
    _subscribe(EVENT_FILE_TRANSFER_ERROR, (err, res) => cb(err, res)),
  ]
  return () => subscriptions.forEach(fn => fn())
}

/**
 *
 * @param {fileTransferCallback} cb
 * @return {sendMessageCallback} unsubscribe
 */
export function subscribeToMessages (cb) {
  return _subscribe(EVENT_RECEIVE_MESSAGE, cb)
}

/**
 *
 * @param cb
 * @returns {Function}
 */
export function subscribeToWatchState (cb) {
  getStateString(cb) // Initial reading
  return _subscribe(EVENT_WATCH_STATE_CHANGED, payload => cb(null, payload.state))
}

export function getStateString(cb = function () {}) {
  return new Promise(resolve => {
    watchBridge.getSessionState(state => {
      cb(null, state)
      resolve(state)
    })
  })
}