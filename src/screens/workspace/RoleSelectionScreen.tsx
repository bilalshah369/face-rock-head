import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE} from '@env';

type RoleWithID = '5' | '6' | '7';

interface Props {
  navigation: any;
}

const roles: {label: string; value: RoleWithID}[] = [
  {label: 'India Post', value: '5'},
  {label: 'City Coordinator', value: '6'},
  {label: 'Center Superintendent', value: '7'},
];

const RoleSelectionScreen: React.FC<Props> = ({navigation}) => {
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/auth/loginWithRole`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({role}),
      });
      //debugger;
      const data = await response.json();

      if (data?.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('nta_token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        console.log(data);
      }

      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Unable to proceed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>National Testing Agency</Text>
          <Text style={styles.subtitle}>Authorized personnel</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {roles.map(role => (
            <TouchableOpacity
              key={role.value}
              style={styles.roleButton}
              onPress={() => handleRoleSelect(role.value)}
              disabled={loading}
              activeOpacity={0.85}>
              <Text style={styles.roleText}>{role.label}</Text>
            </TouchableOpacity>
          ))}

          {loading && (
            <ActivityIndicator
              size="large"
              color="#1D4ED8"
              style={{marginTop: 24}}
            />
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2026 Package Tracking System</Text>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },

  roleButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 14,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 32,
  },
});
