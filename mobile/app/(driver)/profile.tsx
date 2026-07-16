import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

export default function DriverProfile() {
  const { user, logout } = useAuthStore();

  function handleLogout() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🚗</Text>
          <Text style={styles.name}>{user?.displayName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Delivery Driver</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? ''} />
          <InfoRow icon="call-outline" label="Phone" value={user?.phoneNumber ?? ''} />
        </Card>

        <Button label="Sign Out" onPress={handleLogout} variant="danger" style={styles.logout} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={infoStyles.text}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  text: { flex: 1 },
  label: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  value: { fontSize: fontSize.md, color: colors.text, marginTop: 2 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.text, marginBottom: spacing.lg },
  avatar: { alignItems: 'center', marginBottom: spacing.lg },
  avatarEmoji: { fontSize: 56, marginBottom: spacing.sm },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    marginTop: spacing.xs,
  },
  roleText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  card: { marginBottom: spacing.lg },
  logout: { marginTop: spacing.sm },
});
