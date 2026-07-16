import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryCard } from '../../components/domain/DeliveryCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { deliveryService } from '../../services/deliveryService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';
import type { DeliverySummary } from '../../types/api';

export default function DriverHome() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deliveries', 'available'],
    queryFn: deliveryService.getAvailable,
    refetchInterval: 30_000,
  });

  const { mutate: acceptDelivery } = useMutation({
    mutationFn: deliveryService.accept,
    onSuccess: (delivery) => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      router.push(`/(driver)/delivery/${delivery.id}` as never);
    },
    onError: () => Alert.alert('Could not accept', 'This delivery may have been taken. Refreshing…'),
  });

  function handleAccept(delivery: DeliverySummary) {
    Alert.alert(
      'Accept delivery?',
      `Pick up from ${delivery.pickupAddress} and deliver to ${delivery.dropoffAddress}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptDelivery(delivery.id) },
      ]
    );
  }

  if (isLoading) return <LoadingSpinner fullScreen message="Looking for deliveries…" />;

  const available = (data ?? []).filter((d) => d.status === 'CREATED');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0]} 👋</Text>
        <Text style={styles.subtitle}>
          {available.length > 0
            ? `${available.length} delivery${available.length > 1 ? 'ies' : ''} available today`
            : 'No deliveries available right now'}
        </Text>
      </View>

      <FlatList
        data={available}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <DeliveryCard
            delivery={item}
            onPress={() => router.push(`/(driver)/delivery/${item.id}` as never)}
            onAccept={() => handleAccept(item)}
            showAccept
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="No deliveries today"
            subtitle="Check back soon — new deliveries are matched throughout the day."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  list: { padding: spacing.lg, flexGrow: 1 },
});
