import {v4 as uuidv4} from 'uuid';
import {Buffer} from 'buffer';

function buildSignedPhotoXml(base64Image: string) {
  const referenceNo = 'fb9be601-413a-49f1-ad6d-44e967dfbd24'; //uuidv4();
  const dateTime = new Date().toISOString();

  return `<SignedPhoto referenceNo="${referenceNo}" dateTime="${dateTime}" Pht="${base64Image}" />`;
}

export function buildFaceMatchXml(base64Image: string): string {
  const requestId = 'fb9be601-413a-49f1-ad6d-44e967dfbd24'; //uuidv4();

  const signedPhotoXml = buildSignedPhotoXml(base64Image);
  const signedPhotoBase64 = Buffer.from(signedPhotoXml, 'utf-8').toString(
    'base64',
  );

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<localFaceMatchRequest enableAutoCapture="true" language="en" requestId="${requestId}">
  <signedDocument1 auaCode="UIDAI" docType="PHOTO">
${signedPhotoBase64}
  </signedDocument1>
  <signedDocument2/>
</localFaceMatchRequest>`;
}
