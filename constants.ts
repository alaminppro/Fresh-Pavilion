import { CU_LOCATION } from './types';

export const COLORS = {
  PRIMARY: '#2E7D32', // Deep Forest Green
  SECONDARY: '#8BC34A', // Fresh Green
  PAYRA: '#0288D1', // Payra Branding Blue
  ACCENT_RED: '#EF5350',
  ACCENT_BLUE: '#42A5F5',
  BG_SOFT: '#F1F8E9'
};

export const NAV_LABELS = {
  HOME: 'হোম',
  SHOP: 'শপ',
  CART: 'কার্ট',
  ACCOUNT: 'অ্যাকাউন্ট'
};

export const DELIVERY_LOCATIONS = [
  CU_LOCATION.ZERO_POINT,
  CU_LOCATION.SHUTTLE_STATION,
  CU_LOCATION.ONE_STOP,
  CU_LOCATION.HALLS
];

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800';

export const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'অর্গানিক মধু',
    price: 450,
    description: 'সুন্দরবনের খাঁটি প্রাকৃতিক মধু। কোনো প্রকার ভেজালহীন এবং স্বাস্থ্যসম্মত।',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 25,
    unit: 'গ্রাম'
  },
  {
    id: '2',
    name: 'কাঁচা চিনা বাদাম',
    price: 180,
    description: 'সরাসরি কৃষকের ঘর থেকে সংগৃহীত পুষ্টিকর ও মচমচে চিনা বাদাম।',
    image: 'https://images.unsplash.com/photo-1552345386-2401c50f8194?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 60,
    unit: 'কেজি'
  },
  {
    id: '3',
    name: 'গাওয়া ঘি',
    price: 320,
    description: 'বাড়িতে তৈরি খাঁটি গাওয়া ঘি। অতুলনীয় স্বাদ ও সুবাস।',
    image: 'https://images.unsplash.com/photo-1626128665085-483747621778?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 12,
    unit: 'গ্রাম'
  },
  {
    id: '4',
    name: 'প্রিমিয়াম চা পাতা',
    price: 260,
    description: 'সিলেটের বাগান থেকে বাছাইকৃত কচি চা পাতা। রিফ্রেশিং চা।',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc458695d7?auto=format&fit=crop&q=80&w=800',
    category: 'পানীয়',
    stock: 40,
    unit: 'গ্রাম'
  },
  {
    id: '5',
    name: 'কালো জিরা তেল',
    price: 120,
    description: 'স্বাস্থ্য রক্ষায় উপকারী প্রাকৃতিক কালো জিরার তেল।',
    image: 'https://images.unsplash.com/photo-1610725664285-7c47f633a1e2?auto=format&fit=crop&q=80&w=800',
    category: 'স্বাস্থ্য',
    stock: 15,
    unit: 'মিলি'
  },
  {
    id: '6',
    name: 'অর্গানিক গুড়',
    price: 185,
    description: 'কোনো প্রকার চিনি বা কেমিক্যাল ছাড়া তৈরি খাঁটি আখের গুড়।',
    image: 'https://images.unsplash.com/photo-1622359265243-7be1a28a383d?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 30,
    unit: 'কেজি'
  },
  {
    id: '7',
    name: 'কাঠবাদাম (Almond)',
    price: 850,
    description: 'প্রিমিয়াম কোয়ালিটি কাঠবাদাম, যা এনার্জি ও পুষ্টির সেরা উৎস।',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 15,
    unit: 'কেজি'
  },
  {
    id: '8',
    name: 'মরিয়ম খেজুর',
    price: 950,
    description: 'সরাসরি আরব থেকে আমদানিকৃত সুস্বাদু ও পুষ্টিকর মরিয়ম খেজুর।',
    image: 'https://images.unsplash.com/photo-1593361425126-c29411910795?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 20,
    unit: 'কেজি'
  },
  {
    id: '9',
    name: 'ঘানি ভাঙা সরিষার তেল',
    price: 240,
    description: 'প্রাকৃতিক উপায়ে ঘানি ভাঙা ১০০% খাঁটি সরিষার তেল।',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 50,
    unit: 'লিটার'
  },
  {
    id: '10',
    name: 'অর্গানিক হলুদ গুঁড়া',
    price: 130,
    description: 'বাড়িতে তৈরি ভেজালমুক্ত খাঁটি হলুদ গুঁড়া। রান্নায় আনবে প্রাকৃতিক রং।',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 100,
    unit: 'গ্রাম'
  },
  {
    id: '11',
    name: 'শুকনো মরিচ গুঁড়া',
    price: 150,
    description: 'ঝাল ও রঙের সঠিক ভারসাম্য বজায় রাখা খাঁটি মরিচ গুঁড়া।',
    image: 'https://images.unsplash.com/photo-1591871937453-da4c5c16263a?auto=format&fit=crop&q=80&w=800',
    category: 'খাবার',
    stock: 80,
    unit: 'গ্রাম'
  },
  {
    id: '12',
    name: 'হ্যান্ডমেড জুট ব্যাগ',
    price: 350,
    description: 'পরিবেশবান্ধব ও মজবুত পাটের ব্যাগ। দৈনন্দিন ব্যবহারের জন্য দারুণ।',
    image: 'https://images.unsplash.com/photo-1544816153-12ad5d7133a1?auto=format&fit=crop&q=80&w=800',
    category: 'অন্যান্য',
    stock: 45,
    unit: 'টি'
  }
];