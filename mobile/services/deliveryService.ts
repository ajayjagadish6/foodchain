import api from './api';
import type { DeliverySummary, ScheduleEntry } from '../types/api';

export const deliveryService = {
  getAvailable: () =>
    api.get<DeliverySummary[]>('/api/deliveries/available').then((r) => r.data),

  getById: (id: number) =>
    api.get<DeliverySummary>(`/api/deliveries/${id}`).then((r) => r.data),

  accept: (id: number) =>
    api.post<DeliverySummary>(`/api/deliveries/${id}/accept`).then((r) => r.data),

  markPickedUp: (id: number) =>
    api.post<DeliverySummary>(`/api/deliveries/${id}/pickup`).then((r) => r.data),

  markDelivered: (id: number) =>
    api.post<DeliverySummary>(`/api/deliveries/${id}/deliver`).then((r) => r.data),

  updateLocation: (id: number, lat: number, lng: number) =>
    api.post(`/api/deliveries/${id}/location`, { lat, lng }),

  getSchedule: () =>
    api.get<ScheduleEntry[]>('/api/drivers/me/schedule').then((r) => r.data),

  updateSchedule: (entries: ScheduleEntry[]) =>
    api.put<ScheduleEntry[]>('/api/drivers/me/schedule', entries).then((r) => r.data),
};
