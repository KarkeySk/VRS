import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import Navbar from '../components/layout/Navbar'

// Pages — fill these in as you build them
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VehiclesPage from '../pages/vehicles/VehiclesPage'
import VehicleDetail from '../pages/vehicles/VehicleDetail'
import BookingsPage from '../pages/bookings/BookingsPage'
import ProfilePage from '../pages/user/ProfilePage'
import NotFoundPage from '../pages/NotFoundPage'

function Layout() {
    const location = useLocation();
    const hideNavbar = location.pathname.startsWith('/auth');
    return (
        <>
            {!hideNavbar && <Navbar />}
            <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/register" element={<RegisterPage />} />
                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/vehicles" element={<VehiclesPage />} />
                        <Route path="/vehicles/:id" element={<VehicleDetail />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
        </>
    );
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Layout />
            </AuthProvider>
        </BrowserRouter>
    )
}
