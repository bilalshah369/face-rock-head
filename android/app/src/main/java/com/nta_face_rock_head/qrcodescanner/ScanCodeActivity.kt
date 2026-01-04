package com.nta_face_rock_head.qrcodescanner

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.pdf.PdfRenderer
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CaptureRequest
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
import androidx.camera.camera2.interop.Camera2CameraControl
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.CaptureRequestOptions
import androidx.camera.camera2.interop.ExperimentalCamera2Interop
import androidx.camera.core.Camera
import androidx.camera.core.CameraControl
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.mlkit.vision.barcode.ZoomSuggestionOptions
import com.google.zxing.BinaryBitmap
import com.google.zxing.MultiFormatReader
import com.google.zxing.RGBLuminanceSource
import com.google.zxing.common.HybridBinarizer
import com.nta_face_rock_head.qrcodescanner.Constants.BARCODE_RESULT
import com.nta_face_rock_head.qrcodescanner.Constants.MSG
import com.nta_face_rock_head.qrcodescanner.Constants.RESULT_INVALID
import com.nta_face_rock_head.qrcodescanner.Constants.TITLE
import com.nta_face_rock_head.qrcodescanner.Utils.printLog
import com.nta_face_rock_head.databinding.ActivityCamBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.CoroutineContext
import com.google.zxing.Result
import java.io.File

private const val AUTO_CANCEL = 30000L

class ScanCodeActivity : AppCompatActivity(), BarcodeListener, CoroutineScope {

    private lateinit var binding: ActivityCamBinding
    private var processingBarcode = AtomicBoolean(false)
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var cameraProvider: ProcessCameraProvider
    private lateinit var camera: Camera
    private lateinit var preview: Preview

    private lateinit var imageAnalysis: ImageAnalysis
    private lateinit var cameraControl: CameraControl
    private lateinit var barcodeListener: BarcodeListener
    companion object {
        private const val GALLERY_REQUEST_CODE = 1001
        var activeInstance: ScanCodeActivity? = null


    }

    // Select back camera
    private var cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
    private var flashOn = false
    private val job = Job()

    private lateinit var permissionHelper: PermissionHelper
    private val permissionRequestCode = 123


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCamBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initializeData()
        onBackClicked()
        askForPermissions()
        activeInstance = this
    }

    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    private fun initializeData() {
        cameraExecutor = Executors.newSingleThreadExecutor()
        barcodeListener = this

        launch {
            delay(AUTO_CANCEL)
            exitActivity()
        }


        //set title and message
        binding.lblTitle.text = intent.extras?.getString(TITLE)
        binding.lblSubTitle.text = intent.extras?.getString(MSG)


        //Back Button
//        binding.btnBack.setOnClickListener {
//            val intent = Intent()
//            intent.putExtra(BARCODE_RESULT, "BackClicked")
//            setResult(RESULT_CANCELED, intent)
//            finish()
//        }

        //Flash Button
        binding.btnFlash.setOnClickListener {
            flash()
        }

        // Gallery Button
        binding.btnOpenGallery.setOnClickListener {
//           val reactContext = (applicationContext as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext
//           if (reactContext != null) {
//               reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
//                   .emit("onGalleryButtonClicked", "Button clicked from Android!")
//
//           }
            val galleryIntent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(galleryIntent, GALLERY_REQUEST_CODE)

        }


    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == GALLERY_REQUEST_CODE && resultCode == Activity.RESULT_OK && data != null) {
            val selectedImageUri = data.data
            handleSelectedImage(selectedImageUri)
        }
    }
