package com.nta_face_rock_head.qrcodescanner

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*

class MyNativeModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var scanPromise: Promise? = null
    private val SCAN_REQUEST_CODE = 1001

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "MyNativeModule"

    /**
     * JS → Native
     * Launch Secure QR Scanner (PROMISE-BASED)
     */
    @ReactMethod
    fun openScanCodeActivity(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        scanPromise = promise
        val intent = Intent(activity, ScanCodeActivity::class.java)
        activity.startActivityForResult(intent, SCAN_REQUEST_CODE)
    }

    /**
     * Receive result from ScanCodeActivity
     */
    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode != SCAN_REQUEST_CODE) return

        val payload = data?.getStringExtra(Constants.BARCODE_RESULT)

        when {
            resultCode == Activity.RESULT_OK && !payload.isNullOrEmpty() -> {
                scanPromise?.resolve(payload)
            }
            resultCode == Constants.RESULT_INVALID -> {
                scanPromise?.reject("INVALID_QR", "Invalid QR Code")
            }
            else -> {
                scanPromise?.reject("SCAN_CANCELLED", "User cancelled scan")
            }
        }

        scanPromise = null
    }

    override fun onNewIntent(intent: Intent?) {
        // Not required
    }
}
