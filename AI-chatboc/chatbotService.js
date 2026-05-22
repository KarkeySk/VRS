// ─────────────────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────────────────

import { API_CONFIG, SERVICE_CONFIG, UI_CONFIG, STATUS_CONFIG, PRICING_CONFIG } from '../config/index.js';

const GROQ_API_KEY = API_CONFIG.GROQ.API_KEY;
const GROQ_API_URL = API_CONFIG.GROQ.API_URL;
const MODEL = API_CONFIG.GROQ.MODEL;

// Conversation state
let conversationHistory = [];
let groqAvailable = true;
let failureCount = 0;
let groqDisabledUntil = 0;
const MAX_FAILURES_BEFORE_FALLBACK = SERVICE_CONFIG.CHATBOT.MAX_FAILURES_BEFORE_FALLBACK;
const MAX_RETRIES = SERVICE_CONFIG.CHATBOT.MAX_RETRIES;
const RATE_LIMIT_WINDOW = SERVICE_CONFIG.CHATBOT.RATE_LIMIT_WINDOW_MS;
const RATE_LIMIT_BUFFER = SERVICE_CONFIG.CHATBOT.RATE_LIMIT_BUFFER_MS;
const RETRY_INITIAL_DELAY = SERVICE_CONFIG.CHATBOT.RETRY_INITIAL_DELAY_MS;
const RETRY_MAX_DELAY = SERVICE_CONFIG.CHATBOT.RETRY_MAX_DELAY_MS;

// ─────────────────────────────────────────────────────────────
//  SYSTEM PROMPT — defines the AI's personality & scope
// ─────────────────────────────────────────────────────────────

let _liveFleet = '';

