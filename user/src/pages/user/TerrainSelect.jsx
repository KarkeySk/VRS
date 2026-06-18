import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mountain, ArrowRight, ArrowLeft, Navigation, Thermometer, Wind } from 'lucide-react';
import nepalProvincePaths from '../../data/nepalProvincePaths.json';
import { useTheme } from '../../context/ThemeContext';
import { NEPAL_LOCATIONS } from '../../features/chatbot/nepalLocations';

// District → terrain class (1=urban, 2=mid-hill, 3=high-hill, 4=mountain/extreme)
const DISTRICT_TERRAIN = {
    'Mustang': 4, 'Manang': 4, 'Solukhumbu': 4, 'Sankhuwasabha': 4, 'Taplejung': 4,
    'Dolpa': 4, 'Mugu': 4, 'Humla': 4, 'Jumla': 4, 'Kalikot': 4,
    'Rukum West': 4, 'Rukum East': 4, 'Rolpa': 4, 'Bajhang': 4, 'Bajura': 4, 'Darchula': 4,
    'Rasuwa': 3, 'Sindhupalchok': 3, 'Dolakha': 3, 'Ramechhap': 3, 'Gorkha': 3,
    'Lamjung': 3, 'Myagdi': 3, 'Ilam': 3, 'Panchthar': 3, 'Salyan': 3,
    'Jajarkot': 3, 'Dailekh': 3, 'Doti': 3, 'Achham': 3, 'Dadeldhura': 3, 'Baitadi': 3,
    'Kavrepalanchok': 2, 'Makwanpur': 2, 'Sindhuli': 2, 'Nuwakot': 2, 'Dhading': 2,
    'Tanahu': 2, 'Parbat': 2, 'Syangja': 2, 'Baglung': 2, 'Palpa': 2, 'Gulmi': 2,
    'Arghakhanchi': 2, 'Pyuthan': 2, 'Surkhet': 2, 'Okhaldhunga': 2, 'Khotang': 2,
    'Dhankuta': 2, 'Terhathum': 2, 'Bhojpur': 2, 'Udayapur': 2, 'Nawalpur': 2,
};

const getVehicleHint = (district) => {
    const cls = DISTRICT_TERRAIN[district] ?? 1;
    if (cls === 4) return { label: '4WD Jeep Only', color: '#ef4444', icon: '🚙' };
    if (cls === 3) return { label: 'SUV / 4WD Recommended', color: '#f59e0b', icon: '🚗' };
    if (cls === 2) return { label: 'Sedan + SUV', color: '#60a5fa', icon: '🚘' };
    return { label: 'Any Vehicle', color: '#34d399', icon: '🛵' };
};

// Per-province zoom: center point + scale factor
const PROVINCE_ZOOM = {
    koshi:          { cx: 710, cy: 298, scale: 1.8 },
    madhesh:        { cx: 579, cy: 311, scale: 2.6 },
    bagmati:        { cx: 556, cy: 255, scale: 1.9 },
    gandaki:        { cx: 439, cy: 201, scale: 1.8 },
    lumbini:        { cx: 328, cy: 222, scale: 1.8 },
    karnali:        { cx: 285, cy: 154, scale: 1.8 },
    sudurpashchim:  { cx: 176, cy: 81, scale: 1.8 },
};

// Approximate bounding boxes for each province in SVG coordinates [x, y, w, h]
const PROVINCE_BBOX = {
    koshi:          { x: 619, y: 215, w: 170, h: 147 },
    madhesh:        { x: 480, y: 269, w: 211, h: 86 },
    bagmati:        { x: 432, y: 192, w: 221, h: 122 },
    gandaki:        { x: 346, y: 114, w: 193, h: 157 },
    lumbini:        { x: 194, y: 152, w: 247, h: 128 },
    karnali:        { x: 187, y: 20, w: 225, h: 191 },
    sudurpashchim:  { x: 114, y: 18, w: 143, h: 173 },
};

