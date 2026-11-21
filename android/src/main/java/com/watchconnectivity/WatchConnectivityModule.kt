package com.watchconnectivity

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

/**
 * Android has no WatchConnectivity. The JS package never calls this module on
 * Android, but it implements the spec so apps that link it still build, and
 * anything that does call it learns that the session is not supported.
 */
class WatchConnectivityModule(reactContext: ReactApplicationContext) :
  NativeWatchConnectivitySpec(reactContext) {

  override fun isSupported(): Boolean = false

  override fun getReachability(promise: Promise) = promise.resolve(false)

  override fun getIsPaired(promise: Promise) = promise.resolve(false)

  override fun getIsWatchAppInstalled(promise: Promise) = promise.resolve(false)

  override fun getIsComplicationEnabled(promise: Promise) = promise.resolve(false)

  override fun getRemainingComplicationUserInfoTransfers(promise: Promise) =
    promise.resolve(0)

  override fun sendMessage(message: ReadableMap, promise: Promise) =
    rejectNotSupported(promise)

  override fun replyToMessageWithId(messageId: String, message: ReadableMap) = Unit

  override fun sendMessageData(str: String, encoding: Double, promise: Promise) =
    rejectNotSupported(promise)

  override fun transferFile(url: String, metaData: ReadableMap?, promise: Promise) =
    rejectNotSupported(promise)

  override fun getFileTransfers(promise: Promise) = promise.resolve(Arguments.createMap())

  override fun getQueuedFiles(promise: Promise) = promise.resolve(Arguments.createMap())

  override fun clearFilesQueue(promise: Promise) = promise.resolve(null)

  override fun dequeueFile(ids: ReadableArray) = Unit

  override fun transferUserInfo(userInfo: ReadableMap) = Unit

  override fun transferCurrentComplicationUserInfo(userInfo: ReadableMap) = Unit

  override fun getQueuedUserInfo(promise: Promise) = promise.resolve(Arguments.createMap())

  override fun clearUserInfoQueue(promise: Promise) = promise.resolve(null)

  override fun dequeueUserInfo(ids: ReadableArray) = Unit

  override fun updateApplicationContext(context: ReadableMap, promise: Promise) =
    rejectNotSupported(promise)

  override fun getApplicationContext(promise: Promise) = promise.resolve(null)

  override fun getReceivedApplicationContext(promise: Promise) = promise.resolve(null)

  override fun addListener(eventName: String) = Unit

  override fun removeListeners(count: Double) = Unit

  private fun rejectNotSupported(promise: Promise) =
    promise.reject(NOT_SUPPORTED_CODE, "WatchConnectivity is not supported on Android")

  companion object {
    const val NAME = NativeWatchConnectivitySpec.NAME

    // WCErrorCodeSessionNotSupported, the code iOS uses on devices without WatchConnectivity.
    private const val NOT_SUPPORTED_CODE = "7002"
  }
}