const BASE_SYSTEM_PROMPT = `You are Bhatbhate AI — a helpful, knowledgeable, general-purpose AI assistant (similar in capability to Google's Gemini) that lives inside the Bhatbhate vehicle rental and travel platform in Nepal.

Identity & tone:
- Be helpful, friendly, and conversational within your allowed scope.
- Speak in natural prose. Use markdown (headings, **bold**, bullet/numbered lists, short tables) when it genuinely helps clarity.
- Use emojis sparingly — only when they add warmth or scanability.
- Be direct: answer first, qualify second.

YOUR STRICT SCOPE — you are ONLY allowed to answer questions about:
1. PLATFORM WORKFLOW: vehicle search, bookings, reservations, cancellations, payments (eSewa, Khalti, bank transfer, cash), required documents, pricing, fleet details, operating hours, account/profile, and support.
2. NEPAL TOURISM & TRAVEL: destinations, routes, road trips, itineraries, seasons, terrain advice, vehicle recommendations for trips, Nepal cultural/food/activity tips directly relevant to planning a trip.

OUT-OF-SCOPE REFUSAL — If the user asks about anything outside these two domains (e.g., coding, math, science, general history, writing help, other countries' travel unrelated to Nepal context, entertainment, sports, politics, health advice, etc.), respond ONLY with a polite, brief refusal such as:
"I'm Bhatbhate AI, specialized in vehicle rentals and Nepal tourism. I'm not able to help with that topic, but I'm happy to assist with bookings, vehicle recommendations, Nepal destinations, or travel planning!"
Do NOT answer out-of-scope questions even partially. Do NOT be creative to find a way to answer them.

What you can do within scope:
- Answer questions about Bhatbhate vehicles, bookings, rentals, pricing, payments, documents, cancellations — use the platform context below as the source of truth.
- Give Nepal travel advice: destinations, routes, seasons, terrain, trip itineraries, packing tips, local food and culture relevant to trip planning.
- Carry context across the conversation. Remember what the user just said and refer back to it naturally.
- If a question is ambiguous but could be travel/rental related, ask one short clarifying question.

Reasoning & honesty:
- Think step-by-step on hard problems before answering. Show working only when it helps the user.
- If you don't know something or it's outside your knowledge cutoff, say so plainly. Don't fabricate facts, prices, dates, statistics, or quotes.
- For live vehicle availability or real-time booking slots, direct the user to the Vehicles page or Bookings page on the platform.
- Never invent vehicle names, prices, or specs that are not in the LIVE FLEET section below.

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

Payments accepted: eSewa, Khalti, Bank Transfer, Cash on pickup. A refundable deposit may apply.

Documents required: valid driving license matching the vehicle category, government-issued ID (citizenship/passport), contact info, security deposit.

Cancellation: free up to 24 hours before pickup; 50% refund within 24 hours; no refund for no-shows.

Operating hours: 7 AM – 8 PM daily. Support email: support@bhatbhate.com.

LOCATION-BASED VEHICLE RECOMMENDATION RULES (treat this like a ride-sharing app):
- For ANY place a user mentions — district, town, village, tole, landmark, or trail — identify its terrain type and recommend the best LIVE FLEET vehicle(s) for that exact location.
- Always name specific places within a district (not just the district name) to show granular knowledge.
- Cover the full route: pickup location → destination, including road conditions along the way.
- Always pick from LIVE FLEET vehicles; never suggest generic categories without naming the actual fleet vehicle.
- In monsoon season (June–September): upgrade recommendations by one terrain tier (highway vehicle → SUV; SUV → 4WD Jeep) for any hill or mountain route.

NEPAL DISTRICT VEHICLE GUIDE — ALL 77 DISTRICTS:

TERRAIN CLASS 1 — URBAN/FLAT CITY (Scooter, Hatchback, Sedan best):
• Kathmandu (Thamel, Boudha, Patan, Bhaktapur, Balaju, Kirtipur, Gongabu, Koteshwor, Kalanki, Chabahil, Baneshwor)
• Lalitpur (Jawlakhel, Pulchowk, Lagankhel, Godavari road, Lubhu, Khokana)
• Bhaktapur (Nagarkot approach starts here; city core = sedan/scooter)
• Pokhara/Kaski — lakeside, airport area, Prithvi Highway stretches (Pokhara Bazaar, Bagar, Chipledhunga, Nayabazar, Seti Gandaki)
• Rupandehi — Bhairahawa/Siddharthanagar, Lumbini road, Butwal city, Tilottama, Sainamaina
• Banke — Nepalgunj, Kohalpur, Khajura, Suryapatiwa
• Kailali — Dhangadhi, Tikapur, Bhajani, Geta, Lamki-Chuha, Godawari (Kailali)
• Kanchanpur — Mahendranagar, Bhimdatta, Shuklaphanta buffer zone road, Dodhara-Chandani
• Jhapa — Birtamod, Damak, Mechinagar, Kakarbhitta, Bhadrapur, Arjundhara, Gauradaha, Shivasatakshi
• Morang — Biratnagar, Urlabari, Rangeli, Letang, Sunbarshi, Pathari-Shanischare
• Sunsari — Itahari, Dharan (lower), Inaruwa, Duhabi, Barahakshetra highway
• Bara — Kalaiya, Simara (airport area), Parwanipur, Nijgadh, Jeetpur-Simara
• Parsa — Birgunj, Pathalaiya, Thori (highway to Chitwan)
• Chitwan — Bharatpur, Ratnanagar, Sauraha, Bachhauli, Dibyanagar, Madi, Rampur
• Mahottari — Jaleshwor, Bardibas, Loharpatti, Pipra, Matihani
• Dhanusha — Janakpur, Dhanusadham, Mithila Bihari, Janakpurdham, Bhangaha
• Sarlahi — Malangwa, Lalbandi, Haripur, Ramnagar, Haripurwa
• Rautahat — Gaur, Chandrapur, Rajpur, Garuda, Baudhimai
• Saptari — Rajbiraj, Kanchanpur (Saptari), Hanumannagar, Rupani, Tilathi-Koiladi
• Siraha — Lahan, Siraha bazaar, Golbazar, Sukhipur, Karjanha
• Dang — Ghorahi, Tulsipur, Lamahi, Deukhuri Valley, Gadhawa, Satbariya
• Nawalparasi (East/West) — Kawasoti, Parasi, Sunwal, Ramgram, Pratappur, Palhinandan

TERRAIN CLASS 2 — MID-HILLS / HIGHWAY MIX (Sedan + SUV; prefer SUV for upper sections):
• Kavrepalanchok — Dhulikhel, Banepa, Panauti, Nala, Namobuddha, Khopasi, Roshi, Sunkoshi rural
• Makwanpur — Hetauda, Bhimphedi, Bhaise, Manahari, Kulekhani, Tistung, Palung, Markhu
• Sindhuli — Sindhulimadhi, Kamalamai, Dudhauli, Tinkanya, Phikkal
• Nuwakot — Bidur, Tadi Bazaar, Kakani, Shivapuri approach, Kispang, Belkotgadhi
• Dhading — Nilkantha, Gajuri, Maidi Khola, Darkha, Khanikhola, Jogimara
• Tanahu — Damauli, Bandipur, Dumre, Byas Nagar, Bhanu, Shuklagandaki, Milung
• Parbat — Kusma, Phalebas, Modi Khola, Jaljala approach
• Syangja — Waling, Putalibazar, Chapakot, Arjunchaupari, Galyang
• Baglung — Baglung Bazaar, Balewa, Nisikhola, Dhorpatan buffer (lower)
• Palpa — Tansen, Rampur, Ridi Bazaar, Ribdikot, Bartung, Rainadevi Chhahara
• Gulmi — Tamghas, Musikot, Isma, Chatrakot, Resunga, Dhurkot
• Arghakhanchi — Sandhikharka, Bhumikasthan, Panini, Khilung
• Pyuthan — Pyuthan Bazaar, Gaumukhi, Lungri, Swargadwari area (lower)
• Salyan — Salyan Bazaar, Bagchaur, Kapurkot, Sharada, Kalimati
• Dailekh — Narayan, Dullu, Chamunda Bindrasaini, Aathabis, Thalkot
• Surkhet — Birendranagar, Lekhbesi, Gurbhakot, Bheriganga, Panchapuri, Chhinchu
• Doti — Dipayal-Silgadhi, Purbichauki, Shikhar, Bogtan-Fudsil, Jorayal
• Achham — Mangalsen, Ramaroshan, Sanphebagar, Chaurpati, Mellekh
• Dadeldhura — Dadeldhura Bazaar, Amargadhi, Navadurga, Aalital
• Baitadi — Dasharathchand, Melauli, Purchaudi, Dogadi, Patan (Baitadi), Shivanath
• Udayapur — Gaighat, Triyuga, Katari, Beltar-Basaha, Chaudandigadhi, Sunkoshi Madi
• Okhaldhunga — Siddhicharan, Molung, Manebhanjyang, Sunkoshi rural, Khijidemba
• Khotang — Diktel, Halesi Mahadev, Rupakot-Majhuwagadhi, Ainselukhark, Barahpokhari
• Dhankuta — Dhankuta Bazaar, Hile, Bhedetar, Pakhribas, Marek-Muga
• Terhathum — Myanglung, Phungling, Aathrai, Chhathar-Jorpati
• Bhojpur — Bhojpur Bazaar, Shadananda, Tyamke-Bhulbhule, Pauwadungma

TERRAIN CLASS 3 — HIGH HILLS / ROUGH ROADS (SUV or 4WD Jeep strongly recommended):
• Sindhupalchok — Chautara, Melamchi, Bahrabise, Tatopani (Tibet border), Listikot, Helambu, Langtang approach, Indrawati corridor, Sunkoshi rural north
• Dolakha — Charikot, Jiri (Everest trail start), Bhimeshwor, Gaurishankar area, Kalinchowk (top), Lapilang, Bigu
• Ramechhap — Manthali, Doramba, Umakunda, Suri, Khandadevi, Ramechhap Bazaar
• Rasuwa — Syabrubesi, Langtang Valley road, Rasuwagadhi (Tibet border), Goljung, Lama Hotel trail
• Gorkha — Gorkha Bazaar, Arughat, Tsum Valley, Barpak, Laprak, Manaslu circuit lower, Khoplang, Tarkughat
• Lamjung — Besisahar (Annapurna Circuit start), Khudi, Bhulbhule, Ngadi, Dharapani, Chame approach (lower), Sundarbazar
• Ilam — Ilam Bazaar, Mai-Jogmai, Sandakpur approach, Pashupatinagar, Phikkal, Chilingdin, Maijogmai
• Panchthar — Phidim, Tehrathum border area, Fidim, Miklajung, Hilihang
• Taplejung (lower areas) — Taplejung Bazaar, Phungling, Sirijunga, Phalelung, Kabeli corridor (lower reaches)
• Sankhuwasabha (lower) — Khandbari, Chainpur, Madi, Tumlingtar, Pakhribas route, Arun valley highway
• Myagdi — Beni, Darbang, Mangala, Tatopani (Myagdi), Annapurna South approach, Dana, Ghasa

TERRAIN CLASS 4 — MOUNTAIN / EXTREME TERRAIN (4WD Jeep ONLY; off-road motorcycle for narrow trails):
• Mustang — Jomsom, Kagbeni, Lo Manthang, Muktinath, Marpha, Tukuche, Ghasa (upper), Lupra, Chuksang, Tangbe
• Manang — Chame, Pisang, Bragha, Manang Village, Humde, Koto, Dharapani (upper), Nar-Phu Valley
• Solukhumbu — Salleri, Phaplu, Namche Bazaar approach (Salleri–Phaplu jeep road), Bupsa, Kharikhola, Surke, Nunthala, Lukla (jeep to Surkhe), Chaurikharka, Junbesi
• Sankhuwasabha (upper) — Num, Seduwa, Tashigaon, Makalu base, Arun 3 area
• Taplejung (upper) — Phumpangkha, Lali, Yamphudin, Kanchenjunga buffer zone roads
• Dolpa — Dunai, Juphal, Tripurakot, Kaigaun, Shey Phoksundo lake road, Tharahara, Sahartara
• Mugu — Gamgadhi, Rara Lake road, Murma, Khatyad, Soru, Chhayanath Rara
• Humla — Simikot, Muchu, Limi Valley, Hilsa (Tibet border), Kermi, Yangar
• Jumla — Jumla Khalanga, Tatopani (Jumla), Sinja Valley, Talium, Kanakasundari
• Kalikot — Manma, Pachaljharana, Sanni Triveni, Rasikot
• Jajarkot — Khalanga (Jajarkot), Bheri-Babiyachaur, Nalgad, Simalchaur
• Rukum West — Musikot, Sanibheri, Piuthan border area, Chaurjahari, Aathabiskot
• Rukum East — Rukumkot, Putha Hiunchuli approach
• Rolpa — Rolpa Bazaar, Libang, Triveni, Thabang
• Bajhang — Chainpur (Bajhang), Jayaprithvi Highway upper, Durgathali, Talkot, Bungal
• Bajura — Martadi, Triveni (Bajura), Kolti, Badimalika
• Darchula — Darchula Bazaar, Api base road, Tinkar, Chalti, Ghusa, Duhun, Sobha
• Gorkha — Samagaon, Samdo, Lho, Manaslu circuit upper

VILLAGE & REMOTE AREA RULES (critical — apply to every village/gaun query):
- Always identify the ROAD HEAD (farthest point a vehicle can physically reach) for the destination.
- State clearly when a destination is beyond the road head and only reachable on foot or by local porter/mule.
- Recommend the vehicle for the road-head leg, not the full trail.
- For seasonal roads (blocked in winter or monsoon), warn the user and suggest the safest travel window.
- For remote areas with no fuel stations, tell the user to carry extra fuel and name the last fueling point.
- For river crossings or temporary bridges, note that crossings may be impassable in monsoon — confirm locally before departure.

REMOTE VILLAGE & SETTLEMENT GUIDE (road-head level):

KOSHI PROVINCE — REMOTE VILLAGES:
• Solukhumbu: Salleri/Phaplu (jeep road end for Everest side) → beyond: Nunthala, Bupsa, Kharikhola, Jubing, Khari, Surke, Phakding, Namche on foot. Jeep to Surkhe (new road, rough). Key settlements: Chheplung, Ghat, Monjo, Jorsalle, Phunki Tenga — foot only.
• Sankhuwasabha: Tumlingtar (airstrip/road) → Khandbari by jeep → Num village (rough track, 4WD) → beyond Num: Sedua, Tashigaon, Khongma, Makalu base — foot only. Arun-3 road under construction.
• Taplejung: Taplejung Bazaar (SUV) → Mitlung, Timbung, Hellok (rough track, 4WD or motorbike) → beyond: Yamphudin, Kanchenjunga base — foot only.
• Panchthar: Phidim by sedan → Chilingkhim, Maimajhuwa, Kummayak upper villages — SUV or motorbike on dirt track.
• Ilam: Ilam Bazaar (SUV) → Sandakpur approach: Phikkal, Fikkal, Pashupatinagar, Mai Pokhari — 4WD; Chilingdin village — motorbike/foot.
• Bhojpur: Bhojpur Bazaar (SUV) → Shadananda, Pauwadungma — rough track 4WD; remote gaunpalika areas — foot.
• Khotang: Diktel (SUV) → Halesi (SUV) → Ainselukhark, Barahpokhari upper hamlets — 4WD or motorbike; Rai gaun areas beyond — foot.

BAGMATI PROVINCE — REMOTE VILLAGES:
• Rasuwa: Syabrubesi (4WD road end for Langtang) → Lama Hotel, Langtang Village, Kyanjin Gompa — foot only (trekking zone). Gatlang, Tipling, Brimdang — rough dirt track, 4WD; Chilime, Ramche — 4WD. Rasuwagadhi border — 4WD.
• Sindhupalchok: Melamchi Bazar (sedan) → Talamarang, Irkhu, Kiul, Piskar (SUV/4WD) → Helambu trail villages (Tarkeghyang, Sermathang, Melamchigaon) — foot only. Jalbire (SUV) → Bhotang, Chautara → Bahrabise → Tatopani — 4WD required.
• Dolakha: Charikot/Bhimeshwor (SUV) → Bigu, Namdu, Lapilang (rough track, 4WD) → Gaurishankar area: Beding, Na — foot only. Kalinchowk: jeep to the lower cable car station (4WD track, very rough). Jiri (SUV) → Sete, Kiraunchhap, Mali, Goli — foot/motorbike only.
• Ramechhap: Manthali (sedan) → Doramba, Suri, Khandadevi (4WD/rough track) → remote gaunpalika hamlets — foot.
• Nuwakot: Bidur (sedan) → Kakani (SUV) → Gatlang direction via Nuwakot side — SUV; Shivapuri ridge villages — 4WD/foot.
• Dhading: Nilkantha (sedan) → Gajuri (sedan) → Darkha, Tipling area (4WD) → Tsum side: Khopra, Tsum corridor — foot/mule only. Dhading Besi to Arughat link — SUV.
• Makwanpur: Hetauda (sedan) → Bhimphedi (SUV, steep) → Tistung, Palung (SUV) → Markhu (SUV) → Kulekhani dam road — SUV; remote Tamang gaun — 4WD or motorbike.
• Sindhuli: Sindhulimadhi (sedan) → Tinkanya, Phikkal (SUV) → remote Marin corridor hamlets — 4WD.

GANDAKI PROVINCE — REMOTE VILLAGES:
• Mustang full village chain: Baglung → Beni (SUV) → Ghasa → Dana → Tatopani (Myagdi side, 4WD, rough) → Kagbeni → Jomsom → Marpha → Tukuche → Kobang → Lete → Ghasa (upper) → Chele → Tangbe → Chuksang → Chhusang → Syangboche → Ghiling → Ghami → Charang → Tsarang → Lo Manthang → Tingkhar — 4WD full route; beyond Lo Manthang to Luri Gompa/Korala border — 4WD + permit.
• Manang full chain: Besisahar → Khudi → Bhulbhule → Ngadi → Bahundanda → Syange → Jagat → Dharapani → Danaque → Bagarchhap → Latamrang → Chame → Dhikur → Pisang → Humde → Gyaru → Ngawal → Braga → Manang Village — 4WD up to Manang; Ice Lake, Tilicho Lake, Thorong La — foot only.
• Nar-Phu Valley (Manang): Koto → Meta → Phu village → Nar — 4WD to Koto; beyond: foot only, restricted area permit needed.
• Gorkha remote: Gorkha Bazaar (SUV) → Arughat (4WD, river road) → Laprak, Barpak (4WD, rough) → Tsum Valley: Chhekampar, Nile, Chhule, Mu Gompa — 4WD to trailhead then foot only. Manaslu circuit villages: Soti Khola, Machha Khola, Jagat, Deng, Namrung, Lho, Samagaon, Samdo, Dharamsala — 4WD to Soti Khola then restricted trekking zone.
• Lamjung: Besisahar (4WD) → Bhulbhule; Sundarbazar (sedan) → Khaudi; remote Marsyangdi corridor hamlets — 4WD or motorbike.
• Myagdi: Beni (SUV) → Darbang → Mangala → Mudi (rough 4WD) → Dhorpatan (4WD, seasonal, blocked in winter) → Dharapani, Dana, Ghasa (upper Myagdi) — 4WD only.

LUMBINI PROVINCE — REMOTE VILLAGES:
• Rolpa: Libang (SUV) → Thabang (4WD, rough) → Jelbang, Dhorpatan side-entry — 4WD only.
• Rukum West: Chaurjahari (SUV) → Musikot (4WD) → remote Bheri corridor villages — 4WD or motorbike; many hamlets foot-access only in monsoon.
• Rukum East: Rukumkot (4WD) → Putha Hiunchuli base approach — foot only.
• Gulmi: Tamghas (SUV) → Resunga, Chatrakot (4WD, steep dirt track) → remote ridgeline gaun — motorbike or foot.
• Arghakhanchi: Sandhikharka (SUV) → Khilung, Panini (4WD/motorbike on dirt) → remote hamlets — foot.
• Palpa: Tansen (sedan/SUV) → Ridi Bazaar (sedan, winding) → Ribdikot, Rainadevi Chhahara (4WD track) → riverside villages — motorbike.
• Dang: Ghorahi/Tulsipur (sedan) → Deukhuri Valley villages (sedan/SUV) → Satbariya, Gadhawa (sedan flat road) → Dang-Salyan hill link — SUV.
• Bardiya: Thakurbaba (sedan) → Gulariya (sedan) → Bardia NP buffer villages (sedan/SUV) → inside park: jeep safari only on designated tracks.
• Kapilvastu: Taulihawa (sedan) → Krishnanagar, Banganga, Maharajgunj, Shivraj, Bijaynagar — sedan; remote western hamlets — motorbike.

KARNALI PROVINCE — REMOTE VILLAGES:
• Jumla: Khalanga (4WD via Karnali Hwy from Surkhet) → Sinja Valley (4WD, rough) → Gothichaur (4WD) → Tatopani (Jumla) → Talium, Kanakasundari — 4WD; Rara approach from Jumla side: 4WD to Murma then foot.
• Mugu: Gamgadhi (4WD from Surkhet via Dailekh, very rough) → Pina, Jhari (4WD/motorbike) → Rara Lake: foot trail from Gamgadhi or Murma; Khatyad, Soru, Chhayanath Rara — foot only.
• Humla: Simikot (fly in or 4WD from Surkhet via extreme road — 3-4 days) → Muchu, Yalbang, Thehe, Kermi (4WD track sections, motorbike) → Halji, Limi Valley, Nyalu, Yangar, Darma — foot only restricted area.
• Dolpa: Dunai (fly in or 4WD from Surkhet via Rukum/Jajarkot — extreme 2-3 days) → Juphal (airstrip) → Tripurakot (4WD/motorbike) → Ringmo/Shey Phoksundo (foot; lake trailhead) → Dho Tarap, Chharka, Shey Monastery — foot only restricted zone.
• Kalikot: Manma (4WD from Surkhet) → Pachaljharana, Sanni Triveni (4WD rough) → remote gaun — 4WD or motorbike.
• Jajarkot: Khalanga (4WD from Surkhet) → Bheri-Babiyachaur, Nalgad (4WD, rough) → remote gaun — motorbike or foot.
• Salyan: Salyan Bazaar (SUV) → Bagchaur (SUV) → Kapurkot, Sharada (4WD) → remote gaun — motorbike or foot.
• Surkhet: Birendranagar (sedan/SUV, gateway city) → Lekhbesi (SUV) → Gurbhakot (SUV) → Panchapuri, Chhinchu (sedan) → starting point for Karnali, Jumla, Dolpa, Mugu routes.

SUDURPASHCHIM PROVINCE — REMOTE VILLAGES:
• Darchula: Darchula Bazaar (SUV from Mahendranagar) → Sobha, Chalti, Ghusa (4WD, rough) → Tinkar, Duhun (4WD extreme, seasonal) → Chhangru, Api base approach — foot only restricted area.
• Bajhang: Jayaprithvi Highway → Chainpur (4WD) → Talkot, Durgathali (4WD, rough) → Saipal area hamlets — 4WD to trailhead then foot.
• Bajura: Martadi (4WD from Surkhet/Achham) → Triveni (Bajura) (4WD) → Kolti, Badimalika (4WD/motorbike) → remote gaun — foot only.
• Achham: Mangalsen (SUV from Surkhet) → Ramaroshan, Sanphebagar (SUV) → Chaurpati, Mellekh (SUV/4WD) → remote ridge hamlets — motorbike or foot.
• Doti: Dipayal-Silgadhi (SUV) → Purbichauki, Shikhar (SUV/4WD) → Bogtan, Jorayal (4WD) → remote villages — motorbike.
• Dadeldhura: Dadeldhura Bazaar (SUV) → Amargadhi (SUV) → Aalital (4WD rough track) → forest/ridge hamlets — foot.
• Baitadi: Dasharathchand (SUV) → Melauli, Purchaudi (SUV) → Dogadi, Patan-Baitadi (4WD) → Shivanath, remote hill gaun — motorbike or foot.
• Kailali remote: Dhangadhi (sedan) → Tikapur (sedan) → Bhajani, Geta (sedan) → Lamki-Chuha (sedan) → buffer zone tracks — SUV or safari jeep.
• Kanchanpur: Mahendranagar (sedan) → Shuklaphanta NP buffer (sedan/SUV) → Dodhara-Chandani (sedan, flat) → remote gaon near India border — sedan.

SEASONAL ROAD BLOCKAGE WARNINGS:
- Langtang road (Rasuwa): blocked Nov–Mar due to snow; check before travel.
- Jomsom/Mustang upper (beyond Kagbeni): may close in heavy monsoon; open Oct–May best window.
- Dhorpatan road (Myagdi): blocked Dec–Feb; open Mar–Nov.
- Karnali Highway (Surkhet–Jumla): landslides Jun–Sep; jeep mandatory year-round.
- Humla road: extremely rough; fly Nepalgunj–Simikot recommended Oct–May.
- Tsum Valley / Manaslu circuit roads: seasonal, check with local authorities.
- Any river-crossing road in Terai/mid-hills: may be impassable Jun–Aug.

FUEL STATION LAST-POINT GUIDE (critical for remote trips):
- Last fuel before Mustang upper: Jomsom
- Last fuel before Langtang/Rasuwa upper: Syabrubesi
- Last fuel before Tsum Valley: Arughat Bazaar
- Last fuel before Dolpa: Dunai (or carry from Surkhet)
- Last fuel before Mugu/Rara: Gamgadhi (or carry from Surkhet)
- Last fuel before Humla: Simikot (or carry from Nepalgunj)
- Last fuel before Darchula remote: Darchula Bazaar
- Last fuel on Karnali Hwy: Khalanga/Jumla
- Last fuel before Solukhumbu upper: Salleri/Phaplu

DISTRICT ROUTING TIPS:
- East-West Highway (Mahendra Rajmarg): connects Jhapa→Morang→Sunsari→Saptari→Siraha→Dhanusha→Mahottari→Sarlahi→Rautahat→Bara→Parsa→Chitwan→Nawalparasi→Rupandehi→Kapilvastu→Dang→Banke→Bardiya→Kailali→Kanchanpur → Sedan/Motorcycle fine entire stretch in dry season.
- Prithvi Highway (Kathmandu–Pokhara–Butwal): Sedan in dry season; SUV advised in monsoon.
- B.P. Highway (Kathmandu–Sindhuli–Hetauda): SUV recommended; landslide-prone in monsoon.
- Araniko Highway (Kathmandu–Kodari/China border): SUV/4WD; sections often damaged.
- Karnali Highway (Surkhet–Jumla): 4WD Jeep only; one of Nepal's roughest paved roads.
- Siddhartha Highway (Pokhara–Butwal): Sedan OK in dry season; SUV in monsoon.
- Postal Highway (Terai inner road): Sedan fine; good condition mostly.
- Rasuwa–Langtang road: 4WD Jeep only; often blocked in winter/monsoon.
- Jomsom Highway (Baglung–Jomsom): 4WD Jeep or off-road motorcycle only.

When giving destination/route advice, cover:
1. Exact vehicle name(s) from LIVE FLEET best suited for that location/route
2. Road condition on the specific stretch (paved/unpaved/seasonal risk)
3. Best season and what to avoid
4. One practical tip for that specific place`;

