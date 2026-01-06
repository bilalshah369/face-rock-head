import Base64 from 'react-native-base64';
import {NativeModules, Platform, Image} from 'react-native';
import {STRING_CONSTANTS} from '../scan/Constants';
import {Strings} from '../scan/Strings';
import {Buffer} from 'buffer';
//import {isStagingEnv} from '../../config';-------------

// import { btoa, atob } from 'react-native-quick-base64';
// import RNFetchBlob from 'react-native-fetch-blob';

const {RNScanUtil} = NativeModules;
const RNTUtility = NativeModules.RNTUtility;
// const byteArrayToBase64String = NativeModules.RNTUtility
let count = 0;

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}

function convertArrayBufferToBase64(arrayBuffer) {
  var base64 = '';
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXY+/';

  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;

  var a, b, c, d;
  var chunk;

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}

//Email masking
function hexStringToByteArray(hexString) {
  var byteArray = [];
  for (var i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substr(i, 2), 16));
  }
  return byteArray;
}
function filterEmail(byteArray) {
  console.log('byteArray email', byteArray);
  var email = '';
  for (var i = 0; i < byteArray.length; i++) {
    var byte = byteArray[i];
    // Check if the byte represents a lowercase alphabetic character, a number, "@", or "."
    if (
      (byte >= 97 && byte <= 122) ||
      (byte >= 48 && byte <= 57) ||
      byte === 64 ||
      byte === 46
    ) {
      email += String.fromCharCode(byte);
    }
  }
  return email;
}

