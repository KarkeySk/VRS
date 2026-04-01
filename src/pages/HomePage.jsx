import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/common/HeroSection'
import FleetSection from '../components/vehicle/FleetSection'
import RoutesSection from '../components/booking/RoutesSection'
import CTASection from '../components/common/CTASection'
import Footer from '../components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FleetSection />
        <RoutesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
