import React from 'react';
import { COLORS, NAV_LABELS } from '../constants';

interface NavbarProps {
  onNavigate: (page: 'home' | 'shop' | 'admin') => void;
  currentPage: string;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, cartCount, wishlistCount, onOpenCart, onOpenWishlist }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.PRIMARY }}>
            <span className="text-white font-bold text-xl">FP</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold leading-tight" style={{ color: COLORS.PRIMARY }}>ফ্রেশ প্যাভিলিয়ন</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Fresh Pavilion</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => onNavigate('home')}
            className={`font-semibold text-lg transition-colors ${currentPage === 'home' ? 'text-green-700' : 'text-gray-600 hover:text-green-600'}`}
          >
            {NAV_LABELS.HOME}
          </button>
          <button 
            onClick={() => onNavigate('shop')}
            className={`font-semibold text-lg transition-colors ${currentPage === 'shop' ? 'text-green-700' : 'text-gray-600 hover:text-green-600'}`}
          >
            {NAV_LABELS.SHOP}
          </button>
          <button 
            onClick={() => onNavigate('admin')}
            className={`font-semibold text-lg transition-colors ${currentPage === 'admin' ? 'text-green-700' : 'text-gray-600 hover:text-green-600'}`}
          >
            {NAV_LABELS.ACCOUNT}
          </button>
        </div>

        {/* Action Icons - Perfectly Aligned */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={onOpenWishlist}
            className="relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title="উইশলিস্ট"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </button>

          <button 
            onClick={onOpenCart}
            className="relative h-12 flex items-center gap-2 px-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline-block font-bold text-gray-700">{NAV_LABELS.CART}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};