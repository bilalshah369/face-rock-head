package com.nta_face_rock_head.qrcodescanner.scanner.models;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class PidOptions {
    @JacksonXmlProperty(isAttribute = true)
    public String ver;

    @JacksonXmlProperty(isAttribute = true)
    public String env;

    @JacksonXmlProperty(localName = "Opts")
    public Opts opts;

    @JacksonXmlProperty(localName = "Demo")
    public String demo;

    @JacksonXmlProperty(localName = "CustOpts")
    public CustOpts custOpts;

    @JacksonXmlProperty(localName = "BioData")
    public BioData bioData;

    public String toXML() throws Exception {
        XmlMapper xmlMapper = new XmlMapper();
        return xmlMapper.writeValueAsString(this);
    }
}

