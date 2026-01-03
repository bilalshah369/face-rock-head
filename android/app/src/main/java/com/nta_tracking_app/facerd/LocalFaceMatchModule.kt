package com.nta_tracking_app.facerd

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.facebook.react.bridge.ReactApplicationContext

class LocalFaceMatchModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    // UIDAI RD Service action (MUST BE EXACT)
    private val UIDAI_ACTION = "in.gov.uidai.rdservice.face.LOCAL_FACE_MATCH"

    // Intent keys (UIDAI defined)
    private val REQUEST_KEY = "request"
    private val RESPONSE_KEY = "response"

    private val REQUEST_CODE = 1001

    private var promise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        // This name is used in React Native JS
        return "LocalFaceMatch"
    }

    /**
     * Called from React Native JS
     * JS sends ONLY base64 data (already signed)
     */
    @ReactMethod
    fun startLocalFaceMatch(
        signedPhotoBase64: String,
        signedDocumentBase64: String,
        promise: Promise
    ) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        try {
            // 1️⃣ Build final UIDAI XML USING YOUR JAVA CLASSES
            val xmlRequest = UidaiFaceMatchService.buildSignedFaceMatchXml(
                signedPhotoBase64,
                signedDocumentBase64
            )

            // 2️⃣ Create UIDAI intent
            val intent = Intent(UIDAI_ACTION)
            intent.putExtra(REQUEST_KEY, xmlRequest)

            // 3️⃣ Store promise for response
            this.promise = promise

            // 4️⃣ Launch UIDAI RD Service
            activity.startActivityForResult(intent, REQUEST_CODE)

        } catch (e: Exception) {
            promise.reject("XML_BUILD_ERROR", e.message)
        }
    }

    /**
     * UIDAI RD Service returns result here
     */
    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode != REQUEST_CODE) return

        if (resultCode == Activity.RESULT_OK && data != null) {
            val responseXml = data.getStringExtra(RESPONSE_KEY)
            promise?.resolve(responseXml)
        } else {
            promise?.reject("FACE_MATCH_FAILED", "User cancelled or RD error")
        }

        promise = null
    }

    override fun onNewIntent(intent: Intent?) {
        // Not used
    }
}