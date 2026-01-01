import { Chip } from '@mui/material'

export function StatusChip({ status }: { status: string }) {
  const color =
    status === 'DELIVERED' ? 'success' :
    status === 'PICKED_UP' ? 'info' :
    status === 'CLAIMED' ? 'warning' :
    status === 'CREATED' ? 'default' :
    'default'

  return <Chip label={status} color={color as any} size="small" />
}
