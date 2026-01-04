package com.nta_face_rock_head.qrcodescanner.utils;

public class CDataProvider {

    private CDataProvider() {
        // Just to avoid creation from outside
    }

    public static CDataProvider getInstance() {
        return new CDataProvider();
    }

    public String getData() {
        return getData2() + new com.nta_face_rock_head.qrcodescanner.parser.CData().getCDataJ2();
    }

    private String getData2() {
        return new com.nta_face_rock_head.qrcodescanner.totp.CData().getCDataH1() + new com.nta_face_rock_head.qrcodescanner.parser.CData().getCDataJ1() + new com.nta_face_rock_head.qrcodescanner.log.CData().getDataA2();
    }

}
