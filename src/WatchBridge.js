import {NativeModules, NativeAppEventEmitter, keymirror} from 'react-native'
const watchBridge = NativeModules.WatchBridge

const EVENT_FILE_TRANSFER_ERROR        = 'WatchFileTransferError'
const EVENT_FILE_TRANSFER_FINISHED     = 'WatchFileTransferFinished'
const EVENT_RECEIVE_MESSAGE            = 'WatchReceiveMessage'
const EVENT_WATCH_STATE_CHANGED        = 'WatchStateChanged'
const EVENT_WATCH_REACHABILITY_CHANGED = 'WatchReachabilityChanged'

export const WatchState = {
  NotActivated: 'NotActivated',
  Inactive:     'Inactive',
  Activated:    'Activated'
}

const _WatchState = {
  WCSessionActivationStateNotActivated: WatchState.NotActivated,
  WCSessionActivationStateInactive:     WatchState.Inactive,
  WCSessionActivationStateActivated:    WatchState.Activated
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
  getWatchState(cb) // Initial reading
  return _subscribe(EVENT_WATCH_STATE_CHANGED, payload => cb(null, _WatchState[payload.state]))
}

export function subscribeToWatchReachability (cb) {
  getWatchReachability(cb)
  return _subscribe(EVENT_WATCH_REACHABILITY_CHANGED, payload => cb(null, payload.reachability))
}

export function getWatchState (cb = function () {}) {
  return new Promise(resolve => {
    watchBridge.getSessionState(state => {
      cb(null, _WatchState[state])
      resolve(_WatchState[state])
    })
  })
}

export function getWatchReachability (cb) {
  return new Promise(resolve => {
    watchBridge.getReachability(reachability => {
      cb(null, reachability)
      resolve(reachability)
    })
  })
}