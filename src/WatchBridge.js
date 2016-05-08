import {NativeModules, NativeAppEventEmitter, keymirror} from 'react-native'
const watchBridge = NativeModules.WatchBridge

const EVENT_FILE_TRANSFER_ERROR          = 'WatchFileTransferError'
const EVENT_FILE_TRANSFER_FINISHED       = 'WatchFileTransferFinished'
const EVENT_RECEIVE_MESSAGE              = 'WatchReceiveMessage'
const EVENT_WATCH_STATE_CHANGED          = 'WatchStateChanged'
const EVENT_WATCH_REACHABILITY_CHANGED   = 'WatchReachabilityChanged'
const EVENT_WATCH_USER_INFO_RECEIVED     = 'WatchUserInfoReceived'
const EVENT_APPLICATION_CONTEXT_RECEIVED = 'WatchApplicationContextReceived'

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

export const Encoding = {
  NSASCIIStringEncoding:             1,
  NSNEXTSTEPStringEncoding:          2,
  NSJapaneseEUCStringEncoding:       3,
  NSUTF8StringEncoding:              4,
  NSISOLatin1StringEncoding:         5,
  NSSymbolStringEncoding:            6,
  NSNonLossyASCIIStringEncoding:     7,
  NSShiftJISStringEncoding:          8,
  NSISOLatin2StringEncoding:         9,
  NSUnicodeStringEncoding:           10,
  NSWindowsCP1251StringEncoding:     11,
  NSWindowsCP1252StringEncoding:     12,
  NSWindowsCP1253StringEncoding:     13,
  NSWindowsCP1254StringEncoding:     14,
  NSWindowsCP1250StringEncoding:     15,
  NSISO2022JPStringEncoding:         21,
  NSMacOSRomanStringEncoding:        30,
  NSUTF16StringEncoding:             10,
  NSUTF16BigEndianStringEncoding:    0x90000100,
  NSUTF16LittleEndianStringEncoding: 0x94000100,
  NSUTF32StringEncoding:             0x8c000100,
  NSUTF32BigEndianStringEncoding:    0x98000100,
  NSUTF32LittleEndianStringEncoding: 0x9c000100
}

const DEFAULT_ENCODING = Encoding.NSUTF8StringEncoding

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
 * Callback used in sendMessage
 *
 * @callback transferFileCallback
 * @param {Error} error
 * @param {string} transferId
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

export function subscribeToUserInfo (cb) {
  getUserInfo(cb)
  return _subscribe(EVENT_WATCH_USER_INFO_RECEIVED, payload => cb(null, payload))
}


export function subscribeToApplicationContext (cb) {
  getApplicationContext(cb)
  return _subscribe(EVENT_APPLICATION_CONTEXT_RECEIVED, payload => cb(null, payload))
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

export function getUserInfo (cb) {
  return new Promise(resolve => {
    watchBridge.getUserInfo(info => {
      cb(null, info)
      resolve(info)
    })
  })
}

export function getApplicationContext (cb) {
  return new Promise(resolve => {
    watchBridge.getApplicationContext(context => {
      cb(null, context)
      resolve(context)
    })
  })
}

/**
 * Transfer a file stored locally on the device to the iWatch
 *
 * @param {string} url - url to a file on the device e.g. a photo/video
 * @param {object} [metadata]
 * @param {transferFileCallback} [cb]
 * @returns {Promise}
 */
export function transferFile (url, metadata = {}, cb = function () {}) {
  return new Promise((resolve, reject) => {
    watchBridge.transferFile(url, metadata, resp => {
      resolve(resp)
      cb(null, resp)
    }, err => {
      reject(err)
      cb(err)
    })
  })
}

/**
 * Send a message to the watch over the bridge
 *
 * @param {string} data
 * @param {number} encoding - defaults to utf8
 * @param {sendMessageCallback} [cb] - may not be called at all if the watch does not reply
 * @return {Promise} - may not be resolved if the watch doesn't reply.
 */
export function sendMessageData (data, encoding = DEFAULT_ENCODING, cb = function () {}) {
  return new Promise((resolve, reject) => {
    const replyHandler = resp => {
      cb(null, resp)
      resolve(resp)
    }
    const errorHandler = err => {
      cb(err)
      reject(err)
    }
    watchBridge.sendMessageData(data, encoding, replyHandler, errorHandler)
  })
}

/**
 * @param {object} info
 */
export function sendUserInfo (info) {
  watchBridge.sendUserInfo(info)
}

/**
 * @param {object} context
 */
export function updateApplicationContext (context) {
  watchBridge.updateApplicationContext(context)
}