// Geographic center of each district in SVG coordinate space (viewBox 0 0 900 380)
// Derived from actual lat/lon mapped to the hand-drawn SVG province paths
const DISTRICT_CENTERS = {
    // Koshi Province
    'Taplejung':        { x: 758, y: 259 },
    'Panchthar':        { x: 754, y: 298 },
    'Ilam':             { x: 765, y: 317 },
    'Jhapa':            { x: 766, y: 342 },
    'Morang':           { x: 728, y: 340 },
    'Sunsari':          { x: 703, y: 337 },
    'Dhankuta':         { x: 717, y: 308 },
    'Terhathum':        { x: 735, y: 295 },
    'Sankhuwasabha':    { x: 712, y: 259 },
    'Bhojpur':          { x: 672, y: 294 },
    'Solukhumbu':       { x: 666, y: 248 },
    'Okhaldhunga':      { x: 641, y: 280 },
    'Khotang':          { x: 695, y: 293 },
    'Udayapur':         { x: 663, y: 316 },
    // Madhesh Province
    'Saptari':          { x: 634, y: 329 },
    'Siraha':           { x: 570, y: 309 },
    'Dhanusha':         { x: 504, y: 288 },
    'Mahottari':        { x: 528, y: 299 },
    'Sarlahi':          { x: 609, y: 322 },
    'Rautahat':         { x: 591, y: 318 },
    'Bara':             { x: 668, y: 341 },
    'Parsa':            { x: 548, y: 307 },
    // Bagmati Province
    'Sindhuli':         { x: 601, y: 291 },
    'Ramechhap':        { x: 621, y: 265 },
    'Dolakha':          { x: 622, y: 242 },
    'Sindhupalchok':    { x: 584, y: 231 },
    'Kavrepalanchok':   { x: 574, y: 263 },
    'Lalitpur':         { x: 552, y: 247 },
    'Bhaktapur':        { x: 559, y: 251 },
    'Kathmandu':        { x: 542, y: 231 },
    'Nuwakot':          { x: 519, y: 228 },
    'Rasuwa':           { x: 557, y: 209 },
    'Dhading':          { x: 475, y: 259 },
    'Makwanpur':        { x: 551, y: 263 },
    'Chitwan':          { x: 529, y: 268 },
    // Gandaki Province
    'Gorkha':           { x: 475, y: 200 },
    'Manang':           { x: 458, y: 168 },
    'Mustang':          { x: 427, y: 142 },
    'Myagdi':           { x: 394, y: 178 },
    'Kaski':            { x: 439, y: 195 },
    'Lamjung':          { x: 505, y: 198 },
    'Tanahu':           { x: 460, y: 228 },
    'Nawalpur':         { x: 444, y: 250 },
    'Syangja':          { x: 423, y: 222 },
    'Parbat':           { x: 412, y: 207 },
    'Baglung':          { x: 377, y: 195 },
    // Lumbini Province
    'Rukum East':       { x: 354, y: 148 },
    'Rolpa':            { x: 340, y: 168 },
    'Pyuthan':          { x: 325, y: 196 },
    'Gulmi':            { x: 344, y: 215 },
    'Arghakhanchi':     { x: 381, y: 216 },
    'Palpa':            { x: 362, y: 232 },
    'Nawalparasi East': { x: 408, y: 239 },
    'Nawalparasi West': { x: 417, y: 264 },
    'Rupandehi':        { x: 388, y: 260 },
    'Kapilvastu':       { x: 354, y: 255 },
    'Dang':             { x: 222, y: 192 },
    'Banke':            { x: 307, y: 227 },
    'Bardiya':          { x: 258, y: 217 },
    // Karnali Province
    'Dolpa':            { x: 360, y: 127 },
    'Mugu':             { x: 303, y: 89 },
    'Humla':            { x: 262, y: 55 },
    'Jumla':            { x: 290, y: 118 },
    'Kalikot':          { x: 252, y: 125 },
    'Rukum West':       { x: 311, y: 163 },
    'Salyan':           { x: 284, y: 191 },
    'Jajarkot':         { x: 286, y: 152 },
    'Dailekh':          { x: 246, y: 151 },
    'Surkhet':          { x: 238, y: 171 },
    // Sudurpashchim Province
    'Bajura':           { x: 236, y: 94 },
    'Bajhang':          { x: 204, y: 82 },
    'Achham':           { x: 214, y: 131 },
    'Doti':             { x: 180, y: 127 },
    'Kailali':          { x: 179, y: 162 },
    'Kanchanpur':       { x: 133, y: 152 },
    'Dadeldhura':       { x: 146, y: 122 },
    'Baitadi':          { x: 153, y: 98 },
    'Darchula':         { x: 172, y: 62 },
};

