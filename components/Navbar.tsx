
import React from 'react';
import { COLORS, NAV_LABELS } from '../constants';

interface NavbarProps {
  onNavigate: (page: 'home' | 'shop' | 'admin') => void;
  currentPage: string;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  logo: string | null;
  siteName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, currentPage, cartCount, wishlistCount, 
  onOpenCart, onOpenWishlist, logo, siteName 
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-slate-100">
            {logo ? <img src={logo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-black text-xl">FP</div>}
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black leading-tight text-slate-800">{siteName}</h1>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black">Official Store</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {(['home', 'shop', 'admin'] as const).map((page) => (
            <button key={page} onClick={() => onNavigate(page)} className={`font-black text-sm uppercase tracking-widest transition-colors ${currentPage === page ? 'text-green-700 underline underline-offset-8' : 'text-gray-400 hover:text-green-600'}`}>
              {page === 'home' ? NAV_LABELS.HOME : page === 'shop' ? NAV_LABELS.SHOP : NAV_LABELS.ACCOUNT}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onOpenWishlist} className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {wishlistCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">{wishlistCount}</span>}
          </button>

          <button onClick={onOpenCart} className="relative h-12 flex items-center gap-2 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">{cartCount}</span>}
            </div>
            <span className="hidden sm:inline-block font-black text-slate-800 text-xs uppercase tracking-widest">{NAV_LABELS.CART}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
