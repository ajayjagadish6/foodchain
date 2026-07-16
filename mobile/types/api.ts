// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
}
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role: 'DONOR' | 'RECIPIENT' | 'DRIVER';
  phoneNumber: string;
  orgName?: string;
  orgAddress?: string;
  orgLat?: number;
  orgLng?: number;
}
export interface VerifyPhoneRequest {
  email: string;
  code: string;
}
export interface ForgotPasswordRequest {
  email: string;
}
export interface GenericResponse {
  message: string;
}

// ── User ──────────────────────────────────────────────────────────────────────
export type UserRole = 'DONOR' | 'RECIPIENT' | 'DRIVER' | 'ADMIN';

export interface MeView {
  id: number;
  email: string;
  role: UserRole;
  displayName: string;
  phoneNumber: string;
  phoneVerified: boolean;
  orgName?: string;
  orgAddress?: string;
  orgLat?: number;
  orgLng?: number;
  orgLogoUrl?: string;
}

export interface UpdateMeRequest {
  displayName?: string;
  phoneNumber?: string;
  orgName?: string;
  orgAddress?: string;
  orgLat?: number;
  orgLng?: number;
}

// ── Donation ──────────────────────────────────────────────────────────────────
export type DonationStatus = 'OPEN' | 'MATCHED' | 'CANCELLED';

export interface CreateDonationRequest {
  title: string;
  description?: string;
  category: string;
  quantity: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  servingCount: number;
  pickupStart?: string;
  pickupEnd?: string;
  dietaryNotes?: string;
  photoUrl?: string;
}

export interface DonationView {
  id: number;
  title: string;
  description?: string;
  category: string;
  quantity: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  status: DonationStatus;
  servingCount: number;
  pickupStart?: string;
  pickupEnd?: string;
  dietaryNotes?: string;
  photoUrl?: string;
}

// ── Food Request ───────────────────────────────────────────────────────────────
export type RequestStatus = 'OPEN' | 'MATCHED' | 'CANCELLED';

export interface CreateFoodRequest {
  title: string;
  description?: string;
  category: string;
  quantity: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  servingCount: number;
  dietaryNotes?: string;
}

export interface FoodRequestView {
  id: number;
  title: string;
  description?: string;
  category: string;
  quantity: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  status: RequestStatus;
  servingCount: number;
  dietaryNotes?: string;
}

// ── Delivery ───────────────────────────────────────────────────────────────────
export type DeliveryStatus = 'CREATED' | 'CLAIMED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

export interface DeliverySummary {
  id: number;
  status: DeliveryStatus;
  donationId: number;
  requestId: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  donorName: string;
  donorPhone: string;
  recipientName: string;
  recipientPhone: string;
  driverName?: string;
  driverPhone?: string;
  donationTitle: string;
  category: string;
  quantity: string;
  servingCount: number;
  dietaryNotes?: string;
  pickupStart?: string;
  pickupEnd?: string;
}

// ── Schedule ──────────────────────────────────────────────────────────────────
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface ScheduleEntry {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface RegisterTokenRequest {
  token: string;
  platform: 'iOS' | 'Android';
}