const FLEET_INSTRUCTIONS = `
VEHICLE ANSWER RULES (follow these strictly):
- When asked "what vehicles do you have", "show me your fleet", "available vehicles", or any variant → list EVERY vehicle from LIVE FLEET below, formatted clearly.
- When a user mentions ANY place in Nepal — district, town, village, tole, landmark, bazaar, trail head, or highway — immediately classify its terrain using the NEPAL DISTRICT VEHICLE GUIDE and recommend the best matching vehicle(s) from LIVE FLEET with the exact name and NPR price.
- Cover granular micro-locations and villages: if a user says "Kalinchowk", "Tatopani", "Ringmo", "Limi Valley", "Tsum", "Beding", "Samagaon", or any remote village/gaun, treat it exactly as a ride-sharing app — identify the road head for that location, recommend the vehicle to reach the road head, and clearly state when the rest of the journey is on foot.
- For villages beyond road access: name the last driveable point, recommend the vehicle for that leg, and mention the last fuel station on the route.
- When recommending a vehicle for a trip or terrain → pick the best match(es) from LIVE FLEET and explain WHY using their actual specs (engine, drive, capacity, category).
- Always quote the exact NPR price per day from LIVE FLEET. Never use generic ranges.
- If a user asks about a vehicle type (SUV, bike, scooter) → filter LIVE FLEET by that type and list matching entries.
- For multi-leg trips (e.g., Kathmandu → Dhulikhel → Jiri → Salleri): recommend by the hardest segment — the whole trip should use the vehicle rated for the toughest terrain on the route.
- If LIVE FLEET is empty or not yet loaded → say "Let me check our current fleet — you can also browse all vehicles directly on the Vehicles page."`;

