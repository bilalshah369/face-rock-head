import {NativeModules} from 'react-native';

const {PhotoSigner, LocalFaceMatch} = NativeModules;

export async function verifyFace(photoBase64: string) {
  const clean = photoBase64.replace(/^data:image\/\w+;base64,/, '');

  // 🔐 Native signing
  const cmsSignedBase64 = await PhotoSigner.signPhoto(clean);

  // 🔐 RD Service call
  return await LocalFaceMatch.startLocalFaceMatch(cmsSignedBase64);
}
