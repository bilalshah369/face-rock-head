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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import AppHeader from '../Layout/AppHeader';
import {useAppContext} from '../../context/AppContext';

// 🔹 UIDAI Face Match imports
import {callHeadlessFaceMatch} from '../../native/faceMatch';
import {buildFaceMatchXml} from '../../utils/buildFaceMatchXml';
import {parseFaceMatchResponse} from '../../utils/parseFaceMatchResponse';
import {verifyFace} from '../../native/localFaceMatch';
import {launchImageLibrary} from 'react-native-image-picker';
const DashboardScreen = ({navigation}: {navigation: any}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const {setIsAutoSync, isAutoSync} = useAppContext();

  // 🔹 Face Match state
  const [faceMatchLoading, setFaceMatchLoading] = useState(false);
  const faceMatchLock = useRef(false);

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
      const photoBase64 = await pickPhotoFromDevice();

      // 2️⃣ Call your FINAL verified flow
      const responseXml = await verifyFace(photoBase64);

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
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Scanner', {type: 'OUTER'})}>
          <Text style={styles.buttonText}>Scan OUTER Package</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#059669'}]}
          onPress={() => navigation.navigate('Scanner', {type: 'INNER'})}>
          <Text style={styles.buttonText}>Scan INNER Package</Text>
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
