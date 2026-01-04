package com.nta_face_rock_head.facerd

import com.facebook.react.bridge.*
import android.util.Base64
import java.text.SimpleDateFormat
import java.util.*

class PhotoSignerModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "PhotoSigner"

  /**
   * MOCK SIGNER (DEV ONLY)
   * Converts SignedPhoto XML → Base64
   */
  @ReactMethod
  fun signPhoto(photoBase64: String, promise: Promise) {
    try {
      val signedPhotoXml = """
        <SignedPhoto>
          <Pht>$photoBase64</Pht>
          <dateTime>${getDateTime()}</dateTime>
          <referenceNo>${UUID.randomUUID()}</referenceNo>
        </SignedPhoto>
      """.trimIndent()

      val fakeCmsBase64 = Base64.encodeToString(
        signedPhotoXml.toByteArray(),
        Base64.NO_WRAP
      )

      promise.resolve(fakeCmsBase64)

    } catch (e: Exception) {
      promise.reject("MOCK_SIGN_ERROR", e.message)
    }
  }

  private fun getDateTime(): String =
    SimpleDateFormat("yyyyMMddHHmmss", Locale.ENGLISH)
      .format(Date())
}
