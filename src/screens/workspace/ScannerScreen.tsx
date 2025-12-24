import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
import {QR_IV, QR_SECRET} from '@env';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {decryptQR} from '../../utils/qrDecrypt';
import {insertScanLog, markAsSynced} from '../../database/db';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import {API_BASE} from '@env';
const API_URL = API_BASE + '/scans/single';
const TOKEN_KEY = 'nta_token';
import {getCurrentLocation} from '../../utils/location';
import {
  hasLocationPermission,
  requestLocationPermission,
} from '../../utils/locationPermission';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Scanner'>;

const ScannerScreen: React.FC<Props> = ({route, navigation}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUserId = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        setUserId(user.user_id);
      }
    };
    fetchUserId();
  }, []);
  const {type} = route.params; // OUTER / INNER
  const devices = useCameraDevices();
  // const device = devices.back;
  const device = devices.find(d => d.position === 'back');
  const [scanned, setScanned] = useState(false);

  // 🔹 Request camera permission
  useEffect(() => {
    Camera.requestCameraPermission();
    requestLocationPermission();
  }, []);

  // 🔹 Built-in QR code scanner (NO extra library)
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async codes => {
      debugger;
      if (scanned || codes.length === 0) {
        return;
      }

      const encryptedValue = codes[0]?.value;
      if (!encryptedValue) return;

      const decryptedValue = decryptQR(encryptedValue);

      if (!decryptedValue) {
        Alert.alert('Invalid QR', 'Unable to decrypt QR code');
        setScanned(false);
        return;
      }
      let payload: any;
      try {
        payload = JSON.parse(decryptedValue);
      } catch {
        Alert.alert('Invalid QR', 'QR payload is corrupted');
        setScanned(false);
        return;
      }
      const {
        tracking_id,
        qr_type,
        centre_code,
        centre_name,
        encrypted_qr_payload,
      } = payload;

      //  Validate required fields
      if (!tracking_id || !qr_type) {
        Alert.alert('Invalid QR', 'Missing QR data');
        setScanned(false);
        return;
      }

      //  Validate QR type vs scan mode
      if (qr_type !== type) {
        Alert.alert(
          'Wrong QR',
          `You are scanning a ${type} package but this QR is ${qr_type}`,
        );
        setScanned(false);
        return;
      }
      setScanned(true);
      Alert.alert(
        'Scan Successful',
        `Tracking ID: ${tracking_id}\nType: ${qr_type}\nCenter Code: ${
          centre_code || 'N/A'
        }\nCenter Name: ${centre_name || 'N/A'} \nEncrypted Payload: ${
          decryptQR(encrypted_qr_payload) || 'N/A'
        }`,
        [
          {text: 'Scan Again', onPress: () => setScanned(false)},
          {text: 'Back', onPress: () => navigation.goBack()},
        ],
      );
      const net = await NetInfo.fetch();
      const deviceId = await DeviceInfo.getUniqueId();
      let latitude = null;
      let longitude = null;
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
      const insertedId = await insertScanLog({
        tracking_id,
        qr_type,
        scanned_by: userId ? parseInt(userId, 10) : undefined, // later from logged-in user
        scanned_phone: user?.phone_number, // optional
        scan_datetime: new Date().toISOString(),
        latitude: latitude ?? undefined, // add GPS later
        longitude: longitude ?? undefined,
        scan_mode: net.isConnected ? 'ONLINE' : 'OFFLINE',
        device_id: deviceId || 'UNKNOWN_DEVICE',
        remarks: 'QR scanned via mobile app',
        created_by: userId ? parseInt(userId, 10) : undefined,
      });

      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tracking_id: tracking_id,
            qr_type: qr_type,
            scanned_by: userId ? parseInt(userId, 10) : undefined,
            scanned_phone: user?.phone_number,

            scan_datetime: new Date().toISOString(),
            latitude: latitude,
            longitude: longitude,
            scan_mode: net.isConnected ? 'ONLINE' : 'OFFLINE',
            device_id: deviceId || 'UNKNOWN_DEVICE',
            remarks: 'QR scanned via mobile app',
            created_by: userId ? parseInt(userId, 10) : undefined,
          }),
        });
        console.log('Sync response', res);
        if (res.ok) {
          await markAsSynced(insertedId ?? '');
        }
      } catch (err) {
        console.warn('Scan sync failed', insertedId);
      }
    },
  });

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!scanned}
        codeScanner={codeScanner}
      />

      <View style={styles.overlay}>
        <Text style={styles.text}>Scanning {type} Package QR</Text>
      </View>
    </View>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