// Bounding box of each district polygon (viewBox coords) — bounds the town grid so
// village markers stay inside the district shape.
const DISTRICT_BBOX = {
    // Koshi Province
    'Taplejung':        { x0: 727, y0: 229, x1: 790, y1: 285 },
    'Panchthar':        { x0: 731, y0: 272, x1: 779, y1: 319 },
    'Ilam':             { x0: 740, y0: 299, x1: 788, y1: 335 },
    'Jhapa':            { x0: 743, y0: 324, x1: 788, y1: 360 },
    'Morang':           { x0: 710, y0: 318, x1: 747, y1: 362 },
    'Sunsari':          { x0: 681, y0: 318, x1: 719, y1: 357 },
    'Dhankuta':         { x0: 703, y0: 292, x1: 737, y1: 320 },
    'Terhathum':        { x0: 722, y0: 283, x1: 752, y1: 310 },
    'Sankhuwasabha':    { x0: 685, y0: 228, x1: 745, y1: 296 },
    'Bhojpur':          { x0: 642, y0: 271, x1: 687, y1: 318 },
    'Solukhumbu':       { x0: 636, y0: 215, x1: 690, y1: 279 },
    'Okhaldhunga':      { x0: 624, y0: 264, x1: 663, y1: 295 },
    'Khotang':          { x0: 682, y0: 269, x1: 712, y1: 317 },
    'Udayapur':         { x0: 619, y0: 293, x1: 703, y1: 334 },
    // Madhesh Province
    'Saptari':          { x0: 617, y0: 313, x1: 652, y1: 344 },
    'Siraha':           { x0: 550, y0: 291, x1: 591, y1: 328 },
    'Dhanusha':         { x0: 480, y0: 269, x1: 520, y1: 309 },
    'Mahottari':        { x0: 512, y0: 277, x1: 544, y1: 320 },
    'Sarlahi':          { x0: 594, y0: 297, x1: 627, y1: 344 },
    'Rautahat':         { x0: 579, y0: 294, x1: 601, y1: 341 },
    'Bara':             { x0: 646, y0: 325, x1: 691, y1: 356 },
    'Parsa':            { x0: 536, y0: 288, x1: 564, y1: 329 },
    // Bagmati Province
    'Sindhuli':         { x0: 557, y0: 270, x1: 638, y1: 314 },
    'Ramechhap':        { x0: 589, y0: 238, x1: 654, y1: 287 },
    'Dolakha':          { x0: 596, y0: 210, x1: 652, y1: 268 },
    'Sindhupalchok':    { x0: 559, y0: 207, x1: 611, y1: 257 },
    'Kavrepalanchok':   { x0: 555, y0: 245, x1: 596, y1: 280 },
    'Lalitpur':         { x0: 538, y0: 239, x1: 570, y1: 260 },
    'Bhaktapur':        { x0: 552, y0: 247, x1: 566, y1: 256 },
    'Kathmandu':        { x0: 522, y0: 217, x1: 564, y1: 244 },
    'Nuwakot':          { x0: 491, y0: 195, x1: 545, y1: 252 },
    'Rasuwa':           { x0: 533, y0: 192, x1: 589, y1: 227 },
    'Dhading':          { x0: 432, y0: 234, x1: 506, y1: 278 },
    'Makwanpur':        { x0: 542, y0: 250, x1: 560, y1: 274 },
    'Chitwan':          { x0: 495, y0: 248, x1: 565, y1: 294 },
    // Gandaki Province
    'Gorkha':           { x0: 455, y0: 182, x1: 496, y1: 219 },
    'Manang':           { x0: 423, y0: 149, x1: 486, y1: 187 },
    'Mustang':          { x0: 396, y0: 114, x1: 460, y1: 177 },
    'Myagdi':           { x0: 364, y0: 158, x1: 428, y1: 199 },
    'Kaski':            { x0: 415, y0: 173, x1: 462, y1: 217 },
    'Lamjung':          { x0: 474, y0: 162, x1: 539, y1: 241 },
    'Tanahu':           { x0: 434, y0: 213, x1: 485, y1: 245 },
    'Nawalpur':         { x0: 413, y0: 235, x1: 475, y1: 271 },
    'Syangja':          { x0: 393, y0: 206, x1: 442, y1: 235 },
    'Parbat':           { x0: 402, y0: 191, x1: 424, y1: 224 },
    'Baglung':          { x0: 346, y0: 172, x1: 412, y1: 218 },
    // Lumbini Province
    'Rukum East':       { x0: 338, y0: 137, x1: 370, y1: 159 },
    'Rolpa':            { x0: 313, y0: 152, x1: 368, y1: 184 },
    'Pyuthan':          { x0: 302, y0: 178, x1: 352, y1: 216 },
    'Gulmi':            { x0: 322, y0: 194, x1: 364, y1: 234 },
    'Arghakhanchi':     { x0: 358, y0: 202, x1: 406, y1: 230 },
    'Palpa':            { x0: 335, y0: 215, x1: 383, y1: 244 },
    'Nawalparasi East': { x0: 376, y0: 228, x1: 441, y1: 252 },
    'Nawalparasi West': { x0: 403, y0: 250, x1: 430, y1: 279 },
    'Rupandehi':        { x0: 373, y0: 244, x1: 408, y1: 280 },
    'Kapilvastu':       { x0: 330, y0: 239, x1: 375, y1: 272 },
    'Dang':             { x0: 194, y0: 168, x1: 253, y1: 218 },
    'Banke':            { x0: 273, y0: 203, x1: 340, y1: 251 },
    'Bardiya':          { x0: 231, y0: 196, x1: 288, y1: 236 },
    // Karnali Province
    'Dolpa':            { x0: 305, y0: 82, x1: 412, y1: 164 },
    'Mugu':             { x0: 253, y0: 60, x1: 341, y1: 108 },
    'Humla':            { x0: 211, y0: 20, x1: 314, y1: 90 },
    'Jumla':            { x0: 260, y0: 98, x1: 322, y1: 143 },
    'Kalikot':          { x0: 229, y0: 102, x1: 274, y1: 143 },
    'Rukum West':       { x0: 288, y0: 142, x1: 331, y1: 180 },
    'Salyan':           { x0: 251, y0: 171, x1: 309, y1: 211 },
    'Jajarkot':         { x0: 259, y0: 130, x1: 321, y1: 173 },
    'Dailekh':          { x0: 224, y0: 130, x1: 266, y1: 171 },
    'Surkhet':          { x0: 187, y0: 143, x1: 275, y1: 196 },
    // Sudurpashchim Province
    'Bajura':           { x0: 203, y0: 62, x1: 256, y1: 118 },
    'Bajhang':          { x0: 168, y0: 53, x1: 236, y1: 108 },
    'Achham':           { x0: 191, y0: 109, x1: 237, y1: 162 },
    'Doti':             { x0: 150, y0: 104, x1: 205, y1: 147 },
    'Kailali':          { x0: 145, y0: 136, x1: 213, y1: 191 },
    'Kanchanpur':       { x0: 114, y0: 130, x1: 152, y1: 177 },
    'Dadeldhura':       { x0: 121, y0: 106, x1: 171, y1: 141 },
    'Baitadi':          { x0: 126, y0: 82, x1: 181, y1: 114 },
    'Darchula':         { x0: 136, y0: 18, x1: 198, y1: 90 },
};

// Return district positions using real geographic centers (falls back to bbox center)
const getDistrictPositions = (provinceId, districts) => {
    const bbox = PROVINCE_BBOX[provinceId];
    if (!districts.length) return [];
    return districts.map((dist) => {
        const center = DISTRICT_CENTERS[dist];
        if (center) return { district: dist, x: center.x, y: center.y, box: DISTRICT_BBOX[dist] };
        // Fallback: province bbox center
        return { district: dist, x: (bbox?.x ?? 450) + (bbox?.w ?? 0) / 2, y: (bbox?.y ?? 190) + (bbox?.h ?? 0) / 2 };
    });
};

const provinceImages = {
    koshi: [
        'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    ],
    madhesh: [
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    ],
    bagmati: [
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=900&q=80',
    ],
    gandaki: [
        'https://images.unsplash.com/photo-1464822759844-d150ad6d4c06?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508261305436-58d85039f88a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=900&q=80',
    ],
    lumbini: [
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    ],
    karnali: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    ],
    sudurpashchim: [
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    ],
};

