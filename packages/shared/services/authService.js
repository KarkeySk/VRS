import { supabase } from '../lib/supabase'

const noopSubscription = { unsubscribe: () => {} }

function requireSupabase() {
    if (!supabase) throw new Error('Supabase is not configured')
    return supabase
}

function normalizeAuthListener(result) {
    const subscription = result?.data?.subscription
        || result?.data?.listener?.subscription
        || noopSubscription

    return {
        ...result,
        data: {
            ...(result?.data || {}),
            subscription,
            listener: { subscription },
        },
    }
}

function firstVerifiedTotp(factors) {
    return (factors?.totp || []).find((factor) => factor.status === 'verified') || null
}

export const authService = {
    /** Sign up a new user */
    signUp: async (email, password, metadata = {}) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: { data: metadata },
        })
        if (error) throw error
        return data
    },

    /** Sign in existing user */
    signIn: async (email, password) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    },

    /** Send a password reset email */
    requestPasswordReset: async (email, redirectTo) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo,
        })
        if (error) throw error
        return data
    },

    /** Verify a recovery OTP from a Supabase reset email */
    verifyPasswordRecoveryOtp: async (email, token) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.verifyOtp({
            email,
            token,
            type: 'recovery',
        })
        if (error) throw error
        return data
    },

    /** Exchange an auth code from a reset email link for a session */
    exchangeCodeForSession: async (code) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.exchangeCodeForSession(code)
        if (error) throw error
        return data.session
    },

    /** Set a session from recovery hash params */
    setSession: async (accessToken, refreshToken) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        })
        if (error) throw error
        return data.session
    },

    /** Sign out current user */
    signOut: async (scope = 'global') => {
        if (!supabase) return
        const { error } = await supabase.auth.signOut({ scope })
        if (error) throw error
    },

    /** Update current user password */
    updatePassword: async (newPassword) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.updateUser({ password: newPassword })
        if (error) throw error
        return data.user
    },

    /** Get current session */
    getSession: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return data.session
    },

    /** Refresh current session */
    refreshSession: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.refreshSession()
        if (error) throw error
        return data.session
    },

    /** Get current user */
    getUser: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        return data.user
    },

    /** Validate session and user with Supabase Auth before trusting access */
    getValidatedSession: async () => {
        if (!supabase) return null

        let session = await authService.getSession()
        if (!session) return null

        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
        const shouldRefresh = expiresAt && expiresAt - Date.now() < 60_000
        if (shouldRefresh) {
            session = await authService.refreshSession()
        }

        const user = await authService.getUser()
        if (!user) return null

        return {
            ...session,
            user,
        }
    },

    /** Get a validated access token for API calls */
    getAccessToken: async () => {
        const session = await authService.getValidatedSession()
        return session?.access_token || null
    },

    /** Listen to auth state changes */
    onAuthStateChange: (callback) => {
        if (!supabase) return normalizeAuthListener({ data: { subscription: noopSubscription } })
        return normalizeAuthListener(supabase.auth.onAuthStateChange(callback))
    },

    /** List MFA factors for the current user */
    listMfaFactors: async () => {
        const client = requireSupabase()
        const { data, error } = await client.auth.mfa.listFactors()
        if (error) throw error
        return data
    },

    /** Get the active session's authenticator assurance level */
    getAuthenticatorAssuranceLevel: async () => {
        const client = requireSupabase()
        const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
        if (error) throw error
        return data
    },

    /** Whether the current user has a verified TOTP factor */
    getMfaStatus: async () => {
        const [factors, assurance] = await Promise.all([
            authService.listMfaFactors(),
            authService.getAuthenticatorAssuranceLevel(),
        ])
        const verifiedTotp = (factors?.totp || []).filter((factor) => factor.status === 'verified')

        return {
            factors,
            assurance,
            enabled: verifiedTotp.length > 0,
            verifiedTotp,
        }
    },

    /** Create an unverified TOTP factor for opt-in 2FA */
    enrollMfaFactor: async (friendlyName = 'Bhatbhate Authenticator') => {
        const client = requireSupabase()
        const { data, error } = await client.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName,
            issuer: 'Bhatbhate',
        })
        if (error) throw error
        return data
    },

    /** Challenge and verify a TOTP code */
    verifyMfaCode: async (factorId, code) => {
        const client = requireSupabase()
        const challenge = await client.auth.mfa.challenge({ factorId })
        if (challenge.error) throw challenge.error

        const { data, error } = await client.auth.mfa.verify({
            factorId,
            challengeId: challenge.data.id,
            code,
        })
        if (error) throw error
        return data
    },

    /** Verify the first available TOTP factor for login challenge */
    verifyDefaultMfaCode: async (code) => {
        const factors = await authService.listMfaFactors()
        const factor = firstVerifiedTotp(factors)
        if (!factor) throw new Error('No verified authenticator factor found.')
        return authService.verifyMfaCode(factor.id, code)
    },

    /** Remove a TOTP factor */
    unenrollMfaFactor: async (factorId) => {
        const client = requireSupabase()
        const { data, error } = await client.auth.mfa.unenroll({ factorId })
        if (error) throw error
        return data
    },

    /** Check if a user has admin role */
    isAdmin: async (userId) => {
        if (!supabase) return false
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
        if (error) return false
        return data?.role === 'admin'
    },
}
