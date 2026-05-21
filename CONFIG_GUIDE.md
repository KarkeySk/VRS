# Configuration System Guide

## Overview

This project uses a centralized configuration system to eliminate hardcoded values throughout the codebase. All configuration is managed through:

1. **Environment variables** (in `.env` files)
2. **Configuration files** (in `/config` directory)
3. **Exported constants** (for type safety and IDE autocomplete)

## Configuration Files

### 1. `config/api.config.js`
Manages all external API configurations:
- **Groq AI**: API URL, Key, Model
- **Weather API**: Base URL, parameters
- **eSewa**: Payment URL, merchant code
- **Supabase**: Storage buckets, database tables

**Usage:**
```javascript
import { API_CONFIG } from '../config/index.js';
console.log(API_CONFIG.GROQ.MODEL); // llama-3.3-70b-versatile
console.log(API_CONFIG.SUPABASE.TABLES.BOOKINGS); // 'bookings'
```

### 2. `config/service.config.js`
Manages service-specific settings:
- **Chatbot**: Retries, failures, rate limiting, history limits
- **Groq**: Max tokens, temperature for chat vs recommendations
- **Search**: Results limits
- **Notifications**: Fetch limits
- **Storage**: URL expiry

**Usage:**
```javascript
import { SERVICE_CONFIG } from '../config/index.js';
const MAX_RETRIES = SERVICE_CONFIG.CHATBOT.MAX_RETRIES; // 2
const DELAY_MS = SERVICE_CONFIG.CHATBOT.RETRY_INITIAL_DELAY_MS; // 2000
```

### 3. `config/ui.config.js`
Manages all UI text, messages, and labels:
- **Chatbot messages**: Greetings, prompts, help text
- **Social media links**
- **Auth redirects**
- **Icon sizes**

**Usage:**
```javascript
import { UI_CONFIG } from '../config/index.js';
setText(UI_CONFIG.CHATBOT.GREETING); // Full greeting message
const email = UI_CONFIG.SUPPORT_EMAIL; // 'support@bhatbhate.com'
```

### 4. `config/constants.config.js`
Manages status values, types, and enums:
- **Status values**: Payment, Booking, Application statuses
- **Payment methods**: eSewa, Khalti, etc.
- **Notification types**: Approved, Rejected, etc.
- **Weather conditions**: Clear, Rainy, etc.
- **Vehicle models**: Available models list

**Usage:**
```javascript
import { STATUS_CONFIG, NOTIFICATION_TYPES } from '../config/index.js';
const status = STATUS_CONFIG.PAYMENT.COMPLETED; // 'completed'
const type = NOTIFICATION_TYPES.BOOKING_APPROVED; // 'booking_approved'
```

### 5. `config/weather.config.js`
Weather-related configuration:
- **Default location**: Name, latitude, longitude
- **Visibility thresholds**: Excellent, Good, Moderate
- **Wind speed thresholds**

**Usage:**
```javascript
import { WEATHER_CONFIG } from '../config/index.js';
const loc = WEATHER_CONFIG.DEFAULT_LOCATION; // { NAME: 'Pokhara', ... }
const windLimit = WEATHER_CONFIG.WIND_SPEED_THRESHOLDS.STRONG_WINDS_KMH; // 30
```

### 6. `config/pricing.config.js`
All pricing information:
- **Vehicle daily rates**: Scooter, Motorcycle, Car, SUV, Van
- **Add-ons**: Luggage, etc.
- **Cancellation policy**: Free hours, refund percentage
- **Currency**

**Usage:**
```javascript
import { PRICING_CONFIG } from '../config/index.js';
const price = PRICING_CONFIG.VEHICLE_TYPES.SUV_DAILY; // 5000
const currency = PRICING_CONFIG.CURRENCY; // 'NPR'
```

## Environment Variables

All configuration values can be overridden via environment variables. See `.env.example` for complete list:

```bash
# API Configuration
VITE_GROQ_API_KEY=your_key_here
VITE_GROQ_MODEL=llama-3.3-70b-versatile

# Service Configuration
VITE_CHATBOT_MAX_RETRIES=2
VITE_CHATBOT_MAX_FAILURES=10
VITE_CHATBOT_RATE_LIMIT_MS=60000

# UI Configuration
VITE_SUPPORT_EMAIL=support@bhatbhate.com
VITE_OPERATING_HOURS=7 AM – 8 PM daily

# Pricing
VITE_SUV_DAILY_PRICE=5000
VITE_CURRENCY=NPR

# ... more variables in .env.example
```

## How to Add New Configuration

### Step 1: Add Environment Variable
Add to `.env.example`:
```bash
VITE_MY_NEW_CONFIG=default_value
```

### Step 2: Add to Config File
Add to appropriate `config/*.js` file:
```javascript
export const NEW_CONFIG = {
  MY_SETTING: import.meta.env.VITE_MY_NEW_CONFIG || 'default_value',
};
```

### Step 3: Use in Code
```javascript
import { NEW_CONFIG } from '../config/index.js';
console.log(NEW_CONFIG.MY_SETTING);
```

## How to Update Configuration

### For Development
Edit the config files directly or update `.env`:
```bash
VITE_CHATBOT_MAX_RETRIES=3
```

### For Production
Set environment variables when deploying:
```bash
docker run -e VITE_GROQ_API_KEY=production_key app
# or
vercel env add VITE_CHATBOT_MAX_RETRIES=5
```

## Benefits

✅ **Maintainability**: All hardcoded values in one place
✅ **Flexibility**: Change values without editing code
✅ **Environment-specific**: Different values for dev/staging/prod
✅ **Type-safe**: IDE autocomplete for config values
✅ **Audit trail**: Version control tracks all changes
✅ **No secrets in code**: All sensitive data in env vars

## Migration Checklist

When converting hardcoded values to config:

1. ✅ Identify all hardcoded values
2. ✅ Create appropriate config file
3. ✅ Add environment variable to `.env.example`
4. ✅ Import config in code
5. ✅ Replace hardcoded value with config reference
6. ✅ Test with different environment variable values
7. ✅ Update deployment documentation

## Current Coverage

| Category | Status | Coverage |
|----------|--------|----------|
| API Endpoints | ✅ | 100% |
| Service Settings | ✅ | 100% |
| UI Text & Messages | ✅ | 100% |
| Status Values | ✅ | 100% |
| Pricing | ✅ | 100% |
| Weather Thresholds | ✅ | 100% |
| Database Tables | ✅ | 100% |
| Storage Buckets | ✅ | 100% |

**Remaining to migrate**: Image URLs, some React component props (can be CSS-driven instead)