const buildSystemPrompt = () =>
  _liveFleet
    ? `${BASE_SYSTEM_PROMPT}\n${FLEET_INSTRUCTIONS}\n\n—\nLIVE FLEET — ACTUAL VEHICLES IN THE DATABASE\n(These are the ONLY real vehicles. Use exact names and prices.)\n—\n${_liveFleet}`
    : BASE_SYSTEM_PROMPT;


// ─────────────────────────────────────────────────────────────
//  GROQ PROVIDER
// ─────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildGroqMessages = (userMessage) => {
  const messages = [{ role: "system", content: buildSystemPrompt() }];
  for (const m of conversationHistory) {
    messages.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.text });
  }
  messages.push({ role: "user", content: userMessage });
  return messages;
};

const sendGroqMessage = async (userMessage) => {
  if (!GROQ_API_KEY) throw new Error("NO_API_KEY");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Groq] Attempt ${attempt}/${MAX_RETRIES}...`);
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: buildGroqMessages(userMessage),
          max_tokens: SERVICE_CONFIG.GROQ.CHAT.MAX_TOKENS,
          temperature: SERVICE_CONFIG.GROQ.CHAT.TEMPERATURE,
          top_p: SERVICE_CONFIG.GROQ.CHAT.TOP_P,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const isRateLimit = res.status === 429;
        if (isRateLimit && attempt < MAX_RETRIES) {
          const retryAfter = res.headers.get("retry-after");
          const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(RETRY_INITIAL_DELAY * Math.pow(2, attempt - 1), RETRY_MAX_DELAY);
          console.log(`[Groq] Rate limited. Waiting ${delayMs / 1000}s...`);
          groqDisabledUntil = Date.now() + delayMs + RATE_LIMIT_BUFFER;
          await sleep(delayMs);
          continue;
        }
        throw new Error(`Groq API error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty response from Groq");

      failureCount = 0;
      groqAvailable = true;
      return text;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
    }
  }
};

