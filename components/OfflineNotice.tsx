import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const OfflineNotice: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  const retryConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected ?? true);
  };

  if (isConnected) return null; 

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.center}>
        <View style={styles.box}>
          <Text style={styles.title}>No Internet Connection</Text>
          <Text style={styles.subtitle}>Please connect to continue</Text>
          <Button title="Retry" onPress={retryConnection} />
        </View>
      </View>
    </Modal>
  );
};

export default OfflineNotice;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
});
