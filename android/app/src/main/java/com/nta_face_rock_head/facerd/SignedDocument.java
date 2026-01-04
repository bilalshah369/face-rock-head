package com.nta_face_rock_head.facerd;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText;

public class SignedDocument {
    @JacksonXmlProperty(isAttribute = true)
    public String docType;

    @JacksonXmlProperty(isAttribute = true)
    public String auaCode;

    @JacksonXmlText
    public String value;

    public SignedDocument(String docType, String auaCode, String value) {
        this.docType = docType;
        this.auaCode = auaCode;
        this.value = value;
    }

    public SignedDocument() {
    }
}
