import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getPendingScans, markAsSynced} from '../database/db';
import {API_BASE} from '@env';
import DeviceInfo from 'react-native-device-info';
import {hasLocationPermission} from '../utils/locationPermission';
import {getCurrentLocation} from '../utils/location';
const API_URL = API_BASE + '/scans/single';
const TOKEN_KEY = 'token';
export const syncScansToBackend = async () => {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return;
  let latitude = null;
  let longitude = null;
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return;

  const scans = await getPendingScans();
  if (scans.length === 0) return;
  const userData = await AsyncStorage.getItem('user');
  let user = null;
  if (userData) {
    user = JSON.parse(userData);
  }

  const hasPermission = await hasLocationPermission();
  if (hasPermission) {
    try {
      const location = await getCurrentLocation();
      latitude = location.latitude;
      longitude = location.longitude;
    } catch (err) {
      console.warn('Location fetch failed');
    }
  }
  for (const scan of scans) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tracking_id: scan.tracking_id,
          qr_type: scan.qr_type,
          scan_datetime: scan.scan_datetime,

          scan_mode: scan.scan_mode,
          device_id: scan.device_id,
          remarks: scan.remarks,
          scanned_by: scan.scanned_by,
          scanned_phone: scan.phone_number,
          latitude: latitude,
          longitude: longitude,
          created_by: scan.scanned_by,
        }),
      });

      if (res.ok) {
        await markAsSynced(scan.scan_id);
      }
    } catch (err) {
      console.warn('Scan sync failed', scan.scan_id);
    }
  }
};
export const syncSingleScan = async (scan: any) => {
  const token = await AsyncStorage.getItem('auth_token');
  let latitude = null;
  let longitude = null;

  const userData = await AsyncStorage.getItem('user');
  let user = null;
  if (userData) {
    user = JSON.parse(userData);
  }

  const hasPermission = await hasLocationPermission();
  if (hasPermission) {
    try {
      const location = await getCurrentLocation();
      latitude = location.latitude;
      longitude = location.longitude;
    } catch (err) {
      console.warn('Location fetch failed');
    }
  }
  if (!token) return false;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tracking_id: scan.tracking_id,
        qr_type: scan.qr_type,
        scan_datetime: scan.scan_datetime,

        scan_mode: scan.scan_mode,
        device_id: scan.device_id,
        remarks: scan.remarks,
        scanned_by: scan.scanned_by,
        scanned_phone: scan.phone_number,
        latitude: latitude,
        longitude: longitude,
        created_by: scan.scanned_by,
      }),
    });

    if (res.ok) {
      await markAsSynced(scan.scan_id);
      return true;
    }
  } catch (err) {
    console.warn('Single scan sync failed');
  }

  return false;
};
