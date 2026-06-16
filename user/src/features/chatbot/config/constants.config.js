export const STATUS_CONFIG = {
  PAYMENT: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  BOOKING: {
    SUBMITTED: 'submitted',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
    APPROVED: 'approved',
    UNDER_REVIEW: 'under-review',
  },
  APPLICATION: {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under-review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },
  PAYMENT_METHODS: {
    ESEWA: 'esewa',
    KHALTI: 'khalti',
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
  },
};

export const NOTIFICATION_TYPES = {
  BOOKING_APPROVED: 'booking_approved',
  BOOKING_REJECTED: 'booking_rejected',
  PAYMENT_FAILED: 'payment_failed',
};

export const WEATHER_CONDITIONS = {
  CLEAR: 0,
  PARTLY_CLOUDY: [1, 2],
  OVERCAST: 3,
  FOG: [45, 48],
  DRIZZLE: [51, 52, 53, 55, 56, 57],
  RAIN: [61, 63, 65, 80, 81, 82],
  SNOW: [71, 73, 75, 77, 85, 86],
  THUNDERSTORM: [95, 96, 99],
};

export const VEHICLE_MODELS = import.meta.env.VITE_VEHICLE_MODELS?.split(',') || [
  'Himalayan 450',
  'CRF 250L',
  'XPulse 200',
  'Duke 250',
  'FZ-S',
  'Scorpio',
  'Hilux',
  'Land Cruiser',
];
