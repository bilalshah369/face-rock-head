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

    // 🔒 VERY IMPORTANT: prevent multiple callbacks
    private var scanned = false

    @SuppressLint("UnsafeOptInUsageError")
    override fun analyze(imageProxy: ImageProxy) {
        if (scanned) {
            imageProxy.close()
            return
        }

        val mediaImage = imageProxy.image ?: run {
            imageProxy.close()
            return
        }

        val image = InputImage.fromMediaImage(
            mediaImage,
            imageProxy.imageInfo.rotationDegrees
        )

        scanner.process(image)
            .addOnSuccessListener { barcodes ->
                val barcode = barcodes.firstOrNull()
                val rawValue = barcode?.rawValue

                if (!rawValue.isNullOrEmpty()) {
                    scanned = true               // ✅ STOP further scans
                    listener.setBarCodeValue(rawValue) // ✅ RETURN VALUE
                }

                imageProxy.close()
            }
            .addOnFailureListener {
                // ❌ DO NOTHING HERE (DO NOT SEND EMPTY VALUE)
                imageProxy.close()
            }
    }
}
