package com.nta_tracking_app.facerd;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Builds UIDAI Local Face Match XML
 * MATCHES YOUR EXACT MODEL CLASSES
 */
public class UidaiFaceMatchService {

    public static String buildSignedFaceMatchXml(
            String signedPhotoBase64,
            String signedDocumentCmsBase64
    ) throws Exception {

        // 1️⃣ Build SignedPhoto (constructor OR setters)
        SignedPhoto signedPhoto = new SignedPhoto(
                signedPhotoBase64,
                OffsetDateTime.now().toString(),
                UUID.randomUUID().toString()
        );

        // 2️⃣ Convert SignedPhoto → XML
        XmlMapper mapper = new XmlMapper();
        mapper.configure(
                DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
                false
        );
        String signedPhotoXml = mapper.writeValueAsString(signedPhoto);

        // 3️⃣ Build SignedDocument
        // NOTE: value = CMS signed XML (NOT object)
        SignedDocument signedDocument = new SignedDocument();
        signedDocument.docType = "PHOTO";
        signedDocument.auaCode = "UIDAI";
        signedDocument.value = signedDocumentCmsBase64; // CMS signed content

        // 4️⃣ Build LocalFaceMatchRequest
        LocalFaceMatchRequest request = new LocalFaceMatchRequest();
        request.requestId = UUID.randomUUID().toString();
        request.language = "en";
        request.enableAutoCapture = "true";
        request.signedDocument1 = signedDocument;

        // 5️⃣ Convert request → XML
        return request.toXml();
    }
}
