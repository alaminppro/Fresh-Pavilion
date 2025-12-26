import React, { useState } from 'react';
import { COLORS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface ShopProps {
  products: Product[];
  wishlist: Product[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (id: string) => void;
}

export const Shop: React.FC<ShopProps> = ({ products, wishlist, onAddToCart, onToggleWishlist, onProductClick }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');

  const categories = ['সব', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'সব' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 mb-2">আমাদের শপ</h1>
            <p className="text-slate-500 font-medium">ক্যাম্পাসের সেরা এবং খাঁটি অর্গানিক পণ্যের সংগ্রহ</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-bold uppercase tracking-widest">
            <span>{filteredProducts.length} টি পণ্য পাওয়া গেছে</span>
          </div>
        </div>
        
        {/* Thinner and Branded Search Box */}
        <div className="max-w-xl">
          <div className="flex flex-row bg-white border-2 border-[#2E7D32]/20 rounded-full shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-[#2E7D32] transition-all items-center">
            <div className="pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="পণ্য বা কিউওয়ার্ড খুঁজুন..."
              className="flex-grow px-3 py-2.5 bg-transparent outline-none text-slate-700 font-bold text-base placeholder:text-slate-300"
            />
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="pr-1 flex items-center">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent px-3 py-2 text-green-700 font-black outline-none cursor-pointer appearance-none text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onToggleWishlist={onToggleWishlist}
              onProductClick={onProductClick}
              isWishlisted={isInWishlist(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-400">দুঃখিত, কোনো পণ্য পাওয়া যায়নি।</p>
          <button 
            onClick={() => {setSearch(''); setSelectedCategory('সব');}}
            className="mt-6 text-green-600 font-bold hover:underline"
          >
            সব পণ্য আবার দেখুন
          </button>
        </div>
      )}
    </div>
  );
};