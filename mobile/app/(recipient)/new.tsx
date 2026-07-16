import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { requestService } from '../../services/requestService';
import { FOOD_CATEGORIES } from '../../constants/config';
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme';

export default function NewRequest() {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [servingCount, setServingCount] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: requestService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests', 'mine'] });
      Alert.alert('Request posted! 🎉', "We'll match your request with a nearby donor.", [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Failed', err?.response?.data?.message ?? 'Please try again.');
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!category) e.category = 'Select a category';
    if (!quantity.trim()) e.quantity = 'Quantity is required';
    if (!dropoffAddress.trim()) e.dropoffAddress = 'Drop-off address is required';
    if (!servingCount || isNaN(Number(servingCount))) e.servingCount = 'Enter a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    mutate({
      title, description, category, quantity,
      dropoffAddress,
      dropoffLat: 0,
      dropoffLng: 0,
      servingCount: Number(servingCount),
      dietaryNotes: dietaryNotes || undefined,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Food Request</Text>
        <Text style={styles.sub}>Tell donors what your shelter needs and we'll find a match.</Text>

        <Input label="Title" value={title} onChangeText={setTitle}
          placeholder="e.g. Vegetables for 30 people" error={errors.title} leftIcon="text-outline" autoCapitalize="sentences" />

        <Input label="Description (optional)" value={description} onChangeText={setDescription}
          placeholder="Any specific needs or preferences" multiline numberOfLines={3}
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

        <Input label="Quantity Needed" value={quantity} onChangeText={setQuantity}
          placeholder="e.g. 5 kg, 30 meals" error={errors.quantity} leftIcon="scale-outline" />

        <Input label="People to Feed" value={servingCount} onChangeText={setServingCount}
          placeholder="e.g. 30" keyboardType="numeric" error={errors.servingCount} leftIcon="people-outline" />

        <Input label="Drop-off Address" value={dropoffAddress} onChangeText={setDropoffAddress}
          placeholder="123 Shelter Ave, City, State" error={errors.dropoffAddress} leftIcon="location-outline" autoCapitalize="words" />

        <Input label="Dietary Restrictions (optional)" value={dietaryNotes} onChangeText={setDietaryNotes}
          placeholder="e.g. No pork, Halal required" leftIcon="information-circle-outline" autoCapitalize="sentences" />

        <Button label="Post Request" onPress={handleSubmit} loading={isPending} size="lg" style={styles.submit} />
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
  submit: { marginTop: spacing.sm },
});
