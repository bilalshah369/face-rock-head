package com.nta_face_rock_head.qrcodescanner.scanner;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.preference.PreferenceManager;
import android.util.Base64;
import android.util.Log;
import android.util.Pair;
import android.view.View;
import android.widget.Toast;


import org.json.JSONObject;

import com.nta_face_rock_head.qrcodescanner.util.Jp2ToPngConverter;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import java.util.ArrayList;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;

import javax.annotation.Nonnull;

import com.nta_face_rock_head.qrcodescanner.util.OpenJpegHelper;
import org.openJpeg.OpenJPEGJavaDecoder;

import com.nta_face_rock_head.R;
//import com.secureqrcodern1.utils.Constants;
//import org.jetbrains.annotations.NotNull;
//import org.jetbrains.annotations.Nullable;

public class ScannerModule extends ReactContextBaseJavaModule {
    private AadhaarQR aadhaarQR = new AadhaarQR();
    private final static String SIGN_KEY = "sign_key";
    private final Charset CHARSET = Charset.forName("ISO-8859-1");
    private boolean isVerified;
    private String sha256;
    private String address[] = new String[11];
    private boolean isXML;
    Context context;
    PackageManager packageManager;

    private HashMap _$_findViewCache;


    public ScannerModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return "RNScanUtil";
    }
    @ReactMethod
    public void convertPngToJpegFormat(String data, Promise promise) {
        Log.e("p2k", "decodejp2png");
        byte[] buffer = decodeJp2PNG(data);
        if (buffer != null) {
            String base64 = null;
            base64 = Base64.encodeToString(buffer, Base64.DEFAULT);
            promise.resolve(base64);
        } else {
            promise.resolve(data);

        }

    }


     private byte[] decodeJp2PNG(String imageString) {
        Log.e("pk2", "inside ddddddddddddddddddd");
        byte[] imageBytes = Base64.decode(imageString, Base64.DEFAULT);
        try {
            // File dir = getCurrentActivity().getFilesDir();
            //     File dummyPng = new File(dir, "temp.png");

            //     if (!dummyPng.exists()) {
            //         FileOutputStream fos = new FileOutputStream(dummyPng);
            //         fos.write(new byte[]{0}); // 1-byte dummy content
            //         fos.write(new byte[]{0}); // 1-byte dummy content
            //          fos.write(new byte[]{0}); // 1-byte dummy content
            //         fos.flush();
            //         fos.close();
            //     }
            FileOutputStream fo = getCurrentActivity().openFileOutput("temp.jp2", Context.MODE_PRIVATE);
            fo.write(imageBytes);
            fo.close();
        } catch (FileNotFoundException e) {
    Log.e("pk2", "FileNotFoundException while writing temp.jp2");
    Log.e("pk2", "Message: " + e.getMessage(), e);

} catch (IOException e) {
    Log.e("pk2", "IOException while writing temp.jp2");
    Log.e("pk2", "Message: " + e.getMessage(), e);

} catch (Exception e) {
    // safety net (important in native modules)
    Log.e("pk2", "Unexpected exception while writing temp.jp2");
    Log.e("pk2", "Message: " + e.getMessage(), e);
}
        OpenJPEGJavaDecoder decoder = new OpenJPEGJavaDecoder();
        String[] params2 = new String[4];
        params2[0] = "-i";
        String fileDir = getCurrentActivity().getFilesDir().getPath();
        params2[1] = fileDir + "/temp.jp2";// path to jp2
        params2[2] = "-o";
        params2[3] = fileDir + "/temp.png"; // path to png
        int result = decoder.decodeJ2KtoImage(params2);

File jp2 = new File(fileDir, "temp.jp2");
File png = new File(fileDir, "temp.png");

Log.e("pk2",
    "decodeResult=" + result +
    ", jp2Exists=" + jp2.exists() +
    ", jp2Size=" + jp2.length() +
    ", pngExists=" + png.exists() +
    ", pngSize=" + (png.exists() ? png.length() : -1)
);
            Log.e("pk2", "file dir"+fileDir);
        try {
             
            FileInputStream fin = getCurrentActivity().openFileInput("temp.png");
            byte[] buffer = new byte[fin.available()];
            fin.read(buffer);

            try {
                String deleteTemp = fileDir + "/temp.png";
                File deleteTempFile = new File(deleteTemp);
                if (deleteTempFile.exists()) {
                    deleteTempFile.delete();
                }

                deleteTemp = fileDir + "/temp.jp2";
                deleteTempFile = new File(deleteTemp);
                if (deleteTempFile.exists()) {
                    deleteTempFile.delete();
                }
            }
            catch (NullPointerException | SecurityException | IllegalArgumentException e){
                 Log.e("pk2", "Message 1: " + e.getMessage(), e);
                Log.i("Exception","PNG File not found");
            }

            return buffer;
        } catch (FileNotFoundException e) {
             Log.e("pk2", "Message 2: " + e.getMessage(), e);
            // File not found exception
        } catch (IOException e) {
             Log.e("pk2", "Message 3: " + e.getMessage(), e);
            // io exception
        }
        return null;
    }

    public void jpegToPng(byte[] data, String filename, Promise promise) {

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out); // 100-best quality
            out.close();
            promise.resolve(filename);
        } catch (Exception e) {
            // promise.reject("ERROR", "Unable to convert jpegToPng");
            // Exception
        }
    }

    class VerifyAsyncTask extends AsyncTask<byte[], Void, Pair<String, Boolean>> {
        @Override
        protected Pair<String, Boolean> doInBackground(byte[]... uidDataBytes) {

            byte[] uidData = uidDataBytes[0];
            byte[] sign = uidDataBytes[1];

            try {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                out.write(uidData, 0, uidData.length - 256);
                byte[] rawData = out.toByteArray();
                out.close();
                SignVerifier signVerifier = new SignVerifier();
                PublicKey publicKey = signVerifier.getPublicKey("abc.cer", "test".toCharArray(), getReactApplicationContext());
                return signVerifier.verifySignature(rawData, sign, publicKey, aadhaarQR.getRefId().charAt(3) - '0');

            } catch (IOException e) {
            }
            return new Pair<>("", false);
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected void onPostExecute(Pair<String, Boolean> isVerified) {
            super.onPostExecute(isVerified);

        }
    }


    // @ReactMethod
    // public void verifySignature(String uidData, String base64Sign, String uid, boolean isXml, Promise promise, Context context) throws ExecutionException, InterruptedException {
    //     byte[] uiData = null;
    //     if (isXml) {
    //         uiData = stringToByteArray(uidData);

    //     } else {
    //         uiData = new BigInteger(uidData).toByteArray();
    //         uiData = decompress(uiData);
    //     }

    //     aadhaarQR.setDigSign(base64Sign);
    //     aadhaarQR.setRefId(uid);
    //     byte[] sign = Base64.decode(aadhaarQR.getDigSign(), Base64.DEFAULT);
    //     Pair<String, Boolean> pair = new VerifyAsyncTask().execute(uiData, sign).get();
    //     String signVal = pair.first;
    //     Boolean boolVal = pair.second;
    //     WritableMap data = Arguments.createMap();

    //     promise.resolve(data);
    // }
@ReactMethod
public void verifySignature(
    String uidData,
    String base64Sign,
    String uid,
    boolean isXml,
    Promise promise
) throws ExecutionException, InterruptedException {

    Context context = getReactApplicationContext(); // ✅ CORRECT

    byte[] uiData;
    if (isXml) {
        uiData = stringToByteArray(uidData);
    } else {
        uiData = new BigInteger(uidData).toByteArray();
        uiData = decompress(uiData);
    }

    aadhaarQR.setDigSign(base64Sign);
    aadhaarQR.setRefId(uid);

    byte[] sign = Base64.decode(aadhaarQR.getDigSign(), Base64.DEFAULT);
    Pair<String, Boolean> pair =
            new VerifyAsyncTask().execute(uiData, sign).get();

    WritableMap data = Arguments.createMap();
    data.putBoolean("signatureValid", pair.second);

    promise.resolve(data);
}

    @ReactMethod
    public void validateSignature(String completeByteArrayExcludeSignatureA, String singatureByteArraryB, Promise promise) throws ExecutionException, InterruptedException {

        Context context = getReactApplicationContext().getApplicationContext();

        String[] newCompleteByteArrayExcludeSignature = completeByteArrayExcludeSignatureA.split(",");
        byte[] completeByteArrayExcludeSignature = new byte[newCompleteByteArrayExcludeSignature.length];

        for (int i = 0; i < newCompleteByteArrayExcludeSignature.length; i++) {
            Integer value = Integer.parseInt(newCompleteByteArrayExcludeSignature[i]);
            completeByteArrayExcludeSignature[i] = value.byteValue();
        }

        String[] newSingatureByteArrary = singatureByteArraryB.split(",");
        byte[] signatureByteArray = new byte[newSingatureByteArrary.length];

        for (int i = 0; i < newSingatureByteArrary.length; i++) {
            Integer value = Integer.parseInt(newSingatureByteArrary[i]);
            signatureByteArray[i] = value.byteValue();
        }

        Log.e( "Complete Byte Array: ", Arrays.toString(completeByteArrayExcludeSignature));
        Log.e( "signature Byte Array: ", Arrays.toString(signatureByteArray));

        boolean result = false;
//        //Browse through all .cer files in asset folder
        String[] cerFilesNames = new String[]{
                context.getString(R.string.auth_priv_key_stage_secure_qr),
                context.getString(R.string.UIDAI1),
                context.getString(R.string.uidai_auth_sign_prod_2023),
                context.getString(R.string.uidai),
                context.getString(R.string.uidai_auth_sign_prod),
                context.getString(R.string.uidai_prod_cdup),
                context.getString(R.string.uidai_auth_sign_prod_old_0),
                context.getString(R.string.auth_hsm),
                context.getString(R.string.uidai_auth_sign_prod_old),
                context.getString(R.string.uidai_12_06_18_cer),
                context.getString(R.string.Auth_Sign_Private_Key_08_06_2020),
                context.getString(R.string.FI_Private_key_2015),
                context.getString(R.string.Prod_QR_CodeSignValidationCert),
                context.getString(R.string.ssl),
                context.getString(R.string.Uidainew),
                context.getString(R.string.Auth_Sign_Private_Key_Prod),
                context.getString(R.string.UIDAI_2024_26),


        };

        boolean certValidate = false;
        for (String cerFileName : cerFilesNames) {
            try {
                //SHA-256
                Signature s = Signature.getInstance("SHA256withRSA");
                PublicKey pk = getPublicKeyFromCerFile(cerFileName, context);

                Log.e("Public key: ", String.valueOf(pk));
                Log.e("Certificate name: ", cerFileName);

                if (pk != null) {
                    s.initVerify(pk);
                    s.update(completeByteArrayExcludeSignature);
                    result = s.verify(signatureByteArray);
                    if (result) {
                        Log.e("CERTIFICATE USED TO VALIDATE :",cerFileName);
                        certValidate = true;
                        break;
                    }
                }
            } catch (Exception e) {
                Log.e("Exception:", "Exception:: in cert");
            }
        }
        promise.resolve(certValidate);
    }

    private static PublicKey getPublicKeyFromCerFile(String fileName,Context context) {
        InputStream fileStream = null;
        try {
            AssetManager assetManager = context.getApplicationContext().getAssets();
            fileStream = assetManager.open(fileName);
            CertificateFactory f = CertificateFactory.getInstance(context.getString(R.string.cer));
            X509Certificate certificate = (X509Certificate) f.generateCertificate(fileStream);
            PublicKey pk = certificate.getPublicKey();

            return pk;
        } catch (Exception e) {
            Log.e("Exception:","Exception to get pk");
        }
        return null;
    }


    private final char[] hexArray = "0123456789ABCDEF".toCharArray();

    public String getHexStringFromBytes(byte[] bytes) {

        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }

    private byte[] decompress(byte[] data) {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        try {
            ByteArrayInputStream in = new ByteArrayInputStream(data);
            GZIPInputStream gis = new GZIPInputStream(in);
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gis.read(buffer)) != -1) {
                os.write(buffer, 0, len);
            }
            os.close();
            gis.close();
        } catch (IOException e) {
            // io exception
            return null;
        }
        return os.toByteArray();
    }

    private byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4) + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    private byte[] stringToByteArray(String data) {
        byte[] byteArr = data.getBytes();
        return byteArr;
    }
