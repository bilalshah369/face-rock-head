package com.nta_face_rock_head.qrcodescanner.utils;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.util.Base64;

import java.security.MessageDigest;

import com.scottyab.rootbeer.RootBeer;




import com.nta_face_rock_head.BuildConfig;
//import com.nta_face_rock_head.MainApplication;
import com.nta_face_rock_head.R;
import com.nta_face_rock_head.qrcodescanner.parser.CData;

public class Utility {

    public static boolean checkAppSignature(Context context) {
        boolean isValid = false;
        try {
            PackageInfo packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(),
                    PackageManager.GET_SIGNATURES);

            for (Signature signature : packageInfo.signatures) {
                byte[] signatureBytes = signature.toByteArray();
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                md.update(signature.toByteArray());
                final String currentSignature = Base64.encodeToString(md.digest(), Base64.DEFAULT);
                String cerData = new CData().getS1() + new com.nta_face_rock_head.qrcodescanner.gcm.CData().getP1Data() + new com.nta_face_rock_head.qrcodescanner.log.CData().getK1Value();
                isValid = currentSignature.trim().equals(cerData);

            }

        } catch (Exception e) {
            //assumes an issue in checking signature., but we let the caller decide on what to do.
            isValid = false;
        }

        return isValid;
    }
    /* Check if code package is changed */
    public static boolean checkIfHooked(Context context) {
        boolean isValid = false;
        try {
            // String PkgName = MainApplication.getApplication().getString(R.string.PACKAGE_NAME);
            // String google_play = MainApplication.getApplication().getString(R.string.google_store);
            // String amazon_store = MainApplication.getApplication().getString(R.string.amazon_store);
            String PkgName = context.getString(R.string.PACKAGE_NAME);
String google_play = context.getString(R.string.google_store);
String amazon_store = context.getString(R.string.amazon_store);
            isValid = !isHacked(context, PkgName, google_play, amazon_store);
        } catch (Exception e) {
            //assumes an issue in checking signature., but we let the caller decide on what to do.
            isValid = false;
        }

        return isValid;
    }

    public static boolean isHacked(Context context, String myPackageName, String google, String amazon)
    {
        //Renamed?
        if (context.getPackageName().compareTo(myPackageName) != 0) {
            return true; // BOOM!
        }

        //Relocated?
        String installer = context.getPackageManager().getInstallerPackageName(myPackageName);
        if(BuildConfig.DEBUG){
            return false;
        }else {
            if (installer == null) {
                return true; // BOOM!
            }

            return installer.compareTo(google) != 0 && installer.compareTo(amazon) != 0;
        }
    }

    public static boolean checkIsDeviceRooted(String osName, Context context) {

        boolean isRooted = false;

        if(osName != null && "android".equalsIgnoreCase(osName)) {
            RootBeer rootBeer = new RootBeer(context);
            if (rootBeer.isRooted()) {
                isRooted = true;
            }
        }

        return isRooted;
    }

    public static String getCData(String osName) {

        String cData = "";
        Object provider = CDataProvider.getInstance();

        if(osName != null && "android".equalsIgnoreCase(osName) && CDataProvider.class.isInstance(provider)) {
            cData = ((CDataProvider)provider).getData();
        }
        return cData;
    }
}
