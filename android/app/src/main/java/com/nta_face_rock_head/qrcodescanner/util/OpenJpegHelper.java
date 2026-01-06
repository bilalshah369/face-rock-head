package com.nta_face_rock_head.qrcodescanner.util;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import org.openJpeg.OpenJPEGJavaDecoder;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;

public class OpenJpegHelper {

    public static String decodeJp2ToBase64Png(
            Context context,
            byte[] jp2Bytes
    ) throws Exception {

        // 1️⃣ Write JP2 to temp file
        File jp2File = new File(context.getCacheDir(), "photo.j2k");
        FileOutputStream fos = new FileOutputStream(jp2File);
        fos.write(jp2Bytes);
        fos.close();

        // 2️⃣ Output PNG file
        File pngFile = new File(context.getCacheDir(), "photo.png");

        // 3️⃣ Decode using OpenJPEG (JNI)
        OpenJPEGJavaDecoder decoder = new OpenJPEGJavaDecoder();
        String[] params = new String[]{
                "-i", jp2File.getAbsolutePath(),
                "-o", pngFile.getAbsolutePath()
        };

        int result = decoder.decodeJ2KtoImage(params);
        if (result != 0) {
            throw new RuntimeException("OpenJPEG decode failed, code=" + result);
        }

        // 4️⃣ Load PNG as Bitmap
        Bitmap bitmap = BitmapFactory.decodeFile(pngFile.getAbsolutePath());
        if (bitmap == null) {
            throw new RuntimeException("PNG decode failed");
        }

        // 5️⃣ Bitmap → Base64
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, bos);

        String base64 =
                Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);

        // 6️⃣ Cleanup
        jp2File.delete();
        pngFile.delete();

        return base64;
    }
}
