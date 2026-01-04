package com.nta_face_rock_head.qrcodescanner

import android.annotation.SuppressLint
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage

class BarcodeAnalyzer(
        private val listener: BarcodeListener,
) : ImageAnalysis.Analyzer {

    private val options = BarcodeScannerOptions.Builder()
        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
        .build()

    private val scanner = BarcodeScanning.getClient(options)

    @SuppressLint("UnsafeExperimentalUsageError", "UnsafeOptInUsageError")
    override fun analyze(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {

            val image: InputImage =
                InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

            // Pass image to the scanner and have it do its thing
            scanner.process(image)
                .addOnSuccessListener { barcodes ->
                    // Task completed successfully
                    barcodes.firstOrNull().let { barcode ->
                        val rawValue = barcode?.rawValue
                        rawValue?.let {
                            listener.setBarCodeValue(it)
                        }
                    }
                    imageProxy.close()
                }
                .addOnFailureListener {
                    // You should really do something about Exceptions
                    listener.setBarCodeValue("")
                    imageProxy.close()
                }
        }
    }


}