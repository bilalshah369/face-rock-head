import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import AppHeader from '../Layout/AppHeader';
import {useAppContext} from '../../context/AppContext';
import {NativeModules} from 'react-native';
import RNScanUtil from '../../native/MyNativeModule';
import SecureQRResultModal from './SecureQRResultModal';

// 🔹 UIDAI Face Match imports
import {callHeadlessFaceMatch} from '../../native/faceMatch';
import {buildFaceMatchXml} from '../../utils/buildFaceMatchXml';
import {parseFaceMatchResponse} from '../../utils/parseFaceMatchResponse';
import {verifyFace} from '../../native/localFaceMatch';
import {launchImageLibrary} from 'react-native-image-picker';
import {scanData, j2kPng, validateHash} from '../../utils/scan/scanUtils';
const DashboardScreen = ({navigation}: {navigation: any}) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrResult, setQrResult] = useState<{
    name?: string;
    uid?: string;
    photo?: string;
    photoMimeType?: string;
  }>({});
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const {setIsAutoSync, isAutoSync} = useAppContext();
  const {MyNativeModule} = NativeModules;
  // 🔹 Face Match state
  const [faceMatchLoading, setFaceMatchLoading] = useState(false);
  const faceMatchLock = useRef(false);
  useEffect(() => {
    console.log('📡 Registering QR event listener');

    const sub = DeviceEventEmitter.addListener('onQRCodeDecoded', payload => {
      console.log('✅ JS RECEIVED QR PAYLOAD:', payload);

      if (!payload) {
        console.error('❌ Empty payload received');
        return;
      }

      // 👉 THIS IS WHERE YOU CONTINUE FLOW
      console.log('send to headless app');
    });

    return () => {
      console.log('🧹 Removing QR event listener');
      sub.remove();
    };
  }, []);

  /**
   * Launch Android Secure QR Scanner
   * Receives already:
   *  - Decrypted
   *  - Parsed
   *  - UIDAI Secure QR compliant payload
   */
  // const scanSecureQR = async () => {
  //   try {
  //     if (Platform.OS !== 'android') {
  //       console.warn('Secure QR scanner is Android only');
  //       return;
  //     }

  //     // 🔹 Calls MyNativeModule.openScanCodeActivity()
  //     const secureQrResult = await MyNativeModule.openScanCodeActivity();

  //     console.log('Secure QR Payload:', secureQrResult);

  //     if (!secureQrResult) {
  //       throw new Error('Empty QR payload received');
  //     }
  //     console.log('send to headless app');
  //     // 🔹 Send payload to Headless App
  //     // const response = await fetch('https://HEADLESS_APP/api/secureqr/verify', {
  //     //   method: 'POST',
  //     //   headers: {
  //     //     'Content-Type': 'application/json',
  //     //   },
  //     //   body: JSON.stringify({
  //     //     secureQrPayload: secureQrResult,
  //     //     source: 'ANDROID',
  //     //   }),
  //     // });

  //     //const result = await response.json();
  //     //console.log('Headless verification response:', result);
  //   } catch (error) {
  //     console.error('❌ QR Scan failed:', error);
  //   }
  // };
  /* ===================== NETWORK ===================== */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      AsyncStorage.setItem(
        'ENROLLED_FACE_BASE64',
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAPDw8PDw8PDw8PDw8PDw8PFREWFhURExUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgMEAAIHB//EAD0QAAIBAgMFBgQEBQMFAQAAAAECEQADBBIhMQVBUQYiYXGBEzKRobHB0RQjQlJy4fAkM2KS0eHx/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAgEQEBAAICAgMBAAAAAAAAAAAAAQIRAyESMQQTIkFR/9oADAMBAAIRAxEAPwD4kREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREH//Z',
      );
    });
    return () => unsubscribe();
  }, []);
  const onScanSuccess = async (result: any): Promise<void> => {
    try {
      console.log('inside success', result);
      let data: any = null;
      data = await scanData(result);
      //console.log('scanned data output', data);
      console.log(data);
      let imageData = await j2kPng(data.image);
      console.log('Base64 PNG', data);
      console.log(imageData);
      setQrResult({
        name: data.name,
        uid: data.rollNumber,
        photo: imageData,
        //photoMimeType: data.photoMimeType, // 👈 important
      });
      // TODO: handle scan success logic here
    } catch (error) {
      // TODO: handle error here
    }
  };
  const scanSecureQR = async () => {
    if (Platform.OS !== 'android') {
      console.warn('Secure QR scanner is Android only');
      return;
    }

    try {
      console.log('📷 Opening Secure QR Scanner');

      const payload = await MyNativeModule.openScanCodeActivity();

      console.log('✅ JS RECEIVED QR PAYLOAD:', payload);

      if (!payload) {
        throw new Error('Empty QR payload received');
      }
      onScanSuccess(payload);

      let data = null;
      //data = await scanData(result);
      //here
      //const result = await RNScanUtil.decodeSecureQR(payload);

      // debugger;
      // const res1 = await RNScanUtil.convertPngToJpegFormat(result.photoBase64);
      // console.log('Image Result');
      // console.log(res1);
      // // 🔹 Convert Aadhaar JP2 photo → PNG Base64
      // let photoBase64: string | undefined;
      // if (payload.photoJp2) {
      //   photoBase64 = await MyNativeModule.convertPngToJpegFormat(
      //     payload.photoJp2,
      //   );
      // }

      // 🔹 Store result
      //console.log(result);
      // setQrResult({
      //   name: result.rollNumber,
      //   uid: result.rollNumber,
      //   photo: result.photoBase64,
      //   photoMimeType: result.photoMimeType, // 👈 important
      // });

      // 🔹 Show popup
      setQrModalVisible(true);
      console.log('send to headless app');
    } catch (e: any) {
      console.error('❌ QR Scan failed:', e?.message || e);
      Alert.alert('QR Scan Failed', e?.message || 'User cancelled scan');
    }
  };

  /* ===================== AUTO SYNC ===================== */
  const toggleAutoSync = () => {
    setIsAutoSync(!isAutoSync);
  };

  /* ===================== LOGOUT ===================== */
  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };
  const pickPhotoFromDevice = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: true,
          quality: 0.8, // IMPORTANT (UIDAI size)
        },
        response => {
          if (response.didCancel) {
            reject(new Error('User cancelled image selection'));
            return;
          }

          if (response.errorCode) {
            reject(new Error(response.errorMessage || 'Picker error'));
            return;
          }

          const asset = response.assets?.[0];
          if (!asset?.base64) {
            reject(new Error('Base64 not available'));
            return;
          }

          resolve(asset.base64); // ✅ RAW BASE64 (NO PREFIX)
        },
      );
    });
  };

  /* ===================== UIDAI FACE MATCH ===================== */
  const startHeadlessFaceMatch = async () => {
    if (faceMatchLock.current) return;

    try {
      faceMatchLock.current = true;
      setFaceMatchLoading(true);

      // 🔐 Enrollment photo (stored earlier / synced)
      const enrolledPhotoBase64 = await AsyncStorage.getItem(
        'ENROLLED_FACE_BASE64',
      );
      debugger;
      if (!enrolledPhotoBase64) {
        Alert.alert('Error', 'Enrollment photo not found');
        return;
      }

      // 🔹 Build UIDAI XML
      const requestXml = buildFaceMatchXml(enrolledPhotoBase64);

      // 🔹 Call Headless App
      const responseXml = await callHeadlessFaceMatch(requestXml);

      // 🔹 Parse Response
      const result = parseFaceMatchResponse(responseXml);

      if (result.status === 'SUCCESS' && result.score >= 0.75) {
        Alert.alert(
          'Face Verified',
          `Verification successful\nScore: ${result.score.toFixed(2)}`,
        );
      } else {
        Alert.alert(
          'Verification Failed',
          `Face did not match\nScore: ${result.score.toFixed(2)}`,
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Face Match Error',
        err?.message || 'Unable to complete face verification',
      );
    } finally {
      setFaceMatchLoading(false);
      faceMatchLock.current = false;
    }
  };
  const handleFaceMatch = async () => {
    if (faceMatchLock.current) return;

    try {
      faceMatchLock.current = true;
      setFaceMatchLoading(true);

      // 1️⃣ Pick photo from device
      // const photoBase64 = await pickPhotoFromDevice();
      debugger;
      // 2️⃣ Call your FINAL verified flow
      const responseXml = await verifyFace(qrResult.photo ?? '');

      Alert.alert('UIDAI Response', responseXml);
    } catch (e: any) {
      Alert.alert('Face Match Failed', e.message || 'Unable to verify face');
    } finally {
      setFaceMatchLoading(false);
      faceMatchLock.current = false;
    }
  };
  /* ===================== UI ===================== */
  return (
    <>
      {/* LEFT MENU */}
      <Modal visible={showMenu} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowMenu(false)}
        />
        <View style={styles.leftMenu}>
          <View style={styles.menuHeader}>
            <Image
              source={{
                uri: 'https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/app_logo.png',
              }}
              style={styles.menuLogo}
            />
            <Text style={styles.appName}>Package Tracker</Text>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('Scanner', {type: 'OUTER'});
            }}>
            <Text style={styles.menuButtonText}>📦 Scan OUTER Package</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('Scanner', {type: 'INNER'});
            }}>
            <Text style={styles.menuButtonText}>📦 Scan INNER Package</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('ScanHistoryScreen');
            }}>
            <Text style={styles.menuButtonText}>🕘 Scan History</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.menuButton, styles.logoutButton]}
            onPress={logout}>
            <Text style={[styles.menuButtonText, {color: '#DC2626'}]}>
              🚪 Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* HEADER */}
      <AppHeader
        title="Dashboard"
        onMenuPress={() => setShowMenu(true)}
        onProfilePress={() => setShowProfile(true)}
      />

      {/* MAIN CONTENT */}
      <View style={styles.container}>
        {/* STATUS */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isOnline ? '#ECFDF5' : '#FEF2F2',
              borderColor: isOnline ? '#16A34A' : '#DC2626',
            },
          ]}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: isOnline ? '#16A34A' : '#DC2626'},
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {color: isOnline ? '#065F46' : '#7F1D1D'},
            ]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>

        {/* ACTIONS */}
        {/* <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Scanner', {type: 'OUTER'})}>
          <Text style={styles.buttonText}>Scan OUTER Package</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#059669'}]}
          onPress={() => navigation.navigate('Scanner', {type: 'INNER'})}>
          <Text style={styles.buttonText}>Scan INNER Package</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#ed2fb8ff'}]}
          onPress={() => {
            //Alert.alert('Match Face Head');
            scanSecureQR();
          }}
          //disabled={faceMatchLoading}
        >
          {faceMatchLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>UIDAI QR Code Scan</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#7C3AED'}]}
          onPress={() => {
            //Alert.alert('Match Face Head');
            handleFaceMatch();
          }}
          disabled={faceMatchLoading}>
          {faceMatchLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>UIDAI Face Verification</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <SecureQRResultModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        photoBase64={qrResult.photo}
        photoMimeType={qrResult.photoMimeType}
        name={qrResult.name}
        uid={qrResult.uid}
      />
    </>
  );
};

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 24},
  button: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontWeight: '600', fontSize: 16},
  logout: {marginTop: 24, alignItems: 'center'},
  logoutText: {color: '#DC2626', fontWeight: '600'},

  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {width: 8, height: 8, borderRadius: 4, marginRight: 8},
  statusText: {fontSize: 12, fontWeight: '700'},

  overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  leftMenu: {
    position: 'absolute',
    left: 0,
    width: '70%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 24,
  },
  menuHeader: {alignItems: 'center', marginBottom: 24},
  menuLogo: {width: 120, height: 120},
  appName: {fontSize: 16, fontWeight: '700'},
  menuButton: {
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  menuButtonText: {fontSize: 15, fontWeight: '600'},
  divider: {height: 1, backgroundColor: '#E5E7EB', marginVertical: 16},
  logoutButton: {backgroundColor: '#FEF2F2'},
});

export default DashboardScreen;
