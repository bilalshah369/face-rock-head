package com.nta_face_rock_head


import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader


import com.scottyab.rootbeer.RootBeer
import com.nta_face_rock_head.qrcodescanner.crypto.RNCrypto
import com.nta_face_rock_head.qrcodescanner.scanner.RNScanUtil

import com.nta_face_rock_head.qrcodescanner.MyReactPackage
import com.nta_face_rock_head.facematch.FaceMatchPackage
import com.nta_face_rock_head.facerd.LocalFaceMatchPackage
class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(FaceMatchPackage()) 
              add(RNCrypto()) 
              add(RNScanUtil()) 
              //add(MyAppPackage()) 
              add(MyReactPackage())
              add(LocalFaceMatchPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    val rootBeer = RootBeer(this)
  if (rootBeer.isRooted) {
    // Optional: block app / log / toast
  }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
