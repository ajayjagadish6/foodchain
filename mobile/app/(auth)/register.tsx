import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme';

type Role = 'DONOR' | 'RECIPIENT' | 'DRIVER';

const ROLES: { key: Role; emoji: string; title: string; desc: string }[] = [
  { key: 'DONOR',     emoji: '🥦', title: 'Food Donor',   desc: 'Donate surplus food' },
  { key: 'RECIPIENT', emoji: '🏠', title: 'Food Shelter', desc: 'Request food for your shelter' },
  { key: 'DRIVER',    emoji: '🚗', title: 'Driver',       desc: 'Pick up and deliver food' },
];

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!role) e.role = 'Select your role';
    if (!displayName.trim()) e.displayName = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!phone) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate() || !role) return;
    setLoading(true);
    try {
      const phoneE164 = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
      await authService.register({
        email, password, displayName, role,
        phoneNumber: phoneE164,
        orgName: orgName || undefined,
      });
      router.push({ pathname: '/(auth)/verify-phone', params: { email } });
    } catch (err: any) {
      Alert.alert('Registration failed', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.sub}>Join FoodChain and make a difference</Text>

        <Text style={styles.sectionLabel}>I am a…</Text>
        <View style={styles.roles}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleCard, role === r.key && styles.roleCardActive]}
              onPress={() => setRole(r.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.roleEmoji}>{r.emoji}</Text>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleTitle, role === r.key && styles.roleTitleActive]}>
                  {r.title}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </View>
              {role === r.key && (
                <View style={styles.check}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          {errors.role && <Text style={styles.fieldError}>{errors.role}</Text>}
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Jane Smith"
            leftIcon="person-outline"
            error={errors.displayName}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            leftIcon="mail-outline"
            error={errors.email}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            leftIcon="lock-closed-outline"
            isPassword
            error={errors.password}
          />
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            leftIcon="call-outline"
            error={errors.phone}
            hint="You'll receive a verification code via SMS"
          />
          {(role === 'DONOR' || role === 'RECIPIENT') && (
            <Input
              label="Organization Name (optional)"
              value={orgName}
              onChangeText={setOrgName}
              placeholder="e.g. City Food Bank"
              leftIcon="business-outline"
              autoCapitalize="words"
            />
          )}

          <Button
            label="Create Account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.submit}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  back: { marginBottom: spacing.xl },
  backText: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  heading: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roles: { gap: spacing.sm, marginBottom: spacing.lg },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleEmoji: { fontSize: 28, width: 36 },
  roleInfo: { flex: 1 },
  roleTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  roleTitleActive: { color: colors.primary },
  roleDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: colors.textOnPrimary, fontWeight: fontWeight.bold, fontSize: 13 },
  form: { gap: spacing.xs },
  submit: { marginTop: spacing.sm },
  fieldError: { fontSize: fontSize.xs, color: colors.error },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  footerText: { fontSize: fontSize.md, color: colors.textSecondary },
  footerLink: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.semibold },
});
