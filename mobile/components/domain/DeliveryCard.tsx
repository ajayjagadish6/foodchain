import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { StatusBadge, Pill } from '../ui/Badge';
import { Button } from '../ui/Button';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';
import type { DeliverySummary } from '../../types/api';

interface Props {
  delivery: DeliverySummary;
  onPress?: () => void;
  onAccept?: () => void;
  showAccept?: boolean;
}

function openMaps(address: string) {
  const query = encodeURIComponent(address);
  Linking.openURL(`https://maps.google.com/?q=${query}`);
}

export function DeliveryCard({ delivery, onPress, onAccept, showAccept = false }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{delivery.donationTitle}</Text>
          <StatusBadge status={delivery.status} />
        </View>

        <View style={styles.pills}>
          <Pill label={delivery.category} />
          <Pill
            label={`${delivery.servingCount} servings`}
            color={colors.accent}
            bg={colors.accentLight}
          />
        </View>

        <View style={styles.route}>
          <View style={styles.routeItem}>
            <View style={[styles.dot, styles.dotPickup]} />
            <View style={styles.routeText}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <TouchableOpacity onPress={() => openMaps(delivery.pickupAddress)}>
                <Text style={styles.routeAddr} numberOfLines={2}>
                  {delivery.pickupAddress}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <View style={[styles.dot, styles.dotDropoff]} />
            <View style={styles.routeText}>
              <Text style={styles.routeLabel}>DROPOFF</Text>
              <TouchableOpacity onPress={() => openMaps(delivery.dropoffAddress)}>
                <Text style={styles.routeAddr} numberOfLines={2}>
                  {delivery.dropoffAddress}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showAccept && onAccept && (
          <Button
            label="Accept Delivery"
            onPress={onAccept}
            variant="primary"
            size="sm"
            style={styles.acceptBtn}
          />
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  route: { gap: 2 },
  routeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 7,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  dotPickup: { backgroundColor: colors.primary },
  dotDropoff: { backgroundColor: colors.accent },
  routeText: { flex: 1 },
  routeLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  routeAddr: {
    fontSize: fontSize.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
  acceptBtn: { marginTop: spacing.md },
});
