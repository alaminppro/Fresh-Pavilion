
import React from 'react';
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
  heroImage: string | null;
  siteName: string;
  whatsappNumber: string;
  categories: string[];
}

const getCategoryEnglishName = (cat: string) => {
  const map: Record<string, string> = {
    'মধু ও তেল': 'Honey & Oil',
    'শুকনো খাবার': 'Dry Foods',
    'মশলা ও গুড়': 'Spices & Jaggery',
    'ফল ও সবজি': 'Fruits & Vegetables',
    'স্বাস্থ্য': 'Health & Beauty',
    'অন্যান্য': 'Others'
  };
  return map[cat] || 'Organic Collection';
};

export const Home: React.FC<HomeProps> = ({ 
  products, wishlist, onShopNow, onAddToCart, onToggleWishlist, onProductClick,
  heroImage, siteName, whatsappNumber, categories
}) => {
  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const bestSellingProducts = products.filter(p => p.isBestSelling).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="space-y-0 pb-16">
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"} alt="Hero" className="w-full h-full object-cover brightness-[0.35]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-2xl bg-white/5 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl">
            <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-8 shadow-xl shadow-green-500/20 border border-green-400/30 animate-flicker-status">
              ক্যাম্পাস ডেলিভারি চালু আছে 🎓
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.3] tracking-tight">
              <span className="block mb-4">{siteName}</span>
              <span style={{ color: COLORS.SECONDARY }} className="block">অর্গানিক ও খাঁটি</span>
            </h1>
            <p className="text-xl text-gray-200/90 mb-10 leading-relaxed font-medium">সরাসরি কৃষকের ঘর থেকে সংগৃহীত খাঁটি পণ্য এখন আপনার হাতের নাগালে। চবি শিক্ষার্থীদের একটি নিজস্ব উদ্যোগ।</p>
            <div className="flex flex-wrap gap-4">
               <button onClick={onShopNow} className="px-10 py-5 rounded-[1.8rem] text-white font-black text-xl transition-all hover:scale-105 shadow-2xl shadow-green-500/20" style={{ backgroundColor: COLORS.PRIMARY }}>শপিং শুরু করুন</button>
               <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="px-10 py-5 rounded-[1.8rem] bg-white/10 backdrop-blur-md text-white font-black text-xl border border-white/20 transition-all hover:bg-white/20">সংগ্রহ দেখুন</button>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-12 max-w-[1600px] mx-auto space-y-28 mt-12">
        {/* Key Selling Points */}
        <section className="bg-white py-12 rounded-[3rem] shadow-sm border border-slate-50 px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { emoji: '🌿', title: '১০০% অর্গানিক', desc: 'সম্পূর্ণ কেমিক্যাল মুক্ত ও প্রাকৃতিক পণ্য।', bg: 'bg-green-50', text: 'text-green-700' },
              { emoji: '🎓', title: 'চবি শিক্ষার্থী পরিচালিত', desc: 'বিশ্বস্ততা ও মানের সর্বোচ্চ গ্যারান্টি।', bg: 'bg-blue-50', text: 'text-blue-700' },
              { emoji: '⚡', title: 'দ্রুত ডেলিভারি', desc: 'ক্যাম্পাসের ভেতর আমরাই সেরা।', bg: 'bg-orange-50', text: 'text-orange-700' },
            ].map((feat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group">
                <div className={`shrink-0 w-24 h-24 ${feat.bg} ${feat.text} rounded-[2rem] flex items-center justify-center text-5xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>{feat.emoji}</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{feat.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Automatic Static Sections */}
        {featuredProducts.length > 0 && (
          <ProductSection 
            title="জনপ্রিয় পণ্যসমূহ" 
            subtitle="Featured Selection" 
            products={featuredProducts} 
            onAddToCart={onAddToCart} 
            onToggleWishlist={onToggleWishlist} 
            onProductClick={onProductClick} 
            isInWishlist={isInWishlist} 
            onSeeMore={onShopNow} 
          />
        )}

        {bestSellingProducts.length > 0 && (
          <ProductSection 
            title="বেস্ট সেলিং" 
            subtitle="Top Rated Choices" 
            products={bestSellingProducts} 
            onAddToCart={onAddToCart} 
            onToggleWishlist={onToggleWishlist} 
            onProductClick={onProductClick} 
            isInWishlist={isInWishlist} 
            onSeeMore={onShopNow} 
          />
        )}

        {newArrivals.length > 0 && (
          <ProductSection 
            title="নতুন পণ্য" 
            subtitle="Fresh Arrivals" 
            products={newArrivals} 
            onAddToCart={onAddToCart} 
            onToggleWishlist={onToggleWishlist} 
            onProductClick={onProductClick} 
            isInWishlist={isInWishlist} 
            onSeeMore={onShopNow} 
          />
        )}

        {/* Category Header */}
        <div className="pt-8 border-t border-slate-100">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">ক্যাটাগরি অনুযায়ী দেখুন</h2>
            <div className="w-24 h-1.5 bg-green-600 mx-auto rounded-full mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Explore our dynamic collections</p>
          </div>
          
          {/* Dynamic Category Sections */}
          <div className="space-y-32">
            {categories.map((cat) => {
              const catProducts = products.filter(p => p.category === cat);
              if (catProducts.length === 0) return null;

              return (
                <ProductSection 
                  key={cat}
                  title={cat} 
                  subtitle={getCategoryEnglishName(cat)} 
                  products={catProducts.slice(0, 4)}
                  onAddToCart={onAddToCart} 
                  onToggleWishlist={onToggleWishlist} 
                  onProductClick={onProductClick} 
                  isInWishlist={isInWishlist} 
                  onSeeMore={onShopNow} 
                />
              );
            })}
          </div>
        </div>

        {/* Refined 'Other Categories' Grid Section */}
        <section className="pt-24 pb-24 border-t border-slate-100">
          <div className="mb-16">
            <span className="text-green-600 font-black text-xs uppercase tracking-[0.4em] block mb-2">EXPLORE CATEGORIES</span>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">অন্যান্য ক্যাটাগরি</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <div 
                key={cat} 
                onClick={onShopNow} 
                className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                {/* Left Sliding Green Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>
                
                {/* Centered Icon Container */}
                <div className="w-20 h-20 bg-green-50/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 group-hover:bg-green-100">
                  <svg className="w-10 h-10 text-green-600 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                
                {/* Category Name */}
                <h4 className="font-black text-slate-800 text-xl tracking-tight mb-1">{cat}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Products</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const ProductSection = ({ title, subtitle, products, onAddToCart, onToggleWishlist, onProductClick, isInWishlist, onSeeMore }: any) => (
  <section className="scroll-mt-24">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
      <div>
        <div className="text-green-600 font-black text-[11px] uppercase tracking-[0.5em] mb-3">{subtitle}</div>
        <h2 className="text-5xl font-black text-slate-800 tracking-tighter">{title}</h2>
      </div>
      <button onClick={onSeeMore} className="group px-8 py-4 bg-slate-900 hover:bg-green-700 text-white font-black text-sm rounded-2xl transition-all flex items-center gap-3 shadow-xl">
        আরও দেখুন 
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      {products.map((p: any) => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} isWishlisted={isInWishlist(p.id)} />
      ))}
    </div>
  </section>
);
