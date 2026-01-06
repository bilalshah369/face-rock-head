import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  photoBase64?: string;
  photoMimeType?: string; // "image/png" | "image/jpeg"
  name?: string;
  uid?: string;
};

const SecureQRResultModal: React.FC<Props> = ({
  visible,
  onClose,
  photoBase64,
  photoMimeType = 'image/png',
  name,
  uid,
}) => {
  const imageUri = photoBase64
    ? `data:${photoMimeType};base64,${photoBase64}`
    : undefined;

  console.log('IMAGE URI PREFIX:', imageUri?.substring(0, 50));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>QR Details</Text>

          {imageUri ? (
            <Image
              source={{uri: imageUri}}
              style={styles.photo}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.noPhoto}>Photo not available</Text>
          )}

          {name && <Text style={styles.text}>Name: {name}</Text>}
          {uid && <Text style={styles.text}>UID: {uid}</Text>}

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SecureQRResultModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  photo: {
    width: 140,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f2f2f2',
  },
  noPhoto: {
    color: '#999',
    marginVertical: 20,
  },
  text: {
    fontSize: 14,
    marginTop: 4,
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#1976D2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
