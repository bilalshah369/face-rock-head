import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import AppHeader from '../Layout/AppHeader';
import {useAppContext} from '../../context/AppContext';
import {
  hasLocationPermission,
  requestLocationPermission,
} from '../../utils/locationPermission';
import BottomNavigation from '../../navigation/BottomNavigation';
import ScanHistoryScreen from '../workspace/ScanHistoryScreen';
import ManualEntryScreen from '../workspace/ManualEntryScreen';
import DeviceInfo from 'react-native-device-info';
import {NativeModules} from 'react-native';
import {j2kPng, scanData} from '../../utils/scan/scanUtils';
import SecureQRResultModal from './SecureQRResultModal';
import SecureQRResultModalHead from './SecureQRResultModalHead';
import {verifyFace} from '../../native/localFaceMatch';
import CustomAlert from '../modals/CustomAlert';
import {insertScanLog, insertScanLogStudent} from '../../database/db';
import {getCurrentLocation} from '../../utils/location';
import {syncScansToBackend} from '../../services/syncService';

const {width} = Dimensions.get('window');
const MENU_WIDTH = width * 0.7;

const DashboardScreen = ({navigation}: {navigation: any}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrResult, setQrResult] = useState<{
    name?: string;
    uid?: string;
    photo?: string;
    photoMimeType?: string;

    // 👇 FACE VERIFICATION
    faceVerified?: boolean;
    faceError?: string;
    faceErrCode?: string;
    faceRequestId?: string;
  }>({});
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const {isAutoSync, setIsAutoSync} = useAppContext();
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const leftAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const rightAnim = useRef(new Animated.Value(MENU_WIDTH)).current;
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const appVersion = DeviceInfo.getVersion(); // e.g. 1.2.0
  const buildNumber = DeviceInfo.getBuildNumber();
  /* -------------------- EFFECTS -------------------- */
  const {MyNativeModule} = NativeModules;
  const [faceMatchLoading, setFaceMatchLoading] = useState(false);
  const faceMatchLock = useRef(false);

  /////////////
  // useEffect(() => {
  //   const loadUser = async () => {
  //     const data = await AsyncStorage.getItem('user');
  //     if (data) setUser(JSON.parse(data));
  //   };
  //   loadUser();
  // }, []);

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
  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setIsOnline(!!s.isConnected));
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      await requestLocationPermission();
      await Camera.requestCameraPermission();
    })();
  }, []);

  useEffect(() => {
    Animated.timing(leftAnim, {
      toValue: showMenu ? 0 : -MENU_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showMenu]);

  useEffect(() => {
    Animated.timing(rightAnim, {
      toValue: showProfile ? 0 : MENU_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showProfile]);

  /* -------------------- ACTIONS -------------------- */

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const navigate = (screen: string, params?: any) => {
    setShowMenu(false);
    navigation.navigate(screen, params);
  };
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'candidates' | 'verify' | 'history' | 'settings'
  >('dashboard');
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
        uid: data.refId,
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
  function parseLocalFaceMatchResponseAll(
    response: string,
  ): Record<string, string> {
    const result: Record<string, string> = {};
    const regex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = regex.exec(response)) !== null) {
      result[match[1]] = match[2];
    }

    return result;
  }

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
      debugger;
      const parsed = parseLocalFaceMatchResponseAll(responseXml);

      const faceVerified = parsed.errCode === '0';
      const faceErrorMessage = faceVerified ? undefined : parsed.errInfo;

      //insertor update scan if priority
      ///status already verify in db no chnage
      //status not matched and current sttaus not macth no change
      //status is two setstatus only matched not matched
      setQrResult(prev => ({
        ...prev,

        faceVerified: parsed.errCode === '0',
        faceError: parsed.errCode === '0' ? undefined : parsed.errInfo,
        faceErrCode: parsed.errCode,
        faceRequestId: parsed.requestId,
      }));
      setAlertSuccess(faceVerified);
      setAlertMessage(
        faceVerified ? 'Face matched successfully' : 'Face not matched',
      );
      setShowAlert(true);
      try {
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
        const insertedId = await insertScanLogStudent({
          tracking_id: qrResult.uid || '',
          qr_type: 'OUTER',
          centre_id: 1,
          scanned_by: userId ? parseInt(userId, 10) : undefined, // later from logged-in user
          scanned_phone: user?.phone_number, // optional
          scan_datetime: new Date().toISOString(),
          latitude: latitude ?? undefined, // add GPS later
          longitude: longitude ?? undefined,
          scan_mode: net.isConnected ? 'ONLINE' : 'OFFLINE',
          device_id: deviceId || 'UNKNOWN_DEVICE',
          remarks: 'QR and face match done via mobile app',
          created_by: userId ? parseInt(userId, 10) : undefined,
          face_status: faceVerified ? 'VERIFIED' : 'FAILED',
          name: qrResult.name,
        });
      } catch (exp) {
        console.log('Error inserting records to db');
      }

      //const errCode = uidaiResponse.errCode;

      //const faceVerified = errCode === '0';
      //Alert.alert('UIDAI Response', responseXml);
      // Alert.alert(
      //   'UIDAI Face Verification',
      //   faceVerified
      //     ? 'FACE MATCHED\nVerification successful'
      //     : `FACE NOT MATCHED\n${parsed.errInfo || 'Verification failed'}`,
      //   [{text: 'OK'}],
      //);
      // Alert.alert(
      //   '',
      //   faceVerified ? 'Face matched successfully' : 'Face not matched',
      //   [{text: 'OK'}],
      // );
      // Alert.alert(
      //   '',
      //   faceVerified ? '✅ Face matched successfully' : '❌ Face not matched',
      // );
    } catch (e: any) {
      Alert.alert('Face Match Failed', e.message || 'Unable to verify face');
    } finally {
      setFaceMatchLoading(false);
      faceMatchLock.current = false;
    }
  };
  /* -------------------- RENDER -------------------- */

  return (
    <View style={{flex: 1}}>
      {/* OVERLAY */}
      {(showMenu || showProfile) && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            setShowMenu(false);
            setShowProfile(false);
          }}
        />
      )}

      {/* LEFT MENU */}
      <Animated.View
        style={[styles.leftMenu, {transform: [{translateX: leftAnim}]}]}>
        {/* APP / CENTRE HEADER */}
        <MenuHeader />

        {/* DASHBOARD */}
        <MenuItem label="🏠 Dashboard" onPress={() => navigate('Dashboard')} />

        <View style={styles.divider} />

        {/* FACE VERIFICATION */}
        <MenuItem
          label="🧑‍💼 Verify Face"
          highlight
          onPress={() => scanSecureQR()}
        />

        {/* SCANNING */}
        {/* <MenuItem
          label="📦 Scan OUTER Package"
          onPress={() => navigate('Scanner', {type: 'OUTER'})}
        />

        <MenuItem
          label="📦 Scan INNER Package"
          onPress={() => navigate('Scanner', {type: 'INNER'})}
        /> */}

        {/* HISTORY & LOGS */}
        {/* <MenuItem
          label="🕘 Scan History"
          onPress={() => navigate('ScanHistoryScreen')}
        /> */}

        <MenuItem
          label="📄 Verification Logs"
          onPress={() => navigate('ScanHistoryScreen')}
        />

        <View style={styles.divider} />

        {/* SETTINGS */}
        <MenuItem label="⚙️ Settings" onPress={() => navigate('Settings')} />

        {/* LOGOUT */}
        <MenuItem label="🚪 Logout" danger onPress={logout} />
      </Animated.View>

      {/* RIGHT PROFILE */}
      <Animated.View
        style={[styles.rightMenu, {transform: [{translateX: rightAnim}]}]}>
        {/* Profile Header */}
        {/* <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.full_name || 'Authorized User'}
            </Text>
            <Text style={styles.profileRole}>
              {user?.role_name || 'Role Assigned'}
            </Text>
          {user?.employeeId && (
              <Text style={styles.profileMeta}>
                Employee ID: {user.employeeId}
              </Text>
            )} 
          </View>
        </View> */}
        <View style={styles.profileHeaderCompact}>
          <View style={styles.avatarCompact}>
            <Text style={styles.avatarTextCompact}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          <View style={styles.profileInfoCompact}>
            <Text style={styles.profileNameCompact} numberOfLines={1}>
              {user?.full_name || 'Authorized User'}
            </Text>
            <Text style={styles.profileRoleCompact} numberOfLines={1}>
              {user?.role_name || 'Role Assigned'}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Menu Actions */}
        <MenuItem
          disabled={!isOnline}
          label="Change Role"
          onPress={() => {
            navigation.replace('Login');
          }}
        />

        <MenuItem
          label="About Application"
          onPress={() => setShowAbout(true)}
        />

        <MenuItem
          label="Terms & Conditions"
          onPress={() => setShowTerms(true)}
        />
        <Text style={styles.modalFooter}>
          Version {appVersion} (Build {buildNumber}) • N.T.A
        </Text>
        <View style={styles.divider} />

        <MenuItem
          disabled={!isOnline}
          label="Exit Application"
          danger
          onPress={() => {
            Alert.alert(
              'Confirm Exit',
              'Are you sure you want to exit the application?',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Exit', style: 'destructive', onPress: logout},
              ],
            );
          }}
        />
      </Animated.View>

      <AppHeader
        title="Workplace"
        onMenuPress={() => setShowMenu(true)}
        onProfilePress={() => setShowProfile(true)}
      />

      <View style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        {activeTab === 'dashboard' && (
          <View style={styles.dashboardContainer}>
            {/* STATUS */}
            <View style={styles.statusRow}>
              <StatusBadge isOnline={isOnline} />
            </View>

            {/* PRIMARY ACTION */}
            <View style={styles.primaryCard}>
              <Text style={styles.primaryTitle}>Candidate Verification</Text>
              <Text style={styles.primarySubtitle}>
                Scan QR Code and verify candidate identity
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => scanSecureQR()}>
                <Image
                  source={require('../../assets/icons/camera.png')}
                  style={styles.primaryIcon}
                />
                <Text style={styles.primaryButtonText}>Verify Face</Text>
              </TouchableOpacity>
            </View>

            {/* SECONDARY ACTIONS */}
            <View style={styles.actionsGrid}>
              {/* <DashboardCard
                label="Manual Entry"
                subtitle="Add candidate details manually"
                icon={require('../../assets/icons/profile.png')}
                onPress={() => navigation.navigate('ManualEntry')}
              /> */}

              <DashboardCard
                label="Scan History"
                subtitle="View previous scans & logs"
                icon={require('../../assets/icons/history.png')}
                onPress={() => navigation.navigate('ScanHistoryScreen')}
              />
            </View>
          </View>
        )}

        {activeTab === 'history' && <ScanHistoryScreen />}
        {activeTab === 'candidates' && <ManualEntryScreen />}
      </View>

      {/* BOTTOM NAV */}
      <BottomNavigation
        activeTab={activeTab}
        onChange={setActiveTab}
        onScan={() => scanSecureQR()}
      />
      <Modal
        visible={showAbout}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAbout(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>About Application</Text>

            <Text style={styles.modalText}>
              This application has been developed for the National Testing
              Agency (NTA) to support secure, centre-level candidate identity
              verification using facial validation, along with controlled
              scanning and activity logging during examination operations.
            </Text>

            <Text style={styles.modalText}>
              The system provides role-based access to authorized personnel,
              including examination officials, city coordinators, and centre
              administrators, in accordance with prescribed operational
              guidelines.
            </Text>

            <Text style={styles.modalFooter}>
              Version {appVersion} (Build {buildNumber}) • National Testing
              Agency
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAbout(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CustomAlert
        visible={showAlert}
        success={alertSuccess}
        message={alertMessage}
        onClose={() => {
          syncScansToBackend();
          setShowAlert(false);
        }}
      />
      <Modal
        visible={showTerms}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTerms(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>

            <Text style={styles.modalText}>
              • This application is intended strictly for authorized exam centre
              personnel only.
            </Text>

            <Text style={styles.modalText}>
              • Unauthorized access, misuse, duplication, or manipulation of
              data is strictly prohibited.
            </Text>

            <Text style={styles.modalText}>
              • All activities performed within the application, including face
              verification and scanning, may be logged for security, compliance,
              and audit purposes.
            </Text>

            <Text style={styles.modalText}>
              • Users are responsible for maintaining the confidentiality and
              integrity of all operational data accessed through the
              application.
            </Text>

            <Text style={styles.modalFooter}>
              By proceeding, you acknowledge that you have read, understood, and
              agree to comply with all applicable rules, policies, and
              regulations.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTerms(false)}>
              <Text style={styles.modalButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <SecureQRResultModalHead
        visible={qrModalVisible}
        onClose={() => {
          setQrResult({});
          setQrModalVisible(false);
        }}
        //photoBase64={qrResult.photo}
        // photoMimeType={qrResult.photoMimeType}
        name={qrResult.name}
        uid={qrResult.uid}
        faceVerified={qrResult.faceVerified}
        faceError={qrResult.faceError}
        onProceed={function (): void {
          //throw new Error('Function not implemented.');
          handleFaceMatch();
        }}
      />
    </View>
  );
};
const DashboardCard = ({
  label,
  subtitle,
  icon,
  onPress,
}: {
  label: string;
  subtitle: string;
  icon: any;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={icon} style={styles.cardIcon} />
    <View>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);
/* -------------------- COMPONENTS -------------------- */

const StatusBadge = ({isOnline}: {isOnline: boolean}) => (
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
      style={[styles.statusText, {color: isOnline ? '#065F46' : '#7F1D1D'}]}>
      {isOnline ? 'ONLINE' : 'OFFLINE'}
    </Text>
  </View>
);

const ActionButton = ({label, onPress, color = '#2563EB'}: any) => (
  <TouchableOpacity
    style={[styles.button, {backgroundColor: color}]}
    onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

const MenuHeader = () => (
  <View style={styles.menuHeader}>
    <Image
      source={{
        uri: 'https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/app_logo.png',
      }}
      style={styles.menuLogo}
      resizeMode="contain"
    />
    <Text style={styles.appName}>NTA</Text>
    <Text style={styles.appName}>Face Verification System</Text>
    <Text style={styles.appSubTitle}>Centre Operations</Text>
  </View>
);

const MenuItem = ({label, onPress, danger, disabled}: any) => (
  <TouchableOpacity
    style={[
      styles.menuButton,
      danger && {backgroundColor: '#FEF2F2'},
      disabled && {opacity: 0.5},
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}>
    <Text
      style={[
        styles.menuButtonText,
        danger && {color: '#DC2626'},
        disabled && {color: '#9CA3AF'},
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 24},
  button: {
    padding: 18,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontWeight: '600', fontSize: 16},
  logout: {marginTop: 32, alignItems: 'center'},
  logoutText: {color: '#DC2626', fontWeight: '600'},

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },

  leftMenu: {
    position: 'absolute',
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    padding: 24,
    zIndex: 2,
  },

  rightMenu: {
    position: 'absolute',
    right: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    padding: 24,
    zIndex: 2,
  },

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

  menuHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  menuLogo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },

  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  appSubTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  menuButton: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  menuButtonText: {fontSize: 15, fontWeight: '600'},
  divider: {height: 1, backgroundColor: '#E5E7EB', marginVertical: 16},

  profileHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  profileRole: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },

  profileMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  modalText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },

  modalFooter: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
  },

  modalButton: {
    marginTop: 20,
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    borderRadius: 8,
  },

  modalButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  profileHeaderCompact: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  avatarTextCompact: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  profileInfoCompact: {
    flex: 1,
  },

  profileNameCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  profileRoleCompact: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },

  dashboardContainer: {
    padding: 16,
  },

  statusRow: {
    marginBottom: 12,
  },

  /* Primary Card */
  primaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },

  primaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  primarySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },

  primaryIcon: {
    width: 22,
    height: 22,
    tintColor: '#FFFFFF',
    marginRight: 10,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Secondary Grid */
  actionsGrid: {
    gap: 12,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  cardIcon: {
    width: 26,
    height: 26,
    tintColor: '#374151',
    marginRight: 14,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default DashboardScreen;
