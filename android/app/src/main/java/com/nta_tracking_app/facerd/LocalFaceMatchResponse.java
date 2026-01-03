package com.nta_tracking_app.facerd;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "localFaceMatchResponse")
public class LocalFaceMatchResponse {
    @JacksonXmlProperty(isAttribute = true)
    public String requestId;
    @JacksonXmlProperty(isAttribute = true)
    public String responseCode;
    @JacksonXmlProperty(isAttribute = true)
    public String dateTime;
    @JacksonXmlProperty(isAttribute = true)
    public int errCode;
    @JacksonXmlProperty(isAttribute = true)
    public String errInfo;

    public boolean isSuccess() {
        return errCode == 0;
    }

    public String getDateTime() {
        return dateTime;
    }

    public String getResponseCode() {
        return responseCode;
    }

    public static LocalFaceMatchResponse fromXML(String inputXML) throws Exception {
        return new XmlMapper().readValue(inputXML, LocalFaceMatchResponse.class);
    }
}
