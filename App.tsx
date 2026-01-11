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
import {checkAppVersion} from './src/services/versionService';
import ForceUpdateScreen from './src/auth/ForceUpdateScreen';
export default function App() {
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);
  const [forceUpdateData, setForceUpdateData] = useState<any>(null);
  useAutoSync();
  useEffect(() => {
    const initAndSync = async () => {
      try {
        /* -------------------------------
           1️⃣ VERSION CHECK FIRST
        -------------------------------- */

        try {
          const versionResp = await checkAppVersion();
          console.log('version ', versionResp);
          if (versionResp.forceUpdate) {
            setForceUpdateData(versionResp);
            return; // ⛔ STOP app init
          }
        } catch (err) {
          console.error('Init failed', err);
          // setInitialRoute('Login');
        }

        const token = await AsyncStorage.getItem('token');

        if (token) {
          setInitialRoute('Dashboard');
        } else {
          //setInitialRoute('RoleSelection');
          setInitialRoute('Login');
        }
        await initDB(); // ✅ wait for DB
        await syncScansToBackend(); // ✅ then sync
      } catch (err) {
        console.error('Init failed', err);
        setInitialRoute('Dashboard');
      }
    };

    initAndSync();
  }, []);

  /* -------------------------------
     FORCE UPDATE SCREEN
  -------------------------------- */
  if (forceUpdateData) {
    return (
      <ForceUpdateScreen
        updateUrl={forceUpdateData.updateUrl}
        message={forceUpdateData.message}
      />
    );
  }
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