const regions = [
    {
        id: 'koshi',
        name: 'Koshi Province',
        label: 'Province 1',
        terrain: 'Ice Peaks',
        altitude: '8,848m',
        temp: '-26°C',
        routes: ['Everest Base Camp', 'Kanchenjunga Trek', 'Namche Bazaar'],
        desc: 'Home to Mt. Everest. Very high roads with snow and rough tracks.',
        color: '#60a5fa',
        path: 'M748,132 L785,90 L850,115 L885,150 L875,188 L850,220 L825,245 L840,272 L810,305 L752,322 L742,238 L760,205 L742,170 Z',
    },
    {
        id: 'madhesh',
        name: 'Madhesh Province',
        label: 'Province 2',
        terrain: 'Valley Passes',
        altitude: '60m',
        temp: '38°C',
        routes: ['Janakpur Circuit', 'Rajbiraj Wetlands', 'Birgunj–Raxaul Corridor'],
        desc: 'Flat Terai plains with smooth roads and warm weather.',
        color: '#34d399',
        path: 'M372,280 L438,272 L500,266 L562,270 L628,266 L688,260 L742,238 L752,322 L688,316 L628,325 L562,318 L500,326 L435,320 L372,326 Z',
    },
    {
        id: 'bagmati',
        name: 'Bagmati Province',
        label: 'Province 3',
        terrain: 'All Terrain',
        altitude: '1,400m',
        temp: '22°C',
        routes: ['Kathmandu Valley', 'Nagarkot Sunrise', 'Langtang Valley', 'Helambu Trek'],
        desc: 'Nepal\'s capital area with city roads, highways, and some mountain tracks.',
        color: '#e8732a',
        path: 'M548,138 L575,90 L650,85 L715,95 L748,132 L742,170 L760,205 L742,238 L705,254 L645,262 L585,254 L552,205 L540,170 Z',
    },
    {
        id: 'gandaki',
        name: 'Gandaki Province',
        label: 'Province 4',
        terrain: 'Ice Peaks',
        altitude: '8,167m',
        temp: '-18°C',
        routes: ['Annapurna Circuit', 'Upper Mustang', 'Pokhara Lakeside', 'Jomsom Highway'],
        desc: 'Annapurna and Mustang area with famous off-road routes.',
        color: '#818cf8',
        path: 'M388,118 L430,88 L500,80 L545,90 L548,138 L540,170 L552,205 L535,238 L500,252 L438,248 L395,232 L372,230 L360,194 L378,158 Z',
    },
    {
        id: 'lumbini',
        name: 'Lumbini Province',
        label: 'Province 5',
        terrain: 'Valley Passes',
        altitude: '150m',
        temp: '34°C',
        routes: ['Lumbini (Buddha Birthplace)', 'Palpa Hill Station', 'Siddhartha Highway'],
        desc: 'Southern plains with historic places, smooth highways, and easy hill roads.',
        color: '#f59e0b',
        path: 'M170,230 L205,250 L245,270 L300,276 L350,262 L372,280 L372,326 L308,320 L244,330 L182,323 L128,312 L165,268 Z',
    },
    {
        id: 'karnali',
        name: 'Karnali Province',
        label: 'Province 6',
        terrain: 'All Terrain',
        altitude: '4,200m',
        temp: '-8°C',
        routes: ['Rara Lake', 'Dolpo Trek', 'Jumla–Humla Trail', 'Shey Phoksundo'],
        desc: 'A remote and rough area with very few roads. Strong vehicles are best here.',
        color: '#f472b6',
        path: 'M130,110 L185,100 L235,88 L300,95 L360,82 L388,118 L378,158 L360,194 L372,230 L350,262 L300,276 L245,270 L205,250 L170,230 L158,190 L160,150 Z',
    },
    {
        id: 'sudurpashchim',
        name: 'Sudurpashchim Province',
        label: 'Province 7',
        terrain: 'All Terrain',
        altitude: '7,132m',
        temp: '-12°C',
        routes: ['Api Nampa Conservation', 'Khaptad National Park', 'Mahakali Corridor'],
        desc: 'Far-west Nepal with mountain trails and hard border routes.',
        color: '#a78bfa',
        path: 'M20,205 L45,160 L85,130 L130,110 L160,150 L158,190 L170,230 L165,268 L128,312 L88,294 L58,268 L35,238 Z',
    },
];

// Spread town labels in a tight grid around the district's geographic center
const getTownPositions = (districtPos, towns) => {
    if (!districtPos || !towns.length) return [];
    const { x, y, box } = districtPos;
    const cols = Math.ceil(Math.sqrt(towns.length * 1.2));
    const rows = Math.ceil(towns.length / cols);
    // Default spread: wider horizontally, tighter vertically (matches Nepal's east-west elongation)
    let sx = 9, sy = 6.5;
    // Clamp the grid to the district's polygon bounding box so villages stay inside the shape.
    // Centred on the centroid, the symmetric spread is limited by the nearest box edge.
    if (box) {
        const padX = (box.x1 - box.x0) * 0.14;
        const padY = (box.y1 - box.y0) * 0.14;
        const halfW = Math.max(0, Math.min(x - box.x0, box.x1 - x) - padX);
        const halfH = Math.max(0, Math.min(y - box.y0, box.y1 - y) - padY);
        if (cols > 1) sx = Math.min(sx, (2 * halfW) / (cols - 1));
        if (rows > 1) sy = Math.min(sy, (2 * halfH) / (rows - 1));
    }
    return towns.map((town, i) => ({
        town,
        x: x - ((cols - 1) * sx) / 2 + (i % cols) * sx,
        y: y - ((rows - 1) * sy) / 2 + Math.floor(i / cols) * sy,
    }));
};

