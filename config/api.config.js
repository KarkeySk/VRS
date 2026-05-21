export const API_CONFIG = {
  GROQ: {
    API_URL: import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
    API_KEY: import.meta.env.VITE_GROQ_API_KEY,
    MODEL: import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  WEATHER: {
    BASE_URL: import.meta.env.VITE_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast',
    PARAMS: ['temperature_2m', 'weather_code', 'wind_speed_10m', 'wind_direction_10m', 'visibility'],
  },
  ESEWA: {
    TEST_PAYMENT_URL: import.meta.env.VITE_ESEWA_TEST_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    MERCHANT_CODE: import.meta.env.VITE_ESEWA_MERCHANT_CODE,
  },
  SUPABASE: {
    EMAIL_FUNCTION: 'send-booking-approval-email',
    STORAGE_BUCKETS: {
      VEHICLE_IMAGES: 'vehicle-images',
      AVATARS: 'avatars',
      DOCUMENTS: 'documents',
    },
    TABLES: {
      PROFILES: 'profiles',
      VEHICLES: 'vehicles',
      BOOKINGS: 'bookings',
      BOOKING_APPLICATIONS: 'booking_applications',
      INQUIRIES: 'inquiries',
      NOTIFICATIONS: 'notifications',
      EMAIL_LOGS: 'email_logs',
      UI_ASSETS: 'ui_assets',
    },
  },
};
