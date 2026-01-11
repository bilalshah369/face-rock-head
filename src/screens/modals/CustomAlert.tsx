import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

const icons = {
  success: require('../../assets/icons/checktick.png'),
  failure: require('../../assets/icons/cross.png'),
};

type Props = {
  visible: boolean;
  message: string;
  success?: boolean; // true = tick, false = cross
  onClose: () => void;
};

const CustomAlert: React.FC<Props> = ({
  visible,
  message,
  success = false,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* ICON */}
          <Image
            source={success ? icons.success : icons.failure}
            style={styles.icon}
          />

          {/* MESSAGE */}
          <Text style={styles.message}>{message}</Text>

          {/* ACTION */}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },

  icon: {
    width: 48,
    height: 48,
    marginBottom: 12,
    resizeMode: 'contain',
  },

  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },

  button: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#111827',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default CustomAlert;
