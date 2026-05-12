import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";


//  CONFIGURATION
//  Change ACTIVE_PROVIDER to swap between providers:
//    "gemini"   → Google Gemini API (free tier)
//    "local"    → Offline keyword-based bot (always works)
//    "supabase" → Supabase Edge Function (add later)

let ACTIVE_PROVIDER = "gemini"; // Will auto-fallback to "local" if Gemini fails

// Conversation state
let conversationHistory = [];
let chatSession = null;
let geminiAvailable = true; // Track if Gemini is reachable
let failureCount = 0;
const MAX_FAILURES_BEFORE_FALLBACK = 3;

// ─────────────────────────────────────────────────────────────
//  SYSTEM PROMPT — defines the AI's personality & scope
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Bhatbhate AI — a helpful, knowledgeable, general-purpose AI assistant (similar in capability to Google's Gemini) that lives inside the Bhatbhate vehicle rental and travel platform in Nepal.

Identity & tone:
- Be helpful, intelligent, curious, and conversational — like a smart friend who happens to know a lot.
- Speak in natural prose. Use markdown (headings, **bold**, bullet/numbered lists, short tables, code blocks) when it genuinely helps clarity, not for every reply.
- Vary your sentence length and structure. Avoid robotic templates.
- Use emojis only when they add warmth or scanability — never in every line.
- Be direct: answer first, qualify second. Don't bury the lede.

What you can do:
- Answer ANY question the user asks — general knowledge, coding, math, science, history, writing, brainstorming, language help, summarization, explanations, travel, lifestyle, technology, etc. You are not restricted to rental topics.
- When the user asks about Bhatbhate, vehicles, bookings, rentals, pricing, payments, documents, cancellations, or Nepal travel/touring, use the platform context below as the source of truth.
- Carry context across the conversation. Remember what the user just said and refer back to it naturally.
- If the user shifts topics mid-chat (e.g., from booking a jeep to asking a Python question), follow them gracefully — you are a general assistant first.
- If a question is ambiguous, make a reasonable assumption and answer, OR ask one short clarifying question — not several.

Reasoning & honesty:
- Think step-by-step on hard problems before answering. Show working only when it helps the user.
- If you don't know something or it's outside your knowledge cutoff, say so plainly. Don't fabricate facts, prices, dates, statistics, or quotes.
- For things that change in the real world (live availability, current weather, road closures, permit rules, promo prices), tell the user to verify with Bhatbhate support or the relevant authority.
- Never invent specific booking data, vehicle availability, or exact live prices.

Formatting:
- Default to concise, focused answers (2–6 sentences) for casual questions.
- Use lists/tables for comparisons, steps, or 4+ parallel items.
- Use fenced code blocks (\`\`\`lang) for code.
- For long-form answers, use clear section headings.

—
PLATFORM CONTEXT — BHATBHATE
—
Bhatbhate is a vehicle rental and travel platform in Nepal.

Fleet & terrain fit:
- Urban/city loops (Kathmandu, Pokhara, Butwal, Biratnagar): scooters, hatchbacks.
- Highway intercity (Kathmandu–Pokhara, Kathmandu–Chitwan, East-West corridor): sedans, motorcycles, compact SUVs.
- Hill/mountain roads (Bandipur, Dhulikhel, Nagarkot, Ghandruk approach, Mustang access): SUVs or 4x4 jeeps, experienced drivers.
- Family/group tours: vans or jeeps based on luggage and road condition.
- Monsoon: avoid low-clearance vehicles on hill routes — landslide and slick-road risk.

Pricing (indicative starting rates — confirm exact rates on the vehicle detail page):
- Scooters: NPR 800/day+
- Motorcycles: NPR 1,500/day+
- Cars/Sedans: NPR 3,500/day+
- SUVs/Jeeps: NPR 5,000/day+
Longer rentals usually get better daily rates.

Payments accepted: eSewa, Khalti, Bank Transfer, Cash on pickup. A refundable deposit may apply.

Documents required: valid driving license matching the vehicle category, government-issued ID (citizenship/passport), contact info, security deposit.

Cancellation: free up to 24 hours before pickup; 50% refund within 24 hours; no refund for no-shows.

Operating hours: 7 AM – 8 PM daily. Support email: support@bhatbhate.com.

When giving destination/route advice, briefly cover:
1. Recommended vehicle type
2. Best season window (and what to avoid)
3. One practical safety / logistics tip

Popular destinations to fluently advise on: Kathmandu Valley, Pokhara, Chitwan, Lumbini, Bandipur, Mustang, Rara, Ilam, Janakpur, Everest-view road trips (Salleri/Jiri side), Manang, Ghandruk, Nagarkot, Dhulikhel.`;

// ─────────────────────────────────────────────────────────────
//  GEMINI PROVIDER
// ─────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Generation tuning — closer to the consumer Gemini app feel.
const GENERATION_CONFIG = {
  maxOutputTokens: 2048,
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
};

// Permissive safety thresholds so the assistant can answer broad,
// general-purpose questions like the actual Gemini app does.
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// Retry helpers
const MAX_RETRIES = 2;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Convert internal {role, text} history into the Gemini Content[] format.
const buildGeminiHistory = () =>
  conversationHistory.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

const initGeminiSession = ({ preserveHistory = false } = {}) => {
  if (!genAI) return;
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_PROMPT,
      safetySettings: SAFETY_SETTINGS,
    });
    chatSession = model.startChat({
      history: preserveHistory ? buildGeminiHistory() : [],
      generationConfig: GENERATION_CONFIG,
    });
  } catch (err) {
    console.warn("Failed to init Gemini session:", err.message);
    chatSession = null;
  }
};

