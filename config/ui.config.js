export const UI_CONFIG = {
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@bhatbhate.com',
  OPERATING_HOURS: import.meta.env.VITE_OPERATING_HOURS || '7 AM – 8 PM daily',

  CHATBOT: {
    GREETING: "Hello! 👋 I'm your Bhatbhate assistant. Enter your **From** and **To** location below to get a vehicle recommendation for your route — or ask me anything about bookings, pricing, or Nepal travel!",
    RESET_GREETING: "Hello! 👋 I'm your Bhatbhate assistant. Ask me anything — about vehicles, bookings, pricing, or just say hi!",
    DEFAULT_MESSAGE: "Try asking about a vehicle type, a Nepal destination (Pokhara, Chitwan, Mustang, Jomsom) or say hello!",
    SEARCH_PLACEHOLDER: "Search any place in Nepal...",
    OUT_OF_SCOPE_MESSAGE: "I'm Bhatbhate AI, specialized in vehicle rentals and Nepal tourism. I'm not able to help with that topic, but I'm happy to assist with bookings, vehicle recommendations, Nepal destinations, or travel planning!",
    PRICING_MESSAGE: "💰 Our pricing depends on the vehicle type and rental duration:\n\n• Scooters: Starting from NPR 800/day\n• Motorcycles: Starting from NPR 1,500/day\n• Cars/Sedans: Starting from NPR 3,500/day\n• SUVs/Jeeps: Starting from NPR 5,000/day\n• Vans: Starting from NPR 6,500/day\n\nMulti-day and long-term rentals often have discounts. For exact pricing, visit our Vehicles page or contact support@bhatbhate.com",
    CANCELLATION_MESSAGE: "🔄 Cancellation Policy:\n\n• Free cancellation up to 24 hours before pickup\n• 50% refund for cancellation within 24 hours\n• No refund for no-shows\n\nFor exceptions or special circumstances, please contact support@bhatbhate.com",
  },

  ICONS: {
    MESSAGE_CIRCLE_SIZE: 24,
    CLOSE_SIZE: 20,
    DEFAULT_ICON_SIZE: 18,
  },

  SOCIAL_MEDIA: {
    FACEBOOK_URL: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com',
    INSTAGRAM_URL: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com',
    LINKEDIN_URL: import.meta.env.VITE_LINKEDIN_URL || 'https://www.linkedin.com',
  },

  AUTH: {
    EMAIL_VERIFICATION_REDIRECT: '/auth/verify',
    OAUTH_REDIRECT: '/auth/callback',
    PASSWORD_RESET_REDIRECT: '/auth/update-password',
  },
};
