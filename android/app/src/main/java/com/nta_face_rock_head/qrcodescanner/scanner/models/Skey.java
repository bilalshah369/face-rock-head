package com.nta_face_rock_head.qrcodescanner.scanner.models;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText;

public class Skey {
    @JacksonXmlProperty(isAttribute = true)
    public String ci;
    @JacksonXmlText
    public String value;
}
