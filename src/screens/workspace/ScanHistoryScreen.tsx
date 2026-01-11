import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {getScanHistory} from '../../database/db';
import {useFocusEffect} from '@react-navigation/native';
import {syncSingleScan} from '../../services/syncService';
import SecureQRResultModalHead from '../Landing/SecureQRResultModalHead';
import SecureQRResultModalHeadView from '../Landing/SecureQRResultModalHeadView';

const ScanHistoryScreen = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
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
  const loadScans = async () => {
    setLoading(true);
    const data = await getScanHistory();
    setScans(data);
    setLoading(false);
  };

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadScans();
    }, []),
  );

  const renderItem = ({item}: any) => {
    const handleSync = async () => {
      const success = await syncSingleScan(item);
      if (success) {
        loadScans(); // refresh list
      } else {
        //alert('Sync failed. Please try again.' + success);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setQrResult({
            name: item.name,
            uid: item.tracking_id, // Application / UID
            faceVerified: item.face_status === 'VERIFIED',
          });
          setQrModalVisible(true);
        }}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.tracking}>{item.tracking_id}</Text>

            <Text
              style={[
                styles.badge,
                item.face_status === 'VERIFIED'
                  ? styles.synced
                  : styles.pending,
              ]}>
              {item.face_status === 'VERIFIED'
                ? 'FACE VERIFIED'
                : 'FACE NOT VERIFIED'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.tracking}>{item.name}</Text>
            <Text
              style={[
                styles.badge,
                item.synced ? styles.synced : styles.pending,
              ]}>
              {item.synced ? 'SYNCED' : 'NOT SYNCED'}
            </Text>
          </View>

          <Text style={styles.text}>Mode: {item.scan_mode}</Text>
          <Text style={styles.text}>
            Time: {new Date(item.scan_datetime).toLocaleString()}
          </Text>

          {item.latitude && item.longitude && (
            <Text style={styles.text}>
              GPS: {item.latitude}, {item.longitude}
            </Text>
          )}
          {/* {item.face_status === 'VERIFIED' ? (
          <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
            <Text style={styles.syncText}>Face Veified</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
              <Text style={styles.syncText}>Face Not Veified</Text>
            </TouchableOpacity>
          </>
        )} */}
          {/* 🔥 SYNC BUTTON */}
          {/* {!item.synced && (
          <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
            <Text style={styles.syncText}>Sync</Text>
          </TouchableOpacity>
        )} */}
        </View>
      </TouchableOpacity>
    );
  };
  const filteredScans = scans.filter(item =>
    item.tracking_id?.toLowerCase().includes(searchText.trim().toLowerCase()),
  );
  return (
    <>
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search by Application No."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          placeholderTextColor="#9ca3af"
        />
      </View>
      <FlatList
        data={filteredScans}
        keyExtractor={item => item.scan_id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadScans} />
        }
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <Text style={styles.empty}>No scans available</Text>
        }
      />
      <SecureQRResultModalHeadView
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
          // handleFaceMatch();
        }}
      />
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tracking: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#fff',
  },
  synced: {
    backgroundColor: '#16a34a',
  },
  pending: {
    backgroundColor: '#dc2626',
  },
  text: {
    fontSize: 13,
    marginTop: 2,
    color: '#374151',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6b7280',
  },
  syncBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncText: {
    //color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  searchBox: {
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
});

export default ScanHistoryScreen;
