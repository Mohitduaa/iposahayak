import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useInstantAllotment } from '@/hooks/useInstantAllotment';

export function InstantAllotment() {
  const { data: allotmentData, loading } = useInstantAllotment();

  // No loading screen - data shows instantly

  const renderItem = ({ item }: { item: any }) => (
    <View style={{ 
      padding: 12, 
      marginVertical: 4, 
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      marginHorizontal: 16
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
        {item.name || item.companyName}
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
        Status: {item.status || 'Pending'}
      </Text>
      <Text style={{ fontSize: 14, color: '#666' }}>
        Date: {item.date || item.allotmentDate || 'TBA'}
      </Text>
      <Text style={{ fontSize: 12, color: '#888' }}>
        Registrar: {item.registrar || 'N/A'}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={allotmentData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id || item.name || index}`}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
    />
  );
}