package com.nta_face_rock_head.qrcodescanner.scanner.models;


import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class PidData {

    @JacksonXmlProperty(localName = "Resp")
    public Resp resp;

    @JacksonXmlProperty(localName = "DeviceInfo")
    public DeviceInfo deviceInfo;

    @JacksonXmlProperty(localName = "Skey")
    public Skey skey;

    @JacksonXmlProperty(localName = "Hmac")
    public String hmac;

    @JacksonXmlProperty(localName = "Data")
    public Data data;

    @JacksonXmlProperty(localName = "CustOpts")
    public CustOpts custOpts;

    public PidData() {

    }

    public PidData(Resp resp, DeviceInfo deviceInfo, Skey skey, String hmac, Data data, CustOpts custOpts) {

        this.resp = resp;
        this.deviceInfo = deviceInfo;
        this.skey = skey;
        this.hmac = hmac;
        this.data = data;
        this.custOpts = custOpts;
    }


}
