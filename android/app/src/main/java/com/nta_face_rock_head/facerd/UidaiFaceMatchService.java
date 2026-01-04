package com.nta_face_rock_head.facerd;

import java.util.UUID;

public class UidaiFaceMatchService {

    public static String buildSignedFaceMatchXml(
            String mockCmsBase64
    ) throws Exception {

        SignedDocument signedDocument = new SignedDocument();
        signedDocument.docType = "PHOTO";
        signedDocument.auaCode = "UIDAI";
        signedDocument.value = mockCmsBase64;

        LocalFaceMatchRequest request = new LocalFaceMatchRequest();
        request.requestId = UUID.randomUUID().toString();
        request.language = "en";
        request.enableAutoCapture = "true";
        request.signedDocument1 = signedDocument;

        return request.toXml();
    }
}