export default function TerrainSelect() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [hovered, setHovered] = useState(null);
    const [selected, setSelected] = useState(null);       // province id
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedTown, setSelectedTown] = useState(null);
    const [wheelType, setWheelType] = useState('all');

    const lockedRegion = regions.find((r) => r.id === selected);
    const activeImages = lockedRegion ? (provinceImages[lockedRegion.id] || []) : [];

    const districtMap = lockedRegion ? (NEPAL_LOCATIONS[lockedRegion.name] ?? {}) : {};
    const districtList = Object.keys(districtMap);
    const placeList = selectedDistrict ? (districtMap[selectedDistrict] ?? []) : [];
    const vehicleHint = selectedDistrict ? getVehicleHint(selectedDistrict) : null;

    // Computed positions for labels at each zoom level
    const districtPositions = selected ? getDistrictPositions(selected, districtList) : [];
    const selectedDistrictPos = districtPositions.find((d) => d.district === selectedDistrict);
    const townPositions = selectedDistrictPos ? getTownPositions(selectedDistrictPos, placeList) : [];
    const selectedTownPos = townPositions.find((t) => t.town === selectedTown);

    // Compute SVG zoom transform based on current selection depth
    const computeMapTransform = () => {
        if (!selected) return 'translate(0,0) scale(1)';
        const pz = PROVINCE_ZOOM[selected];
        if (!selectedDistrict || !selectedDistrictPos) {
            return `translate(${450 - pz.cx * pz.scale}, ${190 - pz.cy * pz.scale}) scale(${pz.scale})`;
        }
        const ds = pz.scale * 2.1;
        if (!selectedTown || !selectedTownPos) {
            return `translate(${450 - selectedDistrictPos.x * ds}, ${190 - selectedDistrictPos.y * ds}) scale(${ds})`;
        }
        const ts = ds * 1.6;
        return `translate(${450 - selectedTownPos.x * ts}, ${190 - selectedTownPos.y * ts}) scale(${ts})`;
    };
    const mapTransform = computeMapTransform();

    // Theme-aware SVG values
    const svgOutlineStroke = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.2)';
    const svgFillInactive = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)';
    const svgStrokeInactive = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
    const svgShadeStop1 = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
    const svgShadeStop2 = isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)';
    const labelFillActive = isDark ? '#fff' : '#111';
    const labelFillInactive = isDark ? '#888' : '#555';
    const compassColor = isDark ? '#888' : '#555';
    const compassLineStroke = isDark ? '#666' : '#999';

    const handleSelect = (regionId) => {
        setSelected(regionId);
        setSelectedDistrict(null);
        setSelectedTown(null);
        setHovered(null);
    };

    const handleBackToProvinces = () => { setSelected(null); setSelectedDistrict(null); setSelectedTown(null); };
    const handleBackToDistricts = () => { setSelectedDistrict(null); setSelectedTown(null); };
    const handleBackToTowns    = () => { setSelectedTown(null); };

    const handleAIRecommend = () => {
        if (!lockedRegion) return;
        const province = selectedTown
            ? `${selectedTown}, ${selectedDistrict}, ${lockedRegion.name}`
            : selectedDistrict
                ? `${selectedDistrict}, ${lockedRegion.name}`
                : lockedRegion.name;
        const routes = selectedTown
            ? [selectedTown]
            : selectedDistrict
                ? placeList.slice(0, 4)
                : lockedRegion.routes;
        const desc = selectedTown
            ? `${selectedTown} village/town in ${selectedDistrict} district — ${lockedRegion.desc}`
            : selectedDistrict
                ? `${selectedDistrict} district — ${lockedRegion.desc}`
                : lockedRegion.desc;
        const params = new URLSearchParams({
            province, terrain: lockedRegion.terrain, altitude: lockedRegion.altitude,
            temp: lockedRegion.temp, routes: routes.join(','), desc, color: lockedRegion.color,
        });
        navigate(`/recommend?${params.toString()}`);
    };

    const provinceCenters = {
        koshi: [710, 298],
        madhesh: [579, 311],
        bagmati: [556, 255],
        gandaki: [439, 201],
        lumbini: [328, 222],
        karnali: [285, 154],
        sudurpashchim: [176, 81],
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent-subtle)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', color: 'var(--accent)', marginBottom: '16px', border: '1px solid var(--accent-subtle)' }}>
                        <MapPin size={12} /> PICK YOUR AREA
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>
                        Where in Nepal?
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                        Click a province to see routes and find the best vehicle for your road type.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

                    {/* Map — sticky so it stays visible while the panel scrolls */}
                    <div style={{ flex: '0 0 52%', position: 'sticky', top: '88px' }}>
                        <div style={{
                            background: 'var(--bg-card)', borderRadius: '24px', padding: '24px',
                            border: '1px solid var(--border)', position: 'relative',
                        }}>
                            {/* Wrapper clips labels that overflow the card; SVG itself is visible */}
                            <div style={{ overflow: 'hidden', borderRadius: '12px' }}>
                            <svg viewBox="0 0 900 380" style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block' }}>
                                <defs>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                    <linearGradient id="nepalMapShade" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: svgShadeStop1 }} />
                                        <stop offset="100%" style={{ stopColor: svgShadeStop2 }} />
                                    </linearGradient>
                                </defs>

                                {/* Zoomable map group — no clipPath so labels at edges remain visible */}
                                <g
                                    style={{
                                        transform: mapTransform,
                                        transformOrigin: '0px 0px',
                                        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                >
                                    {/* Nepal silhouette */}
                                    <path
                                        d={nepalProvincePaths.outline}
                                        fill="url(#nepalMapShade)"
                                        stroke={svgOutlineStroke}
                                        strokeWidth="1.3"
                                    />

                                    {/* Province shapes */}
                                    {regions.map((region) => {
                                        const isHovered = hovered === region.id;
                                        const isSelected = selected === region.id;
                                        const isActive = isHovered || isSelected;
                                        return (
                                            <g key={region.id}>
                                                <path
                                                    d={nepalProvincePaths.paths[region.id] || region.path}
                                                    fill={isActive ? region.color + '28' : svgFillInactive}
                                                    stroke={isActive ? region.color : svgStrokeInactive}
                                                    strokeWidth={isActive ? 2.5 : 1}
                                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease', filter: isActive ? 'url(#glow)' : 'none' }}
                                                    onMouseEnter={() => !selected && setHovered(region.id)}
                                                    onMouseLeave={() => setHovered(null)}
                                                    onClick={() => handleSelect(region.id)}
                                                />
                                            </g>
                                        );
                                    })}

                                    {/* Province labels — always shown; scale adapts to zoom level */}
                                    {regions.map((region) => {
                                        const isActive = hovered === region.id;
                                        const isSelectedProv = selected === region.id;
                                        // When province is zoomed in, shrink font so it fits inside; hide others
                                        if (selected && !isSelectedProv) return null;
                                        const [cx, cy] = provinceCenters[region.id];
                                        // At district zoom the label is very small (inverse of scale)
                                        const fontSize = selected ? (selectedDistrict ? '3.5' : '6') : (isActive ? '11' : '9');
                                        const fontWeight = (isActive || isSelectedProv) ? '700' : '500';
                                        const fill = isSelectedProv ? (lockedRegion?.color ?? labelFillActive) : isActive ? labelFillActive : labelFillInactive;
                                        return (
                                            <g key={region.id + '-label'} style={{ pointerEvents: 'none' }}>
                                                {/* Small pill behind label for readability when zoomed */}
                                                {isSelectedProv && (
                                                    <rect
                                                        x={cx - region.name.replace(' Province','').length * (selected ? 1.8 : 3.5) - 4}
                                                        y={cy - 2}
                                                        width={region.name.replace(' Province','').length * (selected ? 3.6 : 7) + 8}
                                                        height={selected ? 8 : 14}
                                                        rx={selected ? 4 : 7}
                                                        fill={isDark ? 'rgba(10,10,10,0.55)' : 'rgba(255,255,255,0.65)'}
                                                    />
                                                )}
                                                <text x={cx} y={cy + (selected ? 5 : 6)}
                                                    textAnchor="middle"
                                                    fill={fill}
                                                    fontSize={fontSize}
                                                    fontWeight={fontWeight}
                                                    fontFamily="Inter, sans-serif"
                                                    style={{ transition: 'all 0.3s' }}>
                                                    {region.name.replace(' Province', '')}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* LEVEL 2 — District labels (shown when province is zoomed, no district selected yet) */}
                                    {selected && !selectedDistrict && districtPositions.map(({ district, x, y }) => {
                                        const hint = getVehicleHint(district);
                                        const lw = Math.min(district.length * 4.8 + 14, 88);
                                        return (
                                            <g key={district} style={{ cursor: 'pointer' }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedDistrict(district); setSelectedTown(null); }}>
                                                {/* Pulse ring */}
                                                <circle cx={x} cy={y} r={4} fill={hint.color + '30'} stroke={hint.color + '60'} strokeWidth={0.8} />
                                                <circle cx={x} cy={y} r={2} fill={hint.color} />
                                                {/* Label badge */}
                                                <rect x={x - lw / 2} y={y + 5} width={lw} height={15} rx={7.5}
                                                    fill={isDark ? 'rgba(15,15,15,0.88)' : 'rgba(255,255,255,0.93)'}
                                                    stroke={hint.color + '90'} strokeWidth={0.8} />
                                                <text x={x} y={y + 15} textAnchor="middle"
                                                    fill={hint.color} fontSize="5.8" fontWeight="700" fontFamily="Inter, sans-serif"
                                                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                                                    {district.length > 14 ? district.slice(0, 13) + '…' : district}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* LEVEL 3 — Town/village labels (shown when district is zoomed) */}
                                    {selected && selectedDistrict && townPositions.map(({ town, x, y }) => {
                                        const isSelTown = selectedTown === town;
                                        const tw = Math.min(town.length * 4.2 + 12, 80);
                                        const color = lockedRegion?.color ?? '#e8732a';
                                        return (
                                            <g key={town} style={{ cursor: 'pointer' }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedTown(town); }}>
                                                {/* Highlight ring for selected town */}
                                                {isSelTown && <circle cx={x} cy={y} r={5.5} fill={color + '25'} stroke={color} strokeWidth={1} />}
                                                <circle cx={x} cy={y} r={isSelTown ? 2.8 : 1.8}
                                                    fill={isSelTown ? color : color + 'aa'} />
                                                {/* Town label */}
                                                <rect x={x - tw / 2} y={y + 4} width={tw} height={13} rx={6.5}
                                                    fill={isSelTown ? color : isDark ? 'rgba(15,15,15,0.88)' : 'rgba(255,255,255,0.93)'}
                                                    stroke={color + (isSelTown ? 'ff' : '70')} strokeWidth={isSelTown ? 1 : 0.7} />
                                                <text x={x} y={y + 13} textAnchor="middle"
                                                    fill={isSelTown ? '#fff' : color} fontSize="4.8" fontWeight="700" fontFamily="Inter, sans-serif"
                                                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                                                    {town.length > 16 ? town.slice(0, 15) + '…' : town}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </g>

                                {/* Compass (fixed, outside zoom group) */}
                                <g transform="translate(860, 346)">
                                    <text textAnchor="middle" fill={compassColor} fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">N</text>
                                    <line x1="0" y1="5" x2="0" y2="18" stroke={compassLineStroke} strokeWidth="1" />
                                    <polygon points="0,5 -3,12 3,12" fill={compassColor} />
                                </g>

                                {/* Breadcrumb navigation overlay */}
                                {selected && (() => {
                                    const color = lockedRegion?.color ?? '#e8732a';
                                    const bg = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.9)';
                                    const crumbs = [
                                        { label: 'Nepal', onClick: handleBackToProvinces },
                                        { label: lockedRegion?.name?.replace(' Province', '') ?? '', onClick: handleBackToDistricts },
                                        selectedDistrict && { label: selectedDistrict, onClick: handleBackToTowns },
                                        selectedTown && { label: selectedTown, onClick: null },
                                    ].filter(Boolean);

                                    const fullLabel = crumbs.map(c => c.label).join(' › ');
                                    const w = Math.min(fullLabel.length * 6 + 20, 260);
                                    return (
                                        <g>
                                            <rect x="8" y="8" width={w} height="22" rx="6" fill={bg} stroke={color} strokeWidth="1" />
                                            {crumbs.map((crumb, i) => {
                                                const prevLen = crumbs.slice(0, i).map(c => c.label).join(' › ').length;
                                                const xOffset = 14 + prevLen * 6 + (i > 0 ? 18 : 0);
                                                return (
                                                    <g key={i}>
                                                        {i > 0 && (
                                                            <text x={xOffset - 12} y="22" fontSize="9" fill={color + '80'} fontFamily="Inter, sans-serif">›</text>
                                                        )}
                                                        <text
                                                            x={xOffset} y="22" fontSize="9" fontWeight="700"
                                                            fontFamily="Inter, sans-serif"
                                                            fill={i === crumbs.length - 1 ? color : color + 'bb'}
                                                            style={{ cursor: crumb.onClick ? 'pointer' : 'default' }}
                                                            onClick={crumb.onClick ?? undefined}
                                                        >
                                                            {i === 0 ? '← ' : ''}{crumb.label}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </g>
                                    );
                                })()}
                            </svg>
                            </div>{/* end overflow-hidden wrapper */}
                        </div>

                        {/* Selected location display — outside and below the map card */}
                        {selected && (
                            <div style={{
                                marginTop: '14px',
                                padding: '12px 18px',
                                borderRadius: '14px',
                                background: `linear-gradient(120deg, ${lockedRegion?.color}18, ${lockedRegion?.color}08)`,
                                border: `1px solid ${lockedRegion?.color}35`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}>
                                <MapPin size={14} color={lockedRegion?.color} style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '0.58rem', fontWeight: '700', letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Selected Location</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: lockedRegion?.color }}>
                                            {lockedRegion?.name}
                                        </span>
                                        {selectedDistrict && (
                                            <>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>›</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedDistrict}</span>
                                            </>
                                        )}
                                        {selectedTown && (
                                            <>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>›</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: lockedRegion?.color }}>{selectedTown}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                            {[
                                { label: 'Ice Peaks', color: '#60a5fa' },
                                { label: 'All Terrain', color: '#e8732a' },
                                { label: 'Valley Passes', color: '#34d399' },
                            ].map((l) => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Panel — 3-step drill-down */}
                    <div style={{ flex: '1 1 0', minWidth: '280px' }}>

                        {/* STEP 0 — no province selected */}
                        {!selected && (
                            <div style={{
                                background: 'var(--bg-card)', borderRadius: '20px', padding: '32px 20px',
                                border: '1px solid var(--border)', textAlign: 'center',
                            }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'var(--bg-glass)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                    border: '1px solid var(--border)',
                                }}>
                                    <MapPin size={28} color="var(--text-muted)" />
                                </div>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>
                                    Step 1 — Pick a Province
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Click any province on the map. Then select a district, then a town — and we'll recommend the perfect vehicle.
                                </p>
                                {/* Step indicator */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
                                    {['Province', 'District', 'Vehicle'].map((s, i) => (
                                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{
                                                width: '22px', height: '22px', borderRadius: '50%',
                                                background: i === 0 ? 'var(--accent)' : 'var(--bg-glass)',
                                                border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6rem', fontWeight: '700',
                                                color: i === 0 ? '#fff' : 'var(--text-muted)',
                                            }}>{i + 1}</div>
                                            <span style={{ fontSize: '0.65rem', color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: '600' }}>{s}</span>
                                            {i < 2 && <ArrowRight size={10} color="var(--text-muted)" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 1 — Province selected, pick district */}
                        {selected && !selectedDistrict && lockedRegion && (
                            <div style={{
                                background: 'var(--bg-card)', borderRadius: '20px', padding: '18px',
                                border: `1px solid ${lockedRegion.color}25`,
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <button onClick={handleBackToProvinces} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                                    }}>
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '10px',
                                        background: lockedRegion.color + '15', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        border: `1px solid ${lockedRegion.color}30`, flexShrink: 0,
                                    }}>
                                        <Mountain size={15} color={lockedRegion.color} />
                                    </div>
                                    <div>
                                        <h2 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>{lockedRegion.name}</h2>
                                        <span style={{ fontSize: '0.58rem', fontWeight: '700', letterSpacing: '1px', color: lockedRegion.color, textTransform: 'uppercase' }}>{lockedRegion.terrain}</span>
                                    </div>
                                </div>

                                {/* Images */}
                                {activeImages.length > 0 && (
                                    <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '10px' }}>
                                        <img src={activeImages[0]} alt="" loading="lazy" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: '1 / -1' }} />
                                        {activeImages.slice(1, 3).map((url, i) => (
                                            <img key={i} src={url} alt="" loading="lazy" style={{ width: '100%', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                                        ))}
                                    </div>
                                )}

                                {/* Step 2 instruction */}
                                <div style={{ padding: '10px 12px', borderRadius: '10px', background: lockedRegion.color + '10', border: `1px dashed ${lockedRegion.color}50`, marginBottom: '10px', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <span style={{ color: lockedRegion.color, fontWeight: '700' }}>Step 2 —</span> Click a district label on the map, or pick from the list below.
                                </div>

                                {/* District grid */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '260px', overflowY: 'auto', paddingRight: '2px' }}>
                                    {districtList.map((dist) => {
                                        const hint = getVehicleHint(dist);
                                        return (
                                            <button
                                                key={dist}
                                                onClick={() => setSelectedDistrict(dist)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '8px 12px', borderRadius: '10px',
                                                    background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                                    cursor: 'pointer', width: '100%', textAlign: 'left',
                                                    transition: 'background 0.15s, border-color 0.15s',
                                                    fontFamily: "'Inter', sans-serif",
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = lockedRegion.color + '12'; e.currentTarget.style.borderColor = lockedRegion.color + '50'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                            >
                                                <MapPin size={12} color={lockedRegion.color} style={{ flexShrink: 0 }} />
                                                <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: '500' }}>{dist}</span>
                                                <span style={{ fontSize: '0.6rem', fontWeight: '700', color: hint.color, background: hint.color + '15', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{hint.icon}</span>
                                                <ArrowRight size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 3 — Town selected → recommend */}
                        {selected && selectedDistrict && selectedTown && lockedRegion && (
                            <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '18px', border: `1px solid ${lockedRegion.color}25` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <button onClick={handleBackToTowns} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}>
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div>
                                        <h2 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>{selectedTown}</h2>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{selectedDistrict} · {lockedRegion.name}</span>
                                    </div>
                                </div>

                                {vehicleHint && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', background: vehicleHint.color + '12', border: `1px solid ${vehicleHint.color}30` }}>
                                        <span style={{ fontSize: '1.3rem' }}>{vehicleHint.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Best vehicle for this area</div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: vehicleHint.color }}>{vehicleHint.label}</div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginBottom: '14px' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Vehicle Kind</div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[{ id: 'all', label: 'All' }, { id: 'four', label: 'Four Wheeler' }, { id: 'two', label: 'Two Wheeler' }].map((item) => (
                                            <button key={item.id} onClick={() => setWheelType(item.id)} style={{
                                                padding: '7px 12px', borderRadius: '999px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                                border: wheelType === item.id ? `1px solid ${lockedRegion.color}` : '1px solid var(--border)',
                                                background: wheelType === item.id ? `${lockedRegion.color}20` : 'transparent',
                                                color: wheelType === item.id ? lockedRegion.color : 'var(--text-secondary)',
                                                fontSize: '0.72rem', fontWeight: '700',
                                            }}>{item.label}</button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleAIRecommend} style={{
                                    width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${lockedRegion.color}cc, ${lockedRegion.color})`,
                                    color: '#fff', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: `0 6px 20px ${lockedRegion.color}40`, fontFamily: "'Inter', sans-serif",
                                    transition: 'transform 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    ✦ Get AI Vehicle Recommendation <ArrowRight size={15} />
                                </button>
                            </div>
                        )}

                        {/* STEP 2 — District selected, pick town on map */}
                        {selected && selectedDistrict && !selectedTown && lockedRegion && (
                            <div style={{
                                background: 'var(--bg-card)', borderRadius: '20px', padding: '18px',
                                border: `1px solid ${lockedRegion.color}25`,
                            }}>
                                {/* Header with back */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <button onClick={handleBackToDistricts} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                                    }}>
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div>
                                        <h2 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>{selectedDistrict}</h2>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{lockedRegion.name}</span>
                                    </div>
                                </div>

                                {/* Vehicle hint badge */}
                                {vehicleHint && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 14px', borderRadius: '12px', marginBottom: '12px',
                                        background: vehicleHint.color + '12', border: `1px solid ${vehicleHint.color}30`,
                                    }}>
                                        <span style={{ fontSize: '1.1rem' }}>{vehicleHint.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Vehicle</div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: vehicleHint.color }}>{vehicleHint.label}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Instruction to click town on map */}
                                <div style={{ padding: '10px 12px', borderRadius: '10px', background: lockedRegion.color + '10', border: `1px dashed ${lockedRegion.color}50`, marginBottom: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <span style={{ color: lockedRegion.color, fontWeight: '700' }}>Step 3 —</span> Click any town or village on the map to pinpoint your location and get a vehicle recommendation.
                                </div>

                                {/* Towns & Villages as clickable chips (alternative to map click) */}
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                                    Towns & Villages
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', maxHeight: '140px', overflowY: 'auto' }}>
                                    {placeList.map((place) => (
                                        <button
                                            key={place}
                                            onClick={() => setSelectedTown(place)}
                                            style={{
                                                padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
                                                background: 'var(--bg-glass)', border: `1px solid ${lockedRegion.color}40`,
                                                fontSize: '0.72rem', color: lockedRegion.color, fontWeight: '600',
                                                fontFamily: "'Inter', sans-serif", transition: 'background 0.15s',
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = lockedRegion.color + '15'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                                        >
                                            {place}
                                        </button>
                                    ))}
                                </div>

                                {/* Vehicle Kind */}
                                <div style={{ marginBottom: '14px' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Vehicle Kind</div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[{ id: 'all', label: 'All' }, { id: 'four', label: 'Four Wheeler' }, { id: 'two', label: 'Two Wheeler' }].map((item) => (
                                            <button key={item.id} onClick={() => setWheelType(item.id)} style={{
                                                padding: '7px 12px', borderRadius: '999px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                                border: wheelType === item.id ? `1px solid ${lockedRegion.color}` : '1px solid var(--border)',
                                                background: wheelType === item.id ? `${lockedRegion.color}20` : 'transparent',
                                                color: wheelType === item.id ? lockedRegion.color : 'var(--text-secondary)',
                                                fontSize: '0.72rem', fontWeight: '700',
                                            }}>{item.label}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA — AI Recommend */}
                                <button onClick={handleAIRecommend} style={{
                                    width: '100%', padding: '13px', border: 'none', borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${lockedRegion.color}cc, ${lockedRegion.color})`,
                                    color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: `0 6px 18px ${lockedRegion.color}35`,
                                    transition: 'transform 0.2s, box-shadow 0.2s', fontFamily: "'Inter', sans-serif",
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${lockedRegion.color}45`; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 18px ${lockedRegion.color}35`; }}
                                >
                                    ✦ Get AI Vehicle Recommendation <ArrowRight size={15} />
                                </button>

                                <button
                                    onClick={() => navigate(`/vehicles?terrain=${encodeURIComponent(lockedRegion.terrain)}&region=${encodeURIComponent(selectedDistrict)}&wheels=${wheelType}`)}
                                    style={{
                                        width: '100%', padding: '11px', border: '1px solid var(--border)', borderRadius: '12px',
                                        background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem',
                                        fontWeight: '600', cursor: 'pointer', marginTop: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        fontFamily: "'Inter', sans-serif", transition: 'color 0.2s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                >
                                    Browse All Vehicles <ArrowRight size={14} />
                                </button>
                            </div>
                        )}

                        {/* Skip button */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button onClick={() => navigate('/vehicles')} style={{
                                background: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '999px',
                                fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                                transition: 'color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                Skip - See All Vehicles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
