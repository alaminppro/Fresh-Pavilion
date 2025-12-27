
import React from 'react';
import { Product } from '../types';
import { COLORS, FALLBACK_IMAGE } from '../constants';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (id: string) => void;
  onClose: () => void;
  isWishlisted: boolean;
  wishlist: Product[];
  whatsappNumber: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  allProducts,
  onAddToCart, 
  onToggleWishlist, 
  onProductClick,
  onClose,
  isWishlisted,
  wishlist,
  whatsappNumber
}) => {
  const handlePayraOrder = () => {
    // Clean and format number for international WhatsApp link
    // Payra specifically uses 8801630145305
    const targetNumber = '8801630145305';

    const message = `হ্যালো, আমি ফ্রেশ প্যাভিলিয়ন থেকে, পায়রার মাধ্যমে এই পণ্যটি অর্ডার করতে চাই: ${product.name}`;
    window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const recommendations = relatedProducts.length >= 4 
    ? relatedProducts 
    : [...relatedProducts, ...allProducts.filter(p => p.category !== product.category && p.id !== product.id)].slice(0, 4);

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in font-['Hind_Siliguri'] relative">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-0 right-4 p-3 bg-white border border-slate-100 rounded-full shadow-lg hover:bg-slate-50 transition-all z-50 text-slate-400 hover:text-slate-800"
        title="বন্ধ করুন"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-50 mb-16">
        <div className="relative group">
          <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-slate-100">
            <img 
              src={product.image || FALLBACK_IMAGE} 
              alt={product.name} 
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <button 
            onClick={() => onToggleWishlist(product)}
            className={`absolute top-6 left-6 p-3 rounded-2xl shadow-xl transition-all z-10 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur text-gray-500 hover:text-red-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
              {product.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${product.stock > 0 ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
              {product.stock > 0 ? 'স্টক আছে' : 'স্টক নেই'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-black" style={{ color: COLORS.PRIMARY }}>৳{product.price}</span>
            <span className="text-slate-400 line-through text-lg">৳{Math.round(product.price * 1.2)}</span>
          </div>

          <div className="space-y-6 mb-10">
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {product.longDescription || product.description}
            </p>
            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
               <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2"><span className="text-blue-500">🚲</span> পায়রা ডেলিভারি সার্ভিস</h4>
               <p className="text-slate-500 text-sm font-medium">চবি ক্যাম্পাসের যেকোনো স্থানে দ্রুততম সময়ের মধ্যে ডেলিভারি পেতে পায়রা ব্যবহার করুন।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
              className={`w-full py-5 rounded-3xl text-white font-black text-xl shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${product.stock <= 0 ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'shadow-green-200 hover:shadow-green-300'}`}
              style={{ backgroundColor: product.stock > 0 ? COLORS.PRIMARY : undefined }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {product.stock > 0 ? 'কার্টে যোগ করুন' : 'স্টক নেই'}
            </button>
            <button 
              onClick={handlePayraOrder}
              className="w-full py-5 rounded-3xl text-white font-black text-xl shadow-2xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              style={{ backgroundColor: COLORS.PAYRA }}
            >
              <span>🚀</span> পায়রাতে অর্ডার
            </button>
          </div>
        </div>
      </div>

      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-green-600 font-black text-xs uppercase tracking-[0.3em] mb-2">You might also like</div>
            <h2 className="text-4xl font-black text-slate-800">সম্পর্কিত পণ্যসমূহ</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommendations.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} isWishlisted={isInWishlist(p.id)} />
          ))}
        </div>
      </section>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-4 p-8 bg-green-50 rounded-[2rem] border border-green-100"><span className="text-4xl">🌿</span><div><h3 className="font-black text-green-800">১০০% প্রাকৃতিক</h3><p className="text-green-600 text-sm font-medium">সরাসরি উৎস থেকে সংগৃহীত</p></div></div>
        <div className="flex items-center gap-4 p-8 bg-blue-50 rounded-[2rem] border border-blue-100"><span className="text-4xl">🎓</span><div><h3 className="font-black text-blue-800">চবি শিক্ষার্থী পরিচালিত</h3><p className="text-blue-600 text-sm font-medium">বিশ্বস্ততা ও মান নিশ্চিত</p></div></div>
        <div className="flex items-center gap-4 p-8 bg-orange-50 rounded-[2rem] border border-orange-100"><span className="text-4xl">⚡</span><div><h3 className="font-black text-orange-800">দ্রুত ডেলিভারি</h3><p className="text-orange-600 text-sm font-medium">ক্যাম্পাসের ভেতরেই সহজলভ্য</p></div></div>
      </div>
      
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
