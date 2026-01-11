package com.nta_face_rock_head.qrcodescanner

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager    
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.Bundle
import android.os.ParcelFileDescriptor
import android.provider.MediaStore
import android.util.Size
import android.view.View
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.annotation.OptIn
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.google.zxing.BinaryBitmap
import com.google.zxing.MultiFormatReader
import com.google.zxing.RGBLuminanceSource
import com.google.zxing.common.HybridBinarizer
import com.google.zxing.Result
import com.nta_face_rock_head.databinding.ActivityCamBinding
import com.nta_face_rock_head.qrcodescanner.Constants.BARCODE_RESULT
import com.nta_face_rock_head.qrcodescanner.Constants.MSG
import com.nta_face_rock_head.qrcodescanner.Constants.RESULT_INVALID
import com.nta_face_rock_head.qrcodescanner.Constants.TITLE
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.CoroutineContext

private const val AUTO_CANCEL = 30000L

class ScanCodeActivity : AppCompatActivity(), BarcodeListener, CoroutineScope {

    private lateinit var binding: ActivityCamBinding
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var cameraProvider: ProcessCameraProvider
    private lateinit var preview: Preview
    private lateinit var imageAnalysis: ImageAnalysis

    private val processingBarcode = AtomicBoolean(false)
    private val job = Job()

    private lateinit var permissionHelper: PermissionHelper
    private val permissionRequestCode = 123

    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCamBinding.inflate(layoutInflater)
        setContentView(binding.root)

        cameraExecutor = Executors.newSingleThreadExecutor()

        binding.lblTitle.text = intent.getStringExtra(TITLE)
        binding.lblSubTitle.text = intent.getStringExtra(MSG)
binding.btnBack.setOnClickListener {
    setResult(Activity.RESULT_CANCELED, Intent())
    finish()
}
        onBackClicked()
        askForPermissions()

        launch {
            delay(AUTO_CANCEL)
            exitWithTimeout()
        }
    }

    /* ================= CAMERA ================= */

    private fun startCamera() {
        val providerFuture = ProcessCameraProvider.getInstance(this)
        providerFuture.addListener({
            cameraProvider = providerFuture.get()
            bindCameraUseCases()
        }, ContextCompat.getMainExecutor(this))
    }

    private fun bindCameraUseCases() {

        val resolutionSelector = ResolutionSelector.Builder()
            .setResolutionStrategy(
                ResolutionStrategy(
                    Size(1920, 1080),
                    ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER
                )
            )
            .build()

        preview = Preview.Builder().build().also {
            it.setSurfaceProvider(binding.previewView.surfaceProvider)
        }

        imageAnalysis = ImageAnalysis.Builder()
            .setResolutionSelector(resolutionSelector)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()

        imageAnalysis.setAnalyzer(
            cameraExecutor,
            BarcodeAnalyzer(this)
        )

        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

        cameraProvider.unbindAll()
        cameraProvider.bindToLifecycle(
            this,
            cameraSelector,
            preview,
            imageAnalysis
        )
    }

    /* ================= BARCODE CALLBACK ================= */

    override fun setBarCodeValue(value: String) {

        if (value.isNotEmpty() && processingBarcode.compareAndSet(false, true)) {

            val intent = Intent()
            intent.putExtra(BARCODE_RESULT, value)

            setResult(Activity.RESULT_OK, intent)
            finish()

        } else {
            val intent = Intent()
            intent.putExtra(BARCODE_RESULT, "")
            setResult(RESULT_INVALID, intent)
            finish()
        }
    }

    /* ================= GALLERY ================= */

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == 1001 && resultCode == Activity.RESULT_OK && data != null) {
            handleSelectedImage(data.data)
        }
    }

    private fun handleSelectedImage(uri: Uri?) {
        if (uri == null) {
            returnInvalid()
            return
        }

        val mimeType = contentResolver.getType(uri)

        val decoded = when {
            mimeType?.startsWith("image/") == true -> {
                decodeQRCode(BitmapFactory.decodeStream(contentResolver.openInputStream(uri)))
            }
            mimeType == "application/pdf" -> {
                decodeQRCodeFromPDF(uri)
            }
            else -> null
        }

        if (decoded != null) {
            val intent = Intent()
            intent.putExtra(BARCODE_RESULT, decoded)
            setResult(Activity.RESULT_OK, intent)
        } else {
            setResult(RESULT_INVALID, Intent())
        }

        finish()
    }

    private fun decodeQRCode(bitmap: Bitmap?): String? {
        if (bitmap == null) return null

        val pixels = IntArray(bitmap.width * bitmap.height)
        bitmap.getPixels(pixels, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)

        val source = RGBLuminanceSource(bitmap.width, bitmap.height, pixels)
        val binaryBitmap = BinaryBitmap(HybridBinarizer(source))

        return try {
            MultiFormatReader().decode(binaryBitmap).text
        } catch (e: Exception) {
            null
        }
    }

    private fun decodeQRCodeFromPDF(uri: Uri): String? {
        return try {
            val file = File(uri.path ?: return null)
            val renderer = PdfRenderer(ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY))
            val page = renderer.openPage(0)

            val bitmap = Bitmap.createBitmap(page.width, page.height, Bitmap.Config.ARGB_8888)
            page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

            page.close()
            renderer.close()

            decodeQRCode(bitmap)
        } catch (e: Exception) {
            null
        }
    }

    /* ================= PERMISSIONS ================= */

    private fun askForPermissions() {
        permissionHelper = PermissionHelper(this)
        permissionHelper.setCallback { startCamera() }
        permissionHelper.requestPermission(
            arrayOf(Manifest.permission.CAMERA),
            permissionRequestCode
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        permissionHelper.onRequestPermissionsResult(requestCode, permissions)
    }

    /* ================= EXIT HANDLING ================= */

    private fun onBackClicked() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                setResult(Activity.RESULT_CANCELED, Intent())
                finish()
            }
        })
    }

    private fun exitWithTimeout() {
        setResult(Constants.RESULT_TIME_OUT, Intent())
        finish()
    }

    private fun returnInvalid() {
        setResult(RESULT_INVALID, Intent())
        finish()
    }

    override fun onDestroy() {
        job.cancel()
        cameraExecutor.shutdown()
        super.onDestroy()
    }
}
