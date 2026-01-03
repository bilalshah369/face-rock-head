import {NativeModules} from 'react-native';

const {LocalFaceMatch} = NativeModules;

/**
 * Starts UIDAI Local Face Match
 *
 * @param signedPhotoBase64      Signed photo (Base64)
 * @param signedDocumentBase64   Signed document (Base64)
 * @returns XML response from UIDAI RD Service
 */
export function startLocalFaceMatch(
  signedPhotoBase64: string,
  signedDocumentBase64: string,
): Promise<string> {
  if (!LocalFaceMatch) {
    throw new Error('LocalFaceMatch native module not linked');
  }

  return LocalFaceMatch.startLocalFaceMatch(
    signedPhotoBase64,
    signedDocumentBase64,
  );
}
