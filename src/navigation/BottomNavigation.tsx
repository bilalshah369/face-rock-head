import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';

type TabKey = 'dashboard' | 'candidates' | 'verify' | 'history' | 'settings';

interface Props {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  onScan: () => void;
}

export default function BottomNavigation({activeTab, onChange, onScan}: Props) {
  return (
    <View style={styles.wrapper}>
      {/* BOTTOM BAR */}
      <View style={styles.container}>
        <Tab
          label="Dashboard"
          active={activeTab === 'dashboard'}
          onPress={() => onChange('dashboard')}
          icon={
            <TabIcon
              source={
                activeTab === 'dashboard'
                  ? require('../assets/icons/dashboard-active.png')
                  : require('../assets/icons/dashboard.png')
              }
            />
          }
        />

        {/* <Tab
          label="Candidates"
          active={activeTab === 'candidates'}
          onPress={() => onChange('candidates')}
          icon={<TabIcon source={require('../assets/icons/profile.png')} />}
        /> */}

        {/* Spacer for Camera */}
        <View style={styles.centerGap} />

        <Tab
          label="Logs"
          active={activeTab === 'history'}
          onPress={() => onChange('history')}
          icon={
            <TabIcon
              source={
                activeTab === 'history'
                  ? require('../assets/icons/history-active.png')
                  : require('../assets/icons/history.png')
              }
            />
          }
        />

        {/* <Tab
          label="Settings"
          active={activeTab === 'settings'}
          onPress={() => onChange('settings')}
          icon={<TabIcon source={require('../assets/icons/profile.png')} />}
        /> */}
      </View>

      {/* FLOATING VERIFY CAMERA */}
      <TouchableOpacity
        style={[styles.fab, activeTab === 'verify' && styles.fabActive]}
        onPress={() => onScan()}
        accessibilityLabel="Verify Candidate Face"
        accessibilityRole="button">
        <Image
          source={require('../assets/icons/camera.png')}
          style={styles.fabIcon}
        />
        <Text style={styles.fabLabel}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- TAB ---------------- */

const Tab = ({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.tab} onPress={onPress}>
    {icon}
    <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    {active && <View style={styles.dot} />}
  </TouchableOpacity>
);

/* ---------------- ICON ---------------- */

const TabIcon = ({source}: {source: any}) => (
  <Image source={source} style={styles.icon} resizeMode="contain" />
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },

  container: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,

    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 18,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 22,
    height: 22,
  },

  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 6,
  },

  activeLabel: {
    color: '#1F2937',
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1F2937',
    marginTop: 5,
  },

  centerGap: {
    width: 72,
  },

  /* Floating Camera */
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 34,

    width: 72,
    height: 72,
    borderRadius: 36,

    backgroundColor: '#111827', // PROFESSIONAL (not flashy)

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 30,
  },

  fabActive: {
    backgroundColor: '#1F2937',
  },

  fabIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },

  fabLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
