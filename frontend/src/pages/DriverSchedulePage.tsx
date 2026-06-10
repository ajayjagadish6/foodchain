import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader,
  Checkbox, FormControlLabel, Stack, TextField, Typography
} from '@mui/material'
import { api } from '../lib/api'

const DAYS = [
  { code: 'MON', label: 'Monday' },
  { code: 'TUE', label: 'Tuesday' },
  { code: 'WED', label: 'Wednesday' },
  { code: 'THU', label: 'Thursday' },
  { code: 'FRI', label: 'Friday' },
  { code: 'SAT', label: 'Saturday' },
  { code: 'SUN', label: 'Sunday' },
]

type ScheduleEntry = {
  day: string
  startTime: string   // "HH:MM:SS" from backend — we display "HH:MM"
  endTime: string
}

type DayState = {
  enabled: boolean
  startTime: string  // "HH:MM"
  endTime: string
}

const DEFAULT_DAY: DayState = { enabled: false, startTime: '08:00', endTime: '18:00' }

function toHHMM(t: string): string {
  // Backend returns "HH:MM:SS", UI needs "HH:MM"
  return t ? t.substring(0, 5) : '08:00'
}

export function DriverSchedulePage() {
  const [schedule, setSchedule] = useState<Record<string, DayState>>(
    Object.fromEntries(DAYS.map(d => [d.code, { ...DEFAULT_DAY }]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    api<ScheduleEntry[]>('/api/drivers/me/schedule')
      .then(entries => {
        setSchedule(prev => {
          const next = { ...prev }
          entries.forEach(e => {
            next[e.day] = {
              enabled: true,
              startTime: toHHMM(e.startTime),
              endTime: toHHMM(e.endTime),
            }
          })
          return next
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function updateDay(code: string, patch: Partial<DayState>) {
    setSchedule(prev => ({ ...prev, [code]: { ...prev[code], ...patch } }))
  }

  async function onSave() {
    setSaving(true)
    setMsg(null)
    try {
      const payload = DAYS
        .filter(d => schedule[d.code].enabled)
        .map(d => ({
          day: d.code,
          startTime: schedule[d.code].startTime + ':00',
          endTime: schedule[d.code].endTime + ':00',
        }))
      await api('/api/drivers/me/schedule', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      setMsg({ type: 'success', text: 'Schedule saved.' })
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Typography sx={{ opacity: 0.7 }}>Loading schedule…</Typography>
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>My Availability Schedule</Typography>
      <Typography variant="body2" sx={{ opacity: 0.75 }}>
        Check the days you're available and set your time window for each day.
        Leave a day unchecked to mark yourself unavailable. If no days are set,
        the system treats you as always available.
      </Typography>

      {msg && <Alert severity={msg.type} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <Card>
        <CardHeader title="Weekly availability" />
        <CardContent>
          <Stack spacing={2}>
            {DAYS.map(({ code, label }) => {
              const day = schedule[code]
              return (
                <Box
                  key={code}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: day.enabled ? 'primary.main' : 'divider',
                    bgcolor: day.enabled ? 'action.selected' : 'transparent',
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ sm: 'center' }}
                  >
                    <FormControlLabel
                      sx={{ minWidth: 130 }}
                      control={
                        <Checkbox
                          checked={day.enabled}
                          onChange={e => updateDay(code, { enabled: e.target.checked })}
                        />
                      }
                      label={<Typography sx={{ fontWeight: day.enabled ? 700 : 400 }}>{label}</Typography>}
                    />

                    {day.enabled && (
                      <Stack direction="row" spacing={1.5} alignItems="center" flexGrow={1}>
                        <TextField
                          label="From"
                          type="time"
                          size="small"
                          value={day.startTime}
                          onChange={e => updateDay(code, { startTime: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 140 }}
                        />
                        <Typography variant="body2" sx={{ opacity: 0.6 }}>to</Typography>
                        <TextField
                          label="Until"
                          type="time"
                          size="small"
                          value={day.endTime}
                          onChange={e => updateDay(code, { endTime: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 140 }}
                        />
                      </Stack>
                    )}

                    {!day.enabled && (
                      <Typography variant="body2" sx={{ opacity: 0.5 }}>Unavailable</Typography>
                    )}
                  </Stack>
                </Box>
              )
            })}

            <Button variant="contained" size="large" onClick={onSave} disabled={saving} sx={{ mt: 1 }}>
              {saving ? 'Saving…' : 'Save schedule'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
