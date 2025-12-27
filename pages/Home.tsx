
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
  heroImage: string | null;
  siteName: string;
  whatsappNumber: string;
}

export const Home: React.FC<HomeProps> = ({ 
  products, wishlist, onShopNow, onAddToCart, onToggleWishlist, onProductClick,
  heroImage, siteName, whatsappNumber
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  return (
    <div className="space-y-0 pb-16">
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"} alt="Hero" className="w-full h-full object-cover brightness-[0.4]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            <span className="inline-block px-4 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6">ক্যাম্পাস ডেলিভারি চালু আছে 🎓</span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.3] tracking-tight">
              <span className="block mb-4">{siteName}</span>
              <span style={{ color: COLORS.SECONDARY }} className="block">অর্গানিক ও খাঁটি</span>
            </h1>
            <p className="text-xl text-gray-200/90 mb-10 leading-relaxed font-medium">সরাসরি কৃষকের ঘর থেকে সংগৃহীত খাঁটি পণ্য এখন আপনার হাতের নাগালে। চবি শিক্ষার্থীদের একটি নিজস্ব উদ্যোগ।</p>
            <button onClick={onShopNow} className="px-10 py-5 rounded-[1.5rem] text-white font-black text-xl transition-all hover:scale-105 shadow-2xl shadow-green-500/20" style={{ backgroundColor: COLORS.PRIMARY }}>শপিং শুরু করুন</button>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { emoji: '🌿', title: '১০০% অর্গানিক', desc: 'সম্পূর্ণ কেমিক্যাল মুক্ত ও প্রাকৃতিক পণ্য।', bg: 'bg-green-50', text: 'text-green-700' },
            { emoji: '🎓', title: 'চবি শিক্ষার্থী পরিচালিত', desc: 'বিশ্বস্ততা ও মানের সর্বোচ্চ গ্যারান্টি।', bg: 'bg-blue-50', text: 'text-blue-700' },
            { emoji: '⚡', title: 'দ্রুত ডেলিভারি', desc: 'ক্যাম্পাসের ভেতর আমরাই সেরা।', bg: 'bg-orange-50', text: 'text-orange-700' },
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-slate-50/40 border border-slate-100 hover:shadow-xl hover:bg-white transition-all">
              <div className={`shrink-0 w-20 h-20 ${feat.bg} ${feat.text} rounded-3xl flex items-center justify-center text-4xl shadow-sm`}>{feat.emoji}</div>
              <div><h3 className="text-2xl font-black text-slate-800 mb-1">{feat.title}</h3><p className="text-slate-500 font-medium leading-tight">{feat.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-24">
         <ProductSection title="জনপ্রিয় পণ্যসমূহ" subtitle="Popular Choice" products={filteredProducts.slice(0, 4)} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} isInWishlist={isInWishlist} onSeeMore={onShopNow} whatsappNumber={whatsappNumber} />
         <ProductSection title="বেস্ট সেলিং" subtitle="Best Selling" products={filteredProducts.slice(1, 5)} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} isInWishlist={isInWishlist} onSeeMore={onShopNow} whatsappNumber={whatsappNumber} />
      </div>
    </div>
  );
};

const ProductSection = ({ title, subtitle, products, onAddToCart, onToggleWishlist, onProductClick, isInWishlist, onSeeMore, whatsappNumber }: any) => (
  <section>
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div><div className="text-green-600 font-black text-xs uppercase tracking-[0.3em] mb-2">{subtitle}</div><h2 className="text-4xl font-black text-slate-800">{title}</h2></div>
      <button onClick={onSeeMore} className="group text-green-700 font-black text-lg hover:text-green-800 flex items-center gap-2">সব দেখুন <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((p: any) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} isWishlisted={isInWishlist(p.id)} />)}
    </div>
  </section>
);
