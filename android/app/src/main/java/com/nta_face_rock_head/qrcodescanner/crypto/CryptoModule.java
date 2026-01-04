package com.nta_face_rock_head.qrcodescanner.crypto;

import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.HashMap;

public class CryptoModule extends ReactContextBaseJavaModule {
    CryptoModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "RNCrypto";
    }

    @ReactMethod
    public void validateHashString( String base, String reference, Promise promise) {
        Log.i(" validateHashString ---", base +" " +reference);
        String baseString = "";
        int i = Integer.parseInt(reference);
        try {
            if (i == 0 || i == 1) {
                baseString = Utility.gethashSaltedApiKey(base);
            } else {
                int k = i;
                baseString = base;
                for (int j = 0; j < k; j++) {
                    baseString = Utility.gethashSaltedApiKey(baseString);
                }
            }
        } catch (NoSuchAlgorithmException e) {
            // No such algorithm exception
        }
        promise.resolve(baseString);

    }

    @ReactMethod
    public void isDeviceRooted(String osName, Promise promise) {
        promise.resolve(com.nta_face_rock_head.qrcodescanner.utils.Utility.checkIsDeviceRooted(osName, getReactApplicationContext()));
    }

}