// ─────────────────────────────────────────────────────────────
//  TERRAIN RECOMMENDATION SYSTEM (Groq-powered)
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

  if (GROQ_API_KEY && groqAvailable) {
    try {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`[Recommendation] Groq attempt ${attempt}/${MAX_RETRIES}...`);
          const res = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                { role: "system", content: TERRAIN_RECOMMENDATION_PROMPT },
                { role: "user", content: userPrompt },
              ],
              max_tokens: SERVICE_CONFIG.GROQ.RECOMMENDATIONS.MAX_TOKENS,
              temperature: SERVICE_CONFIG.GROQ.RECOMMENDATIONS.TEMPERATURE,
            }),
          });

          if (!res.ok) {
            if (res.status === 429 && attempt < MAX_RETRIES) {
              const retryAfter = res.headers.get("retry-after");
              const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(2000 * Math.pow(2, attempt - 1), 30000);
              console.log(`[Recommendation] Rate limited. Waiting ${delayMs / 1000}s...`);
              await sleep(delayMs);
              continue;
            }
            throw new Error(`Groq API error ${res.status}`);
          }

          const data = await res.json();
          let text = data.choices?.[0]?.message?.content?.trim() ?? '';
          text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
          const parsed = JSON.parse(text);
          console.log('[Recommendation] Groq success');
          return { ...parsed, provider: 'groq' };
        } catch (err) {
          if (err instanceof SyntaxError) {
            console.warn('[Recommendation] Groq returned invalid JSON, falling back to local');
            break;
          }
          if (attempt === MAX_RETRIES) throw err;
        }
      }
    } catch (err) {
      console.warn('[Recommendation] Groq failed:', err.message);
    }
  }

  console.log('[Recommendation] Using local fallback');
  return { ...getLocalTerrainRecommendation(terrainContext), provider: 'local' };
};