private byte[] convertEncodedQRToBytes(String encodedPayload) {
    // Aadhaar Secure QR payload is a numeric BigInteger string
    return new BigInteger(encodedPayload).toByteArray();
}

@ReactMethod
public void decodeSecureQR(String encodedPayload, Promise promise) {
    try {
        Log.e("SECURE_QR", "==== START DECODE (NO VALIDATION) ====");

        // Declare result ONCE
        WritableMap result = Arguments.createMap();

        //  BigInteger → bytes
        byte[] qrBytes = new BigInteger(encodedPayload).toByteArray();
        if (qrBytes.length > 0 && qrBytes[0] == 0x00) {
            qrBytes = Arrays.copyOfRange(qrBytes, 1, qrBytes.length);
            Log.e("SECURE_QR", "Leading 0x00 removed from BigInteger");
        }
        Log.e("SECURE_QR", "QR raw bytes length = " + qrBytes.length);

        // Decompress
        byte[] data = decompress(qrBytes);
        if (data == null || data.length < 100) {
            throw new RuntimeException("Invalid Secure QR payload");
        }
        Log.e("SECURE_QR", "Decompressed payload length = " + data.length);

        // Parse STRING fields (0xFF delimited)
        List<byte[]> stringFields = new ArrayList<>();
        ByteArrayOutputStream current = new ByteArrayOutputStream();

        int offset = 0;
        for (; offset < data.length; offset++) {
            if ((data[offset] & 0xFF) == 0xFF) {
                byte[] field = current.toByteArray();
                stringFields.add(field);

                Log.e(
                        "SECURE_QR_FIELD",
                        "Field[" + (stringFields.size() - 1) + "] = " +
                                new String(field, "ISO-8859-1")
                );

                current.reset();

                if (stringFields.size() == 8) { // backend writes 8 fields
                    offset++; // skip delimiter
                    break;
                }
            } else {
                current.write(data[offset]);
            }
        }

        Log.e("SECURE_QR", "Total STRING fields found = " + stringFields.size());
        Log.e("SECURE_QR", "Binary section offset = " + offset);

        // Add string fields to result
        for (int i = 0; i < stringFields.size(); i++) {
            result.putString(
                    "field_" + i,
                    new String(stringFields.get(i), "ISO-8859-1")
            );
        }
if (stringFields.size() > 1) {
    String rollNumber = new String(stringFields.get(1), "ISO-8859-1");
    result.putString("rollNumber", rollNumber);
}
        //  Detect photo flag (field[4])
        boolean hasPhoto = stringFields.size() > 4 &&
                "1".equals(new String(stringFields.get(4), "ISO-8859-1"));

        result.putBoolean("hasPhoto", hasPhoto);
        result.putBoolean("verified", false);

        if (!hasPhoto) {
            Log.e("SECURE_QR", "QR does NOT contain photo");
            promise.resolve(result);
            return;
        }

        // Extract RAW IMAGE BYTES (REMOVE SIGNATURE)
        final int SIGNATURE_LEN = 256;

        if (data.length - offset <= SIGNATURE_LEN) {
            throw new RuntimeException("Binary section too small");
        }

        byte[] imageBytes = Arrays.copyOfRange(
                data,
                offset,
                data.length - SIGNATURE_LEN
        );

        Log.e("SECURE_QR", "Image-only payload length = " + imageBytes.length);

        //convertPngToJpegFormat()

        // 6️⃣ Detect image MIME type
        String mimeType = "image/jpeg";
        if (imageBytes.length >= 4 &&
            (imageBytes[0] & 0xFF) == 0x89 &&
            (imageBytes[1] & 0xFF) == 0x50 &&
            (imageBytes[2] & 0xFF) == 0x4E &&
            (imageBytes[3] & 0xFF) == 0x47) {
            mimeType = "image/png";
        }

       


        
        String photoBase64 =
                android.util.Base64.encodeToString(imageBytes, android.util.Base64.NO_WRAP);

        Log.e("SECURE_QR", "Photo Base64 length = " + photoBase64.length());

        result.putString("photoBase64", photoBase64);
        result.putString("photoMimeType", mimeType);
        result.putString(
                "warning",
                "Photo extracted without signature validation (RAW image bytes)"
        );

        Log.e("SECURE_QR", "==== DECODE COMPLETE ====");
        promise.resolve(result);

    } catch (Exception e) {
        Log.e("SECURE_QR_ERROR", e.getMessage(), e);
        promise.reject("SECURE_QR_DECODE_ERROR", e.getMessage(), e);
    }
}


