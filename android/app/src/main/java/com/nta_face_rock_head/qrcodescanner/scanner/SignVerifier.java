package com.nta_face_rock_head.qrcodescanner.scanner;
import android.content.Context;
import android.util.Log;
import android.util.Pair;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.KeyStoreException;
import java.security.UnrecoverableEntryException;
import java.security.UnrecoverableKeyException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import org.bouncycastle.x509.X509CertificatePair;


public class SignVerifier {

    public Pair<String,Boolean> verifySignature(byte[] inputData, byte[] signature, PublicKey publicKey, int recur){
        try {
            Signature publicSignature = Signature.getInstance("SHA256withRSA");
            publicSignature.initVerify(publicKey);
            String shaDigest=getSHARec(new String(inputData),recur);
            publicSignature.update(getBytefromHex(shaDigest));
            return new Pair<>(shaDigest,publicSignature.verify(signature));
        }
        catch(InvalidKeyException e) {
        }
        catch(SignatureException e) {
        }
        catch(NoSuchAlgorithmException e) {
        }
        return new Pair<>("",false);
    }

    public PublicKey getPublicKey(String filename, char[] password,Context context) {

        try {
            InputStream fis = context.getAssets().open(filename);
            CertificateFactory f = CertificateFactory.getInstance("X.509");
            X509Certificate certificate = (X509Certificate)f.generateCertificate(fis);

            PublicKey pk = certificate.getPublicKey();
            fis.close();
            return pk;
        }

        catch(IOException e) {
        }
        catch(CertificateException e) {
        }

        return null;
    }


    private String getSHARec(String input,int recur) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            for(int i=0;i<recur;++i) {
                input=getHexStringFromBytes(md.digest(input.getBytes()));
            }
        }
        catch(NoSuchAlgorithmException e) {
            Log.e("Exception:", "No such algorithm exception");
            return null;
        }
        return input;
    }
    public static String getHexStringFromBytes(byte []data) {
        char []hexCharset="0123456789abcdef".toCharArray();
        char []hexString=new char[2*data.length];
        int temp;
        for(int i=0;i<data.length;++i) {
            temp=data[i] & 0xff;
            hexString[2*i]=hexCharset[temp>>4];
            hexString[2*i+1]=hexCharset[temp & 0x0f];
        }
        return new String(hexString);
    }
    private byte []getBytefromHex(String hexString) {
        String hexCharset="0123456789abcdef";
        byte []data=new byte[hexString.length()/2];
        int j,k;
        for(int i=0;i<hexString.length();i+=2) {
            j= hexCharset.indexOf(hexString.charAt(i));
            k=hexCharset.indexOf(hexString.charAt(i+1));
            data[i/2]=(byte)((j<<4)^k);
        }
        return data;
    }
}
