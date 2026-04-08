// ===== Centralized mock data for the entire fleet dashboard =====

export const upcomingBookings = [
  {
    id: "bk-001",
    vehicle: "Royal Enfield Him...",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVPOsvo3SKaoimjFkDOPWhTnSWqPYqJtRNZA&s",
    type: "SELF-DRIVE",
    customer: "Rajesh Hamal",
    dates: "Oct 12 - Oct 16",
    extras: "Off-road Pack · Extra Helmet",
    status: "ACTIVE",
    price: "NPR 45,000",
  },
  {
    id: "bk-002",
    vehicle: "Honda CRF 250L",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200&h=140&fit=crop",
    type: "WITH DRIVER",
    customer: "Sarah Jenkins",
    dates: "Oct 15 - Oct 20",
    extras: "Guide: Karma Sherpa · Full Insurance",
    status: "PARTIAL",
    price: "NPR 72,500",
  },
  {
    id: "bk-003",
    vehicle: "Ducati DesertX",
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=200&h=140&fit=crop",
    type: "SELF-DRIVE",
    customer: "Michael Zhang",
    dates: "Oct 18 - Oct 25",
    extras: "Premium Luggage · GPS Nav",
    status: "OVERDUE",
    price: "NPR 110,000",
  },
];

export const pastBookings = [
  {
    id: "bk-past-001",
    vehicle: "KTM Adventure 390",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=200&h=140&fit=crop",
    type: "SELF-DRIVE",
    customer: "Priya Sharma",
    dates: "Sep 28 - Oct 3",
    extras: "Basic Insurance",
    status: "COMPLETED",
    price: "NPR 38,000",
  },
  {
    id: "bk-past-002",
    vehicle: "Royal Enfield Classic",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVPOsvo3SKaoimjFkDOPWhTnSWqPYqJtRNZA&s",
    type: "WITH DRIVER",
    customer: "Tom Berger",
    dates: "Oct 1 - Oct 5",
    extras: "Guide: Raj Thapa · Camping Gear",
    status: "COMPLETED",
    price: "NPR 62,000",
  },
  {
    id: "bk-past-003",
    vehicle: "Yamaha Tenere 700",
    image: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=200&h=140&fit=crop",
    type: "SELF-DRIVE",
    customer: "Anil Gurung",
    dates: "Sep 10 - Sep 18",
    extras: "Full Insurance · GPS Nav",
    status: "COMPLETED",
    price: "NPR 85,000",
  },
];

export const fleetVehicles = [
  { id: "fv-1", name: "Land Rover Defender 110", subtitle: "Luxury Expedition Series", plate: "BA-2-CHA-4482", status: "Available", bluebookExpiry: "Oct 24, 2024", bluebookStatus: "VALID" },
  { id: "fv-2", name: "Toyota Hilux GR", subtitle: "Cargo & Support", plate: "BA-1-KHA-9921", status: "Maintenance", bluebookExpiry: "Nov 12, 2024", bluebookStatus: "EXPIRES SOON" },
  { id: "fv-3", name: "Toyota Land Cruiser", subtitle: "VIP Sherpa Transport", plate: "BA-3-YA-1256", status: "On Expedition", bluebookExpiry: "Jan 05, 2025", bluebookStatus: "VALID" },
  { id: "fv-4", name: "Mercedes Sprinter 4x4", subtitle: "Crew Shuttle", plate: "BA-2-KHA-6843", status: "Compliance Alert", bluebookExpiry: "Aug 20, 2024", bluebookStatus: "EXPIRED" },
];

export const telemetryVehicles = [
  { id: "tv-1", name: "KTM-ADV-790", code: "#082", route: "Manang to Thorong La", altitude: "3,540m", engineTemp: "88°C", battery: 75, batteryColor: "bg-status-green" },
  { id: "tv-2", name: "RE-HIM-450", code: "#124", route: "Jomsom Valley", altitude: "3,710m", engineTemp: "72°C", battery: 50, batteryColor: "bg-status-yellow" },
  { id: "tv-3", name: "KTM-EXC-300", code: "#061", route: "Mustang Circuit", altitude: "2,890m", engineTemp: "65°C", battery: 90, batteryColor: "bg-status-green" },
];

export const serviceAlerts = [
  { id: "sa-1", title: "Low Oil Pressure", description: "RE-HIM-450 #109 · Kagbeni Region", severity: "URGENT" },
  { id: "sa-2", title: "Scheduled Overhaul", description: "KTM-ADV-790 #082 · Pokhara Hub", severity: "2 DAYS" },
  { id: "sa-3", title: "Tire Pressure Drop", description: "RE-HIM-450 #124 · Low Pressure Alert", severity: "INFO" },
];

export const consumerLogs = [
  { id: "cl-1", rentalId: "#RT-96122", name: "Anjali Pradhan", initials: "AP", initialsColor: "bg-[#6366f1]", vehicle: "Royal Enfield-450 (G)", kycStatus: "VERIFIED", encrypted: true },
  { id: "cl-2", rentalId: "#RT-98881", name: "Siddharth Mukherji", initials: "SM", initialsColor: "bg-brand-orange", vehicle: "Scram 411-Himalayan", kycStatus: "PENDING REVIEW", encrypted: true },
  { id: "cl-3", rentalId: "#RT-90765", name: "Ramesh Thapa", initials: "RT", initialsColor: "bg-txt-muted", vehicle: "Classic 350-Stealth", kycStatus: "REJECTED", encrypted: false },
];
