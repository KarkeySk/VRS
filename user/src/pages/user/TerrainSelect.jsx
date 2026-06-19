import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mountain, ArrowRight, ArrowLeft, Navigation, Thermometer, Wind, Search, X } from 'lucide-react';
import nepalProvincePaths from '../../data/nepalProvincePaths.json';
import { useTheme } from '../../context/ThemeContext';
import { useViewport } from '../../hooks/useViewport';
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
    koshi:          { cx: 704, cy: 288, scale: 2.2 },
    madhesh:        { cx: 585, cy: 312, scale: 3.63 },
    bagmati:        { cx: 543, cy: 253, scale: 2.64 },
    gandaki:        { cx: 442, cy: 192, scale: 2.05 },
    lumbini:        { cx: 318, cy: 216, scale: 2.53 },
    karnali:        { cx: 300, cy: 116, scale: 1.69 },
    sudurpashchim:  { cx: 185, cy: 105, scale: 1.86 },
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
    'Taplejung':          { x: 756.3, y: 264.2 },
    'Panchthar':          { x: 760.0, y: 292.9 },
    'Ilam':               { x: 759.8, y: 317.7 },
    'Jhapa':              { x: 770.6, y: 343.3 },
    'Morang':             { x: 728.6, y: 338.4 },
    'Sunsari':            { x: 703.3, y: 336.2 },
    'Dhankuta':           { x: 715.6, y: 308.3 },
    'Terhathum':          { x: 736.3, y: 291.8 },
    'Sankhuwasabha':      { x: 712.4, y: 256.8 },
    'Bhojpur':            { x: 695.5, y: 293.2 },
    'Solukhumbu':         { x: 668.2, y: 254.9 },
    'Okhaldhunga':        { x: 635.8, y: 278.0 },
    'Khotang':            { x: 670.6, y: 291.0 },
    'Udayapur':           { x: 655.0, y: 308.7 },
    // Madhesh Province
    'Saptari':            { x: 665.6, y: 342.9 },
    'Siraha':             { x: 637.2, y: 328.7 },
    'Dhanusha':           { x: 608.2, y: 324.7 },
    'Mahottari':          { x: 589.4, y: 316.2 },
    'Sarlahi':            { x: 569.3, y: 307.5 },
    'Rautahat':           { x: 546.2, y: 310.7 },
    'Bara':               { x: 528.8, y: 298.1 },
    'Parsa':              { x: 507.9, y: 286.3 },
    // Bagmati Province
    'Sindhuli':           { x: 593.3, y: 283.2 },
    'Ramechhap':          { x: 615.7, y: 276.3 },
    'Dolakha':            { x: 622.5, y: 243.0 },
    'Sindhupalchok':      { x: 582.8, y: 230.1 },
    'Kavrepalanchok':     { x: 572.7, y: 264.3 },
    'Lalitpur':           { x: 549.6, y: 264.3 },
    'Bhaktapur':          { x: 559.3, y: 251.2 },
    'Kathmandu':          { x: 551.0, y: 245.5 },
    'Nuwakot':            { x: 532.5, y: 233.6 },
    'Rasuwa':             { x: 549.9, y: 211.2 },
    'Dhading':            { x: 512.1, y: 232.4 },
    'Makwanpur':          { x: 524.3, y: 263.6 },
    'Chitwan':            { x: 473.9, y: 263.5 },
    // Gandaki Province
    'Gorkha':             { x: 512.1, y: 191.9 },
    'Manang':             { x: 461.4, y: 167.5 },
    'Mustang':            { x: 434.5, y: 134.9 },
    'Myagdi':             { x: 389.5, y: 175.5 },
    'Kaski':              { x: 439.1, y: 194.2 },
    'Lamjung':            { x: 478.0, y: 200.2 },
    'Tanahu':             { x: 463.5, y: 227.2 },
    'Nawalpur':           { x: 448.6, y: 247.2 },
    'Syangja':            { x: 424.6, y: 222.9 },
    'Parbat':             { x: 413.5, y: 199.9 },
    'Baglung':            { x: 369.8, y: 192.3 },
    // Lumbini Province
    'Rukum East':         { x: 339.3, y: 168.7 },
    'Rolpa':              { x: 320.5, y: 195.7 },
    'Pyuthan':            { x: 342.5, y: 218.3 },
    'Gulmi':              { x: 383.6, y: 218.6 },
    'Arghakhanchi':       { x: 367.7, y: 231.0 },
    'Palpa':              { x: 413.9, y: 239.5 },
    'Nawalparasi East':   { x: 448.6, y: 247.2 },
    'Nawalparasi West':   { x: 414.2, y: 261.9 },
    'Rupandehi':          { x: 386.0, y: 257.0 },
    'Kapilvastu':         { x: 359.9, y: 257.0 },
    'Dang':               { x: 312.1, y: 230.6 },
    'Banke':              { x: 261.0, y: 219.0 },
    'Bardiya':            { x: 223.5, y: 193.9 },
    // Karnali Province
    'Dolpa':              { x: 358.2, y: 123.2 },
    'Mugu':               { x: 319.8, y: 85.9 },
    'Humla':              { x: 261.3, y: 45.2 },
    'Jumla':              { x: 281.9, y: 119.8 },
    'Kalikot':            { x: 249.3, y: 124.7 },
    'Rukum West':         { x: 304.6, y: 166.7 },
    'Salyan':             { x: 287.2, y: 188.6 },
    'Jajarkot':           { x: 279.6, y: 156.6 },
    'Dailekh':            { x: 248.9, y: 152.3 },
    'Surkhet':            { x: 220.8, y: 159.6 },
    // Sudurpashchim Province
    'Bajura':             { x: 237.3, y: 95.7 },
    'Bajhang':            { x: 212.4, y: 73.6 },
    'Achham':             { x: 213.1, y: 129.3 },
    'Doti':               { x: 178.0, y: 128.2 },
    'Kailali':            { x: 181.4, y: 163.7 },
    'Kanchanpur':         { x: 132.2, y: 148.8 },
    'Dadeldhura':         { x: 143.1, y: 121.4 },
    'Baitadi':            { x: 156.4, y: 94.2 },
    'Darchula':           { x: 176.1, y: 66.2 },
};

