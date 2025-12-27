
import React, { useState } from 'react';
import { CartItem, CU_LOCATION, Order } from '../types';
import { COLORS, DELIVERY_LOCATIONS } from '../constants';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: (orderData: Omit<Order, 'id' | 'created_at' | 'status'>) => Promise<boolean>;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout }) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<CU_LOCATION>(CU_LOCATION.ZERO_POINT);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!customerName || !customerPhone) {
      alert('দয়া করে নাম ও ফোন নম্বর দিন।');
      return;
    }
    
    setIsSubmitting(true);
    const success = await onCheckout({
        customerName,
        customerPhone,
        location,
        items,
        totalPrice
    });
    
    setIsSubmitting(false);
    if (success) {
      setStep('success');
    }
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
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col font-['Hind_Siliguri']">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">
            {step === 'cart' ? 'আপনার কার্ট' : step === 'checkout' ? 'অর্ডার সম্পন্ন করুন' : 'সাফল্য!'}
          </h2>
          <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {step === 'cart' && (
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                   </svg>
                   <p className="text-xl font-bold">কার্ট খালি</p>
                </div>
              ) : items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 border border-slate-100 rounded-[2rem] bg-white relative group hover:border-green-100 transition-all shadow-sm">
                  {/* Remove Button - Prominently visible */}
                  <button 
                    onClick={() => onRemove(item.id)} 
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-10"
                    title="আইটেমটি বাদ দিন"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  
                  <div className="flex-grow pr-8">
                    <h4 className="font-black text-slate-800 leading-tight mb-1 max-w-[180px]">{item.name}</h4>
                    <p className="text-green-600 font-black text-lg">৳{item.price}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-1">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 font-black transition-all"
                        >-</button>
                        <span className="w-8 text-center font-black text-slate-800 tabular-nums">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 font-black transition-all"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'checkout' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">ব্যক্তিগত তথ্য</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-green-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400" 
                  placeholder="আপনার নাম" 
                />
                <input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-green-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400" 
                  placeholder="ফোন নম্বর" 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">ডেলিভারি পয়েন্ট</label>
                <div className="grid grid-cols-2 gap-2">
                  {DELIVERY_LOCATIONS.map(loc => (
                    <button 
                      key={loc} 
                      onClick={() => setLocation(loc)} 
                      className={`p-3 border-2 rounded-2xl font-black text-sm transition-all ${location === loc ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100' : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-100'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-20 px-6">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">অর্ডার সফল হয়েছে!</h3>
              <p className="text-slate-500 font-bold leading-relaxed mb-10">খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন। ক্যাম্পাসের ভেতরে আমরাই সেরা।</p>
              <button onClick={resetAndClose} className="w-full py-5 bg-green-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all">ধন্যবাদ!</button>
            </div>
          )}
        </div>

        {items.length > 0 && step !== 'success' && (
          <div className="p-8 border-t bg-slate-50 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between mb-6">
              <span className="text-slate-600 font-bold uppercase tracking-widest text-xs self-center">মোট পরিমাণ:</span>
              <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">৳{totalPrice}</span>
            </div>
            <button 
              onClick={step === 'cart' ? () => setStep('checkout') : handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl text-white font-black text-xl transition-all active:scale-[0.98] shadow-2xl ${isSubmitting ? 'bg-slate-300 shadow-none' : 'bg-green-600 shadow-green-100 hover:bg-green-700'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>প্রসেসিং হচ্ছে...</span>
                </div>
              ) : step === 'cart' ? 'চেকআউট' : 'অর্ডার নিশ্চিত করুন'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
