import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Switch, Alert, TouchableOpacity,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { deliveryService } from '../../services/deliveryService';
import { DAYS_OF_WEEK } from '../../constants/config';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';
import type { DayOfWeek, ScheduleEntry } from '../../types/api';

const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

type DayState = { enabled: boolean; startTime: string; endTime: string };
type Schedule = Record<DayOfWeek, DayState>;

function buildInitial(entries: ScheduleEntry[]): Schedule {
  const init = {} as Schedule;
  for (const { key } of DAYS_OF_WEEK) {
    const found = entries.find((e) => e.day === key);
    init[key] = found
      ? { enabled: true, startTime: found.startTime, endTime: found.endTime }
      : { enabled: false, startTime: DEFAULT_START, endTime: DEFAULT_END };
  }
  return init;
}

export default function DriverSchedule() {
  const qc = useQueryClient();
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: deliveryService.getSchedule,
  });

  useEffect(() => {
    if (data) setSchedule(buildInitial(data));
  }, [data]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: (entries: ScheduleEntry[]) => deliveryService.updateSchedule(entries),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
      Alert.alert('Saved!', 'Your driving schedule has been updated.');
    },
    onError: () => Alert.alert('Error', 'Could not save schedule. Try again.'),
  });

  function toggle(day: DayOfWeek, value: boolean) {
    setSchedule((s) => s ? { ...s, [day]: { ...s[day], enabled: value } } : s);
  }

  function handleSave() {
    if (!schedule) return;
    const entries: ScheduleEntry[] = DAYS_OF_WEEK
      .filter(({ key }) => schedule[key].enabled)
      .map(({ key }) => ({
        day: key,
        startTime: schedule[key].startTime,
        endTime: schedule[key].endTime,
      }));
    save(entries);
  }

  if (isLoading || !schedule) return <LoadingSpinner fullScreen message="Loading schedule…" />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>My Schedule</Text>
        <Text style={styles.sub}>Set the days you're available to make deliveries.</Text>

        {DAYS_OF_WEEK.map(({ key, label }) => {
          const day = schedule[key];
          return (
            <Card key={key} style={[styles.dayCard, day.enabled && styles.dayCardActive]}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayLabel, day.enabled && styles.dayLabelActive]}>
                  {label}
                </Text>
                <Switch
                  value={day.enabled}
                  onValueChange={(v) => toggle(key, v)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={day.enabled ? colors.primary : colors.textMuted}
                />
              </View>
              {day.enabled && (
                <View style={styles.times}>
                  <TouchableOpacity style={styles.timeChip}>
                    <Text style={styles.timeLabel}>FROM</Text>
                    <Text style={styles.timeValue}>{day.startTime}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSep}>→</Text>
                  <TouchableOpacity style={styles.timeChip}>
                    <Text style={styles.timeLabel}>TO</Text>
                    <Text style={styles.timeValue}>{day.endTime}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}

        <Button
          label="Save Schedule"
          onPress={handleSave}
          loading={isPending}
          size="lg"
          style={styles.save}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.text, marginBottom: spacing.xs },
  sub: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
  dayCard: { marginBottom: spacing.sm, borderWidth: 1.5, borderColor: 'transparent' },
  dayCardActive: { borderColor: colors.primary },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  dayLabelActive: { color: colors.text },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  timeChip: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
  },
  timeLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primary, letterSpacing: 0.8 },
  timeValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary, marginTop: 2 },
  timeSep: { fontSize: fontSize.lg, color: colors.textMuted },
  save: { marginTop: spacing.md },
});