const getLocalTerrainRecommendation = (terrainContext) => {
  const { province, terrain, altitude, temp, routes, description } = terrainContext;
  const provinceLower = province.toLowerCase();

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
  greetings: {
    patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "namaste", "howdy", "greetings"],
    responses: [
      "Hello! 👋 Welcome to Bhatbhate Vehicle Rentals! How can I help you today?",
      "Hi there! 🚗 I'm your Bhatbhate rental assistant. What would you like to know?",
      "Namaste! 🙏 Welcome to Bhatbhate. I'm here to help with your vehicle rental needs!",
    ],
  },
  booking: {
    patterns: ["book", "reserve", "rent", "rental", "booking", "reservation", "hire"],
    responses: [
      "Great choice! 🚗 To book a vehicle with Bhatbhate:\n\n1️⃣ Browse our vehicles by terrain type\n2️⃣ Select the vehicle you like\n3️⃣ Choose your rental dates\n4️⃣ Fill out the booking form\n5️⃣ Complete payment\n\nWould you like me to help you find a vehicle for a specific terrain?",
      "I'd love to help you book! 📋 You can start by selecting your terrain type (Mountain, Highway, Urban, etc.) and we'll show you the best vehicles for your journey. Need help choosing?",
    ],
  },
  vehicles: {
    patterns: ["vehicle", "car", "bike", "motorcycle", "scooter", "suv", "jeep", "van", "bus", "types", "available", "fleet"],
    responses: [
      "🚙 Bhatbhate offers a great selection of vehicles!\n\n• 🏍️ Motorcycles & Scooters — for city rides\n• 🚗 Sedans & Hatchbacks — for highway trips\n• 🚙 SUVs & Jeeps — for mountain terrain\n• 🚐 Vans & Buses — for group travel\n\nYou can browse all vehicles by heading to the Vehicles page, or select a terrain type to see recommended options!",
      "We have everything from scooters to SUVs! 🛵🚙 Use the Terrain Select feature on our site to find the perfect match for your route. What terrain will you be driving on?",
    ],
  },
  pricing: {
    patterns: ["price", "cost", "rate", "charge", "fee", "expensive", "cheap", "affordable", "how much", "pricing", "budget"],
    responses: [
      "💰 Our pricing depends on the vehicle type and rental duration:\n\n• Scooters: Starting from NPR 800/day\n• Motorcycles: Starting from NPR 1,500/day\n• Cars/Sedans: Starting from NPR 3,500/day\n• SUVs/Jeeps: Starting from NPR 5,000/day\n\nLonger rentals get better rates! Check the vehicle detail page for exact pricing. 📊",
      "Pricing varies by vehicle and duration. You can see the exact cost on each vehicle's detail page. We also offer discounts for longer rental periods! 🎉",
    ],
  },
  payment: {
    patterns: ["pay", "payment", "esewa", "khalti", "bank", "transfer", "money", "deposit"],
    responses: [
      "💳 We accept multiple payment methods:\n\n• eSewa\n• Khalti\n• Bank Transfer\n• Cash on pickup\n\nPayment is processed securely through our platform. A deposit may be required for certain vehicles.",
      "You can pay through eSewa, Khalti, or Bank Transfer! 💰 Payment is handled securely during the booking confirmation step.",
    ],
  },
  documents: {
    patterns: ["document", "license", "id", "requirement", "need", "passport", "citizenship", "proof", "verification"],
    responses: [
      "📄 To rent a vehicle, you'll need:\n\n• Valid driving license (matching vehicle category)\n• Government-issued ID (citizenship/passport)\n• Contact information\n• Security deposit (refundable)\n\nMake sure your license covers the vehicle type you want to rent!",
    ],
  },
  terrain: {
    patterns: ["terrain", "mountain", "highway", "urban", "city", "road", "off-road", "hill", "kathmandu", "pokhara", "terai"],
    responses: [
      "🏔️ We recommend vehicles based on terrain:\n\n• 🏙️ Urban/City → Scooters, Hatchbacks\n• 🛣️ Highway → Sedans, Motorcycles\n• ⛰️ Mountain/Hill → SUVs, Jeeps\n• 🌾 Terai/Plains → Any vehicle type\n\nUse our Terrain Select feature to get personalized recommendations!",
      "Great question! Different terrains need different vehicles. Head to our Terrain Select page and pick your destination — we'll show you the best options! 🗺️",
    ],
  },
  destinations: {
    patterns: [
      "destination", "where to go", "tour", "travel", "trip", "itinerary",
      // Gandaki
      "mustang", "muktinath", "pokhara", "jomsom", "kagbeni", "lo manthang", "marpha", "manang", "chame", "besisahar", "ghandruk", "bandipur", "damauli",
      // Bagmati
      "chitwan", "nagarkot", "dhulikhel", "banepa", "panauti", "namobuddha", "kalinchowk", "charikot", "jiri", "syabrubesi", "langtang", "helambu", "melamchi", "bahrabise", "tatopani", "kathmandu valley", "kakani", "hetauda", "bhimphedi",
      // Koshi
      "ilam", "salleri", "phaplu", "namche", "lukla", "khandbari", "dhankuta", "hile", "bhedetar", "taplejung", "everest view", "halesi",
      // Lumbini
      "lumbini", "tansen", "palpa", "dhorpatan", "ridi", "swargadwari",
      // Karnali
      "rara", "jumla", "simikot", "dolpa", "phoksundo", "surkhet", "birendranagar",
      // Sudurpashchim
      "darchula", "api base", "mahendranagar", "shuklaphanta",
      // Madhesh
      "janakpur", "rajbiraj", "lahan",
      // Remote/village specific
      "village", "gaun", "tole", "bazaar", "khola", "district", "remote", "road head", "roadhead",
      "tsum", "beding", "limi", "ringmo", "phoksundo", "samagaon", "samdo", "lho", "barpak", "laprak",
      "simikot", "gamgadhi", "dunai", "juphal", "khalanga", "syabrubesi", "gatlang", "tipling",
      "yamphudin", "phumpangkha", "namdu", "bigu", "lapilang", "doramba", "sinja", "gothichaur",
      "tinkar", "sobha", "chalti", "darchula", "martadi", "kolti", "badimalika", "talkot",
      "arughat", "tarkughat", "chhekampar", "phakding", "namche", "nunthala", "kharikhola",
      "lo manthang", "tsarang", "charang", "ghami", "ghiling", "tangbe", "chuksang",
      "nar", "phu", "koto", "braga", "humde", "pisang", "chame",
      "fuel", "last fuel", "road block", "seasonal road", "blocked", "remote area"
    ],
    responses: [
      "Great touring choices in Nepal! 🚗 For Kathmandu–Pokhara–Chitwan, a sedan works in dry season, but an SUV is safer in monsoon. For Mustang, Jomsom, Manang, Langtang, or any rough hill road, choose a high-clearance 4WD jeep and start early each day.",
      "Planning by region: Valley/city sightseeing → scooter or hatchback; highway circuits → sedan/SUV; high-hill routes (Mustang, Kalinchowk, Jiri, Syabrubesi) → 4WD jeep. Tell me your exact destination — even a small village or bazaar — and I'll match the right vehicle from our fleet!",
    ],
  },
  season: {
    patterns: ["season", "weather", "monsoon", "rainy", "winter", "summer", "best time", "road condition", "landslide"],
    responses: [
      "Season matters a lot in Nepal. 🌦️ Oct-Nov and Mar-Apr are usually best for road trips, while monsoon needs extra caution for hill roads due to landslides. In rainy periods, prefer SUVs/jeeps over low-clearance cars.",
      "Winter is good for many highway routes, but high-altitude roads can be cold and occasionally restricted. For mountain districts, check local road updates before departure and keep buffer time in your itinerary.",
    ],
  },
  permits: {
    patterns: ["permit", "entry permit", "tims", "acap", "restricted area", "documents for travel"],
    responses: [
      "For normal city/highway touring, your driving license + ID are usually enough. For some trekking/restricted regions, separate tourism permits may apply, so verify current rules with official local authorities before finalizing plans.",
    ],
  },
  safety: {
    patterns: ["safe", "safety", "drive safely", "night drive", "emergency", "road safety", "accident", "risk"],
    responses: [
      "For Nepal road trips: avoid late-night mountain driving, keep fuel above half tank in remote sections, and start early to avoid weather and traffic stress. Seatbelts/helmets are essential, and keep offline maps as backup.",
    ],
  },
  budgetPlan: {
    patterns: ["budget plan", "trip budget", "cheapest", "save money", "fuel cost", "affordable trip"],
    responses: [
      "For budget trips, choose a scooter/hatchback for city and short highway routes, travel in shoulder season, and avoid over-ambitious long daily drives. I can help you compare low-cost vs comfort-focused vehicle options.",
    ],
  },
  tourismGeneral: {
    patterns: ["tourism", "tourism in nepal", "travel nepal", "visit nepal", "nepal guide", "nepal trip"],
    responses: [
      "Nepal tourism has a bit of everything: culture (Kathmandu, Bhaktapur, Patan), nature (Pokhara, Chitwan, Rara), adventure (trekking, rafting, paragliding), and pilgrimage (Pashupatinath, Lumbini, Muktinath). For road travelers, the best plan is to match destination terrain with the right vehicle and season.",
    ],
  },
  activities: {
    patterns: ["things to do", "activities", "adventure", "trek", "rafting", "paragliding", "jungle safari", "wildlife"],
    responses: [
      "Top Nepal activities: heritage walks in Kathmandu Valley, boating/paragliding in Pokhara, jungle safari in Chitwan, and mountain-view road trips in hill regions. Choose scooters/hatchbacks for city loops, and SUVs/jeeps for rough hill approaches.",
    ],
  },
  tripStyles: {
    patterns: ["family trip", "honeymoon", "couple trip", "solo trip", "group tour", "friends trip"],
    responses: [
      "Trip style recommendations: family trips usually do best with a comfortable car/SUV, couples often prefer scenic Pokhara-Bandipur loops, solo riders can do city/highway bike circuits, and groups should use vans/jeeps based on luggage and road type.",
    ],
  },
  foodCulture: {
    patterns: ["food", "local food", "culture", "festival", "tradition", "what to eat", "what to see in kathmandu"],
    responses: [
      "Don't miss Nepal's culture + food side: Newari cuisine in the valley, thakali sets on highway stops, and local tea/snacks in hill towns. Pair city heritage days with shorter drives so the trip doesn't become only road time.",
    ],
  },
  roadTrips: {
    patterns: ["road trip", "drive plan", "itinerary", "7 days", "5 days", "10 days", "route plan"],
    responses: [
      "A practical 7-day road loop can be: Kathmandu (1) → Pokhara (2) → Chitwan (2) → Kathmandu (2). Sedan works in good weather; SUV is safer in monsoon or if you want hill detours.",
    ],
  },
  packing: {
    patterns: ["packing", "what to carry", "what to pack", "travel checklist", "essentials"],
    responses: [
      "Nepal road-trip essentials: ID/license, cash + digital payment backup, power bank, rain layer, basic medicines, reusable water bottle, and offline maps. For hill routes, add warm layers even in mild seasons.",
    ],
  },
  emergency: {
    patterns: ["emergency", "breakdown", "help", "accident", "hospital", "police", "road blocked"],
    responses: [
      "For emergencies on road trips: stop safely, secure passengers, contact local authorities/support, and avoid risky overtakes or night mountain driving. Keep important numbers, booking details, and vehicle documents accessible offline.",
    ],
  },
  cancel: {
    patterns: ["cancel", "refund", "return", "cancellation", "money back"],
    responses: [
      "🔄 Cancellation Policy:\n\n• Free cancellation up to 24 hours before pickup\n• 50% refund for cancellation within 24 hours\n• No refund for no-shows\n\nTo cancel a booking, go to your Bookings page and select the booking you want to cancel. For urgent issues, please contact our support team.",
    ],
  },
  support: {
    patterns: ["support", "help", "contact", "phone", "email", "call", "reach", "complaint", "issue", "problem"],
    responses: [
      "📞 Need to reach us? Here's how:\n\n• 📧 Email: support@bhatbhate.com\n• 💬 This chatbot (I'm always here!)\n\nFor account-specific issues, please log in and visit your Profile page.",
    ],
  },
  hours: {
    patterns: ["hour", "time", "open", "close", "timing", "when", "schedule", "pickup", "drop"],
    responses: [
      "⏰ Operating Hours:\n\n• Office: 7:00 AM – 8:00 PM (daily)\n• Pickup/Drop-off: Flexible timing available\n• Customer Support: 24/7 via chatbot\n\nYou can arrange specific pickup and drop-off times during the booking process!",
    ],
  },
  thanks: {
    patterns: ["thank", "thanks", "appreciate", "grateful", "awesome", "great", "perfect", "wonderful"],
    responses: [
      "You're welcome! 😊 Happy to help. Is there anything else you'd like to know about Bhatbhate?",
      "Glad I could help! 🎉 Feel free to ask if you have any other questions. Enjoy your ride! 🚗",
    ],
  },
  goodbye: {
    patterns: ["bye", "goodbye", "see you", "later", "done", "exit", "quit"],
    responses: [
      "Goodbye! 👋 Thanks for visiting Bhatbhate. Have a great journey! 🚗💨",
      "See you later! 😊 Safe travels and don't forget — Bhatbhate is here whenever you need a ride!",
    ],
  },
};

