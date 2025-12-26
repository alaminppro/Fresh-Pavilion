
import React, { useState } from 'react';
import { CartItem, CU_LOCATION, Order } from '../types';
import { COLORS, DELIVERY_LOCATIONS } from '../constants';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout }) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [location, setLocation] = useState<CU_LOCATION>(CU_LOCATION.ZERO_POINT);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (!customerName || !customerPhone) {
      alert('দয়া করে নাম ও ফোন নম্বর দিন।');
      return;
    }
    
    onCheckout({
        customerName,
        customerPhone,
        location,
        items,
        totalPrice
    });
    
    setStep('success');
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep('cart');
      setCustomerName('');
      setCustomerPhone('');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={resetAndClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in font-['Hind_Siliguri']">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {step === 'cart' ? 'আপনার কার্ট' : step === 'checkout' ? 'অর্ডার সম্পন্ন করুন' : 'সাফল্য!'}
          </h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-xl font-black">কার্ট এখন খালি!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-2xl" />
                      <div className="flex-grow">
                        <h4 className="font-black text-slate-800 text-lg leading-tight">{item.name}</h4>
                        <p className="text-green-700 font-black mt-1">৳{item.price}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors">-</button>
                          <span className="font-black text-slate-800 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors">+</button>
                        </div>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 self-start p-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <div className="space-y-8">
              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎓</div>
                <div>
                   <h4 className="font-black text-green-800 leading-tight text-lg">চবি ডেলিভারি</h4>
                   <p className="text-green-600/70 text-xs font-bold uppercase tracking-wider">CU Campus Exclusive</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">নাম</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-slate-700 font-bold" 
                  placeholder="আপনার পূর্ণ নাম লিখুন" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ফোন নম্বর</label>
                <input 
                  type="tel" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-slate-700 font-bold" 
                  placeholder="০১......" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">ডেলিভারি লোকেশন</label>
                <div className="grid grid-cols-2 gap-3">
                  {DELIVERY_LOCATIONS.map(loc => (
                    <button 
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`p-4 text-sm border-2 rounded-2xl transition-all font-black ${location === loc ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-32 h-32 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">অর্ডার সফল হয়েছে!</h3>
              <p className="text-slate-500 leading-relaxed font-bold text-lg">খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন। ক্যাম্পাসের ভেতরে আমরাই সেরা।</p>
              <button 
                onClick={resetAndClose}
                className="mt-12 px-12 py-5 rounded-[1.5rem] text-white font-black text-xl shadow-2xl shadow-green-200 hover:shadow-green-300 transition-all active:scale-[0.98]"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                ধন্যবাদ!
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && step !== 'success' && (
          <div className="p-8 border-t bg-slate-50/50 backdrop-blur-md">
            <div className="flex justify-between items-center mb-8">
              <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Grand Total</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">৳{totalPrice}</span>
            </div>
            {step === 'cart' ? (
              <button 
                onClick={() => setStep('checkout')}
                className="w-full py-5 rounded-3xl text-white font-black text-xl shadow-2xl shadow-green-200 hover:shadow-green-300 transition-all active:scale-[0.98]"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                চেকআউট করুন
              </button>
            ) : (
              <button 
                onClick={handleCheckout}
                className="w-full py-5 rounded-3xl text-white font-black text-xl shadow-2xl shadow-green-200 hover:shadow-green-300 transition-all active:scale-[0.98]"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                অর্ডার নিশ্চিত করুন
              </button>
            )}
          </div>
        )}
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