// Bounding box of each district polygon (viewBox coords) — bounds the town grid so
// village markers stay inside the district shape.
const DISTRICT_BBOX = {
    // Koshi Province
    'Taplejung':          { x0: 726.7, y0: 228.9, x1: 789.7, y1: 285.4 },
    'Panchthar':          { x0: 730.4, y0: 271.5, x1: 779.5, y1: 319.2 },
    'Ilam':               { x0: 739.6, y0: 299.1, x1: 788.1, y1: 335.4 },
    'Jhapa':              { x0: 742.3, y0: 323.8, x1: 788.4, y1: 360.3 },
    'Morang':             { x0: 709.3, y0: 318.3, x1: 746.9, y1: 360.7 },
    'Sunsari':            { x0: 681.3, y0: 317.7, x1: 718.8, y1: 356.8 },
    'Dhankuta':           { x0: 701.7, y0: 292.0, x1: 737.7, y1: 320.4 },
    'Terhathum':          { x0: 722.0, y0: 283.3, x1: 752.1, y1: 310.3 },
    'Sankhuwasabha':      { x0: 684.6, y0: 228.5, x1: 745.9, y1: 296.4 },
    'Bhojpur':            { x0: 680.6, y0: 269.4, x1: 712.3, y1: 316.9 },
    'Solukhumbu':         { x0: 635.6, y0: 215.4, x1: 690.2, y1: 279.6 },
    'Okhaldhunga':        { x0: 622.9, y0: 264.1, x1: 663.2, y1: 295.4 },
    'Khotang':            { x0: 641.5, y0: 271.2, x1: 688.0, y1: 318.1 },
    'Udayapur':           { x0: 618.9, y0: 292.7, x1: 703.4, y1: 333.4 },
    // Madhesh Province
    'Saptari':            { x0: 646.5, y0: 324.9, x1: 690.5, y1: 355.1 },
    'Siraha':             { x0: 616.8, y0: 312.9, x1: 652.1, y1: 344.3 },
    'Dhanusha':           { x0: 593.2, y0: 296.5, x1: 627.5, y1: 343.0 },
    'Mahottari':          { x0: 578.9, y0: 293.6, x1: 601.3, y1: 340.3 },
    'Sarlahi':            { x0: 549.4, y0: 291.3, x1: 590.5, y1: 328.7 },
    'Rautahat':           { x0: 536.1, y0: 288.2, x1: 564.5, y1: 328.4 },
    'Bara':               { x0: 511.3, y0: 277.1, x1: 545.1, y1: 319.7 },
    'Parsa':              { x0: 479.4, y0: 269.0, x1: 520.2, y1: 308.6 },
    // Bagmati Province
    'Sindhuli':           { x0: 557.5, y0: 270.3, x1: 638.2, y1: 314.1 },
    'Ramechhap':          { x0: 589.2, y0: 238.6, x1: 653.6, y1: 287.5 },
    'Dolakha':            { x0: 596.3, y0: 210.2, x1: 652.2, y1: 268.3 },
    'Sindhupalchok':      { x0: 559.5, y0: 207.7, x1: 611.4, y1: 256.9 },
    'Kavrepalanchok':     { x0: 554.8, y0: 244.8, x1: 596.0, y1: 279.9 },
    'Lalitpur':           { x0: 541.8, y0: 250.0, x1: 559.5, y1: 274.0 },
    'Bhaktapur':          { x0: 551.9, y0: 247.1, x1: 566.3, y1: 256.1 },
    'Kathmandu':          { x0: 538.3, y0: 239.7, x1: 569.7, y1: 260.1 },
    'Nuwakot':            { x0: 521.6, y0: 217.0, x1: 564.0, y1: 244.3 },
    'Rasuwa':             { x0: 532.8, y0: 192.3, x1: 589.3, y1: 227.4 },
    'Dhading':            { x0: 490.9, y0: 195.6, x1: 545.1, y1: 251.9 },
    'Makwanpur':          { x0: 494.6, y0: 248.4, x1: 564.8, y1: 294.0 },
    'Chitwan':            { x0: 432.4, y0: 234.3, x1: 505.5, y1: 277.9 },
    // Gandaki Province
    'Gorkha':             { x0: 474.2, y0: 161.6, x1: 539.1, y1: 241.4 },
    'Manang':             { x0: 421.7, y0: 149.0, x1: 486.6, y1: 187.1 },
    'Mustang':            { x0: 395.8, y0: 112.7, x1: 459.8, y1: 177.0 },
    'Myagdi':             { x0: 364.1, y0: 157.9, x1: 428.5, y1: 199.3 },
    'Kaski':              { x0: 414.2, y0: 173.0, x1: 462.2, y1: 217.8 },
    'Lamjung':            { x0: 454.7, y0: 181.7, x1: 497.0, y1: 219.6 },
    'Tanahu':             { x0: 433.9, y0: 213.5, x1: 485.7, y1: 245.8 },
    'Nawalpur':           { x0: 412.2, y0: 235.1, x1: 475.1, y1: 270.9 },
    'Syangja':            { x0: 392.4, y0: 205.9, x1: 441.6, y1: 235.2 },
    'Parbat':             { x0: 402.4, y0: 190.9, x1: 424.4, y1: 223.7 },
    'Baglung':            { x0: 345.5, y0: 171.1, x1: 412.0, y1: 217.6 },
    // Lumbini Province
    'Rukum East':         { x0: 313.0, y0: 151.4, x1: 368.5, y1: 184.4 },
    'Rolpa':              { x0: 301.5, y0: 177.4, x1: 352.1, y1: 216.3 },
    'Pyuthan':            { x0: 321.4, y0: 193.9, x1: 363.8, y1: 234.2 },
    'Gulmi':              { x0: 357.6, y0: 201.6, x1: 406.2, y1: 230.7 },
    'Arghakhanchi':       { x0: 334.7, y0: 214.7, x1: 383.2, y1: 244.9 },
    'Palpa':              { x0: 375.0, y0: 227.7, x1: 441.4, y1: 252.2 },
    'Nawalparasi East':   { x0: 412.2, y0: 235.1, x1: 475.1, y1: 270.9 },
    'Nawalparasi West':   { x0: 403.4, y0: 249.7, x1: 431.2, y1: 278.5 },
    'Rupandehi':          { x0: 372.7, y0: 243.5, x1: 408.5, y1: 279.7 },
    'Kapilvastu':         { x0: 330.5, y0: 239.2, x1: 375.1, y1: 272.5 },
    'Dang':               { x0: 273.2, y0: 202.4, x1: 339.8, y1: 250.8 },
    'Banke':              { x0: 230.5, y0: 195.7, x1: 288.4, y1: 236.1 },
    'Bardiya':            { x0: 193.8, y0: 167.5, x1: 252.8, y1: 218.0 },
    // Karnali Province
    'Dolpa':              { x0: 305.2, y0: 80.9, x1: 412.4, y1: 163.6 },
    'Mugu':               { x0: 252.8, y0: 58.5, x1: 341.6, y1: 107.7 },
    'Humla':              { x0: 210.5, y0: 17.8, x1: 313.9, y1: 89.2 },
    'Jumla':              { x0: 259.6, y0: 97.5, x1: 321.7, y1: 142.6 },
    'Kalikot':            { x0: 228.0, y0: 101.4, x1: 274.0, y1: 142.7 },
    'Rukum West':         { x0: 287.9, y0: 141.1, x1: 330.7, y1: 180.5 },
    'Salyan':             { x0: 251.0, y0: 170.1, x1: 308.6, y1: 211.2 },
    'Jajarkot':           { x0: 257.3, y0: 129.7, x1: 320.7, y1: 172.9 },
    'Dailekh':            { x0: 223.1, y0: 128.8, x1: 266.2, y1: 171.0 },
    'Surkhet':            { x0: 187.5, y0: 142.1, x1: 275.4, y1: 195.8 },
    // Sudurpashchim Province
    'Bajura':             { x0: 203.2, y0: 60.1, x1: 256.4, y1: 117.0 },
    'Bajhang':            { x0: 167.9, y0: 51.1, x1: 236.2, y1: 107.2 },
    'Achham':             { x0: 191.2, y0: 107.6, x1: 237.4, y1: 161.4 },
    'Doti':               { x0: 149.4, y0: 102.7, x1: 204.6, y1: 145.9 },
    'Kailali':            { x0: 144.6, y0: 134.5, x1: 212.9, y1: 190.5 },
    'Kanchanpur':         { x0: 110.6, y0: 128.5, x1: 152.1, y1: 177.7 },
    'Dadeldhura':         { x0: 120.9, y0: 104.3, x1: 171.1, y1: 140.6 },
    'Baitadi':            { x0: 125.8, y0: 80.4, x1: 181.3, y1: 114.1 },
    'Darchula':           { x0: 136.0, y0: 34.7, x1: 198.1, y1: 88.9 },
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

// Province display-name → region id, for resolving search hits back to map state.
const PROVINCE_ID_BY_NAME = regions.reduce((m, r) => { m[r.name] = r.id; return m; }, {});

// Flat, searchable index of every province / district / town in Nepal so a user can
// jump straight to a location instead of drilling down through the map by hand.
const SEARCH_INDEX = (() => {
    const items = [];
    Object.entries(NEPAL_LOCATIONS).forEach(([provinceName, districts]) => {
        const provinceId = PROVINCE_ID_BY_NAME[provinceName];
        if (!provinceId) return;
        const shortProvince = provinceName.replace(' Province', '');
        items.push({ type: 'Province', provinceId, provinceName, label: shortProvince, sub: 'Province', key: 'p:' + provinceId });
        Object.entries(districts).forEach(([district, towns]) => {
            items.push({ type: 'District', provinceId, provinceName, district, label: district, sub: shortProvince, key: 'd:' + district });
            towns.forEach((town) => {
                items.push({ type: 'Place', provinceId, provinceName, district, town, label: town, sub: `${district}, ${shortProvince}`, key: `t:${district}:${town}` });
            });
        });
    });
    return items;
})();

// Rank matches: exact label > label prefix > label substring > context (sub) substring.
const searchLocations = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX
        .map((it) => {
            const label = it.label.toLowerCase();
            let score = -1;
            if (label === q) score = 0;
            else if (label.startsWith(q)) score = 1;
            else if (label.includes(q)) score = 2;
            else if (it.sub.toLowerCase().includes(q)) score = 3;
            return { it, score };
        })
        .filter((r) => r.score >= 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, 8)
        .map((r) => r.it);
};