const sendGeminiMessage = async (userMessage) => {
  if (!genAI || !GEMINI_API_KEY) {
    throw new Error("NO_API_KEY");
  }

  if (!chatSession) {
    initGeminiSession();
  }
  if (!chatSession) {
    throw new Error("SESSION_INIT_FAILED");
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt}/${MAX_RETRIES}...`);
      const result = await chatSession.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text().trim();

      // Success — reset failure counter
      failureCount = 0;
      geminiAvailable = true;
      return text;
    } catch (err) {
      const msg = err.message || "";
      const isRateLimit =
        msg.includes("429") ||
        msg.includes("Too Many Requests") ||
        msg.includes("quota") ||
        msg.includes("RESOURCE_EXHAUSTED");

      if (isRateLimit && attempt < MAX_RETRIES) {
        // Try to parse the retry delay from the error
        let delayMs = 3000 * attempt;
        const match = msg.match(/retry\s+in\s+([\d.]+)s/i);
        if (match) {
          delayMs = Math.min(Math.ceil(parseFloat(match[1]) * 1000), 15000);
        }
        console.log(`[Gemini] Rate limited. Waiting ${delayMs / 1000}s...`);
        initGeminiSession({ preserveHistory: true });
        await sleep(delayMs);
        continue;
      }

      // All retries failed
      throw err;
    }
  }
};

// ─────────────────────────────────────────────────────────────
//  TERRAIN RECOMMENDATION SYSTEM (Gemini-powered)
// ─────────────────────────────────────────────────────────────

const TERRAIN_RECOMMENDATION_PROMPT = `You are a Nepal vehicle recommendation expert for Bhatbhate vehicle rentals.

You will receive terrain context about a specific province in Nepal. Based on the terrain type, altitude, road conditions, and routes, recommend the most suitable vehicle categories.

Nepal terrain knowledge:
- Koshi Province: Home to Mt. Everest, extreme altitude, snow-covered rough tracks, very narrow mountain roads
- Madhesh Province: Flat Terai plains, smooth national highways, warm climate, well-paved roads
- Bagmati Province: Kathmandu valley mix — city roads, some highways, and mountain tracks to Langtang/Helambu
- Gandaki Province: Annapurna region, famous off-road routes like Upper Mustang, Jomsom Highway (unpaved sections)
- Lumbini Province: Southern plains with historic sites, smooth highways like Siddhartha Highway, easy hill roads
- Karnali Province: Most remote region, very few paved roads, extreme terrain, Rara Lake and Dolpo treks
- Sudurpashchim Province: Far-west, mountain trails, hard border routes, limited road infrastructure

Vehicle categories available:
- SUV/Jeep: High ground clearance (200mm+), 4WD, suitable for off-road, mountain terrain. Examples: Mahindra Scorpio, Toyota Fortuner, Tata Safari
- Sedan/Hatchback: Low ground clearance, fuel efficient, comfortable on highways. Examples: Hyundai i20, Maruti Suzuki Swift, Honda City
- Motorcycle: Versatile for narrow mountain roads, fuel efficient. Examples: Royal Enfield Himalayan (off-road), Honda CB Shine (city)
- Scooter: Best for city/urban areas only. Examples: Honda Activa, TVS Jupiter
- Van/Bus: Group travel on paved roads. Examples: Toyota HiAce, Mahindra Bolero Pickup
- Pickup Truck: Cargo + passengers on rough roads. Examples: Tata Yodha, Mahindra Bolero Camper

IMPORTANT RULES:
1. For off-road/mountain terrain: ALWAYS recommend high ground clearance vehicles (SUV/Jeep/Pickup) and explain WHY
2. For flat highways/plains: Recommend sedans, hatchbacks, or any vehicle — explain they don't need high ground clearance
3. For mixed terrain: Recommend SUVs as primary, sedans as secondary for highway sections
4. Always mention ground clearance requirements explicitly
5. Consider altitude — vehicles may struggle above 4000m, mention this
6. Consider road width — narrow mountain roads favor motorcycles/smaller vehicles

Respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "summary": "2-3 sentence overview of the terrain and what vehicles work best",
  "recommendations": [
    {
      "category": "SUV/Jeep",
      "suitability": 95,
      "groundClearance": "High (200mm+)",
      "reason": "Why this category is suitable for this terrain",
      "bestFor": "Which specific routes/conditions this excels at",
      "warning": "Any cautions (optional, can be empty string)"
    }
  ],
  "roadConditions": {
    "paved": "percentage or description",
    "offRoad": "percentage or description",
    "difficulty": "Easy/Moderate/Challenging/Extreme"
  },
  "tips": ["Practical tip 1", "Practical tip 2"]
}

