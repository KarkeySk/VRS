const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[+\d][\d\s().-]{6,}$/

export const getRequiredError = (value, message) => (
    String(value ?? '').trim() ? '' : message
)

export const getEmailError = (email) => {
    const value = String(email ?? '').trim()
    if (!value) return 'Email is required.'
    if (!emailPattern.test(value)) return 'Enter a valid email address.'
    return ''
}

export const getPasswordError = (password) => {
    const value = String(password ?? '')
    if (!value) return 'Password is required.'
    if (value.length < 8) return 'Password must be at least 8 characters.'
    return ''
}

export const getPhoneError = (phone, { required = true } = {}) => {
    const value = String(phone ?? '').trim()
    if (!value) return required ? 'Phone number is required.' : ''
    const digitCount = value.replace(/\D/g, '').length
    if (!phonePattern.test(value) || digitCount < 7) return 'Enter a valid phone number.'
    return ''
}

export const isEmailVerificationError = (error) => {
    const message = String(error?.message ?? error ?? '')
    return error?.code === 'email_not_confirmed' ||
        /email not confirmed|verify your email|verification is required|email verification/i.test(message)
}

export const getFriendlyAuthError = (error, fallback = 'Something went wrong. Please try again.') => {
    const message = String(error?.message ?? error ?? '').trim()
    const code = String(error?.code ?? '').trim()
    const combined = `${code} ${message}`.toLowerCase()

    if (isEmailVerificationError(error)) {
        return 'Email verification is required before you can sign in.'
    }
    if (/invalid login credentials|invalid credentials|email or password/i.test(combined)) {
        return 'Email or password is incorrect.'
    }
    if (/already registered|user already exists|already exists|already been registered/i.test(combined)) {
        return 'An account with this email already exists. Please sign in instead.'
    }
    if (/password.*(weak|short|least|characters)|weak password/i.test(combined)) {
        return 'Password must be at least 8 characters.'
    }
    if (/rate limit|too many|over_email_send_rate_limit/i.test(combined)) {
        return 'Too many attempts. Please wait a moment and try again.'
    }
    if (/network|failed to fetch|fetch failed|timeout|offline/i.test(combined)) {
        return 'We could not reach the auth server. Check your connection and try again.'
    }
    if (/invalid token|expired|otp|link is invalid|link.*expired/i.test(combined)) {
        return 'This link is invalid or has expired. Please request a new one.'
    }
    if (/unsupported provider|provider is not enabled/i.test(combined)) {
        return 'Google sign-in is not available right now. Please use email and password.'
    }
    if (/supabase is not configured|missing.*supabase/i.test(combined)) {
        return 'Authentication is temporarily unavailable. Please try again later.'
    }
    if (/session.*missing|no active session/i.test(combined)) {
        return 'Your reset session has expired. Please request a new reset link.'
    }
    if (/same password|different from the old password/i.test(combined)) {
        return 'Choose a new password that is different from your current password.'
    }

    return fallback
}
