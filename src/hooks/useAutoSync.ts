import {useEffect, useRef} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {syncScansToBackend} from '../services/syncService';

export const useAutoSync = () => {
  const hasSyncedOnce = useRef(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected && !hasSyncedOnce.current) {
        hasSyncedOnce.current = true;
        syncScansToBackend();
      }
    });

    return () => unsub();
  }, []);
};