private byte[] extractJp2BySOC(byte[] data) {
    for (int i = 0; i < data.length - 1; i++) {
        if ((data[i] & 0xFF) == 0xFF &&
            (data[i + 1] & 0xFF) == 0x4F) {
            return Arrays.copyOfRange(data, i, data.length);
        }
    }
    throw new RuntimeException("JPEG2000 SOC marker (FF 4F) not found");
}

private byte[] extractJp2(byte[] binaryPayload) {
    List<byte[]> binaryFields = new ArrayList<>();
    ByteArrayOutputStream current = new ByteArrayOutputStream();

    // Split binary payload by 0xFF delimiter
    for (byte b : binaryPayload) {
        if ((b & 0xFF) == 0xFF) {
            if (current.size() > 0) {
                binaryFields.add(current.toByteArray());
                current.reset();
            }
        } else {
            current.write(b);
        }
    }

    if (current.size() > 0) {
        binaryFields.add(current.toByteArray());
    }

    // Pick the LARGEST field as JP2 photo
    byte[] jp2 = null;
    int maxLen = 0;

    for (byte[] field : binaryFields) {
        if (field.length > maxLen) {
            maxLen = field.length;
            jp2 = field;
        }
    }

    if (jp2 == null || jp2.length < 500) {
        throw new RuntimeException("JP2 photo not found");
    }

    return jp2;
}



}
