import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { donationService } from '../../services/donationService';
import { FOOD_CATEGORIES } from '../../constants/config';
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme';

export default function NewDonation() {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [servingCount, setServingCount] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupStart, setPickupStart] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: donationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donations', 'mine'] });
      Alert.alert('Posted! 🎉', 'Your donation is now live. We\'ll match it with a shelter shortly.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Failed to post', err?.response?.data?.message ?? 'Please try again.');
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!category) e.category = 'Select a category';
    if (!quantity.trim()) e.quantity = 'Quantity is required';
    if (!pickupAddress.trim()) e.pickupAddress = 'Pickup address is required';
    if (!servingCount || isNaN(Number(servingCount))) e.servingCount = 'Enter a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    mutate({
      title, description, category, quantity,
      pickupAddress,
      pickupLat: 0,
      pickupLng: 0,
      servingCount: Number(servingCount),
      pickupStart: pickupStart || undefined,
      pickupEnd: pickupEnd || undefined,
      dietaryNotes: dietaryNotes || undefined,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Post a Donation</Text>
        <Text style={styles.sub}>Fill in the details and we'll match it with a shelter in need.</Text>

        <Input label="Title" value={title} onChangeText={setTitle}
          placeholder="e.g. Fresh vegetables from our farm" error={errors.title} leftIcon="text-outline" autoCapitalize="sentences" />

        <Input label="Description (optional)" value={description} onChangeText={setDescription}
          placeholder="Tell shelters more about this donation" multiline numberOfLines={3}
          style={styles.multiline} leftIcon="document-text-outline" autoCapitalize="sentences" />

        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categories}>
          {FOOD_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catLabel, category === cat && styles.catLabelActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.fieldError}>{errors.category}</Text>}

        <Input label="Quantity" value={quantity} onChangeText={setQuantity}
          placeholder="e.g. 10 kg, 50 portions" error={errors.quantity} leftIcon="scale-outline" />

        <Input label="Estimated Servings" value={servingCount} onChangeText={setServingCount}
          placeholder="e.g. 20" keyboardType="numeric" error={errors.servingCount} leftIcon="people-outline" />

        <Input label="Pickup Address" value={pickupAddress} onChangeText={setPickupAddress}
          placeholder="123 Main St, City, State" error={errors.pickupAddress} leftIcon="location-outline" autoCapitalize="words" />

        <View style={styles.row}>
          <View style={styles.half}>
            <Input label="Pickup From" value={pickupStart} onChangeText={setPickupStart}
              placeholder="09:00" leftIcon="time-outline" />
          </View>
          <View style={styles.half}>
            <Input label="Pickup Until" value={pickupEnd} onChangeText={setPickupEnd}
              placeholder="17:00" leftIcon="time-outline" />
          </View>
        </View>

        <Input label="Dietary Notes (optional)" value={dietaryNotes} onChangeText={setDietaryNotes}
          placeholder="e.g. Vegan, Gluten-free, Contains nuts" leftIcon="information-circle-outline" autoCapitalize="sentences" />

        <Button label="Post Donation" onPress={handleSubmit} loading={isPending} size="lg" style={styles.submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.text, marginBottom: spacing.xs },
  sub: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  catChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  catChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  catLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  catLabelActive: { color: colors.primary },
  fieldError: { fontSize: fontSize.xs, color: colors.error, marginTop: -spacing.sm, marginBottom: spacing.sm },
  multiline: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  submit: { marginTop: spacing.sm },
});