function hexToBytes(hex) {
  let bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

function bytesToString(bytes) {
  return String.fromCharCode(...bytes);
}

function extractReadableCharacters(asciiString) {
  // Filter out non-printable characters
  return asciiString.replace(/[^\x20-\x7E]/g, '');
}

function processHexString(hexString) {
  let byteArray = hexToBytes(hexString);
  let asciiString = bytesToString(byteArray);

  // Find the index of the first non-printable character
  let firstPrintableIndex = asciiString.search(/[^\x20-\x7E]/);

  // If all characters are printable or there are no non-printable characters
  if (firstPrintableIndex === -1) {
    return asciiString;
  }

  // Extract characters after the first non-printable character
  let substringAfterFirstPrintable = asciiString.substring(
    firstPrintableIndex + 1,
  );
  let cleanedString = extractReadableCharacters(
    substringAfterFirstPrintable,
  ).replace(/[<>]/g, '');

  return cleanedString;
}

function findImageStartIndex(data) {
  const possibleHeaders = [
    // JP2 signature box
    new Uint8Array([0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20]),
    // J2K codestream start (SOC marker)
    new Uint8Array([0xff, 0x4f]),
    // Partial JP2
    new Uint8Array([0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50]),
  ];

  for (let i = 0; i < data.length; i++) {
    for (const header of possibleHeaders) {
      if (i + header.length <= data.length) {
        let match = true;

        for (let j = 0; j < header.length; j++) {
          if (data[i + j] !== header[j]) {
            match = false;
            break;
          }
        }

        if (match) {
          return i;
        }
      }
    }
  }

  return -1;
}

export const getAadhaarDataFromBytes = async (data, rawData) => {
  try {
    let user_photo = '';
    let refId = '';
    let name = '';

    let dob = '';

    let gender = '';

    let address1 = '';

    let address2 = '';

    let address3 = '';

    let address4 = '';

    let address5 = '';

    let address6 = '';

    let address7 = '';

    let address8 = '';

    let address9 = '';

    let address10 = '';

    let address11 = '';
    let image = '';
    let mobile = '';
    let email = '';

    //foreinger expiry Date //
    let expiryDate = '';
    let isForeiner = '';

    let flag = '';
    let versionFlag = '';
    let subdata = [];
    let temp_arr = [];
    let image_arr = [];
    let sub_index = 0;
    let image_index = 0;
    debugger;
    let data1;

    console.log('data:::::-----', data);

    flag = data[0];

    // isStagingEnv && console.log('flag ');
    flag = String.fromCharCode(data[0]);
    console.log('Flag', flag);
    let startIndex = 2;
    debugger;
    //  isStagingEnv && console.log('flag value ');
    const photoStartIndex = findImageStartIndex(data);
    let imageBytes;
    if (photoStartIndex !== -1) {
      const photoLength = data.length - photoStartIndex;
      imageBytes = data.slice(photoStartIndex, photoStartIndex + photoLength);
    }
    //image = Base64.encode(imageBytes);
    const base64 = Buffer.from(imageBytes).toString('base64');
    // const base64 = Base64.encodeToString(imageBytes, Base64.DEFAULT);
    console.log('Image Bytes');
    console.log(imageBytes);
    console.log('Image Base64');
    console.log(base64);
    image = base64;
    user_photo = base64;
    if (flag.startsWith('V')) {
      startIndex = 5;
    }

    for (let index = startIndex; index < data.length; index++) {
      const getVersionIndex = data[1];
      if (getVersionIndex == 53) {
        if (sub_index < 18) {
          if (data[index] == '255') {
            subdata.push(temp_arr);
            temp_arr = [];
            sub_index = sub_index + 1;
          } else {
            temp_arr.push(data[index]);
          }
        } else {
          let getExpiryForForeigner = subdata[16];
          if (getExpiryForForeigner == '') {
            image_index = index - 1;
          } else {
            image_index = index + 2;
          }
          break;
        }
      } else {
        if (sub_index < 16) {
          if (data[index] == '255') {
            subdata.push(temp_arr);
            temp_arr = [];
            sub_index = sub_index + 1;
          } else {
            temp_arr.push(data[index]);
          }
        } else {
          image_index = index + 2;
          break;
        }
      }
    }

    image_arr = data.slice(image_index - 3, data.length - 288 + 32 + 32);
    console.log('image array', image_arr);

    image = Base64.encode(String.fromCharCode(...new Uint8Array(image_arr)));
    console.log('imagedata', image);

    if (flag.startsWith('V')) {
      console.log('Inside V', flag);
      versionFlag = String.fromCharCode(data[1]);
      let typeFlag = String.fromCharCode(data[3]);
      console.log('typeFlag', typeFlag);
      versionFlag = flag + versionFlag;
      if (typeFlag === STRING_CONSTANTS.qrcodeVerEmail) {
        data1 = data.slice(-(256 + 32));
        console.log('data1', data1);
        email = data1.slice(0, 32);
        console.log('email11', email);
        email = toHexString(email);
        if (versionFlag == 'V4') {
          // var byteArray = hexStringToByteArray(email)

          email = processHexString(email);

          // email = filterEmail(byteArray)
          console.log('First!!!!', email);
        } else if (versionFlag == 'V5') {
          // expiry date for foreiner
          //  let getData =  data.slice(125)
          //  let getExpiryForForeigner =   getData.slice(0,10)
          //  expiryDate = String.fromCharCode(...getExpiryForForeigner);
          //  console.log('getData Expiry ',expiryDate)

          let expiryCondtionForeinger = subdata[15];
          isForeiner = String.fromCharCode(...expiryCondtionForeinger);
          console.log('expiry condion', isForeiner);

          let getExpiryForForeigner = subdata[16];
          expiryDate = String.fromCharCode(...getExpiryForForeigner);
          console.log('expiry condion', expiryDate);

          data1 = data.slice(-(256 + 32));
          email = data1.slice(0, 32);
          console.log('email data', email);
          email = toHexString(email);
          email = processHexString(email);
          console.log('email masking after filter v5 ', email);
        }
      } else if (typeFlag === STRING_CONSTANTS.qrCodeVerMob) {
        data1 = data.slice(-(256 + 32));
        image_arr = data.slice(image_index - 2, data.length - 288 + 32 + 32);
        image = Base64.encode(
          String.fromCharCode(...new Uint8Array(image_arr)),
        );

        const mobelement = subdata[15];
        mobile = `${mobelement
          .map(item => String.fromCharCode(item))
          .join('')}`;
      } else if (typeFlag === STRING_CONSTANTS.qrCodeVerBOth) {
        image_arr = data.slice(image_index - 2, data.length - 288 + 32 + 32);
        image = Base64.encode(
          String.fromCharCode(...new Uint8Array(image_arr)),
        );
        console.log('qrCodeVerBOth ', image);

        // data1 = data.slice(-(256 + 32))

        const mobelement = subdata[15];
        mobile = `${mobelement
          .map(item => String.fromCharCode(item))
          .join('')}`;

        if (versionFlag === 'V4' || versionFlag === 'V3') {
          data1 = data.slice(-(256 + 32));
          email = data1.slice(0, 32);
          email = toHexString(email);
          console.log('email hexa string', email);
          email = processHexString(email);
          // var byteArray = hexStringToByteArray(email);
          // console.log('email mask byte ',byteArray)
          // email  =   filterEmail(byteArray)
          console.log('email masking after filter v3 ', email);
        } else if (versionFlag == 'V5') {
          // expiry date for foreiner
          //  let getData =  data.slice(147)
          //  let getExpiryForForeigner =   getData.slice(0,10)
          //  expiryDate = String.fromCharCode(...getExpiryForForeigner);
          //  console.log('getData Expiry ',expiryDate)

          //  let expiryCondtionForeinger = subdata[15]
          //  isForeiner = String.fromCharCode(...expiryCondtionForeinger);
          //  console.log('expiry condion',isForeiner)

          let expiryCondtionForeinger = subdata[15];
          isForeiner = String.fromCharCode(...expiryCondtionForeinger);
          console.log('expiry condion', isForeiner);

          let getExpiryForForeigner = subdata[16];
          expiryDate = String.fromCharCode(...getExpiryForForeigner);
          console.log('expiry condion', expiryDate);

          data1 = data.slice(-(256 + 32));
          email = data1.slice(0, 32);
          email = toHexString(email);
          email = processHexString(email);
          console.log('email masking after filter v5 ', email);

          if (expiryDate == '') {
            const mobelement = subdata[15];
            mobile = `${mobelement
              .map(item => String.fromCharCode(item))
              .join('')}`;
          } else {
            const mobelement = subdata[17];
            mobile = `${mobelement
              .map(item => String.fromCharCode(item))
              .join('')}`;
          }
        } else {
          data1 = data.slice(-(256 + 32));
          email = data1.slice(0, 32);
          email = toHexString(email);
          console.log('email after filter', email);
        }
      }
    } else {
      switch (flag) {
        case '1':
          data1 = data.slice(-(256 + 32));
          email = data1.slice(0, 32);
          image_arr = data.slice(image_index - 3, data.length - 288 + 32 + 32);
          image = Base64.encode(
            String.fromCharCode(...new Uint8Array(image_arr)),
          );

          break;
        case '2':
          data1 = data.slice(-(256 + 32));
          mobile = data1.slice(0, 32);
          image_arr = data.slice(image_index - 3, data.length - 288 + 32 + 32);
          image = Base64.encode(
            String.fromCharCode(...new Uint8Array(image_arr)),
          );

          break;
        case '3':
          image_arr = data.slice(image_index - 3, data.length - 288 + 32 + 32);
          image = Base64.encode(
            String.fromCharCode(...new Uint8Array(image_arr)),
          );
          data1 = data.slice(-(256 + 32 + 32));
          mobile = data1.slice(32, 64);
          email = data1.slice(0, 32);
          break;
      }
    }

    if (!flag.startsWith('V')) {
      mobile = toHexString(mobile);
      email = toHexString(email);
    }

    try {
      console.log('subdata (raw)', subdata);
      console.log('subdata (json)', JSON.stringify(subdata));
      console.log(
        'subdata (chars)',
        subdata.map(arr => arr.map(b => String.fromCharCode(b)).join('')),
      );
    } catch (e) {
      console.log('subdata logging error', e);
    }

    for (let index = 0; index < subdata.length; index++) {
      const element = subdata[index];
      if (index < 15) {
        switch (index) {
          case 0:
            refId = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 1:
            name = `${element.map(item => String.fromCharCode(item)).join('')}`;
          case 2:
            dob = `${element.map(item => String.fromCharCode(item)).join('')}`;
          case 3:
            gender = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 4:
            address1 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 5:
            address2 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 6:
            address3 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 7:
            address4 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 8:
            address5 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 9:
            address6 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 10:
            address7 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 11:
            address8 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 12:
            address9 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 13:
            address10 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
          case 14:
            address11 = `${element
              .map(item => String.fromCharCode(item))
              .join('')}`;
        }
      } else {
      }
    }

    if (Platform.OS != 'ios') {
      let completeByteArrayExcludeSignature = Array.from(
        data.slice(0, data.length - 256),
      ).join(',');
      let sign_arr = Array.from(
        data.slice(data.length - 256, data.length),
      ).join(',');
      let signatureVal = await RNScanUtil.validateSignature(
        completeByteArrayExcludeSignature,
        sign_arr,
      );
      // if (
      //         signatureVal == false ||
      //         (signatureVal && signatureVal.signVal == '')
      //       )
      if (false) {
        debugger;
        console.log('not uidai');
        return Strings.not_uidai_compliant;
      } else {
        return qrDetails(
          address1,
          address2,
          address3,
          address4,
          address5,
          address6,
          address7,
          address8,
          address9,
          address10,
          address11,
          refId,
          name,
          dob,
          gender,
          (image = user_photo),
          email,
          mobile,
          versionFlag,
          isForeiner,
          expiryDate,
          user_photo,
        );
      }
    } else {
      let sign_arr = data.slice(data.length - 256, data.length);
      let sign = Base64.encode(
        String.fromCharCode(...new Uint8Array(sign_arr)),
      );
      let newData = null;
      newData = data;
      let newDataStr = null;
      let signObj = {};
      let signatureValue = null;
      newDataStr = Base64.encode(
        String.fromCharCode(...new Uint8Array(newData)),
      );

      signObj = {
        data: newDataStr,
        sign: sign,
        isXml: false,
      };

      if (count == 0) {
        signatureValue = await RNTUtility.qrcodeSignature(signObj);
        if (!signatureValue) {
          count = 0;
          debugger;
          return Strings.not_uidai_compliant;
        } else {
          count = 0;
          return qrDetails(
            address1,
            address2,
            address3,
            address4,
            address5,
            address6,
            address7,
            address8,
            address9,
            address10,
            address11,
            refId,
            name,
            dob,
            gender,
            image,
            email,
            mobile,
            versionFlag,
            isForeiner,
            expiryDate,
          );
        }
      }
    }
  } catch (error) {
    return error;
  }
};

const qrDetails = (
  addr1,
  addr2,
  addr3,
  addr4,
  addr5,
  addr6,
  addr7,
  addr8,
  addr9,
  addr10,
  addr11,
  refId,
  name,
  dob,
  gender,
  image,
  email,
  mobile,
  versionFlag,
  isForeiner,
  expiryDate,
) => {
  if (addr1) {
    addr1 = addr1 + ', ';
  }
  if (addr2) {
    addr2 = addr2 + ', ';
  }
  if (addr3) {
    addr3 = addr3 + ', ';
  }
  if (addr4) {
    addr4 = addr4 + ', ';
  }
  if (addr5) {
    addr5 = addr5 + ', ';
  }
  if (addr6) {
    addr6 = addr6 + '.';
  }
  if (addr7) {
    addr7 = addr7 + ', ';
  }
  if (addr8) {
    addr8 = addr8;
  }
  if (addr9) {
    addr9 = addr9 + ', ';
  }
  if (addr10) {
    addr10 = addr10;
  }
  if (addr11) {
    addr11 = addr11 + ', ';
  }

  // let address = `${addr1}${addr2}${addr3}${addr4}${addr5}${addr6}${addr7}${addr8}${addr9}${addr10} - ${addr11}`
  let address = `${addr1}${addr4}${addr9}${addr5}${addr3}${addr11}${addr7}${addr2}${addr8} - ${addr6}`;

  let aadhaarQrcodeDetailsObj = {
    refId,
    name,
    dob,
    gender,
    address,
    image,
    email,
    mobile,
    isXml: false,
    versionFlag,
    isForeiner,
    expiryDate,
  };
  return aadhaarQrcodeDetailsObj;
};
