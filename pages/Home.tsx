
import React, { useState } from 'react';
import { COLORS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface HomeProps {
  products: Product[];
  wishlist: Product[];
  onShopNow: () => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ 
  products, 
  wishlist,
  onShopNow, 
  onAddToCart, 
  onToggleWishlist,
  onProductClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  return (
    <div className="space-y-0 pb-16">
      {/* Hero Section */}
      <section className="relative h-[550px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600" 
            alt="Hero Background" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <span className="inline-block px-4 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6 animate-pulse">
              চবি ক্যাম্পাসে ডেলিভারি চালু আছে 🎓
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
              ফ্রেশ পণ্যের <br /> 
              <span style={{ color: COLORS.SECONDARY }}>বিশ্বস্ত ঠিকানা</span>
            </h1>
            <p className="text-lg text-gray-200/90 mb-8 leading-relaxed font-medium">
              চবি শিক্ষার্থীদের উদ্যোগে পরিচালিত একটি অর্গানিক শপ। সরাসরি কৃষকের ঘর থেকে সংগৃহীত খাঁটি পণ্য এখন আপনার হাতের নাগালে।
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onShopNow}
                className="px-8 py-4 rounded-[1.2rem] text-white font-black text-lg transition-all hover:scale-105 shadow-2xl shadow-green-500/20 active:scale-95"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                শপিং শুরু করুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { emoji: '🌿', title: '১০০% অর্গানিক', desc: 'আমরা সরাসরি সোর্স থেকে পণ্য সংগ্রহ করি যা সম্পূর্ণ কেমিক্যাল মুক্ত।', bg: 'bg-green-50', text: 'text-green-700' },
            { emoji: '🎓', title: 'শিক্ষার্থী পরিচালিত', desc: 'চবি শিক্ষার্থী দিয়ে পরিচালিত এই উদ্যোগ আপনার ক্যাম্পাস লাইফ সহজ করবে ও সুস্বাস্থ্য বজায় রাখবে', bg: 'bg-blue-50', text: 'text-blue-700' },
            { emoji: '⚡', title: 'দ্রুত ডেলিভারি', desc: 'জিরো পয়েন্ট থেকে শুরু করে সকল হলে আমরা দ্রুততম সময়ে ডেলিভারি দেই।', bg: 'bg-orange-50', text: 'text-orange-700' },
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-6 p-8 md:p-10 rounded-[2.5rem] bg-slate-50/40 border border-slate-100 transition-all hover:shadow-xl hover:bg-white hover:-translate-y-1">
              <div className={`shrink-0 w-20 h-20 ${feat.bg} ${feat.text} rounded-3xl flex items-center justify-center text-4xl shadow-sm`}>
                {feat.emoji}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-1">{feat.title}</h3>
                <p className="text-base text-slate-500 font-medium leading-tight">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consistent Search Bar Section */}
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-8">
        <div className="relative group max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="পছন্দের পণ্যটি খুঁজুন..."
            className="w-full pl-11 pr-6 py-3 bg-white border-2 border-[#2E7D32]/20 rounded-full shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-[#2E7D32] transition-all text-base font-bold text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative">
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1543255006-d6395b6f1171?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover blur-[8px]"
            alt="Background Texture"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 space-y-24 py-16">
          <ProductSection 
            title="জনপ্রিয় পণ্যসমূহ" 
            subtitle="Popular Products"
            products={filteredProducts.slice(0, 4)} 
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onProductClick={onProductClick}
            isInWishlist={isInWishlist}
            onSeeMore={onShopNow}
          />
          <ProductSection 
            title="বেস্ট সেলিং" 
            subtitle="Best Selling"
            products={filteredProducts.slice(1, 5)} 
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onProductClick={onProductClick}
            isInWishlist={isInWishlist}
            onSeeMore={onShopNow}
          />
          <ProductSection 
            title="নতুন আগমন" 
            subtitle="New Arrivals"
            products={filteredProducts.slice(2, 6)} 
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onProductClick={onProductClick}
            isInWishlist={isInWishlist}
            onSeeMore={onShopNow}
          />
          <ProductSection 
            title="মৌসুমি পণ্য" 
            subtitle="Seasonal Selections"
            products={filteredProducts.slice(3, 7)} 
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onProductClick={onProductClick}
            isInWishlist={isInWishlist}
            onSeeMore={onShopNow}
          />
          <section>
            <div className="flex justify-between items-end mb-10">
               <div>
                  <div className="text-green-600 font-black text-xs uppercase tracking-[0.3em] mb-2">Explore Categories</div>
                  <h2 className="text-4xl font-black text-slate-800">অন্যান্য ক্যাটাগরি</h2>
               </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['মধু ও তেল', 'শুকনো খাবার', 'মশলা ও গুড়', 'ফল ও সবজি'].map(cat => (
                <div key={cat} onClick={onShopNow} className="p-10 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-green-500 transition-all cursor-pointer group text-center">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-slate-800">{cat}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ProductSection = ({ title, subtitle, products, onAddToCart, onToggleWishlist, onProductClick, isInWishlist, onSeeMore }: any) => (
  <section>
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div>
        <div className="text-green-600 font-black text-xs uppercase tracking-[0.3em] mb-2">{subtitle}</div>
        <h2 className="text-4xl font-black text-slate-800">{title}</h2>
      </div>
      <button onClick={onSeeMore} className="group text-green-700 font-black text-lg hover:text-green-800 flex items-center gap-2 transition-all">
        সব দেখুন 
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
    {products.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} isWishlisted={isInWishlist(product.id)} />
        ))}
      </div>
    ) : (
      <div className="py-12 text-center bg-white/50 backdrop-blur rounded-[3rem] border border-dashed border-slate-200">
        <p className="text-lg font-bold text-slate-400">কোনো পণ্য পাওয়া যায়নি।</p>
      </div>
    )}
  </section>
);