Provide 3-4 vehicle category recommendations, sorted by suitability score (highest first).`;

/**
 * Get AI-powered terrain-based vehicle recommendations
 * @param {Object} terrainContext - { province, terrain, altitude, temp, routes, description }
 * @returns {Object} Structured recommendation data
 */
export const getTerrainRecommendation = async (terrainContext) => {
  const { province, terrain, altitude, temp, routes, description } = terrainContext;

  const userPrompt = `Recommend vehicles for this Nepal terrain:

Province: ${province}
Terrain Type: ${terrain}
Max Altitude: ${altitude}
Temperature: ${temp}
Popular Routes: ${routes.join(', ')}
Road Description: ${description}

Give me your vehicle recommendations in the JSON format specified.`;

  // Try Gemini first
  if (genAI && GEMINI_API_KEY && geminiAvailable) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: TERRAIN_RECOMMENDATION_PROMPT,
      });

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`[Recommendation] Gemini attempt ${attempt}/${MAX_RETRIES}...`);
          const result = await model.generateContent(userPrompt);
          const response = await result.response;
          let text = response.text().trim();

          // Strip markdown code block wrappers if present
          text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

          const parsed = JSON.parse(text);
          console.log('[Recommendation] Gemini success');
          return { ...parsed, provider: 'gemini' };
        } catch (err) {
          const msg = err.message || '';
          const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');

          if (isRateLimit && attempt < MAX_RETRIES) {
            const delayMs = 3000 * attempt;
            console.log(`[Recommendation] Rate limited. Waiting ${delayMs / 1000}s...`);
            await sleep(delayMs);
            continue;
          }

          if (err instanceof SyntaxError) {
            console.warn('[Recommendation] Gemini returned invalid JSON, falling back to local');
            break;
          }

          throw err;
        }
      }
    } catch (err) {
      console.warn('[Recommendation] Gemini failed:', err.message);
    }
  }

  // Local fallback
  console.log('[Recommendation] Using local fallback');
  return { ...getLocalTerrainRecommendation(terrainContext), provider: 'local' };
};

/**
 * Local rule-based terrain recommendation (fallback)
 */
const getLocalTerrainRecommendation = (terrainContext) => {
  const { province, terrain, altitude, temp, routes, description } = terrainContext;
  const provinceLower = province.toLowerCase();

  // Off-road / Mountain terrain
  if (terrain === 'Ice Peaks' || terrain === 'All Terrain') {
    const isExtreme = provinceLower.includes('karnali') || provinceLower.includes('sudurpashchim');
    const isEverest = provinceLower.includes('koshi');

    return {
      summary: isExtreme
        ? `${province} is one of Nepal's most remote regions with very few paved roads. You absolutely need a high ground clearance 4WD vehicle to navigate the rough, unpaved mountain trails.`
        : `${province} has challenging mountain terrain with a mix of paved and unpaved roads. A high ground clearance vehicle is strongly recommended for safe travel.`,
      recommendations: [
        {
          category: 'SUV / Jeep',
          suitability: isExtreme ? 98 : 92,
          groundClearance: 'High (200mm+)',
          reason: `${terrain} terrain requires high ground clearance to handle rocky, unpaved roads and steep inclines. 4WD is essential for mountain passes.`,
          bestFor: routes.slice(0, 2).join(', '),
          warning: isEverest ? 'Vehicle performance may decrease significantly above 4,000m altitude due to thin air.' : '',
        },
        {
          category: 'Pickup Truck',
          suitability: isExtreme ? 85 : 78,
          groundClearance: 'High (200mm+)',
          reason: 'Pickup trucks offer excellent ground clearance and can carry supplies for remote journeys. Good for rough roads.',
          bestFor: 'Remote supply runs and off-road trails',
          warning: 'Less comfortable for long journeys with passengers.',
        },
        {
          category: 'Motorcycle (Off-road)',
          suitability: 75,
          groundClearance: 'Medium-High (180mm+)',
          reason: 'Narrow mountain roads are often easier to navigate on a motorcycle. Royal Enfield Himalayan is ideal for Nepal mountains.',
          bestFor: 'Narrow mountain trails and single-track roads',
          warning: 'Not suitable for carrying heavy luggage or group travel.',
        },
        {
          category: 'Sedan / Hatchback',
          suitability: isExtreme ? 15 : 35,
          groundClearance: 'Low (140-160mm)',
          reason: `Low ground clearance vehicles are NOT recommended for ${terrain} terrain. They will scrape on rocky roads and struggle on steep grades.`,
          bestFor: 'Only suitable for paved highway sections',
          warning: '⚠️ High risk of undercarriage damage on unpaved mountain roads.',
        },
      ],
      roadConditions: {
        paved: isExtreme ? '15-20%' : '40-55%',
        offRoad: isExtreme ? '80-85%' : '45-60%',
        difficulty: isExtreme ? 'Extreme' : 'Challenging',
      },
      tips: [
        'Always carry a spare tire and basic repair tools',
        isExtreme ? 'Fuel stations are scarce — carry extra fuel' : 'Check road conditions before departure',
        'Inform someone of your travel plans in remote areas',
        isEverest ? 'Be prepared for altitude sickness above 3,500m' : 'Carry warm clothing for high-altitude passes',
      ],
    };
  }

  // Valley / Plains / Highway terrain
  return {
    summary: `${province} features flat terrain with well-paved highways and smooth roads. You don't need high ground clearance — sedans, hatchbacks, and scooters all work great here, offering comfort and fuel efficiency.`,
    recommendations: [
      {
        category: 'Sedan / Hatchback',
        suitability: 95,
        groundClearance: 'Low (140-160mm)',
        reason: 'Smooth, paved highways are perfect for sedans and hatchbacks. They offer the best fuel efficiency and comfort for long drives on flat terrain.',
        bestFor: routes.slice(0, 2).join(', '),
        warning: '',
      },
      {
        category: 'Motorcycle',
        suitability: 88,
        groundClearance: 'Medium (160mm+)',
        reason: 'Motorcycles are versatile and fuel efficient for highway travel. Perfect for solo travelers or couples.',
        bestFor: 'Quick highway trips and town-to-town travel',
        warning: 'Less comfortable for very long distances.',
      },
      {
        category: 'Scooter',
        suitability: 75,
        groundClearance: 'Low (130-150mm)',
        reason: 'Scooters are great for short urban trips and town visits in the Terai region. Very affordable.',
        bestFor: 'City exploration and short-distance travel',
        warning: 'Not ideal for long highway stretches.',
      },
      {
        category: 'SUV / Jeep',
        suitability: 50,
        groundClearance: 'High (200mm+)',
        reason: 'SUVs work on any road but are overkill for flat highways. Higher fuel consumption without the terrain advantage.',
        bestFor: 'Group travel or if you plan to venture into nearby hills',
        warning: 'Higher rental cost and fuel consumption compared to sedans.',
      },
    ],
    roadConditions: {
      paved: '85-95%',
      offRoad: '5-15%',
      difficulty: 'Easy',
    },
    tips: [
      'Any vehicle type works well on these roads',
      'Fuel stations are readily available along highways',
      `Watch for high temperatures (${temp}) — ensure vehicle AC is working`,
      'Speed limits are enforced on national highways',
    ],
  };
};

