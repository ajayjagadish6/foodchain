import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { DonationCard } from '../../components/domain/DonationCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { donationService } from '../../services/donationService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

export default function DonorHome() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['donations', 'mine'],
    queryFn: donationService.getMine,
  });

  if (isLoading) return <LoadingSpinner fullScreen message="Loading donations…" />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Your food donations</Text>
        </View>
        <Button
          label="+ Donate"
          onPress={() => router.push('/(donor)/new')}
          size="sm"
          fullWidth={false}
        />
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        renderItem={({ item }) => <DonationCard donation={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="leaf-outline"
            title="No donations yet"
            subtitle="Your food donations will appear here. Post your first one!"
            actionLabel="Post a Donation"
            onAction={() => router.push('/(donor)/new')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  list: { padding: spacing.lg, flexGrow: 1 },
});
