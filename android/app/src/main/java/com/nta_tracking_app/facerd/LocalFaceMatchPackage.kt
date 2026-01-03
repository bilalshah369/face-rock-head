package com.nta_tracking_app.facerd

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class LocalFaceMatchPackage : ReactPackage {
  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ) = listOf(
    PhotoSignerModule(reactContext),
    LocalFaceMatchModule(reactContext)
  )

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ) = emptyList<ViewManager<*, *>>()
}