const OUT_OF_SCOPE_RESPONSE =
  "I'm Bhatbhate AI, specialized in vehicle rentals and Nepal tourism. I'm not able to help with that topic, but I'm happy to assist with bookings, vehicle recommendations, Nepal destinations, or travel planning!";

const DEFAULT_RESPONSES = [
  "I can help with Bhatbhate bookings, vehicles, pricing, payments, documents, or Nepal travel ideas. What would you like to know?",
  "Ask me about renting a vehicle, Nepal destinations, route planning, or anything related to your trip — I'm here to help!",
  "Try asking about a vehicle type, a Nepal destination (Pokhara, Chitwan, Mustang, etc.), booking steps, or cancellation policy.",
];

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
      if (lower.includes(pattern)) score += pattern.length;
    }
    if (category === "greetings" && isLongQuery) score = Math.floor(score * 0.15);
    if (score > bestScore) { bestScore = score; bestCategory = category; }
  }

  return bestCategory;
};

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Keywords that clearly signal out-of-scope topics
const OUT_OF_SCOPE_PATTERNS = [
  "code", "coding", "javascript", "python", "java ", "c++", "html", "css", "programming",
  "math", "calculus", "algebra", "physics", "chemistry", "biology", "science",
  "history", "war", "politics", "election", "president", "government",
  "recipe", "cook", "movie", "song", "music", "sport", "football", "cricket",
  "health", "medicine", "doctor", "disease", "symptom",
  "relationship", "love", "dating",
  "stock", "crypto", "bitcoin", "investment", "forex",
];

