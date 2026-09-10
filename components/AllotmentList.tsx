import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { useAllotmentData } from '@/hooks/useAllotmentData';

export function AllotmentList() {
  const { allotmentData, loading, hasMore, onItemReached } = useAllotmentData();

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Call onItemReached when item is rendered
    React.useEffect(() => {
      onItemReached(index);
    }, [index]);

    return (
      <View style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.companyName}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Allotment: {item.allotmentDate}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text>Loading more...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={allotmentData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id || index}`}
      ListFooterComponent={renderFooter}
      onEndReached={() => {
        if (hasMore && !loading) {
          // Additional trigger when reaching end
        }
      }}
      onEndReachedThreshold={0.1}
    />
  );
}