import {parseString} from 'react-native-xml2js';

export const parseXML = async xml => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err != null) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
};
