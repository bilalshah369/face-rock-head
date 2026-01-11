import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  useColorScheme,
} from 'react-native';

type Props = {
  message: string;
  updateUrl: string;
};

const ForceUpdateScreen: React.FC<Props> = ({message, updateUrl}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDark ? '#111827' : '#F9FAFB'},
      ]}>
      <Text style={[styles.title, {color: isDark ? '#F9FAFB' : '#111827'}]}>
        Update Required
      </Text>

      <Text style={[styles.message, {color: isDark ? '#D1D5DB' : '#374151'}]}>
        {message}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL(updateUrl)}
        activeOpacity={0.85}>
        <Text style={styles.buttonText}>Update Now</Text>
      </TouchableOpacity>

      <Text style={[styles.footer, {color: isDark ? '#9CA3AF' : '#6B7280'}]}>
        National Testing Agency • Secure Application
      </Text>
    </View>
  );
};

export default ForceUpdateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    marginVertical: 20,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 28,
    fontSize: 12,
    textAlign: 'center',
  },
});
