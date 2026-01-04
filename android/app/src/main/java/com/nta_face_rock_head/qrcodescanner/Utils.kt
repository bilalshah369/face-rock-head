package com.nta_face_rock_head.qrcodescanner

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.nta_face_rock_head.qrcodescanner.BuildConfig
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

//TODO Change Object to File
object Utils {

    fun epochToDateFormat(epochTime: Long, dateTimeFormat: String = "dd-MM-yyyy HH:mm:ss"): String {
        //"yyyy-MM-dd'T'HH:mm:ss'Z'"
        val date = Date(epochTime)
        val format: DateFormat = SimpleDateFormat(dateTimeFormat, Locale.ENGLISH)
        format.timeZone = TimeZone.getTimeZone("Asia/Kolkata")
        return format.format(date)
    }

    fun getMilliseconds(): Long {
        return System.currentTimeMillis()
    }

    @SuppressLint("HardwareIds")
    fun getDeviceId(context: Context): String {
        var deviceId: String? = ""
        try {
            deviceId = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ANDROID_ID
            )
        } catch (e: Exception) {
            e.localizedMessage
        }
        return deviceId.toString()
    }

    private fun getDeviceDetail(): String {
        val sb = StringBuilder()
        val detail =
            sb.append(Build.MANUFACTURER).append("|")
                .append(Build.BRAND).append("|").append(Build.MODEL).append("|")
        return detail.toString()
    }

    private fun getAppPackageName(context: Context): String {
        return context.packageName
    }

    private fun getAppVersionName(context: Context): String {
        return try {
            val packageInfo: PackageInfo =
                context.packageManager.getPackageInfo(context.packageName, 0)
            packageInfo.versionName ?: "Unknown"
        } catch (e: PackageManager.NameNotFoundException) {
            "Unknown"
        }
    }

    private fun getResolution(appContext: Context): String{

        val cameraResolutionBack = try {
            val backCameraData =
                getCameraCharacteristics(appContext, CameraCharacteristics.LENS_FACING_BACK)
            val backCameraPixelSize =
                backCameraData?.get(CameraCharacteristics.SENSOR_INFO_PIXEL_ARRAY_SIZE)
            "${(backCameraPixelSize?.height?.times(backCameraPixelSize.width))?.div(1000000)} MP"
        } catch (e: Exception) {
            null
        }

        return cameraResolutionBack!!
    }

    private fun getCameraCharacteristics(
        appContext: Context,
        lensFacing: Int
    ): CameraCharacteristics? {
        val manager = appContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        val cameraId = getCameraInterfaceId(appContext, lensFacing)
        return cameraId?.let { manager.getCameraCharacteristics(it) }
    }

    private fun getCameraInterfaceId(appContext: Context, lensFacing: Int): String? {
        val manager = appContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        try {
            for (cameraId in manager.cameraIdList) {
                val characteristics = manager.getCameraCharacteristics(cameraId)
                val facing = characteristics.get(CameraCharacteristics.LENS_FACING)
                if (facing != null && facing != lensFacing) {
                    continue
                }
                return cameraId
            }
        } catch (e: CameraAccessException) {
            printLog("Exception", "Error CameraAccess Exception : ${e.message}")
        }
        return null
    }


    fun printLog(tag:String,message:String){
        if(BuildConfig.DEBUG){
            Log.e(tag,message)
        }
    }

}