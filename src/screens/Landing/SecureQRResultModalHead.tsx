import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
  name?: string;
  uid?: string;
  faceVerified?: boolean;
  faceError?: string;
};

const SecureQRResultModalHead: React.FC<Props> = ({
  visible,
  onClose,
  onProceed,
  name,
  uid,
  faceVerified,
  faceError,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* HEADER */}
          <Text style={styles.title}>Candidate Details</Text>
          <Text style={styles.subtitle}>Secure QR successfully verified</Text>

          {/* STATUS */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>QR VERIFIED</Text>
          </View>
          {/* FACE STATUS (LETTERS ONLY) */}
          {faceVerified !== undefined && (
            <>
              <Text
                style={[
                  styles.faceStatusText,
                  {color: faceVerified ? '#166534' : '#991B1B'},
                ]}>
                {faceVerified ? 'FACE VERIFIED' : 'FACE NOT VERIFIED'}
              </Text>

              {!faceVerified && faceError && (
                <Text style={styles.faceErrorText}>{faceError}</Text>
              )}
            </>
          )}
          {/* DETAILS */}
          <View style={styles.detailsBlock}>
            <DetailRow label="Candidate Name" value={name || '—'} />
            <DetailRow label="Unique ID" value={uid || '—'} />
          </View>
          {faceVerified === false || faceVerified === undefined ? (
            <Text style={styles.infoText}>
              Proceed to perform live face verification to confirm candidate
              identity.
            </Text>
          ) : undefined}
          {/* ACTIONS */}
          <View style={styles.actions}>
            {faceVerified === false || faceVerified === undefined ? (
              <>
                {/* INFO */}

                <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                  <Text style={styles.secondaryText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryBtn} onPress={onProceed}>
                  <Text style={styles.primaryText}>
                    Proceed to Face Verification
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.successBtn} onPress={onClose}>
                <Text style={styles.primaryText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SecureQRResultModalHead;

/* ----------------- SUB COMPONENT ----------------- */

const DetailRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/* ----------------- STYLES ----------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },

  statusBadge: {
    alignSelf: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.4,
  },

  detailsBlock: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
  },

  row: {
    marginBottom: 10,
  },

  rowLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },

  infoText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 16,
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 11,
  },
  successBtn: {
    flex: 2,
    backgroundColor: 'green',
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    alignItems: 'center',
  },

  primaryBtn: {
    flex: 2,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  faceStatusText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  faceErrorText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 11,
    color: '#6B7280',
  },
});