// Spread town labels in a tight grid around the district's geographic center
// Label sizing (in on-screen SVG units). Markers are counter-scaled by 1/zoom so a
// place name renders at this constant size at every zoom level — never clipped, never huge.
const TOWN_FS = 10.5;
const DISTRICT_FS = 11;
// Estimated pill width for a name at a given font size (Inter, bold ~0.6em advance) + padding.
const labelWidth = (name, fs) => name.length * fs * 0.6 + 16;

// Town positions: a compact grid centred on the district point (which is also the zoom
// focus, so the block sits centred in view). There is no per-town geographic data and no
// district polygon — only the province outline — so we keep the cluster tight around the
// district's centre rather than spreading it across the bounding box, otherwise corner
// markers land in neighbouring (grey) areas outside the irregular province shape.
//
// Markers keep a constant on-screen size while the map is zoomed by `scale`, so the
// overlap-free spacing in map units is the on-screen footprint divided by `scale`.
const getTownPositions = (districtPos, towns, scale = 1, bbox = null) => {
    if (!districtPos || !towns.length) return [];
    const { x: cx, y: cy } = districtPos;
    const n = towns.length;
    const maxLen = towns.reduce((m, t) => Math.max(m, t.length), 0);

    const sx = (labelWidth('x'.repeat(maxLen), TOWN_FS) + 12) / scale; // column pitch
    const sy = (TOWN_FS + 18) / scale;                                 // row pitch

    // Cap the column count to what the district's width can hold so the cluster never
    // spills sideways past the district body; otherwise aim for a balanced block.
    const pad = 8 / scale;
    const usableW = bbox ? Math.max(sx, bbox.x1 - bbox.x0 - 2 * pad) : Infinity;
    const colsFit = Math.max(1, Math.floor(usableW / sx) + 1);
    const balancedCols = Math.max(1, Math.round(Math.sqrt(n * 1.4)));
    const cols = Math.max(1, Math.min(n, colsFit, balancedCols));
    const rows = Math.ceil(n / cols);

    const usedW = (cols - 1) * sx;
    const usedH = (rows - 1) * sy;

    return towns.map((town, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        // Centre the final (possibly partial) row so it isn't left-justified under the rest.
        const itemsInRow = row === rows - 1 ? n - row * cols : cols;
        const rowOffset = ((cols - itemsInRow) * sx) / 2;
        return {
            town,
            x: cx - usedW / 2 + rowOffset + col * sx,
            y: cy - usedH / 2 + row * sy,
        };
    });
};

