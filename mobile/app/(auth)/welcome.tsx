import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>FoodChain</Text>
          <Text style={styles.tagline}>
            Connecting food donors with communities that need them most
          </Text>
        </View>

        <View style={styles.roles}>
          <View style={styles.roleItem}>
            <Text style={styles.roleEmoji}>🥦</Text>
            <Text style={styles.roleText}>Donate surplus food</Text>
          </View>
          <View style={styles.roleItem}>
            <Text style={styles.roleEmoji}>🏠</Text>
            <Text style={styles.roleText}>Request for your shelter</Text>
          </View>
          <View style={styles.roleItem}>
            <Text style={styles.roleEmoji}>🚗</Text>
            <Text style={styles.roleText}>Drive deliveries in your area</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Get Started"
            onPress={() => router.push('/(auth)/register')}
            size="lg"
          />
          <Button
            label="Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            size="lg"
            style={styles.signIn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center', paddingTop: spacing.xxl },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: { fontSize: 48 },
  appName: {
    fontSize: 36,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 280,
  },
  roles: { gap: spacing.md },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
  },
  roleEmoji: { fontSize: 28 },
  roleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  actions: { gap: spacing.sm },
  signIn: { marginTop: spacing.xs },
});
