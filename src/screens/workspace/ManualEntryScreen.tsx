import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  deleteScan,
  insertScanLog,
  insertScanLogStudent,
  markAsSynced,
} from '../../database/db';
import {getCurrentLocation} from '../../utils/location';
import {hasLocationPermission} from '../../utils/locationPermission';
import {API_BASE} from '@env';
import {useNavigation, useRoute} from '@react-navigation/native';
const API_URL = API_BASE + '/scans/singleManual';

type Props = NativeStackScreenProps<RootStackParamList, 'ManualEntry'>;

const ManualEntryScreen: React.FC = () => {
  //const {type, centre_id: routeCentreId} = route.params;
  const navigation = useNavigation();
  const route = useRoute();
  const [trackingId, setTrackingId] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem('user');
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  const onSubmit = async () => {
    if (!trackingId.trim()) {
      Alert.alert('Validation', 'Tracking ID is required');
      return;
    }

    let centre_id; //user?.centre_id ?? routeCentreId;

    // if (!centre_id) {
    //   Alert.alert('Error', 'Centre ID not available');
    //   return;
    // }
    Keyboard.dismiss();
    setLoading(true);

    try {
      const net = await NetInfo.fetch();
      const deviceId = await DeviceInfo.getUniqueId();
      const scanTime = new Date().toISOString();

      let latitude: number | undefined;
      let longitude: number | undefined;

      if (await hasLocationPermission()) {
        try {
          const loc = await getCurrentLocation();
          latitude = loc.latitude;
          longitude = loc.longitude;
        } catch {
          console.warn('Location fetch failed');
        }
      }
      debugger;
      /* ================= LOCAL INSERT ================= */
      const localId = await insertScanLogStudent({
        tracking_id: trackingId.trim(),
        qr_type: 'OUTER',
        centre_id: 0,
        scanned_by: user?.user_id,
        scanned_phone: user?.phone_number,
        scan_datetime: scanTime,
        latitude,
        longitude,
        scan_mode: net.isConnected ? 'ONLINE' : 'OFFLINE',
        device_id: deviceId,
        remarks: remark || 'Manual entry',
        created_by: user?.user_id,
      });
      setTrackingId('');
      setRemark('');
      /* ================= SYNC ================= */
      if (net.isConnected) {
        try {
          const token = await AsyncStorage.getItem('token');

          const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              tracking_id: trackingId.trim(),
              qr_type: 'OUTER',
              centre_id,
              scanned_by: user?.user_id,
              scanned_phone: user?.phone_number,
              scan_datetime: scanTime,
              latitude,
              longitude,
              scan_mode: 'ONLINE',
              device_id: deviceId,
              remarks: remark || 'Manual entry',
              created_by: user?.user_id,
            }),
          });

          if (res.ok) {
            await markAsSynced(localId ?? '');
          } else {
            await deleteScan(localId ?? '');
            Alert.alert(
              'Error',
              'The provided tracking ID is incorrect. Please verify and try again.',
            );
          }
        } catch (err) {
          console.warn('Sync failed', err);
        }
      }

      Alert.alert('Success', 'Entry saved successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* <Text style={styles.title}>Manual Entry</Text> */}

        <TextInput
          style={styles.input}
          placeholder="Enter Tracking ID"
          placeholderTextColor="#9CA3AF"
          value={trackingId}
          onChangeText={t => setTrackingId(t.toUpperCase())}
          autoCapitalize="characters"
        />

        <TextInput
          style={[styles.input, styles.remark]}
          placeholder="Remark (optional)"
          placeholderTextColor="#9CA3AF"
          value={remark}
          onChangeText={setRemark}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={onSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ManualEntryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  remark: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1e3a8a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
