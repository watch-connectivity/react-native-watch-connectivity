package com.watchconnectivity

import com.facebook.react.bridge.ReactApplicationContext

class WatchConnectivityModule(reactContext: ReactApplicationContext) :
  NativeWatchConnectivitySpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeWatchConnectivitySpec.NAME
  }
}
