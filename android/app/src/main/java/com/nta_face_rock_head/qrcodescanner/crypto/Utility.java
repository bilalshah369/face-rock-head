package com.nta_face_rock_head.qrcodescanner.crypto;

import android.content.Context;
import android.content.res.AssetManager;
import android.text.TextUtils;
import android.util.Base64;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

public final class Utility {

    private static final String FILE_NAME_STAGING_PUBLIC_KEY = "certificate1.cer";
    private static final String FILE_NAME_PROD_PUBLIC_KEY = "certificate2.cer";
    private static final String FILE_NAME_QA_PUBLIC_KEY = "certificate3.cer";

    public static List<byte[]> loadPublicKeys(Context context) {
        InputStream fileStream = null;
        BufferedReader reader = null;
        List<byte[]> keys = new ArrayList<>();
        try {
            AssetManager assetManager = context.getAssets();
            fileStream = assetManager.open(FILE_NAME_PROD_PUBLIC_KEY);

            reader = new BufferedReader(new InputStreamReader(fileStream));

            String line;
            int i = 0;
            while ((line = reader.readLine()) != null) {
//                byte[] key = Base64.decode(line.trim());
//                keys.add(key);
            }
        } catch (IOException e) {
            // ignore
        } finally {
            closeStreams(fileStream, reader);
        }

        return keys;
    }

    private static void closeStreams(InputStream fileStream, BufferedReader reader) {
        if (fileStream != null) {
            try {
                fileStream.close();
            } catch (IOException e) {
            }
        }
        if (reader != null) {
            try {
                reader.close();
            } catch (IOException e) {
            }
        }
    }

//    public static String byteArrayToHexString(byte[] bytes) {
//        StringBuffer result = new StringBuffer();
//        for (int i = 0; i < bytes.length; i++) {
//            result.append(Integer.toString((bytes[i] & 0xff) + 0x100, 16).substring(1));
//        }
//        return result.toString();
//    }

    public static String byteArrayToHex(byte[] inBytes) {
        StringBuffer result = new StringBuffer();

        for (int i = 0; i < inBytes.length; i++)
            result.append(Integer.toString((inBytes[i] & 0xff) + 0x100, 16).substring(1));
        return result.toString();
    }

    public static byte[] hexStringToByteArray(String data) {
        int k = 0;
        byte[] results = new byte[data.length() / 2];
        for (int i = 0; i < data.length();) {
            results[k] = (byte) (Character.digit(data.charAt(i++), 16) << 4);
            results[k] += (byte) (Character.digit(data.charAt(i++), 16));
            k++;
        }
        return results;
    }

    /**
     * Combine two byte arrays
     *
     * @param byte2 first byte array,this will be appended after the byte1 in the
     *              output
     * @param byte1 second byte array,this will be appended before the byte2 in the
     *              output
     * @return byte[] combined byte array
     */
//    public static byte[] mergeStream(byte[] byte2, byte[] byte1) {
//        byte[] message = new byte[byte1.length + byte2.length];
//        System.arraycopy(byte1, 0, message, 0, byte1.length);
//        System.arraycopy(byte2, 0, message, byte1.length, byte2.length);
//        return message;
//    }

    /**
     * split a byte array in two
     *
     * @param src byte array to be split
     * @param n   element at which to split the byte array
     * @return byte[][] two byte arrays that have been split
     */
//    public static byte[][] split(byte[] src, int n) {
//        byte[] l, r;
//        if (src == null || src.length <= n) {
//            l = src;
//            r = new byte[0];
//        } else {
//            l = new byte[n];
//            r = new byte[src.length - n];
//            System.arraycopy(src, 0, l, 0, n);
//            System.arraycopy(src, n, r, 0, r.length);
//        }
//        return new byte[][] { l, r };
//    }

    /**
     * Returns the random object
     *
     * @return SecureRandom
     * @throws 'RuntimeException' Algorithm Issue.
     */
//    public static SecureRandom generateRandom() {
////        SecureRandom sr = null;
//        SecureRandom sr = new SecureRandom();
////        try {
//
////            sr = SecureRandom.getInstance("SHA1PRNG");
//
//        byte[] bytes = new byte[1024 / 8];
//        sr.nextBytes(bytes);
//        int seedByteCount = 10;
//        byte[] seed = sr.generateSeed(seedByteCount);
//
//        sr.setSeed(seed);
//
////        } catch (NoSuchAlgorithmException e) {
////            throw new RuntimeException("Random Number Generation Error.");
////        }
//        return sr;
//    }

//    public static byte[] getRandomBytes(int byteLength) {
//        try {
//            SecureRandom sr = SecureRandom.getInstance("SHA1PRNG");
//            byte[] bytes = new byte[byteLength];
//            sr.nextBytes(bytes);
//            return bytes;
//        } catch (NoSuchAlgorithmException e) {
//            throw new RuntimeException("Random Number Generation Error.");
//        }
//    }

//    public static int length(byte[] byteArr) {
//        return (byteArr == null ? 0 : byteArr.length);
//    }

//    public static int length(String anyStr) {
//        return (anyStr == null ? 0 : anyStr.trim().length());
//    }

    /*
     * Converting the machine code to UID format
     *
     * @return UID string
     */
//    public static String convertToUUID(String convertString) {
//        StringBuilder newValue = new StringBuilder();
//        newValue.append(convertString.substring(0, 8));
//        newValue.append("-");
//        newValue.append(convertString.substring(8, 12));
//        newValue.append("-");
//        newValue.append(convertString.substring(12, 16));
//        newValue.append("-");
//        newValue.append(convertString.substring(16, 20));
//        newValue.append("-");
//        newValue.append(convertString.substring(20, 32));
//
//        return newValue.toString();
//
//    }

