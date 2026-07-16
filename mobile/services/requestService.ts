import api from './api';
import type { CreateFoodRequest, FoodRequestView } from '../types/api';

export const requestService = {
  create: (data: CreateFoodRequest) =>
    api.post<FoodRequestView>('/api/requests', data).then((r) => r.data),

  getMine: () =>
    api.get<FoodRequestView[]>('/api/requests/mine').then((r) => r.data),
};
