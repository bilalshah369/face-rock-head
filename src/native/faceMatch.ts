import {NativeModules} from 'react-native';

type FaceMatchNative = {
  startFaceMatch(xml: string): Promise<string>;
};

const {FaceMatch} = NativeModules as {
  FaceMatch: FaceMatchNative;
};

export async function callHeadlessFaceMatch(
  requestXml: string,
): Promise<string> {
  return await FaceMatch.startFaceMatch(requestXml);
}
