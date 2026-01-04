package com.nta_face_rock_head.facerd;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "SignedPhoto")
public class SignedPhoto {

    public SignedPhoto() {
    }

    public SignedPhoto(String pht, String dateTime, String referenceId) {
        this.referenceNo = referenceId;
        this.dateTime = dateTime;
        this.Pht = pht;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    public String getPht() {
        return Pht;
    }

    public void setPht(String pht) {
        this.Pht = pht;
    }

    @JacksonXmlProperty(isAttribute = true)
    private String referenceNo = "";

    @JacksonXmlProperty(isAttribute = true)
    private String dateTime = "";

    @JacksonXmlProperty(isAttribute = true)
    private String Pht = "";

    public static SignedPhoto fromXML(String signedPhoto) throws Exception {
        XmlMapper xmlMapper = new XmlMapper();
        xmlMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return xmlMapper.readValue(signedPhoto, SignedPhoto.class);
    }

}
