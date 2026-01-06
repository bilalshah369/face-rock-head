package com.nta_face_rock_head.qrcodescanner.util;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

public class Jp2ToPngConverter {

    private static final String TAG = "JP2_CONVERTER";

    /**
     * Convert UIDAI JP2 bytes → Android Bitmap
     */
    public static Bitmap convert(byte[] jp2Bytes) {
        if (jp2Bytes == null || jp2Bytes.length == 0) {
            throw new IllegalArgumentException("JP2 bytes are empty");
        }

        Bitmap bitmap = BitmapFactory.decodeByteArray(
                jp2Bytes,
                0,
                jp2Bytes.length
        );

        if (bitmap == null) {
            Log.e(TAG, "BitmapFactory failed to decode JP2");
            throw new RuntimeException("JP2 decode failed");
        }

        return bitmap;
    }
}
