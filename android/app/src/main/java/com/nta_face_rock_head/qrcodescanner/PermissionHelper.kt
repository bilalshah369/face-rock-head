package com.nta_face_rock_head.qrcodescanner

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat


class PermissionHelper(private val activity: Activity) {

    private var block: ((Int) -> Unit)? = null
    private val deniedPermissions: MutableList<String> = ArrayList()
    private val grantedPermissions: MutableList<String> = ArrayList()

    fun setCallback(permissionGrantedBlock: (Int) -> Unit) = run { this.block = permissionGrantedBlock }

    fun requestPermission(permissions: Array<String>, requestCode: Int) {
        deniedPermissions.clear()
        if (!hasPermissionGranted(permissions)) {
            ActivityCompat.requestPermissions(activity, deniedPermissions.toTypedArray(), requestCode)
        } else {
            block?.invoke(requestCode)
        }
    }

    fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>) {
        var didCheckNeverAgain = false
        grantedPermissions.clear()
        for (permission in permissions) {
            if (ActivityCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED) {
                grantedPermissions.add(permission)
            } else {
                if (!ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)) {
                    didCheckNeverAgain = true
                }
            }
        }
        deniedPermissions.removeAll(grantedPermissions)
        if (deniedPermissions.size > 0) {
            if (!didCheckNeverAgain) {
                getRequestAgainAlertDialog(activity, requestCode)
            } else {
                goToSettingsAlertDialog(activity,requestCode)
            }
        } else {
            block?.invoke(requestCode)
        }
    }

    private fun goToSettingsAlertDialog(view: Activity,requestCode: Int) {
        AlertDialog.Builder(view).setTitle(view.getString(R.string.permission_not_granted_dialog_title))
            .setMessage(view.getString(R.string.permission_not_granted_dialog__settings_msg))
            .setPositiveButton(view.getString(R.string.permission_dialog_go_to_settings_cta_title)) { _, _ ->
                val intent = Intent()
                intent.action = Settings.ACTION_APPLICATION_DETAILS_SETTINGS
                intent.addCategory(Intent.CATEGORY_DEFAULT)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                intent.flags = Intent.FLAG_ACTIVITY_NO_HISTORY
                intent.data = Uri.parse("package:" + view.packageName)
                view.startActivity(intent)
                requestPermission(deniedPermissions.toTypedArray(), requestCode)
            }.setCancelable(false).show()
    }

    private fun getRequestAgainAlertDialog(view: Activity, request_code: Int) {
        AlertDialog.Builder(view).setTitle(view.getString(R.string.permission_not_granted_dialog_title))
            .setMessage(R.string.permission_not_granted_dialog_local_msg)
            .setPositiveButton(view.getString(R.string.permission_dialog_ok_cta_title)) { _, _ ->
                requestPermission(deniedPermissions.toTypedArray(), request_code)
            }.setCancelable(false).show()
    }

    private fun hasPermissionGranted(permissions: Array<out String>): Boolean {
        var retValue = true
        for (permission in permissions) {
            if (ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_DENIED) {
                deniedPermissions.add(permission)
                retValue = false
            }
        }
        return retValue
    }
}