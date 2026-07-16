import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { RequestCard } from '../../components/domain/RequestCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { requestService } from '../../services/requestService';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

export default function RecipientHome() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['requests', 'mine'],
    queryFn: requestService.getMine,
  });

  if (isLoading) return <LoadingSpinner fullScreen message="Loading requests…" />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Your food requests</Text>
        </View>
        <Button
          label="+ Request"
          onPress={() => router.push('/(recipient)/new')}
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
        renderItem={({ item }) => <RequestCard request={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="home-outline"
            title="No requests yet"
            subtitle="Post a food request and we'll match you with a local donor."
            actionLabel="Post a Request"
            onAction={() => router.push('/(recipient)/new')}
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