//    private fun handleSelectedImage(imageUri: Uri?) {
//        if (imageUri != null) {
//            try {
//                val inputStream = contentResolver.openInputStream(imageUri)
//                val bitmap = BitmapFactory.decodeStream(inputStream)
//                val qrCodeText = decodeQRCode(bitmap)
//
//                if (qrCodeText != null) {
//                    sendDecodedQRCodeToReactNative(qrCodeText)
//                } else {
//                    // Send "Unable to parse" to React Native
//                    println("No QR code found in the image")
//                    sendDecodedQRCodeToReactNative("Unable to parse")
//                }
//            } catch (e: Exception) {
//                e.printStackTrace()
//                // Handle exception and send error message to React Native if needed
//                sendDecodedQRCodeToReactNative("Unable to parse")
//            }
//        } else {
//            println("No image selected")
//            sendDecodedQRCodeToReactNative("Unable to parse")
//        }
//    }
private fun handleSelectedImage(imageUri: Uri?) {
    if (imageUri != null) {
        try {
            val mimeType = contentResolver.getType(imageUri)
            println("MimeType: $mimeType")

            when {
                mimeType?.startsWith("image/") == true -> {
                    // Handle image formats (PNG, JPEG, etc.)
                    val inputStream = contentResolver.openInputStream(imageUri)
                    val bitmap = BitmapFactory.decodeStream(inputStream)
                    val qrCodeText = decodeQRCode(bitmap)

                    if (qrCodeText != null) {
                        sendDecodedQRCodeToReactNative(qrCodeText)
                    } else {
                        println("No QR code found in the image")
                        sendDecodedQRCodeToReactNative("Unable to parse")
                    }
                }

                mimeType == "application/pdf" -> {
                    // Handle PDF
                    val decodedText = decodeQRCodeFromPDF(imageUri)
                    if (decodedText != null) {
                        sendDecodedQRCodeToReactNative(decodedText)
                    } else {
                        println("No QR code found in the PDF")
                        sendDecodedQRCodeToReactNative("Unable to parse")
                    }
                }

                mimeType == "image/svg+xml" -> {
                    // Handle SVG (requires a library to render SVG as bitmap)
                    println("SVG format detected")
                    sendDecodedQRCodeToReactNative("SVG QR Code decoding is not supported")
                }

                else -> {
                    println("Unsupported file format")
                    sendDecodedQRCodeToReactNative("Unsupported file format")
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            sendDecodedQRCodeToReactNative("Unable to parse")
        }
    } else {
        println("No image selected")
        sendDecodedQRCodeToReactNative("Unable to parse")
    }
}

    private fun decodeQRCodeFromPDF(pdfUri: Uri): String? {
        return try {
            val inputStream = contentResolver.openInputStream(pdfUri)
            val pdfDocument = PdfRenderer(ParcelFileDescriptor.open(File(pdfUri.path), ParcelFileDescriptor.MODE_READ_ONLY))
            val page = pdfDocument.openPage(0) // Assuming QR is on the first page
            val bitmap = Bitmap.createBitmap(page.width, page.height, Bitmap.Config.ARGB_8888)
            page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            page.close()
            pdfDocument.close()

            // Decode QR Code from PDF page bitmap
            decodeQRCode(bitmap)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }


    private fun decodeQRCode(bitmap: Bitmap): String? {
        val intArray = IntArray(bitmap.width * bitmap.height)
        bitmap.getPixels(intArray, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)

        val source = RGBLuminanceSource(bitmap.width, bitmap.height, intArray)
        val binaryBitmap = BinaryBitmap(HybridBinarizer(source))

        return try {
            val result: Result = MultiFormatReader().decode(binaryBitmap)
            println("DecodedCode: ${result.text}") // Print the decoded QR code data

            result.text // Return the decoded text
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun sendDecodedQRCodeToReactNative(decodedText: String) {
        val reactContext = (application as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext
        reactContext?.let {
            it.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onQRCodeDecoded", decodedText)
        }
    }

    private fun onBackClicked() {
        println("backtriggd")
        onBackPressedDispatcher.addCallback(
            this@ScanCodeActivity,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    val intent = Intent()
                    intent.putExtra(BARCODE_RESULT, "BackClicked")
                    setResult(RESULT_CANCELED, intent)
                    finish()
                }
            })
    }

//    fun closeActivityWithCustomResult(actionResult: String) {
//        val intent = Intent().apply {
//            putExtra(Constants.BARCODE_RESULT, actionResult)
//        }
//        setResult(Constants.RESULT_CLOSED_WITH_ACTION, intent)
//        finish()
//    }

    fun closeActivityWithCustomResult(actionResult: String) {
        println("actionclose")
        val intent = Intent().apply {
            putExtra(Constants.BARCODE_RESULT, actionResult) // Custom result to differentiate the action
        }
        setResult(Constants.RESULT_CLOSED_WITH_ACTION, intent) // Use the new constant here
        finish() // Close the activity
    }

//    @ReactMethod
//    fun closeScanCodeActivityWithCustomResult(actionResult: String) {
//        println("Method called with actionResult: $actionResult")
//        val currentActivity = this@ScanCodeActivity
//        if (currentActivity is ScanCodeActivity) {
//            println("Current activity is ScanCodeActivity. Closing with result...")
//            currentActivity.closeActivityWithCustomResult(actionResult)
//        } else {
//            println("Current activity is not ScanCodeActivity. Skipping close.")
//        }
//    }
    private fun askForPermissions() {
        permissionHelper = PermissionHelper(this@ScanCodeActivity)
        permissionHelper.setCallback {
            startCamera()
        }
        permissionHelper.requestPermission(
            getRuntimePermissions(), permissionRequestCode
        )
    }

    private fun getRuntimePermissions(): Array<String> {
        val requiredRuntimePermission = arrayOf(Manifest.permission.CAMERA)
        val permissionsToRequest = mutableListOf<String>()
        for (permission in requiredRuntimePermission) {
            permission.let {
                if (!isPermissionGranted(this@ScanCodeActivity, it)) {
                    permissionsToRequest.add(permission)
                }
            }
        }

        return permissionsToRequest.toTypedArray()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        permissionHelper.onRequestPermissionsResult(requestCode, permissions)
    }

    private fun isPermissionGranted(context: Context, permission: String): Boolean {
        return (ContextCompat.checkSelfPermission(
            context, permission
        ) == PackageManager.PERMISSION_GRANTED)
    }


    private fun exitActivity() {
        val intent = Intent()
        intent.putExtra(BARCODE_RESULT, "TimeOut")
        setResult(Constants.RESULT_TIME_OUT, intent)
        finish() //Exit the activity
    }

    override fun onResume() {
        super.onResume()
        processingBarcode.set(false)
    }

    override fun onDestroy() {
        job.cancel() //Cancel the coroutine job when the activity is destroyed
        super.onDestroy()
        cameraExecutor.shutdown()
        activeInstance = null
    }


    @OptIn(ExperimentalCamera2Interop::class)
    private fun bindCameraUserCases() {

        val resolutionSelector = ResolutionSelector.Builder().setResolutionStrategy(
            ResolutionStrategy(
                Size(4320, 7680),
                ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER
            )
        ).build()

        val cameraSelector: CameraSelector = CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .build()

        preview = Preview.Builder()
            .build()
            .also {
                it.setSurfaceProvider(binding.previewView.surfaceProvider)
            }

    binding.previewView.implementationMode = PreviewView.ImplementationMode.PERFORMANCE

        imageAnalysis = ImageAnalysis.Builder()
            .setResolutionSelector(resolutionSelector)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()


        try {
            // Unbind any bound use cases before rebinding
            cameraProvider.unbindAll()
            // Bind use cases to lifecycleOwner
            camera =
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageAnalysis)
            cameraControl = camera.cameraControl
            cameraControl.setLinearZoom(1.0f)
            cameraControl.setZoomRatio(1.5f)


            imageAnalysis
                .also {
                    it.setAnalyzer(
                        cameraExecutor,
                        BarcodeAnalyzer(barcodeListener)
                    )

                }

            if (camera.cameraInfo.hasFlashUnit()) {
                camera.cameraControl.enableTorch(flashOn)
                binding.btnFlash.visibility = View.VISIBLE
            }

        } catch (e: Exception) {
            printLog("PreviewUseCase", "Binding failed! :(  $e")
        }

    }

    private fun startCamera() {
        try {
            val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

            cameraProviderFuture.addListener({
                cameraProvider = cameraProviderFuture.get()
                bindCameraUserCases()
            }, ContextCompat.getMainExecutor(this))
        } catch (e: Exception) {
            e.localizedMessage
        }
    }


    private fun flash() {
        flashOn = !flashOn
        // Change icon
        val id = if (flashOn) R.drawable.ic_round_flash_off else R.drawable.ic_round_flash_on
        binding.btnFlash.setImageDrawable(ContextCompat.getDrawable(this, id))

        try {
            // Bind use cases to lifecycleOwner
            camera =
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageAnalysis)
            camera.cameraControl.enableTorch(flashOn)
        } catch (e: Exception) {
            e.localizedMessage
        }
    }


    override fun setBarCodeValue(value: String) {
        if (value.isNotEmpty()) {
            if (processingBarcode.compareAndSet(false, true)) {
                val intent = Intent()
                intent.putExtra(BARCODE_RESULT, value)
                setResult(RESULT_OK, intent)
                finish()

            }
        } else {
            Toast.makeText(applicationContext, "Invalid QR Code", Toast.LENGTH_SHORT).show()
            val intent = Intent()
            intent.putExtra(BARCODE_RESULT, value)
            setResult(RESULT_INVALID, intent)
            finish()

        }
    }

}