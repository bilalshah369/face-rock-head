import {NativeModules} from 'react-native';

const {PhotoSigner, LocalFaceMatch} = NativeModules;

export async function verifyFace(photoBase64: string) {
  //const clean = photoBase64.replace(/^data:image\/\w+;base64,/, '');
  debugger;

  const cmsSignedBase64 = await PhotoSigner.signPhoto(photoBase64);
  debugger;
  console.log(cmsSignedBase64);

  return await LocalFaceMatch.startLocalFaceMatch(cmsSignedBase64);
}