// ─────────────────────────────────────────────────────────────
//  LOCAL FALLBACK PROVIDER (always works, no API needed)
// ─────────────────────────────────────────────────────────────
const LOCAL_KNOWLEDGE_BASE = {
  // Greetings
  greetings: {
    patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "namaste", "howdy", "greetings"],
    responses: [
      "Hello! 👋 Welcome to Bhatbhate Vehicle Rentals! How can I help you today?",
      "Hi there! 🚗 I'm your Bhatbhate rental assistant. What would you like to know?",
      "Namaste! 🙏 Welcome to Bhatbhate. I'm here to help with your vehicle rental needs!",
    ],
  },

  // Booking related
  booking: {
    patterns: ["book", "reserve", "rent", "rental", "booking", "reservation", "hire"],
    responses: [
      "Great choice! 🚗 To book a vehicle with Bhatbhate:\n\n1️⃣ Browse our vehicles by terrain type\n2️⃣ Select the vehicle you like\n3️⃣ Choose your rental dates\n4️⃣ Fill out the booking form\n5️⃣ Complete payment\n\nWould you like me to help you find a vehicle for a specific terrain?",
      "I'd love to help you book! 📋 You can start by selecting your terrain type (Mountain, Highway, Urban, etc.) and we'll show you the best vehicles for your journey. Need help choosing?",
    ],
  },

  // Vehicle types
  vehicles: {
    patterns: ["vehicle", "car", "bike", "motorcycle", "scooter", "suv", "jeep", "van", "bus", "types", "available", "fleet"],
    responses: [
      "🚙 Bhatbhate offers a great selection of vehicles!\n\n• 🏍️ Motorcycles & Scooters — for city rides\n• 🚗 Sedans & Hatchbacks — for highway trips\n• 🚙 SUVs & Jeeps — for mountain terrain\n• 🚐 Vans & Buses — for group travel\n\nYou can browse all vehicles by heading to the Vehicles page, or select a terrain type to see recommended options!",
      "We have everything from scooters to SUVs! 🛵🚙 Use the Terrain Select feature on our site to find the perfect match for your route. What terrain will you be driving on?",
    ],
  },

  // Pricing
  pricing: {
    patterns: ["price", "cost", "rate", "charge", "fee", "expensive", "cheap", "affordable", "how much", "pricing", "budget"],
    responses: [
      "💰 Our pricing depends on the vehicle type and rental duration:\n\n• Scooters: Starting from NPR 800/day\n• Motorcycles: Starting from NPR 1,500/day\n• Cars/Sedans: Starting from NPR 3,500/day\n• SUVs/Jeeps: Starting from NPR 5,000/day\n\nLonger rentals get better rates! Check the vehicle detail page for exact pricing. 📊",
      "Pricing varies by vehicle and duration. You can see the exact cost on each vehicle's detail page. We also offer discounts for longer rental periods! 🎉",
    ],
  },

  // Payment
  payment: {
    patterns: ["pay", "payment", "esewa", "khalti", "bank", "transfer", "money", "deposit"],
    responses: [
      "💳 We accept multiple payment methods:\n\n• eSewa\n• Khalti\n• Bank Transfer\n• Cash on pickup\n\nPayment is processed securely through our platform. A deposit may be required for certain vehicles.",
      "You can pay through eSewa, Khalti, or Bank Transfer! 💰 Payment is handled securely during the booking confirmation step.",
    ],
  },

  // Documents / Requirements
  documents: {
    patterns: ["document", "license", "id", "requirement", "need", "passport", "citizenship", "proof", "verification"],
    responses: [
      "📄 To rent a vehicle, you'll need:\n\n• Valid driving license (matching vehicle category)\n• Government-issued ID (citizenship/passport)\n• Contact information\n• Security deposit (refundable)\n\nMake sure your license covers the vehicle type you want to rent!",
    ],
  },

  // Terrain
  terrain: {
    patterns: ["terrain", "mountain", "highway", "urban", "city", "road", "off-road", "hill", "kathmandu", "pokhara", "terai"],
    responses: [
      "🏔️ We recommend vehicles based on terrain:\n\n• 🏙️ Urban/City → Scooters, Hatchbacks\n• 🛣️ Highway → Sedans, Motorcycles\n• ⛰️ Mountain/Hill → SUVs, Jeeps\n• 🌾 Terai/Plains → Any vehicle type\n\nUse our Terrain Select feature to get personalized recommendations!",
      "Great question! Different terrains need different vehicles. Head to our Terrain Select page and pick your destination — we'll show you the best options! 🗺️",
    ],
  },

  // Nepal destinations and touring
  destinations: {
    patterns: [
      "destination", "where to go", "tour", "travel", "trip", "itinerary",
      "mustang", "muktinath", "pokhara", "chitwan", "lumbini", "rara",
      "ilam", "bandipur", "nagarkot", "janakpur", "ghandruk", "manang",
      "everest view", "salleri", "jiri", "kathmandu valley"
    ],
    responses: [
      "Great touring choices in Nepal! 🚗 For Kathmandu-Pokhara-Chitwan, a sedan works in dry season, but an SUV is more comfortable in monsoon. For Mustang/Muktinath or rough hill roads, choose a high-clearance SUV/jeep and start early each day.",
      "If you're planning by region: Valley/city sightseeing → scooter or hatchback, highway circuits → sedan/SUV, high-hill routes (Mustang side roads, remote trails) → 4x4 jeep. I can build a day-by-day route if you share your trip length and group size.",
      "Popular routes we can plan for: Kathmandu Valley loop, Pokhara + Sarangkot, Chitwan safari trip, Lumbini heritage route, and East Nepal (Ilam tea hills). Tell me your dates and I’ll match vehicle, season tips, and estimated comfort level."
    ],
  },

  // Weather / season guidance
  season: {
    patterns: ["season", "weather", "monsoon", "rainy", "winter", "summer", "best time", "road condition", "landslide"],
    responses: [
      "Season matters a lot in Nepal. 🌦️ Oct-Nov and Mar-Apr are usually best for road trips, while monsoon needs extra caution for hill roads due to landslides. In rainy periods, prefer SUVs/jeeps over low-clearance cars.",
      "Winter is good for many highway routes, but high-altitude roads can be cold and occasionally restricted. For mountain districts, check local road updates before departure and keep buffer time in your itinerary.",
    ],
  },

  // Permits / docs for touring context
  permits: {
    patterns: ["permit", "entry permit", "tims", "acap", "restricted area", "documents for travel"],
    responses: [
      "For normal city/highway touring, your driving license + ID are usually enough. For some trekking/restricted regions, separate tourism permits may apply, so verify current rules with official local authorities before finalizing plans.",
      "Permit requirements can change by destination and nationality. If your route includes protected or restricted areas, confirm latest permit rules first, then we can choose the right vehicle and route timing.",
    ],
  },

  // Road safety and driving
  safety: {
    patterns: ["safe", "safety", "drive safely", "night drive", "emergency", "road safety", "accident", "risk"],
    responses: [
      "For Nepal road trips: avoid late-night mountain driving, keep fuel above half tank in remote sections, and start early to avoid weather and traffic stress. Seatbelts/helmets are essential, and keep offline maps as backup.",
      "Road safety tip: on hill roads, pick vehicles with good ground clearance and brakes, plan shorter daily distances, and keep extra time for delays. I can help you choose a safer route split by day."
    ],
  },

  // Budget planning for touring
  budgetPlan: {
    patterns: ["budget plan", "trip budget", "cheapest", "save money", "fuel cost", "affordable trip"],
    responses: [
      "For budget trips, choose a scooter/hatchback for city and short highway routes, travel in shoulder season, and avoid over-ambitious long daily drives. I can help you compare low-cost vs comfort-focused vehicle options.",
      "To control cost: match vehicle to terrain (not overpowered), group passengers efficiently, and plan a realistic loop to reduce backtracking fuel spend. Share your route and I’ll suggest an efficient vehicle class."
    ],
  },

  tourismGeneral: {
    patterns: ["tourism", "tourism in nepal", "travel nepal", "visit nepal", "nepal guide", "nepal trip"],
    responses: [
      "Nepal tourism has a bit of everything: culture (Kathmandu, Bhaktapur, Patan), nature (Pokhara, Chitwan, Rara), adventure (trekking, rafting, paragliding), and pilgrimage (Pashupatinath, Lumbini, Muktinath). For road travelers, the best plan is to match destination terrain with the right vehicle and season.",
      "If you want the complete Nepal experience, combine 3 zones: heritage cities, hill-lake views, and wildlife/plains. A common route is Kathmandu → Pokhara → Chitwan → Lumbini, then return by highway with a sedan/SUV based on weather and comfort preference.",
    ],
  },

  activities: {
    patterns: ["things to do", "activities", "adventure", "trek", "rafting", "paragliding", "jungle safari", "wildlife"],
    responses: [
      "Top Nepal activities: heritage walks in Kathmandu Valley, boating/paragliding in Pokhara, jungle safari in Chitwan, and mountain-view road trips in hill regions. Choose scooters/hatchbacks for city loops, and SUVs/jeeps for rough hill approaches.",
      "For adventure-heavy trips, keep flexible timing: weather and road conditions can change quickly. Start early, carry offline maps, and avoid planning long hill drives after dark.",
    ],
  },

  tripStyles: {
    patterns: ["family trip", "honeymoon", "couple trip", "solo trip", "group tour", "friends trip"],
    responses: [
      "Trip style recommendations: family trips usually do best with a comfortable car/SUV, couples often prefer scenic Pokhara-Bandipur loops, solo riders can do city/highway bike circuits, and groups should use vans/jeeps based on luggage and road type.",
      "For honeymoon/couple travel, Pokhara + Bandipur + short hill viewpoints is a balanced route. For family with elders or kids, reduce daily drive hours and prioritize smooth highways with reliable stays.",
    ],
  },

  foodCulture: {
    patterns: ["food", "local food", "culture", "festival", "tradition", "what to eat", "what to see in kathmandu"],
    responses: [
      "Don’t miss Nepal’s culture + food side: Newari cuisine in the valley, thakali sets on highway stops, and local tea/snacks in hill towns. Pair city heritage days with shorter drives so the trip doesn’t become only road time.",
      "Cultural highlights are best explored slowly: Kathmandu Durbar area, Bhaktapur, Patan, temples/stupas, then continue to Pokhara or Chitwan for nature contrast.",
    ],
  },

  roadTrips: {
    patterns: ["road trip", "drive plan", "itinerary", "7 days", "5 days", "10 days", "route plan"],
    responses: [
      "A practical 7-day road loop can be: Kathmandu (1) → Pokhara (2) → Chitwan (2) → Kathmandu (2). Sedan works in good weather; SUV is safer in monsoon or if you want hill detours.",
      "For 10 days, add Bandipur or Lumbini to the Kathmandu-Pokhara-Chitwan core route. Keep buffer time for traffic, weather, and rest days, especially on hill highways.",
    ],
  },

  packing: {
    patterns: ["packing", "what to carry", "what to pack", "travel checklist", "essentials"],
    responses: [
      "Nepal road-trip essentials: ID/license, cash + digital payment backup, power bank, rain layer, basic medicines, reusable water bottle, and offline maps. For hill routes, add warm layers even in mild seasons.",
      "If riding bikes/scooters, include gloves, visor/eye protection, and quick-dry clothing. Weather can shift fast between valley, plains, and higher roads.",
    ],
  },

  emergency: {
    patterns: ["emergency", "breakdown", "help", "accident", "hospital", "police", "road blocked"],
    responses: [
      "For emergencies on road trips: stop safely, secure passengers, contact local authorities/support, and avoid risky overtakes or night mountain driving. Keep important numbers, booking details, and vehicle documents accessible offline.",
      "If roads are blocked by weather or landslides, prioritize safety over schedule, wait for official clearance, and reroute only with reliable local updates.",
    ],
  },

  // Cancel / Refund
  cancel: {
    patterns: ["cancel", "refund", "return", "cancellation", "money back"],
    responses: [
      "🔄 Cancellation Policy:\n\n• Free cancellation up to 24 hours before pickup\n• 50% refund for cancellation within 24 hours\n• No refund for no-shows\n\nTo cancel a booking, go to your Bookings page and select the booking you want to cancel. For urgent issues, please contact our support team.",
    ],
  },

  // Support / Contact
  support: {
    patterns: ["support", "help", "contact", "phone", "email", "call", "reach", "complaint", "issue", "problem"],
    responses: [
      "📞 Need to reach us? Here's how:\n\n• 📧 Email: support@bhatbhate.com\n• 📱 Phone: +977-01-XXXXXXX\n• 💬 This chatbot (I'm always here!)\n• 📍 Visit: Check our office locations\n\nFor account-specific issues, please log in and visit your Profile page.",
    ],
  },

  // Hours / Timing
  hours: {
    patterns: ["hour", "time", "open", "close", "timing", "when", "schedule", "pickup", "drop"],
    responses: [
      "⏰ Operating Hours:\n\n• Office: 7:00 AM – 8:00 PM (daily)\n• Pickup/Drop-off: Flexible timing available\n• Customer Support: 24/7 via chatbot\n\nYou can arrange specific pickup and drop-off times during the booking process!",
    ],
  },

  // Thanks
  thanks: {
    patterns: ["thank", "thanks", "appreciate", "grateful", "awesome", "great", "perfect", "wonderful"],
    responses: [
      "You're welcome! 😊 Happy to help. Is there anything else you'd like to know about Bhatbhate?",
      "Glad I could help! 🎉 Feel free to ask if you have any other questions. Enjoy your ride! 🚗",
      "My pleasure! 😄 Don't hesitate to come back if you need anything else!",
    ],
  },

  // Goodbye
  goodbye: {
    patterns: ["bye", "goodbye", "see you", "later", "done", "exit", "quit"],
    responses: [
      "Goodbye! 👋 Thanks for visiting Bhatbhate. Have a great journey! 🚗💨",
      "See you later! 😊 Safe travels and don't forget — Bhatbhate is here whenever you need a ride!",
    ],
  },
};

