import {NativeModules, Platform} from 'react-native';
import {parseXML} from '../scan/mAadhaarResponseParser';
import {getAadhaarDataFromBytes} from '../scan/ScannerFileUtil';
import {Strings} from './Strings';
//import {isStagingEnv} from '../../config';

var pako = require('pako');

const RNScanUtil = NativeModules.RNScanUtil;
const RNCrypto = NativeModules.RNCrypto;
const RNTUtility = NativeModules.RNTUtility;

export const scanData = async data => {
  console.log('datttta ', data);
  if (data.startsWith('<QPDB')) {
    let xmlJson = await parseXML(data);
    xmlJson = xmlJson.QPDB.$;
    let infoJson = {};
    infoJson['name'] = xmlJson.n || '';
    infoJson['uid'] = xmlJson.u || '';
    infoJson['gender'] = xmlJson.g || '';
    infoJson['dob'] = xmlJson.d || '';
    infoJson['address'] = xmlJson.a || '';
    infoJson['sign'] = xmlJson.s || '';
    infoJson['mobileNumber'] = xmlJson.m || '';
    infoJson['image'] = xmlJson.i || '';
    infoJson['isXml'] = true;
    let signatureVal;
    if (Platform.OS != 'ios') {
      //creating data byte
      var largeNumber = BigInt(data);
      let hexString = largeNumber.toString(16);

      const chunkSize = 2;
      const chunks = hexString.match(new RegExp(`.{1,${chunkSize}}`, 'g'));

      // Convert each chunk to a byte and store in an array
      const bytes = chunks.map(chunk => parseInt(chunk, 16));

      let compressed = new Uint8Array(bytes);
      const unzippedData = pako.inflate(compressed);

      let completeByteArrayExcludeSignature = Array.from(
        unzippedData.slice(0, unzippedData.length - 256),
      ).join(',');
      let sign_arr = Array.from(
        unzippedData.slice(unzippedData.length - 256, unzippedData.length),
      ).join(',');
      signatureVal = await RNScanUtil.validateSignature(
        completeByteArrayExcludeSignature,
        sign_arr,
      );

      if (
        signatureVal == false ||
        (signatureVal && signatureVal.signVal == '')
      ) {
        debugger;
        return Strings.not_uidai_compliant;
      } else {
        return infoJson;
      }
    } else {
      console.log('validate cert');
      let signObj = {
        data: data,
        sign: infoJson['sign'],
        isXml: true,
      };
      let signatureValue = await RNTUtility.qrcodeSignature(signObj);

      console.log('signature value', signatureValue);

      if (!signatureValue) {
        infoJson['isDataVerified'] = false;
      } else {
        infoJson['isDataVerified'] = true;
      }
      return infoJson;
    }
  } else if (data.startsWith('</?xml') || data.startsWith('<?xml')) {
    return 'older version';
  } else if (data.includes('PrintLetterBarcodeData')) {
    return 'older version';
  } else {
    try {
      var largeNumber = BigInt(data);
      let hexString = largeNumber.toString(16);
      debugger;
      const chunkSize = 2;
      const chunks = hexString.match(new RegExp(`.{1,${chunkSize}}`, 'g'));

      // Convert each chunk to a byte and store in an array
      const bytes = chunks.map(chunk => parseInt(chunk, 16));

      let compressed = new Uint8Array(bytes);
      const unzipped = pako.inflate(compressed);
      console.log('unzipped.length');
      console.log(unzipped.length);
      return getAadhaarDataFromBytes(unzipped, data);
    } catch (error) {
      return 'Unable to parse';
    }
  }
};

//
export const j2kPng = async data => {
  return await RNScanUtil.convertPngToJpegFormat(data);
};

export const validateHash = async data => {
  if (Platform.OS === 'ios') {
    return await RNCrypto.validateHashString(data);
  } else {
    return await RNCrypto.validateHashString(
      data.emailNMobText,
      data.lastDigitNumber,
    );
  }
};
