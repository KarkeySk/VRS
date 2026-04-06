import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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
                <Navbar />
                <Routes>
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
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
