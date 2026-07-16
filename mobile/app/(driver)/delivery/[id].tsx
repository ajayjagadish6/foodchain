import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Alert, TouchableOpacity, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { deliveryService } from '../../../services/deliveryService';
import { colors, spacing, fontSize, fontWeight } from '../../../constants/theme';

export default function DeliveryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const deliveryId = Number(id);

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', deliveryId],
    queryFn: () => deliveryService.getById(deliveryId),
    enabled: !!deliveryId,
    refetchInterval: 15_000,
  });

  const { mutate: markPickedUp, isPending: pickingUp } = useMutation({
    mutationFn: () => deliveryService.markPickedUp(deliveryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery', deliveryId] }),
    onError: () => Alert.alert('Error', 'Could not update status. Try again.'),
  });

  const { mutate: markDelivered, isPending: delivering } = useMutation({
    mutationFn: () => deliveryService.markDelivered(deliveryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      Alert.alert('Delivery complete! 🎉', 'Great job! The food has been delivered.', [
        { text: 'Back to Tasks', onPress: () => router.back() },
      ]);
    },
    onError: () => Alert.alert('Error', 'Could not update status. Try again.'),
  });

  if (isLoading || !delivery) return <LoadingSpinner fullScreen message="Loading delivery…" />;

  function callPhone(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  function openMaps(address: string) {
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back to Tasks</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.heading} numberOfLines={2}>{delivery.donationTitle}</Text>
          <StatusBadge status={delivery.status} />
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <TouchableOpacity style={styles.addressRow} onPress={() => openMaps(delivery.pickupAddress)}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.address}>{delivery.pickupAddress}</Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          {delivery.pickupStart && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.meta}>Window: {delivery.pickupStart} – {delivery.pickupEnd}</Text>
            </View>
          )}
          <ContactRow
            name={delivery.donorName}
            phone={delivery.donorPhone}
            label="Donor"
            onCall={callPhone}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Drop-off Location</Text>
          <TouchableOpacity style={styles.addressRow} onPress={() => openMaps(delivery.dropoffAddress)}>
            <Ionicons name="location" size={18} color={colors.accent} />
            <Text style={styles.address}>{delivery.dropoffAddress}</Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <ContactRow
            name={delivery.recipientName}
            phone={delivery.recipientPhone}
            label="Shelter"
            onCall={callPhone}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Food Details</Text>
          <View style={styles.metaRow}>
            <Ionicons name="scale-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.meta}>{delivery.quantity}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.meta}>{delivery.servingCount} servings</Text>
          </View>
          {delivery.dietaryNotes && (
            <View style={styles.metaRow}>
              <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.meta}>{delivery.dietaryNotes}</Text>
            </View>
          )}
        </Card>

        {delivery.status === 'CLAIMED' && (
          <Button
            label="Mark as Picked Up"
            onPress={() => markPickedUp()}
            loading={pickingUp}
            size="lg"
            style={styles.actionBtn}
          />
        )}

        {delivery.status === 'PICKED_UP' && (
          <Button
            label="Mark as Delivered ✓"
            onPress={() => Alert.alert('Confirm delivery', 'Has the food been delivered to the shelter?', [
              { text: 'Not yet', style: 'cancel' },
              { text: 'Yes, delivered!', onPress: () => markDelivered() },
            ])}
            loading={delivering}
            size="lg"
            variant="secondary"
            style={styles.actionBtn}
          />
        )}

        {delivery.status === 'DELIVERED' && (
          <View style={styles.complete}>
            <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
            <Text style={styles.completeText}>Delivery complete!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  name, phone, label, onCall,
}: {
  name: string; phone: string; label: string; onCall: (p: string) => void;
}) {
  return (
    <View style={contactStyles.row}>
      <View style={contactStyles.info}>
        <Text style={contactStyles.label}>{label}</Text>
        <Text style={contactStyles.name}>{name}</Text>
      </View>
      <TouchableOpacity style={contactStyles.callBtn} onPress={() => onCall(phone)}>
        <Ionicons name="call-outline" size={16} color={colors.primary} />
        <Text style={contactStyles.callText}>Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const contactStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  info: {},
  label: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  name: { fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.semibold },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  callText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  backText: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  heading: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  card: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  address: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.primary,
    textDecorationLine: 'underline',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  meta: { fontSize: fontSize.sm, color: colors.textSecondary },
  actionBtn: { marginTop: spacing.sm },
  complete: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  completeText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
