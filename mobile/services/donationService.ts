import api from './api';
import type { CreateDonationRequest, DonationView } from '../types/api';

export const donationService = {
  create: (data: CreateDonationRequest) =>
    api.post<DonationView>('/api/donations', data).then((r) => r.data),

  getMine: () =>
    api.get<DonationView[]>('/api/donations/mine').then((r) => r.data),
};
