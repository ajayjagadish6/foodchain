export const API_BASE_URL = 'https://food-chain.me';
export const TOKEN_STORAGE_KEY = 'foodchain_jwt';

export const FOOD_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains & Bread',
  'Dairy',
  'Protein',
  'Prepared Meals',
  'Canned Goods',
  'Beverages',
  'Snacks',
  'Other',
];

export const DAYS_OF_WEEK = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
  { key: 'SUN', label: 'Sunday' },
] as const;
