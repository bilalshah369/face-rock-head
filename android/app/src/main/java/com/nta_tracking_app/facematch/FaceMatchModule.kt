package com.nta_tracking_app.facematch

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import java.util.UUID

class FaceMatchModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var promise: Promise? = null
  private val REQUEST_CODE = 12345

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName(): String = "FaceMatch"

  @ReactMethod
  fun startFaceMatch(requestXml: String, promise: Promise) {
    this.promise = promise

    val intent = Intent("in.gov.uidai.rdservice.face.LOCAL_FACE_MATCH")
    intent.putExtra("request", requestXml)

    try {
      currentActivity?.startActivityForResult(intent, REQUEST_CODE)
    } catch (e: Exception) {
      promise.reject("INTENT_ERROR", e.message)
    }
  }

  override fun onActivityResult(
    activity: Activity?,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
  ) {
    if (requestCode == REQUEST_CODE) {
      val response = data?.getStringExtra("response")
      if (response != null) {
        promise?.resolve(response)
      } else {
        promise?.reject("NO_RESPONSE", "No response from UIDAI app")
      }
      promise = null
    }
  }

  override fun onNewIntent(intent: Intent?) {}
}