export default function TerrainSelect() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    // Below this width the 52/48 map+panel split is too cramped, so we stack vertically.
    const isStacked = useViewport('(max-width: 960px)');
    const isMobile = useViewport('(max-width: 560px)');
    const [hovered, setHovered] = useState(null);
    const [hoveredMarker, setHoveredMarker] = useState(null); // 'd:<district>' | 't:<town>' on the map
    const [selected, setSelected] = useState(null);       // province id
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedTown, setSelectedTown] = useState(null);
    const [wheelType, setWheelType] = useState('all');
    const [search, setSearch] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    const searchResults = searchLocations(search);

    const lockedRegion = regions.find((r) => r.id === selected);
    const activeImages = lockedRegion ? (provinceImages[lockedRegion.id] || []) : [];

    const districtMap = lockedRegion ? (NEPAL_LOCATIONS[lockedRegion.name] ?? {}) : {};
    const districtList = Object.keys(districtMap);
    const placeList = selectedDistrict ? (districtMap[selectedDistrict] ?? []) : [];
    const vehicleHint = selectedDistrict ? getVehicleHint(selectedDistrict) : null;

    // Scale at which towns are laid out (the district-zoom level). Kept independent of
    // selectedTown so town markers don't shift position when one is picked.
    const districtZoomScale = selected && PROVINCE_ZOOM[selected]
        ? PROVINCE_ZOOM[selected].scale * 2.1
        : 1;

    // Computed positions for labels at each zoom level
    const districtPositions = selected ? getDistrictPositions(selected, districtList) : [];
    const selectedDistrictPos = districtPositions.find((d) => d.district === selectedDistrict);
    const townPositions = selectedDistrictPos
        ? getTownPositions(selectedDistrictPos, placeList, districtZoomScale, selectedDistrictPos.box)
        : [];
    const selectedTownPos = townPositions.find((t) => t.town === selectedTown);

    // Compute SVG zoom transform based on current selection depth.
    // The map centre (450,190) is the viewBox centre; we translate the focus point there
    // and scale up. Units must be `px` for the CSS `transform` property to be valid in SVG
    // user space (unitless translate is invalid CSS and would be silently dropped → no zoom).
    const zoomTo = (cx, cy, scale) =>
        `translate(${450 - cx * scale}px, ${190 - cy * scale}px) scale(${scale})`;
    const computeMapTransform = () => {
        if (!selected) return 'translate(0px, 0px) scale(1)';
        const pz = PROVINCE_ZOOM[selected];
        // Level 1 — province selected: zoom to the whole province
        if (!selectedDistrict || !selectedDistrictPos) {
            return zoomTo(pz.cx, pz.cy, pz.scale);
        }
        // Level 2 — district selected: zoom further into the district
        const ds = pz.scale * 2.1;
        if (!selectedTown || !selectedTownPos) {
            return zoomTo(selectedDistrictPos.x, selectedDistrictPos.y, ds);
        }
        // Level 3 — town selected: zoom in on the town
        const ts = ds * 1.6;
        return zoomTo(selectedTownPos.x, selectedTownPos.y, ts);
    };
    const mapTransform = computeMapTransform();

    // The map group scales everything by `currentScale`; markers counter-scale by `invScale`
    // (1/currentScale) so pins and name labels keep a constant, crisp on-screen size at any zoom.
    const currentScale = (() => {
        if (!selected) return 1;
        const pz = PROVINCE_ZOOM[selected];
        if (!selectedDistrict || !selectedDistrictPos) return pz.scale;
        const ds = pz.scale * 2.1;
        if (!selectedTown || !selectedTownPos) return ds;
        return ds * 1.6;
    })();
    const invScale = 1 / currentScale;

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
        setHoveredMarker(null);
    };

    const handleSearchSelect = (it) => {
        setSelected(it.provinceId);
        setSelectedDistrict(it.district ?? null);
        setSelectedTown(it.town ?? null);
        setHovered(null);
        setHoveredMarker(null);
        setSearch('');
        setSearchFocused(false);
    };

    const handleBackToProvinces = () => { setSelected(null); setSelectedDistrict(null); setSelectedTown(null); setHoveredMarker(null); };
    const handleBackToDistricts = () => { setSelectedDistrict(null); setSelectedTown(null); setHoveredMarker(null); };
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
        <div style={{ paddingTop: isMobile ? '84px' : '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 14px' : '0 24px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: isStacked ? '18px' : '24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent-subtle)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', color: 'var(--accent)', marginBottom: '16px', border: '1px solid var(--accent-subtle)' }}>
                        <MapPin size={12} /> PICK YOUR AREA
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>
                        Where in Nepal?
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                        Click a province to see routes and find the best vehicle for your road type.
                    </p>

                    {/* Location search — jump straight to any province, district or town */}
                    <div style={{ maxWidth: '440px', margin: '18px auto 0', position: 'relative', textAlign: 'left', zIndex: 30 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                                placeholder="Search a province, district or town"
                                aria-label="Search locations"
                                style={{
                                    width: '100%', padding: '11px 38px 11px 40px', borderRadius: '999px',
                                    border: '1px solid var(--border)', background: 'var(--bg-card)',
                                    color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {searchFocused && searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '14px', boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
                                overflow: 'hidden', zIndex: 40,
                            }}>
                                {searchResults.map((it, i) => {
                                    const region = regions.find((r) => r.id === it.provinceId);
                                    const color = region?.color ?? 'var(--accent)';
                                    return (
                                        <button
                                            key={it.key}
                                            onMouseDown={() => handleSearchSelect(it)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                                                padding: '10px 14px', background: 'transparent', border: 'none',
                                                borderBottom: i < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                                                cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <MapPin size={14} color={color} style={{ flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.sub}</div>
                                            </div>
                                            <span style={{
                                                flexShrink: 0, fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.5px',
                                                textTransform: 'uppercase', color, background: color + '18',
                                                padding: '3px 8px', borderRadius: '999px',
                                            }}>{it.type}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {searchFocused && search.trim() && searchResults.length === 0 && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '14px', boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
                                padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)',
                                textAlign: 'center', zIndex: 40,
                            }}>
                                No locations found for "{search.trim()}"
                            </div>
                        )}
                    </div>
                </div>

                {/* On the desktop overview the content is short; centre the whole block vertically to
                    avoid a big empty void, while keeping the two cards top-aligned to each other.
                    Once a province is picked the panel grows, so we let it flow from the top. */}
                <div style={{
                    minHeight: (!isStacked && !selected) ? 'calc(100vh - 300px)' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: (!isStacked && !selected) ? 'center' : 'flex-start',
                }}>
                <div style={{ display: 'flex', flexDirection: isStacked ? 'column' : 'row', gap: isStacked ? '16px' : '24px', alignItems: 'flex-start' }}>

                    {/* Map — sticky on desktop so it stays visible while the panel scrolls; static when stacked */}
                    <div style={{
                        flex: isStacked ? '1 1 auto' : '0 0 52%',
                        width: isStacked ? '100%' : 'auto',
                        position: isStacked ? 'static' : 'sticky',
                        top: isStacked ? 'auto' : '92px',
                        alignSelf: isStacked ? 'stretch' : 'flex-start',
                    }}>
                        <div style={{
                            background: 'var(--bg-card)', borderRadius: isMobile ? '16px' : '24px', padding: isMobile ? '12px' : '24px',
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

                                    {/* Province labels — overview only; once a province is selected the
                                        breadcrumb names it, so we hide these to avoid clutter/overlap. */}
                                    {!selected && regions.map((region) => {
                                        const isActive = hovered === region.id;
                                        const [cx, cy] = provinceCenters[region.id];
                                        const name = region.name.replace(' Province', '');
                                        const fontSize = isActive ? 12 : 10;
                                        const fontWeight = isActive ? '700' : '600';
                                        const fill = isActive ? labelFillActive : labelFillInactive;
                                        return (
                                            <g key={region.id + '-label'} style={{ pointerEvents: 'none' }}>
                                                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                                                    fill={fill}
                                                    fontSize={fontSize}
                                                    fontWeight={fontWeight}
                                                    fontFamily="Inter, sans-serif"
                                                    paintOrder="stroke"
                                                    stroke={isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)'}
                                                    strokeWidth={2.5}
                                                    style={{ transition: 'all 0.3s' }}>
                                                    {name}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* LEVEL 2 — District markers. Counter-scaled (1/zoom) so the pin and the
                                        full district name stay a constant, fully-legible size at any zoom. */}
                                    {selected && !selectedDistrict && districtPositions.map(({ district, x, y }) => {
                                        const hint = getVehicleHint(district);
                                        const isHover = hoveredMarker === 'd:' + district;
                                        const pillW = labelWidth(district, DISTRICT_FS);
                                        const pillH = DISTRICT_FS + 7;
                                        return (
                                            <g key={district} style={{ cursor: 'pointer' }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedDistrict(district); setSelectedTown(null); setHoveredMarker(null); }}
                                                onMouseEnter={() => setHoveredMarker('d:' + district)}
                                                onMouseLeave={() => setHoveredMarker((h) => (h === 'd:' + district ? null : h))}>
                                                {/* The marker pops slightly and the pill fills with its colour on hover. */}
                                                <g transform={`translate(${x} ${y}) scale(${invScale * (isHover ? 1.12 : 1)})`} style={{ transition: 'transform 0.15s ease' }}>
                                                    <circle r={isHover ? 6.5 : 5} fill={hint.color + (isHover ? '55' : '33')} stroke={hint.color} strokeWidth={isHover ? 1.6 : 1} style={{ transition: 'r 0.15s, fill 0.15s' }} />
                                                    <circle r={2.4} fill={hint.color} />
                                                    <rect x={-pillW / 2} y={8} width={pillW} height={pillH} rx={pillH / 2}
                                                        fill={isHover ? hint.color : (isDark ? 'rgba(15,15,15,0.92)' : 'rgba(255,255,255,0.96)')}
                                                        stroke={hint.color + 'cc'} strokeWidth={isHover ? 1.4 : 1}
                                                        style={{ transition: 'fill 0.15s' }} />
                                                    <text x={0} y={8 + pillH / 2} textAnchor="middle" dominantBaseline="central"
                                                        fill={isHover ? '#fff' : hint.color} fontSize={DISTRICT_FS} fontWeight="700" fontFamily="Inter, sans-serif"
                                                        style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.15s' }}>
                                                        {district}
                                                    </text>
                                                </g>
                                            </g>
                                        );
                                    })}

                                    {/* LEVEL 3 — Town/village markers (district zoomed). Same counter-scaling so
                                        every village name renders fully and crisply. */}
                                    {selected && selectedDistrict && townPositions.map(({ town, x, y }) => {
                                        const isSelTown = selectedTown === town;
                                        const isHover = hoveredMarker === 't:' + town;
                                        const active = isSelTown || isHover;
                                        const color = lockedRegion?.color ?? '#e8732a';
                                        const pillW = labelWidth(town, TOWN_FS);
                                        const pillH = TOWN_FS + 6;
                                        return (
                                            <g key={town} style={{ cursor: 'pointer' }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedTown(town); }}
                                                onMouseEnter={() => setHoveredMarker('t:' + town)}
                                                onMouseLeave={() => setHoveredMarker((h) => (h === 't:' + town ? null : h))}>
                                                <g transform={`translate(${x} ${y}) scale(${invScale * (isHover && !isSelTown ? 1.12 : 1)})`} style={{ transition: 'transform 0.15s ease' }}>
                                                    {active && <circle r={7} fill={color + '25'} stroke={color} strokeWidth={1.4} style={{ transition: 'r 0.15s' }} />}
                                                    <circle r={active ? 3.2 : 2.2} fill={active ? color : color + 'cc'} style={{ transition: 'r 0.15s, fill 0.15s' }} />
                                                    <rect x={-pillW / 2} y={7} width={pillW} height={pillH} rx={pillH / 2}
                                                        fill={isSelTown ? color : isHover ? color + 'dd' : (isDark ? 'rgba(15,15,15,0.92)' : 'rgba(255,255,255,0.96)')}
                                                        stroke={color + (active ? 'ff' : 'aa')} strokeWidth={active ? 1.4 : 1}
                                                        style={{ transition: 'fill 0.15s' }} />
                                                    <text x={0} y={7 + pillH / 2} textAnchor="middle" dominantBaseline="central"
                                                        fill={active ? '#fff' : color} fontSize={TOWN_FS} fontWeight="700" fontFamily="Inter, sans-serif"
                                                        style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.15s' }}>
                                                        {town}
                                                    </text>
                                                </g>
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
                    <div style={{
                        flex: isStacked ? '1 1 auto' : '1 1 0',
                        width: isStacked ? '100%' : 'auto',
                        minWidth: 0,
                    }}>

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

                                {/* Images — hero + two thumbs. A province-colour gradient sits behind each
                                    image so the area always looks intentional even if a photo fails to load. */}
                                <div style={{ marginTop: '10px', marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} style={{
                                            position: 'relative',
                                            height: i === 0 ? '92px' : '58px',
                                            gridColumn: i === 0 ? '1 / -1' : 'auto',
                                            borderRadius: '10px', overflow: 'hidden',
                                            border: '1px solid var(--border)',
                                            background: `linear-gradient(135deg, ${lockedRegion.color}cc, ${lockedRegion.color}44)`,
                                        }}>
                                            {activeImages[i] && (
                                                <img
                                                    src={activeImages[i]} alt="" loading="lazy"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                            )}
                                            {i === 0 && (
                                                <span style={{
                                                    position: 'absolute', left: '10px', bottom: '8px',
                                                    color: '#fff', fontSize: '0.72rem', fontWeight: '800',
                                                    textShadow: '0 1px 4px rgba(0,0,0,0.6)', letterSpacing: '0.3px',
                                                }}>{lockedRegion.terrain}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Step 2 instruction */}
                                <div style={{ padding: '8px 12px', borderRadius: '10px', background: lockedRegion.color + '10', border: `1px dashed ${lockedRegion.color}50`, marginBottom: '10px', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                                    <span style={{ color: lockedRegion.color, fontWeight: '700' }}>Step 2 —</span> Tap a district on the map or pick one below.
                                </div>

                                {/* District grid — two columns to stay compact */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: isStacked ? '46vh' : 'none', overflowY: isStacked ? 'auto' : 'visible', paddingRight: isStacked ? '2px' : '0' }}>
                                    {districtList.map((dist) => {
                                        const hint = getVehicleHint(dist);
                                        const isHover = hoveredMarker === 'd:' + dist;
                                        return (
                                            <button
                                                key={dist}
                                                onClick={() => { setSelectedDistrict(dist); setHoveredMarker(null); }}
                                                title={dist}
                                                onMouseEnter={() => setHoveredMarker('d:' + dist)}
                                                onMouseLeave={() => setHoveredMarker((h) => (h === 'd:' + dist ? null : h))}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '7px 9px', borderRadius: '9px',
                                                    background: isHover ? lockedRegion.color + '18' : 'var(--bg-glass)',
                                                    border: `1px solid ${isHover ? lockedRegion.color + '70' : 'var(--border)'}`,
                                                    cursor: 'pointer', width: '100%', textAlign: 'left', minWidth: 0,
                                                    transform: isHover ? 'translateY(-1px)' : 'none',
                                                    transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
                                                    fontFamily: "'Inter', sans-serif",
                                                }}
                                            >
                                                <MapPin size={11} color={lockedRegion.color} style={{ flexShrink: 0 }} />
                                                <span style={{ flex: 1, minWidth: 0, color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dist}</span>
                                                <span style={{ fontSize: '0.62rem', flexShrink: 0 }}>{hint.icon}</span>
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
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', maxHeight: isStacked ? '32vh' : '320px', overflowY: 'auto' }}>
                                    {placeList.map((place) => {
                                        const isSel = selectedTown === place;
                                        const isHover = hoveredMarker === 't:' + place;
                                        const active = isSel || isHover;
                                        return (
                                            <button
                                                key={place}
                                                onClick={() => setSelectedTown(place)}
                                                onMouseEnter={() => setHoveredMarker('t:' + place)}
                                                onMouseLeave={() => setHoveredMarker((h) => (h === 't:' + place ? null : h))}
                                                style={{
                                                    padding: '5px 11px', borderRadius: '20px', cursor: 'pointer',
                                                    background: isSel ? lockedRegion.color : active ? lockedRegion.color + '22' : 'var(--bg-glass)',
                                                    border: `1px solid ${isSel ? lockedRegion.color : lockedRegion.color + (active ? '80' : '40')}`,
                                                    fontSize: '0.72rem', color: isSel ? '#fff' : lockedRegion.color, fontWeight: isSel ? '700' : '600',
                                                    fontFamily: "'Inter', sans-serif",
                                                    transform: active ? 'translateY(-1px)' : 'none',
                                                    transition: 'background 0.15s, border-color 0.15s, transform 0.15s, color 0.15s',
                                                }}
                                            >
                                                {place}
                                            </button>
                                        );
                                    })}
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
        </div>
    );
}
