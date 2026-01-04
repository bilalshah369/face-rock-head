package com.nta_face_rock_head.qrcodescanner.scanner;

import com.google.gson.Gson;

public class AadhaarQR {

    private String name;
    private String refId;
    private String gender;
    private String dob;
    private String mobile;
    private String image;
    private String digSign;
    private String address;
    private String email;
    private String version;
    private boolean isVerified;
    private String uid;

    public String getUid() {
        return uid;
    }
    public void setUid(String uid) {
        this.uid = uid;
    }
    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setRefId(String refId) {
        this.refId = refId;
    }

    public String getRefId() {
        return refId;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getGender() {
        return gender;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getDob() {
        return dob;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getMobile() {
        return mobile;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getImage() {
        return image;
    }

    public void setDigSign(String digSign) {
        this.digSign = digSign;
    }

    public String getDigSign() {
        return digSign;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getVersion() {
        return version;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAddress() {
        return address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String toJSONString() {
        return new Gson().toJson(this);
    }

}
