// services/versionService.ts
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {API_BASE} from '@env';
const TOKEN_KEY = 'nta_token';
export const checkAppVersion = async () => {
  const getLocalVersionCode = (): string => {
    return DeviceInfo.getBuildNumber(); // "261" start with
  };
  const localVersionCode = getLocalVersionCode();

  const res = await fetch(`${API_BASE.replace('/api', '')}/app/version-check`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      platform: Platform.OS,
      versionCode: '262',
    }),
  });
  if (!res.ok) {
    console.log(res);
    throw new Error('Version check failed');
  }

  return res.json();
};
