
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetAndClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col font-['Hind_Siliguri']">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">
            {step === 'cart' ? 'আপনার কার্ট' : step === 'checkout' ? 'অর্ডার সম্পন্ন করুন' : 'সাফল্য!'}
          </h2>
          <button onClick={resetAndClose} className="p-2 text-slate-400">✕</button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {step === 'cart' && (
            <div className="space-y-4">
              {items.length === 0 ? <p className="text-center text-slate-400 mt-20">কার্ট খালি</p> : items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-3xl">
                  <img src={item.image} className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-grow">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-green-600 font-bold">৳{item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-2 border rounded">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-2 border rounded">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'checkout' && (
            <div className="space-y-6">
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border p-4 rounded-xl font-bold" placeholder="আপনার নাম" />
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border p-4 rounded-xl font-bold" placeholder="ফোন নম্বর" />
              <div className="grid grid-cols-2 gap-2">
                {DELIVERY_LOCATIONS.map(loc => (
                  <button key={loc} onClick={() => setLocation(loc)} className={`p-3 border rounded-xl font-bold ${location === loc ? 'bg-green-600 text-white' : ''}`}>{loc}</button>
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">✓</div>
              <h3 className="text-2xl font-black mb-4">অর্ডার সফল হয়েছে!</h3>
              <p className="text-slate-500 font-bold">প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।</p>
              <button onClick={resetAndClose} className="mt-10 px-10 py-4 bg-green-600 text-white rounded-xl font-bold">ধন্যবাদ!</button>
            </div>
          )}
        </div>

        {items.length > 0 && step !== 'success' && (
          <div className="p-8 border-t bg-slate-50">
            <div className="flex justify-between mb-6 font-black"><span>মোট:</span> <span>৳{totalPrice}</span></div>
            <button 
              onClick={step === 'cart' ? () => setStep('checkout') : handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl text-white font-black ${isSubmitting ? 'bg-slate-400' : 'bg-green-600'}`}
            >
              {isSubmitting ? 'প্রসেসিং হচ্ছে...' : step === 'cart' ? 'চেকআউট' : 'অর্ডার নিশ্চিত করুন'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