    public static byte[] generateHash(byte[] message) {
        byte[] hash = null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            digest.reset();
            hash = digest.digest(message);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("SHA-256 Hashing algorithm not available");
        }
        return hash;
    }

//    public static boolean compareByteArray(byte[] array1, byte[] array2) {
//        if (array1.length != array2.length)
//            return false;
//        for (int i = 0; i < array1.length; i++) {
//            if (array1[i] != array2[i])
//                return false;
//        }
//        return true;
//    }

//    public static String generateHashHexString(byte[] message) {
//        return Utility.byteArrayToHexString(generateHash(message));
//    }

    public static String gethashSaltedApiKey(String payload) throws NoSuchAlgorithmException {
        if (TextUtils.isEmpty(payload)) {
            return null;
        }
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.reset();
        byte[] pass_hash = md.digest(payload.getBytes());
        return Utility.byteArrayToHex(pass_hash);
    }

//    public static String decodeNCreatePNGFile(String fileData, String doubleDecode) throws IOException {
//        Calendar c = Calendar.getInstance();
//        @SuppressLint("SimpleDateFormat")
//        SimpleDateFormat df = new SimpleDateFormat("ddMMyyyyHHmmss");
//        String formattedDate = df.format(c.getTime());
//        String fileName = formattedDate + ".png";
//        byte[] pdfAsBytes;
//
//        String root = Environment.getExternalStorageDirectory().toString();
//        File myDir = new File(root + "/UnifiedApp");
//        myDir.mkdirs();
//        final String fname = "showQRCode_" + fileName;
//        File file1 = new File(myDir, fname);
//
//        if (file1.exists()) {
//            file1.delete();
//        }
//        FileOutputStream out = null;
//        try {
//            out = new FileOutputStream(file1);
//            pdfAsBytes = android.util.Base64.decode(fileData, android.util.Base64.NO_WRAP);
//
//            out.write(pdfAsBytes);
//            out.flush();
//
//
//        } catch (Exception e) {
//            // ignore
//        }finally {
//            if(out != null)
//                out.close();
//        }
//        return file1.getPath();
//    }

//    public static String decodeNCreatePDFFile(String fileData) throws IOException  {
//        Calendar c = Calendar.getInstance();
//        @SuppressLint("SimpleDateFormat")
//        SimpleDateFormat df = new SimpleDateFormat("ddMMyyyyHHmmss");
//        String formattedDate = df.format(c.getTime());
//        String fileName = formattedDate + ".pdf";
//
//        String root = Environment.getExternalStorageDirectory().toString();
//        File myDir = new File(root + "/UnifiedApp");
//        myDir.mkdirs();
//        final String fname = "PDF-" + fileName;
//        File file1 = new File(myDir, fname);
//        if (file1.exists()) {
//            file1.delete();
//        }
//        FileOutputStream out = null;
//        try {
//            out = new FileOutputStream(file1);
//            byte[] pdfAsBytes = android.util.Base64.decode(fileData, android.util.Base64.NO_WRAP);
//            out.write(pdfAsBytes);
//            out.flush();
//
//
//        } catch (Exception e) {
//            // Ignore
//        }finally {
//            if(out != null)
//                out.close();
//        }
//        return file1.getPath();
//    }

//    public static String createFile(String fileData, String fileType) throws IOException {
//        Calendar c = Calendar.getInstance();
//        @SuppressLint("SimpleDateFormat")
//        SimpleDateFormat df = new SimpleDateFormat("ddMMyyyyHHmmss");
//        String formattedDate = df.format(c.getTime());
//        String fileName = formattedDate + "." + fileType;
//
//        String root = Environment.getExternalStorageDirectory().toString();
//        File myDir = new File(root + "/UnifiedApp");
//        myDir.mkdirs();
//        final String fname = "XML-" + fileName;
//        File file1 = new File(myDir, fname);
//        if (file1.exists()) {
//            file1.delete();
//        }
//        FileOutputStream out = null;
//        try {
//            out = new FileOutputStream(file1);
//            byte[] dataAsBytes = fileData.getBytes();
//            out.write(dataAsBytes);
//            out.flush();
//
//
//        } catch (Exception e) {
//
//        }finally {
//            if(out != null)
//                out.close();
//        }
//        return file1.getPath();
//    }

//    public static String decodeImageData(String fileData) {
//
//        byte[] decodedString = android.util.Base64.decode(fileData, android.util.Base64.DEFAULT);
//        String xml = new String(decodedString);
//
//        return xml;
//    }


//    public static String createZipFile(String ekycXmlData, String password) {
//
//
//        String input = null;
//        String zipFilePath = null;
//
//        if (ekycXmlData != null) {
//            input = ekycXmlData;
//
//            String fileName = UUID.randomUUID().toString();
//
//            String root = Environment.getExternalStorageDirectory().toString();
//            String rootFilePath = root + File.separator + "UnifiedApp";
//
//            String xmlFilePath = rootFilePath + File.separator + fileName + ".xml";
//            zipFilePath = rootFilePath + File.separator + fileName + ".zip";
//
//            File myDir = new File(rootFilePath);
//            myDir.mkdirs();
//
//            File imageFile = new File(xmlFilePath);
//            FileOutputStream fos = null;
//            try {
//                fos = new FileOutputStream(imageFile);
//                fos.write(input.getBytes());
//            } catch (Exception e) {
//                // Ignore
//            }
//
//            File zipFile = new File(zipFilePath);
//            ZipManagerUtil.createZipFile(password, imageFile.getAbsolutePath(), zipFile.getAbsolutePath());
//            zipFile.deleteOnExit();
//
//        }
//
//        return zipFilePath;
//
//    }

}