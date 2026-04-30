import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Navbar from './components/layout/Navbar'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import Dashboard from './pages/user/Dashboard'
import TerrainSelect from './pages/user/TerrainSelect'
import VehiclesPage from './pages/user/VehiclesPage'
import VehicleDetail from './pages/user/VehicleDetail'
import InquiryPage from './pages/user/InquiryPage'
import BookingApply from './pages/user/BookingApply'
import BookingConfirm from './pages/user/BookingConfirm'
import BookingsPage from './pages/user/BookingsPage'
import ProfilePage from './pages/user/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <Navbar />
                    <AnimatedRoutes />
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    )
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
        }, 560)

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

            <div className={stage === 'exit' ? 'page-exit' : 'page-enter page-rotate'} key={`${displayKey}-${stage}`}>
                <Routes location={displayLocation}>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/terrain" element={<TerrainSelect />} />
                        <Route path="/vehicles" element={<VehiclesPage />} />
                        <Route path="/vehicles/:id" element={<VehicleDetail />} />
                        <Route path="/inquiry/:id" element={<InquiryPage />} />
                        <Route path="/apply/:inquiryId" element={<BookingApply />} />
                        <Route path="/booking/confirm/:applicationId" element={<BookingConfirm />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </>
    )
}

export default App
