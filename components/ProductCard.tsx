
import React from 'react';
import { Product } from '../types';
import { COLORS, FALLBACK_IMAGE } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onToggleWishlist?: (p: Product) => void;
  onProductClick?: (id: string) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onProductClick,
  isWishlisted = false 
}) => {
  const handlePayraOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Payra WhatsApp number: +880 1400-065088
    const payraNumber = '8801400065088';
    const message = `হ্যালো, আমি ফ্রেশ প্যাভিলিয়ন থেকে, পায়রার মাধ্যমে এই পণ্যটি অর্ডার করতে চাই: ${product.name}`;
    window.open(`https://wa.me/${payraNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div 
      onClick={() => onProductClick?.(product.id)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group border border-gray-100 relative cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={product.image || FALLBACK_IMAGE} 
          alt={product.name} 
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        
        {/* Wishlist Toggle Button */}
        {onToggleWishlist && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
            className={`absolute top-2 left-2 p-1.5 rounded-full shadow-md transition-all z-10 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur text-gray-500 hover:text-red-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-green-800">
          {product.category}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-1 text-gray-800 group-hover:text-green-700 transition-colors">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto">
          <div className="mb-3">
             <span className="text-2xl font-bold" style={{ color: COLORS.PRIMARY }}>৳{product.price}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="flex-grow py-2 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              কার্টে যোগ
            </button>
            <button 
              onClick={handlePayraOrder}
              className="flex-grow py-2 rounded-lg text-white text-[10px] font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: COLORS.PAYRA }}
              title="ক্যাম্পাস ডেলিভারি সার্ভিস"
            >
              পায়রাতে অর্ডার
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
