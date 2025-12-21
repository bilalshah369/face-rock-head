import {useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {syncScansToBackend} from '../services/syncService';

export const useAutoSync = () => {
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        debugger;
        syncScansToBackend();
      }
    });

    return () => unsub();
  }, []);
};