// Default fallback when no pattern matches
// (Used only when Gemini is unreachable — kept rental-focused since
// the offline brain has no general-knowledge capability.)
const DEFAULT_RESPONSES = [
  "I'm running in offline mode right now, so I can mainly help with Bhatbhate basics — bookings, vehicles, pricing, payments, documents, or Nepal route ideas. What would you like to know?",
  "Connection to the AI is down at the moment. I can still help with rental and Nepal touring questions — try asking about a vehicle type, a destination, or a date range.",
  "Offline mode here. Ask me about booking, pricing, payments, cancellation, or pick a destination (Pokhara, Chitwan, Mustang, etc.) and I'll suggest the right vehicle.",
];

/**
 * Match user message to a knowledge base category
 */
const findBestMatch = (message) => {
  const lower = message
    .toLowerCase()
    .trim()
    .replace(/\btorism\b/g, "tourism")
    .replace(/\btravell?\b/g, "travel");
  let bestCategory = null;
  let bestScore = 0;
  const tokens = lower.split(/\s+/).filter(Boolean);
  const isLongQuery = tokens.length >= 4;

  for (const [category, data] of Object.entries(LOCAL_KNOWLEDGE_BASE)) {
    let score = 0;
    for (const pattern of data.patterns) {
      if (lower.includes(pattern)) {
        // Longer pattern matches get higher scores
        score += pattern.length;
      }
    }

    // Do not let greeting intent hijack longer, meaningful questions.
    if (category === "greetings" && isLongQuery) {
      score = Math.floor(score * 0.15);
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
};

/**
 * Pick a random response from an array
 */
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Local chatbot response
 */
const sendLocalMessage = (userMessage) => {
  const category = findBestMatch(userMessage);

  if (category) {
    return randomPick(LOCAL_KNOWLEDGE_BASE[category].responses);
  }

  return randomPick(DEFAULT_RESPONSES);
};


//  SUPABASE PROVIDER (placeholder for future integration)
//  To activate: set ACTIVE_PROVIDER = "supabase"
//  and implement the function below

// const SUPABASE_CHAT_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/chat";
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
//
// const sendSupabaseMessage = async (userMessage) => {
//   const res = await fetch(SUPABASE_CHAT_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
//     },
//     body: JSON.stringify({
//       message: userMessage,
//       history: conversationHistory.slice(-10),
//     }),
//   });
//   if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
//   const data = await res.json();
//   return data.reply;
// };


//  PUBLIC API (used by ChatBot.jsx)


/**
 * Initialize a new chat session
 */
export const initializeChatSession = () => {
  conversationHistory = [];
  failureCount = 0;
  geminiAvailable = true;

  if (ACTIVE_PROVIDER === "gemini" && genAI) {
    initGeminiSession();
  }
};

/**
 * Send a message and get a response.
 * Auto-falls back to local bot if Gemini is unavailable.
 */
export const sendChatMessage = async (userMessage) => {
  let assistantMessage = "";
  let usedProvider = ACTIVE_PROVIDER;

  // ── Try Gemini first (if configured) ──
  if (
    (ACTIVE_PROVIDER === "gemini" || ACTIVE_PROVIDER === "supabase") &&
    genAI &&
    GEMINI_API_KEY &&
    geminiAvailable
  ) {
    try {
      assistantMessage = await sendGeminiMessage(userMessage);
      usedProvider = "gemini";
    } catch (err) {
      const msg = err.message || "";
      console.warn("[Chatbot] Gemini failed:", msg);

      failureCount++;

      // If repeated failures, disable Gemini for this session
      if (failureCount >= MAX_FAILURES_BEFORE_FALLBACK) {
        geminiAvailable = false;
        console.warn(
          `[Chatbot] Gemini disabled after ${failureCount} failures. Using local fallback.`
        );
      }

      // Fall through to local
      assistantMessage = "";
    }
  }

  // ── Supabase provider (future) ──
  // if (!assistantMessage && ACTIVE_PROVIDER === "supabase") {
  //   try {
  //     assistantMessage = await sendSupabaseMessage(userMessage);
  //     usedProvider = "supabase";
  //   } catch (err) {
  //     console.warn("[Chatbot] Supabase failed:", err.message);
  //   }
  // }

  // ── Local fallback (always works) ──
  if (!assistantMessage) {
    assistantMessage = sendLocalMessage(userMessage);
    usedProvider = "local";
  }

  console.log(`[Chatbot] Response via [${usedProvider}]:`, assistantMessage.substring(0, 80) + "...");

  // Store in conversation history
  conversationHistory.push({ role: "user", text: userMessage });
  conversationHistory.push({ role: "assistant", text: assistantMessage });

  // Keep only last 10 message pairs for context
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  return assistantMessage;
};

/**
 * Clear chat history and reset provider state
 */
export const clearChatHistory = () => {
  conversationHistory = [];
  failureCount = 0;
  geminiAvailable = true;
  if (genAI) {
    initGeminiSession();
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = () => {
  return conversationHistory;
};

/**
 * Get current active provider info (useful for debugging / UI indicator)
 */
export const getProviderStatus = () => {
  return {
    configured: ACTIVE_PROVIDER,
    geminiAvailable: !!(genAI && GEMINI_API_KEY && geminiAvailable),
    fallbackActive: !geminiAvailable || !genAI,
    failureCount,
  };
};
