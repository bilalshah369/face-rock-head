package com.nta_face_rock_head.facematch

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class FaceMatchPackage : ReactPackage {

  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ): List<NativeModule> {
    return listOf(FaceMatchModule(reactContext))
  }

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> {
    return emptyList()
  }
}
