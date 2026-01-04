package com.nta_face_rock_head.qrcodescanner.scanner.models;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class DeviceInfo {
    @JacksonXmlProperty(isAttribute = true)
    public String dpId;
    @JacksonXmlProperty(isAttribute = true)
    public String rdsId;
    @JacksonXmlProperty(isAttribute = true)
    public String rdsVer;
    @JacksonXmlProperty(isAttribute = true)
    public String dc;
    @JacksonXmlProperty(isAttribute = true)
    public String mi;
    @JacksonXmlProperty(isAttribute = true)
    public String mc;
    @JacksonXmlProperty(localName = "Additional_Info")
    public AdditionalInfo additional_info;
}
