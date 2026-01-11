import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE} from '@env';

type LoginMode = 'USER' | 'ROLE';
type RoleWithID = '5' | '6' | '7';

const ROLES: {label: string; value: RoleWithID}[] = [
  {label: 'Invigilator', value: '5'},
  {label: 'Observer (External / Flying Squad)', value: '6'},
  {label: 'Exam Controller', value: '7'},
];
const ROLE_COLORS: Record<RoleWithID, string> = {
  '5': '#2563EB', // India Post → Blue (operations)
  '6': '#059669', // City Coordinator → Green (management)
  '7': '#7C3AED', // Center Superintendent → Purple (authority)
};

const LoginScreen = ({navigation}: {navigation: any}) => {
  const [loginMode, setLoginMode] = useState<LoginMode>('ROLE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /* ===============================
     1️⃣ NORMAL USER LOGIN
  =============================== */
  const handleUserLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username & password required');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
      });

      const data = await res.json();
      if (!res.ok || !data?.token) throw new Error();

      await AsyncStorage.multiSet([
        ['token', data.token],
        ['nta_token', data.token],
        ['user', JSON.stringify(data.user)],
      ]);

      navigation.replace('Dashboard');
    } catch {
      Alert.alert('Login Failed', 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     2️⃣ ROLE-BASED LOGIN
  =============================== */
  const handleRoleLogin = async (role: RoleWithID) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/loginWithRole`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({role}),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok || !data?.token) throw new Error();

      await AsyncStorage.multiSet([
        ['token', data.token],
        ['nta_token', data.token],
        ['user', JSON.stringify(data.user)],
        ['role', role],
      ]);

      navigation.replace('Dashboard');
    } catch {
      Alert.alert('Access Denied', 'Unable to login with selected role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={{
            uri: 'https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/app_logo.png',
          }}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Mode Toggle */}
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            style={[styles.modeBtn, loginMode === 'ROLE' && styles.modeActive]}
            onPress={() => setLoginMode('ROLE')}>
            <Text
              style={[
                styles.modeText,
                loginMode === 'ROLE' && styles.modeTextActive,
              ]}>
              Role Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, loginMode === 'USER' && styles.modeActive]}
            onPress={() => setLoginMode('USER')}>
            <Text
              style={[
                styles.modeText,
                loginMode === 'USER' && styles.modeTextActive,
              ]}>
              User Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {loginMode === 'USER' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleUserLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Secure Login</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {ROLES.map(role => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleBtn,
                    {backgroundColor: ROLE_COLORS[role.value]},
                  ]}
                  onPress={() => handleRoleLogin(role.value)}
                  disabled={loading}
                  activeOpacity={0.85}>
                  <Text style={styles.roleText}>{role.label}</Text>
                </TouchableOpacity>
              ))}

              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#1D4ED8"
                  style={{marginTop: 16}}
                />
              )}
            </>
          )}
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} National Testing Agency
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
export const styles = StyleSheet.create({
  /* ====== BASE ====== */
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6', // neutral govt background
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  /* ====== LOGO ====== */
  logo: {
    height: 120,
    width: '100%',
    marginBottom: 24,
  },

  /* ====== MODE TOGGLE ====== */
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeActive: {
    backgroundColor: '#1D4ED8',
  },
  modeText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },

  /* ====== CARD ====== */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  /* ====== INPUTS ====== */
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },

  /* ====== PRIMARY BUTTON ====== */
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* ====== ROLE LOGIN ====== */
  // roleBtn: {
  //   backgroundColor: '#1D4ED8',
  //   paddingVertical: 14,
  //   borderRadius: 10,
  //   marginBottom: 12,
  // },
  roleBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  /* ====== FOOTER ====== */
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
});
