import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/common/Toast'
import ScrollToTop from './components/common/ScrollToTop'
import Navbar from './components/layout/Navbar'
import ChatBot from './features/chatbot/ChatBot.jsx'
import CookiesConsent from './components/common/CookiesConsent'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage'
import Dashboard from './pages/user/Dashboard'
import TerrainSelect from './pages/user/TerrainSelect'
import VehiclesPage from './pages/user/VehiclesPage'
import VehicleRecommendation from './pages/user/VehicleRecommendation'
import VehicleDetail from './pages/user/VehicleDetail'
import InquiryPage from './pages/user/InquiryPage'
import BookingApply from './pages/user/BookingApply'
import BookingConfirm from './pages/user/BookingConfirm'
import PaymentPage from './pages/user/PaymentPage'
import PaymentSuccess from './pages/user/PaymentSuccess'
import BookingsPage from './pages/user/BookingsPage'
import ProfilePage from './pages/user/ProfilePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import HelpCenterPage from './pages/HelpCenterPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <a href="#main-content" className="skip-to-content">Skip to main content</a>
                        <ScrollToTop />
                        <Navbar />
                        <AnimatedRoutes />
                        <ChatBotGate />
                        <CookiesConsent />
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

function ChatBotGate() {
    const { user } = useAuth()
    if (!user) return null
    return <ChatBot />
}

function AnimatedRoutes() {
    const location = useLocation()
    const navigationType = useNavigationType()
    const [displayLocation, setDisplayLocation] = useState(location)
    const [stage, setStage] = useState('enter')
    const [exitDirection, setExitDirection] = useState('ltr')

    const locationKey = useMemo(
        () => `${location.pathname}${location.search}${location.hash}`,
        [location.pathname, location.search, location.hash]
    )
    const displayKey = useMemo(
        () => `${displayLocation.pathname}${displayLocation.search}${displayLocation.hash}`,
        [displayLocation.pathname, displayLocation.search, displayLocation.hash]
    )

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (locationKey === displayKey) return undefined

        if (reduceMotion) {
            setDisplayLocation(location)
            setStage('enter')
            return undefined
        }

        setExitDirection(navigationType === 'POP' ? 'rtl' : 'ltr')
        setStage('exit')
        const timer = window.setTimeout(() => {
            setDisplayLocation(location)
            setStage('enter')
        }, 960)

        return () => window.clearTimeout(timer)
    }, [displayKey, location, locationKey, navigationType])

    return (
        <>
            {stage === 'exit' && (
                <div className={`transition-bike-overlay ${exitDirection}`} aria-hidden="true">
                    <div className="transition-bike-shape">
                        <span className="transition-bike-wheel transition-bike-wheel-back"></span>
                        <span className="transition-bike-wheel transition-bike-wheel-front"></span>
                        <span className="transition-bike-fairing"></span>
                        <span className="transition-bike-tank"></span>
                        <span className="transition-bike-body"></span>
                        <span className="transition-bike-seat"></span>
                        <span className="transition-bike-tail"></span>
                        <span className="transition-bike-handle"></span>
                        <span className="transition-bike-fork"></span>
                        <span className="transition-bike-headlight-glow"></span>
                        <span className="transition-bike-rider-head"></span>
                        <span className="transition-bike-rider-back"></span>
                    </div>
                </div>
            )}

            <main id="main-content" className={stage === 'exit' ? 'page-exit' : 'page-enter page-rotate'} key={`${displayKey}-${stage}`}>
                <Routes location={displayLocation}>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/register" element={<RegisterPage />} />
                    <Route path="/auth/verify" element={<VerifyEmailPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
                    <Route path="/auth/callback" element={<OAuthCallbackPage />} />

                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                    <Route path="/help" element={<HelpCenterPage />} />

                    <Route path="/__terrain_preview" element={<TerrainSelect />} />
                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/terrain" element={<TerrainSelect />} />
                        <Route path="/recommend" element={<VehicleRecommendation />} />
                        <Route path="/vehicles" element={<VehiclesPage />} />
                        <Route path="/vehicles/:id" element={<VehicleDetail />} />
                        <Route path="/inquiry/:id" element={<InquiryPage />} />
                        <Route path="/apply/:inquiryId" element={<BookingApply />} />
                        <Route path="/booking/confirm/:applicationId" element={<BookingConfirm />} />
                        <Route path="/payment/:applicationId" element={<PaymentPage />} />
                        <Route path="/payment/success/:applicationId" element={<PaymentSuccess />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </>
    )
}

export default App
