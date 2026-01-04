package com.nta_face_rock_head.qrcodescanner

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.nta_face_rock_head.qrcodescanner.ScanCodeActivity

class MyNativeModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var scanPromise: Promise? = null
    private val SCAN_REQUEST_CODE = 1001

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "MyNativeModule"
    }

    /**
     * JS → Native
     * Launch Secure QR Scanner
     */
    @ReactMethod
    fun openScanCodeActivity(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        scanPromise = promise
        val intent = Intent(activity, ScanCodeActivity::class.java)
        activity.startActivityForResult(intent, SCAN_REQUEST_CODE)
    }

    /**
     * Result from ScanCodeActivity
     */
//    override fun onActivityResult(
//        activity: Activity?,
//        requestCode: Int,
//        resultCode: Int,
//        data: Intent?
//    ): Boolean {
//        if (requestCode == SCAN_REQUEST_CODE) {
//            if (resultCode == Activity.RESULT_OK) {
//                val decryptedResult = data?.getStringExtra("SCAN_RESULT")
//                scanPromise?.resolve(decryptedResult)
//            } else {
//                scanPromise?.reject("SCAN_CANCELLED", "User cancelled scan")
//            }
//            scanPromise = null
//            return true
//        }
//        return false
//    }
    override fun onActivityResult(
    activity: Activity?,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
) {
    if (requestCode == SCAN_REQUEST_CODE) {
        if (resultCode == Activity.RESULT_OK) {
            val decryptedResult = data?.getStringExtra("SCAN_RESULT")
            scanPromise?.resolve(decryptedResult)
        } else {
            scanPromise?.reject("SCAN_CANCELLED", "User cancelled scan")
        }
        scanPromise = null
    }
}


    override fun onNewIntent(intent: Intent?) {
        // Not required
    }

    /**
     * Optional: Native → JS event emitter (keep if needed)
     */
    private fun sendEvent(eventName: String, eventData: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, eventData)
    }
}
