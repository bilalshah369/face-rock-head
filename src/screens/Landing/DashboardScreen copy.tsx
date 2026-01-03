import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import AppHeader from '../Layout/AppHeader';
import {useAppContext} from '../../context/AppContext';

const DashboardScreen = ({navigation}: {navigation: any}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState(false);
  const {setIsAutoSync, isAutoSync} = useAppContext();
  const [showProfile, setShowProfile] = useState(false);
  // const [autoSync, setAutoSync] = useState<boolean>(true);
  const toggleAutoSync = async () => {
    // const newValue = !autoSync;
    // setAutoSync(newValue);
    setIsAutoSync(!isAutoSync);
    // await AsyncStorage.setItem('AUTO_SYNC', String(newValue));
  };
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);
  // useEffect(() => {
  //   const loadAutoSync = async () => {
  //     // const value = await AsyncStorage.getItem('AUTO_SYNC');
  //     // if (value !== null) {
  //     //   setAutoSync(value === 'true');
  //     // }
  //     setAutoSync(isAutoSync);
  //   };
  //   loadAutoSync();
  // }, []);
  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <>
      {/* LEFT MENU */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        />

        <View style={styles.leftMenu}>
          {/* Logo Section */}
          <View style={styles.menuHeader}>
            <Image
              source={{
                uri: 'https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/app_logo.png',
              }}
              style={styles.menuLogo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Package Tracker</Text>
          </View>

          {/* Menu Items */}
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

          {/* Logout */}
          <TouchableOpacity
            style={[styles.menuButton, styles.logoutButton]}
            onPress={logout}>
            <Text style={[styles.menuButtonText, {color: '#DC2626'}]}>
              🚪 Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* RIGHT PROFILE */}
      <Modal
        visible={showProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowProfile(false)}
        />

        <View style={styles.rightMenu}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: 'https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/app_logo.png',
              }}
              style={styles.profileAvatar}
            />
            <Text style={styles.profileName}>Admin</Text>
            <Text style={styles.profileRole}>Dispatcher</Text>
          </View>
          {/* Auto Sync Toggle */}
          <TouchableOpacity
            style={[
              styles.profileButton,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            ]}
            onPress={toggleAutoSync}>
            <Text style={styles.profileButtonText}>🔁 Auto Sync</Text>

            <View
              style={[
                styles.syncIndicator,
                {backgroundColor: isAutoSync ? '#16A34A' : '#9CA3AF'},
              ]}>
              <Text style={styles.syncText}>{isAutoSync ? 'ON' : 'OFF'}</Text>
            </View>
          </TouchableOpacity>

          {/* Profile Actions */}
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileButtonText}>👤 View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Logout */}
          <TouchableOpacity
            style={[styles.profileButton, styles.logoutButton]}
            onPress={logout}>
            <Text style={[styles.profileButtonText, {color: '#DC2626'}]}>
              🚪 Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <AppHeader
        title={'Dashboard'}
        onMenuPress={() => setShowMenu(true)}
        onProfilePress={() => setShowProfile(true)}
      />
      <View style={styles.container}>
        {/* 🔹 Online / Offline Status */}
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

        <Text style={styles.title}></Text>

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
          style={[styles.button, {backgroundColor: 'yellowgreen'}]}
          onPress={() => navigation.navigate('ScanHistoryScreen')}>
          <Text style={styles.buttonText}>Scan History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
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
    zIndex: 10,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  logout: {
    marginTop: 32,
    alignItems: 'center',
  },

  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    //backgroundColor: 'rgba(0,0,0,0.3)',
  },

  leftMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    elevation: 10,
  },

  rightMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '70%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    elevation: 10,
  },

  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },

  menuItem: {
    paddingVertical: 14,
  },

  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },

  profileItem: {
    fontSize: 15,
    marginBottom: 12,
    color: '#374151',
  },

  menuHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  menuLogo: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },

  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  menuButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },

  menuButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  // logoutButton: {
  //   backgroundColor: '#FEF2F2',
  // },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },

  profileAvatar: {
    width: 150,
    height: 150,
    borderRadius: 42,
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  profileButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },

  profileButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  logoutButton: {
    backgroundColor: '#FEF2F2',
  },
  syncIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  syncText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default DashboardScreen;
