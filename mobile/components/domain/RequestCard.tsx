import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { StatusBadge, Pill } from '../ui/Badge';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';
import type { FoodRequestView } from '../../types/api';

interface Props {
  request: FoodRequestView;
  onPress?: () => void;
}

export function RequestCard({ request, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{request.title}</Text>
          <StatusBadge status={request.status} />
        </View>

        <View style={styles.pills}>
          <Pill label={request.category} />
          <Pill
            label={`${request.servingCount} servings`}
            color={colors.accent}
            bg={colors.accentLight}
          />
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.meta} numberOfLines={1}>{request.dropoffAddress}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="scale-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.meta}>{request.quantity}</Text>
        </View>

        {request.dietaryNotes && (
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.meta} numberOfLines={1}>{request.dietaryNotes}</Text>
          </View>
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
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
});
