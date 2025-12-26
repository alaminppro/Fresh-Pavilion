
export enum CU_LOCATION {
  ZERO_POINT = 'জিরো পয়েন্ট',
  SHUTTLE_STATION = 'শাটল স্টেশন',
  ONE_STOP = 'ওয়ান স্টপ',
  HALLS = 'হলসমূহ'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  longDescription?: string;
  image: string;
  category: string;
  stock: number;
  unit: string; // e.g., 'টি', 'কেজি', 'গ্রাম', 'মিলি', 'লিটার'
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  location: CU_LOCATION;
  items: CartItem[];
  totalPrice: number;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  date: string;
}

export interface AdminUser {
  id: string;
  username: string; // email for sub-admins
  phone: string;
  password: string;
  role: 'admin' | 'staff';
}
