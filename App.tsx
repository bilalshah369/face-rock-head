import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigatorMobile';
import {initDB} from './src/database/initDB';
import {syncScansToBackend} from './src/services/syncService';
import {useAutoSync} from './src/hooks/useAutoSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from './src/navigation/types';
import {ActivityIndicator, View} from 'react-native';
import {AppProvider} from './src/context/AppContext';

export default function App() {
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);
  useAutoSync();
  useEffect(() => {
    const initAndSync = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (token) {
          setInitialRoute('Dashboard');
        } else {
          setInitialRoute('Login');
        }
        await initDB(); // ✅ wait for DB
        await syncScansToBackend(); // ✅ then sync
      } catch (err) {
        console.error('Init / Sync failed', err);
      }
    };

    initAndSync();
  }, []);
  if (!initialRoute) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator initialRoute={initialRoute} />
      </NavigationContainer>
    </AppProvider>
  );
}
