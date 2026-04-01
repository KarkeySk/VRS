export const vehicles = [
  {
    id: "scorpio-s11",
    name: "Mahindra Scorpio S11",
    subtitle: "The ultimate mountain beast, engineered for the Annapurna Circuit and beyond.",
    image: "https://stimg.cardekho.com/images/carexteriorimages/630x420/Mahindra/Scorpio/10764/1755775497601/front-left-side-47.jpg",
    engine: "2.2L mHawk",
    torque: "320 Nm",
    drive: "4WD High/Low",
    capacity: "7 Seats",
    price: 120,
    rating: 4.5,
    category: "All Terrain",
    capabilities: [
      {
        title: "High Ground Clearance",
        desc: "209mm clearance designed for river crossings and rocky terrain.",
        icon: "Mountain"
      },
      {
        title: "Winterized Package",
        desc: "Equipped with snow chains and high-altitude oil viscosity for -15°C.",
        icon: "Snowflake"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "Independent Coil Spring, Anti-Roll Bar" },
      { label: "Braking", value: "Ventilated Discs with ABS + EBD" },
      { label: "Fuel Capacity", value: "60 Liters + 20L Reserve Can" },
      { label: "Wheelbase", value: "2,680 mm" }
    ],
    altitude: {
      target: "5,000m",
      milestones: ["Kathmandu (1.4K)", "Namche (3.4K)", "EBC Trail (5.0K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "carrier", name: "Roof Carrier Kit", price: 15 }
    ]
  },
  {
    id: "toyota-lc300",
    name: "Toyota Land Cruiser 300",
    subtitle: "The undeniable king of all terrains, blending luxury with raw power.",
    image: "https://img.autocarindia.com/ExtraImages/20250618065840_Hybrid_Land_Cruiser_300_Drifting.jpg",
    engine: "3.3L Twin-Turbo V6",
    torque: "700 Nm",
    drive: "Full-Time 4WD",
    capacity: "7 Seats",
    price: 250,
    rating: 5.0,
    category: "Ice Peaks",
    capabilities: [
      {
        title: "Multi-Terrain Select",
        desc: "Advanced off-road tracking and adaptive suspension for varying terrains.",
        icon: "Activity"
      },
      {
        title: "Crawl Control",
        desc: "Modulates throttle and brakes automatically on extreme inclines.",
        icon: "Settings"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "E-KDSS Adaptive System" },
      { label: "Braking", value: "Ventilated Discs Front/Rear" },
      { label: "Fuel Capacity", value: "110 Liters" },
      { label: "Wheelbase", value: "2,850 mm" }
    ],
    altitude: {
      target: "5,600m",
      milestones: ["Pokhara (0.8K)", "Jomsom (2.7K)", "Kora La Base (5.6K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "satellite", name: "Satellite Phone", price: 30 }
    ]
  },
  {
    id: "bmw-x5",
    name: "BMW X5 xDrive",
    subtitle: "Premium German engineering for comfortable long-distance mountain cruising.",
    image: "https://i0.wp.com/gadgetsgaadi.com/wp-content/uploads/2021/01/bmw-x5-price-in-nepal-blue-gadgetsgaadi.png?w=1280&ssl=1",
    engine: "3.0L TwinPower Turbo",
    torque: "450 Nm",
    drive: "AWD xDrive",
    capacity: "5 Seats",
    price: 190,
    rating: 4.8,
    category: "All Terrain",
    capabilities: [
      {
        title: "xDrive AWD",
        desc: "Intelligent all-wheel drive for optimal traction on slippery alpine roads.",
        icon: "RefreshCw"
      },
      {
        title: "Air Suspension",
        desc: "Adaptive 2-axle air suspension for maximum comfort.",
        icon: "Wind"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "Adaptive M Suspension" },
      { label: "Braking", value: "M Sport Brakes" },
      { label: "Fuel Capacity", value: "83 Liters" },
      { label: "Wheelbase", value: "2,975 mm" }
    ],
    altitude: {
      target: "4,000m",
      milestones: ["Kathmandu (1.4K)", "Kagbeni (2.8K)", "Muktinath (4.0K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "ski", name: "Ski Rack", price: 20 }
    ]
  },
  {
    id: "mitsubishi-pajero",
    name: "Mitsubishi Pajero Sport",
    subtitle: "Reliable and rugged, a legendary name in off-road expeditions.",
    image: "https://media.adtorqueedge.com/new-cars/mitsubishi-au/pajero-sport/perf-bg.webp",
    engine: "2.4L MIVEC Diesel",
    torque: "430 Nm",
    drive: "Super Select 4WD-II",
    capacity: "7 Seats",
    price: 140,
    rating: 4.6,
    category: "Ice Peaks",
    capabilities: [
      {
        title: "Super Select 4WD",
        desc: "Shift between 2H, 4H, and 4LLc directly on the fly.",
        icon: "Unlock"
      },
      {
        title: "Water Wading",
        desc: "Capable of dealing with deep river crossings up to 700mm.",
        icon: "Droplet"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "Double Wishbone Front, 3-Link Rear" },
      { label: "Braking", value: "Ventilated Discs Front" },
      { label: "Fuel Capacity", value: "68 Liters" },
      { label: "Wheelbase", value: "2,800 mm" }
    ],
    altitude: {
      target: "5,200m",
      milestones: ["Pokhara (0.8K)", "Manang (3.5K)", "Tilicho Base (5.2K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "carrier", name: "Roof Carrier Kit", price: 15 }
    ]
  },
  {
    id: "renault-duster",
    name: "Dacia / Renault Duster",
    subtitle: "Budget-friendly adventurer that punches way above its weight.",
    image: "https://cdni.autocarindia.com/Utils/ImageResizer.ashx?n=https:%2f%2fcdni.autocarindia.com%2fExtraImages%2f20210622062834_Renault_Duster_2022_front.jpg&h=795&w=1200&c=1",
    engine: "1.5L dCi Diesel",
    torque: "260 Nm",
    drive: "AWD / 4x4",
    capacity: "5 Seats",
    price: 65,
    rating: 4.3,
    category: "Valley Passes",
    capabilities: [
      {
        title: "Agile Dimensions",
        desc: "Incredibly light footprint making it perfect for narrow mountain passes.",
        icon: "Navigation"
      },
      {
        title: "High Approach Angle",
        desc: "Surprising off-road capability with a 30-degree approach angle.",
        icon: "Map"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "MacPherson Strut" },
      { label: "Braking", value: "Disc Front, Drum Rear" },
      { label: "Fuel Capacity", value: "50 Liters" },
      { label: "Wheelbase", value: "2,673 mm" }
    ],
    altitude: {
      target: "3,800m",
      milestones: ["Kathmandu (1.4K)", "Syabrubesi (1.5K)", "Langtang (3.8K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "carrier", name: "Roof Carrier Kit", price: 15 }
    ]
  },
  {
    id: "suzuki-jimny",
    name: "Suzuki Jimny",
    subtitle: "Compact, budget-friendly and an incredibly capable mountain goat.",
    image: "https://images.carexpert.com.au/crop/500/375/app/uploads/2023/01/Suzuki-Jimny-5-Door1240169_4f111d2d5b_o.jpg",
    engine: "1.5L K15B",
    torque: "130 Nm",
    drive: "ALLGRIP PRO 4WD",
    capacity: "4 Seats",
    price: 70,
    rating: 4.7,
    category: "Valley Passes",
    capabilities: [
      {
        title: "Rigid Ladder Frame",
        desc: "Solid foundation for serious off-roading capability in a tiny package.",
        icon: "Shield"
      },
      {
        title: "Excellent Angles",
        desc: "37° approach, 28° breakover, and 49° departure angles.",
        icon: "Map"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "3-Link Rigid Axle with Coil Spring" },
      { label: "Braking", value: "Solid Disc Front, Drum Rear" },
      { label: "Fuel Capacity", value: "40 Liters" },
      { label: "Wheelbase", value: "2,250 mm" }
    ],
    altitude: {
      target: "4,800m",
      milestones: ["Pokhara (0.8K)", "Lethe (2.5K)", "Lo Manthang (4.8K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "carrier", name: "Roof Carrier Kit", price: 15 }
    ]
  },
  {
    id: "jeep-wrangler",
    name: "Jeep Wrangler Rubicon",
    subtitle: "Purpose-built 4x4 offering uncompromised off-road supremacy.",
    image: "https://media.ed.edmunds-media.com/jeep/wrangler/2025/oem/2025_jeep_wrangler_convertible-suv_rubicon-x_fq_oem_1_1600.jpg",
    engine: "2.0L Turbo",
    torque: "400 Nm",
    drive: "Rock-Trac 4x4",
    capacity: "5 Seats",
    price: 180,
    rating: 4.8,
    category: "All Terrain",
    capabilities: [
      {
        title: "Sway Bar Disconnect",
        desc: "Electronic front sway bar disconnect for incredible suspension travel.",
        icon: "Unlock"
      },
      {
        title: "Tru-Lok® Diff",
        desc: "Electronic locking front and rear differentials.",
        icon: "Lock"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "Solid Axle with Coil Springs" },
      { label: "Braking", value: "Heavy-Duty Disc Brakes" },
      { label: "Fuel Capacity", value: "81 Liters" },
      { label: "Wheelbase", value: "3,008 mm" }
    ],
    altitude: {
      target: "5,416m",
      milestones: ["Kathmandu (1.4K)", "Manang (3.5K)", "Thorong La (5.4K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "winch", name: "Recovery Winch Kit", price: 25 }
    ]
  },
  {
    id: "tata-nexon",
    name: "Tata Nexon",
    subtitle: "Highly popular and affordable compact SUV with a 5-star safety rating.",
    image: "https://cdn-s3.autocarindia.com/Tata/nexon/_BE07548.JPG",
    engine: "1.2L Revotron Turbo",
    torque: "170 Nm",
    drive: "FWD",
    capacity: "5 Seats",
    price: 55,
    rating: 4.2,
    category: "Valley Passes",
    capabilities: [
      {
        title: "5-Star Safety",
        desc: "Maximum safety rating for peace of mind on narrow mountain trails.",
        icon: "Shield"
      },
      {
        title: "Ground Clearance",
        desc: "209mm unladen ground clearance to tackle rough roads easily.",
        icon: "Navigation"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "Independent MacPherson Dual Path" },
      { label: "Braking", value: "Disc Front, Drum Rear" },
      { label: "Fuel Capacity", value: "44 Liters" },
      { label: "Wheelbase", value: "2,498 mm" }
    ],
    altitude: {
      target: "3,200m",
      milestones: ["Kathmandu (1.4K)", "Nagarkot (2.1K)", "Poon Hill (3.2K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "carrier", name: "Roof Carrier Kit", price: 15 }
    ]
  },
  {
    id: "alpine-scout-500",
    name: "Alpine Scout 500cc",
    subtitle: "Lightweight High-Altitude Build",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1600",
    engine: "471cc Parallel-Twin",
    torque: "43 Nm",
    drive: "Chain Drive",
    capacity: "2 Seats",
    price: 85,
    rating: 4.8,
    type: "bike",
    category: "Ice Peaks",
    capabilities: [
      {
        title: "Heated Grips",
        desc: "Essential for crossing high-altitude passes where temperatures drop below freezing.",
        icon: "Wind"
      },
      {
        title: "Gravel Pro Tyres",
        desc: "Deep tread 50/50 tyres offering ultimate grip on loose mountain scree.",
        icon: "Map"
      }
    ],
    technicalSpecs: [
      { label: "Suspension", value: "Long-Travel Inverted Telescopic Fork" },
      { label: "Braking", value: "Dual Channel ABS, Wave Discs" },
      { label: "Fuel Capacity", value: "17 Liters (+ Range: 450km)" },
      { label: "Wheelbase", value: "1,445 mm" }
    ],
    altitude: {
      target: "4,500m",
      milestones: ["Pokhara (0.8K)", "Kagbeni (2.8K)", "Muktinath (4.0K)"]
    },
    addons: [
      { id: "permit", name: "National Park Permit", price: 45 },
      { id: "panniers", name: "Aluminium Pannier Set", price: 20 }
    ],
    tags: ["HEATED GRIPS", "GRAVEL PRO TYRES"]
  }
];
