package com.nta_face_rock_head.qrcodescanner.scanner.models;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "PidData")
public class CaptureResponse extends PidData {
    public CaptureResponse(Resp resp, DeviceInfo deviceInfo, Skey skey, String hmac, Data data, CustOpts custOpts) {
        super(resp, deviceInfo, skey, hmac, data, custOpts);
    }

    public String toXML() throws Exception {
        XmlMapper xmlMapper = new XmlMapper();
        return xmlMapper.writeValueAsString(this);
    }

    public CaptureResponse() {
    }

    public static CaptureResponse fromXML(String inputXML) throws Exception {
        XmlMapper xmlMapper = new XmlMapper();
        return xmlMapper.readValue(inputXML, CaptureResponse.class);
    }

    @JsonIgnore
    public boolean isSuccess() {
        return resp.errCode == 0;
    }

    @JsonIgnore
    public String getErrInfo() {
        return resp.errInfo;
    }

    @JsonIgnore
    public String getTxnID() {
        if (custOpts == null) {
            return "";
        }

        for (NameValue nv : custOpts.nameValues) {
            if (nv.getName().equals("txnId")) {
                return nv.getValue();
            }
        }
        return "";
    }
}
