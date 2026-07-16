import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, radius } from '../../constants/theme';
import type { DonationStatus, RequestStatus, DeliveryStatus } from '../../types/api';

type Status = DonationStatus | RequestStatus | DeliveryStatus;

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  OPEN:      { label: 'Open',       bg: colors.statusOpenBg,       text: colors.statusOpen },
  MATCHED:   { label: 'Matched',    bg: colors.statusMatchedBg,    text: colors.statusMatched },
  CREATED:   { label: 'Available',  bg: colors.statusOpenBg,       text: colors.statusOpen },
  CLAIMED:   { label: 'Claimed',    bg: colors.statusMatchedBg,    text: colors.statusMatched },
  PICKED_UP: { label: 'En Route',   bg: colors.accentLight,        text: colors.accent },
  DELIVERED: { label: 'Delivered',  bg: colors.statusDeliveredBg,  text: colors.statusDelivered },
  CANCELLED: { label: 'Cancelled',  bg: colors.statusCancelledBg,  text: colors.statusCancelled },
};

interface BadgeProps {
  status: Status;
}

export function StatusBadge({ status }: BadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status, bg: colors.surfaceAlt, text: colors.textSecondary,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

interface PillProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Pill({ label, color = colors.primary, bg = colors.primaryLight }: PillProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
});