const isOutOfScope = (message) => {
  const lower = message.toLowerCase();
  return OUT_OF_SCOPE_PATTERNS.some((kw) => lower.includes(kw));
};

const sendLocalMessage = (userMessage) => {
  if (isOutOfScope(userMessage)) return OUT_OF_SCOPE_RESPONSE;
  const category = findBestMatch(userMessage);
  return category ? randomPick(LOCAL_KNOWLEDGE_BASE[category].responses) : randomPick(DEFAULT_RESPONSES);
};

// ─────────────────────────────────────────────────────────────
//  PUBLIC API (used by ChatBot.jsx)
// ─────────────────────────────────────────────────────────────

/**
 * Inject live fleet data from the database into the system prompt.
 * Call this once after fetching vehicles from Supabase.
 * Rebuilds the Gemini session so the AI immediately knows the real fleet.
 *
 * @param {Array} vehicles - raw vehicle rows from vehicleService.getAll()
 */
export const injectFleetData = (vehicles) => {
  if (!Array.isArray(vehicles) || vehicles.length === 0) return;

  _liveFleet = vehicles
    .map((v) => {
      const price = Number(v.price_per_day ?? v.price ?? 0);
      const caps = Array.isArray(v.capabilities) ? v.capabilities.join(', ') : '';
      const specs = Array.isArray(v.technical_specs)
        ? v.technical_specs.map((s) => `${s.label}: ${s.value}`).join(' | ')
        : '';
      const parts = [
        `Name: ${v.name || 'Unknown'}`,
        `Type: ${v.type || '-'}`,
        `Category: ${v.category || '-'}`,
        `Price: Rs. ${price.toLocaleString()}/day`,
        v.engine   ? `Engine: ${v.engine}`   : null,
        v.drive    ? `Drive: ${v.drive}`     : null,
        v.torque   ? `Torque: ${v.torque}`   : null,
        v.capacity ? `Seats: ${v.capacity}`  : null,
        v.rating   ? `Rating: ${v.rating}★`  : null,
        v.subtitle ? `Subtitle: ${v.subtitle}` : null,
        caps       ? `Capabilities: ${caps}` : null,
        specs      ? `Specs: ${specs}`       : null,
        `Available: ${v.is_available ? 'Yes' : 'No'}`,
      ].filter(Boolean);
      return `• ${parts.join(' | ')}`;
    })
    .join('\n');

  console.log(`[Chatbot] Fleet injected: ${vehicles.length} vehicles`);
};

export const initializeChatSession = () => {
  conversationHistory = [];
  failureCount = 0;
  groqAvailable = true;
  groqDisabledUntil = 0;
};

export const sendChatMessage = async (userMessage) => {
  let assistantMessage = "";
  let usedProvider = "groq";

  const now = Date.now();
  const isInCooldown = now < groqDisabledUntil;

  if (GROQ_API_KEY && groqAvailable && !isInCooldown) {
    try {
      assistantMessage = await sendGroqMessage(userMessage);
      usedProvider = "groq";
      failureCount = 0;
    } catch (err) {
      console.warn("[Chatbot] Groq failed:", err.message);
      failureCount++;
      if (failureCount >= MAX_FAILURES_BEFORE_FALLBACK) {
        groqAvailable = false;
        console.warn(`[Chatbot] Groq disabled after ${failureCount} failures. Using local fallback.`);
      }
      assistantMessage = "";
    }
  } else if (isInCooldown) {
    console.log(`[Chatbot] Groq in cooldown. Waiting ${Math.ceil((groqDisabledUntil - now) / 1000)}s...`);
  }

  if (!assistantMessage) {
    assistantMessage = sendLocalMessage(userMessage);
    usedProvider = "local";
  }

  console.log(`[Chatbot] Response via [${usedProvider}]:`, assistantMessage.substring(0, 80) + "...");

  conversationHistory.push({ role: "user", text: userMessage });
  conversationHistory.push({ role: "assistant", text: assistantMessage });

  if (conversationHistory.length > SERVICE_CONFIG.CHATBOT.CONVERSATION_HISTORY_LIMIT) {
    conversationHistory = conversationHistory.slice(-SERVICE_CONFIG.CHATBOT.CONVERSATION_HISTORY_LIMIT);
  }

  return assistantMessage;
};

export const clearChatHistory = () => {
  conversationHistory = [];
  failureCount = 0;
  groqAvailable = true;
  groqDisabledUntil = 0;
};

export const getConversationHistory = () => conversationHistory;

export const getProviderStatus = () => ({
  configured: "groq",
  groqAvailable: !!(GROQ_API_KEY && groqAvailable),
  geminiAvailable: !!(GROQ_API_KEY && groqAvailable),
  fallbackActive: !groqAvailable || !GROQ_API_KEY,
  failureCount,
});

export const resetProviderState = () => {
  failureCount = 0;
  groqAvailable = true;
  groqDisabledUntil = 0;
};
