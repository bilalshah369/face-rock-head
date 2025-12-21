import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {getScanHistory} from '../../database/db';
import {useFocusEffect} from '@react-navigation/native';
import {syncSingleScan} from '../../services/syncService';

const ScanHistoryScreen = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        alert('Sync failed. Please try again.' + success);
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.tracking}>{item.tracking_id}</Text>

          <Text
            style={[
              styles.badge,
              item.synced ? styles.synced : styles.pending,
            ]}>
            {item.synced ? 'SYNCED' : 'PENDING'}
          </Text>
        </View>

        <Text style={styles.text}>QR Type: {item.qr_type}</Text>
        <Text style={styles.text}>Mode: {item.scan_mode}</Text>
        <Text style={styles.text}>
          Time: {new Date(item.scan_datetime).toLocaleString()}
        </Text>

        {item.latitude && item.longitude && (
          <Text style={styles.text}>
            GPS: {item.latitude}, {item.longitude}
          </Text>
        )}

        {/* 🔥 SYNC BUTTON */}
        {!item.synced && (
          <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
            <Text style={styles.syncText}>Sync</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={scans}
      keyExtractor={item => item.scan_id.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadScans} />
      }
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text style={styles.empty}>No scans available</Text>}
    />
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
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default ScanHistoryScreen;
