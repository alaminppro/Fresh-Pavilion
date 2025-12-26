import React from 'react';
import { Product } from '../types';
import { COLORS } from '../constants';

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onAddToCart: (p: Product) => void;
  onRemove: (p: Product) => void;
}

export const WishlistSidebar: React.FC<WishlistSidebarProps> = ({ isOpen, onClose, items, onAddToCart, onRemove }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in font-['Hind_Siliguri']">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">আপনার উইশলিস্ট</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-xl font-black">উইশলিস্ট এখন খালি!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-2xl" />
                  <div className="flex-grow">
                    <h4 className="font-black text-slate-800 text-lg leading-tight">{item.name}</h4>
                    <p className="text-green-700 font-black mt-1">৳{item.price}</p>
                    <button 
                      onClick={() => onAddToCart(item)}
                      className="mt-3 text-xs font-bold py-1.5 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      কার্টে যোগ করুন
                    </button>
                  </div>
                  <button onClick={() => onRemove(item)} className="text-slate-300 hover:text-red-500 self-start p-1 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};