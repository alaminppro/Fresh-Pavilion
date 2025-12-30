
import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, AdminUser } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { FALLBACK_IMAGE } from '../constants';

type AdminTab = 'Dashboard' | 'Products' | 'Orders' | 'Customers' | 'Staff' | 'Categories' | 'Settings' | 'Notifications';

interface AdminProps {
  products: Product[];
  orders: Order[];
  categories: string[];
  staff: AdminUser[];
  customers: any[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (p: Product) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  onAddStaff: (s: Omit<AdminUser, 'id'>) => void;
  onDeleteStaff: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onSeedDatabase: () => void;
  onSyncCustomers: () => void;
  onBackToSite: () => void;
  settings: any;
  onUpdateSetting: (key: string, value: string) => void;
}

const UNIT_OPTIONS = ['টি', 'কেজি', 'গ্রাম', 'লিটার', 'মিলি', 'হালি', 'ডজন', 'প্যাকেট'];

export const Admin: React.FC<AdminProps> = ({ 
  products, orders, categories, staff, customers,
  onAddProduct, onDeleteProduct, onUpdateProduct,
  onAddCategory, onDeleteCategory, 
  onAddStaff, onDeleteStaff,
  onUpdateOrderStatus, onSeedDatabase, onSyncCustomers, onBackToSite,
  settings, onUpdateSetting
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি'
  });

  const [staffForm, setStaffForm] = useState<Omit<AdminUser, 'id'>>({
    username: '', phone: '', password: '', role: 'staff'
  });

  useEffect(() => {
    const session = sessionStorage.getItem('fp_admin_session');
    if (session) { setIsLoggedIn(true); setCurrentUser(JSON.parse(session)); }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const masterAdmin = (usernameInput === 'fpadmin2025' && passwordInput === 'Fp2025@2030');
    const staffMatch = staff.find(s => s.username === usernameInput && s.password === passwordInput);
    
    if (masterAdmin || staffMatch) {
      const user: AdminUser = masterAdmin ? { id: '0', username: 'fpadmin2025', phone: '', password: '', role: 'admin' } : staffMatch!;
      setIsLoggedIn(true); setCurrentUser(user); sessionStorage.setItem('fp_admin_session', JSON.stringify(user));
    } else alert('ভুল ইউজারনেম বা পাসওয়ার্ড!');
  };

  const handleLogout = () => { setIsLoggedIn(false); sessionStorage.removeItem('fp_admin_session'); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'hero' | 'product') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert('ইমেজ সাইজ ১MB এর নিচে হতে হবে।'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === 'logo') onUpdateSetting('logo', result);
        else if (target === 'hero') onUpdateSetting('hero_image', result);
        else if (target === 'product') setFormState(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => {
        let val = row[header];
        if (header === 'items' && Array.isArray(val)) val = val.map(i => `${i.name} x${i.quantity}`).join(' | ');
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvString = "\ufeff" + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `${filename}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-['Hind_Siliguri']">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl"><span className="text-white font-black text-3xl">FP</span></div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">অ্যাডমিন প্যানেল</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-green-500 text-slate-900 placeholder:text-slate-500" placeholder="ইউজারনেম" />
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-green-500 text-slate-900 placeholder:text-slate-500" placeholder="পাসওয়ার্ড" />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-black text-xl shadow-lg bg-[#2E7D32] hover:bg-green-700 transition-all">প্রবেশ করুন</button>
          </form>
          <div className="mt-8 text-center"><button onClick={onBackToSite} className="text-slate-500 font-bold text-sm hover:text-slate-700">ওয়েবসাইটে ফিরে যান</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Hind_Siliguri']">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-40 shadow-xl">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black">A</div>
          <div className="font-black text-slate-800 text-sm truncate">{currentUser?.username}</div>
        </div>
        <nav className="flex-grow p-3 space-y-1">
          {[
            { id: 'Dashboard', label: 'ড্যাশবোর্ড', icon: '📊' },
            { id: 'Products', label: 'পণ্য', icon: '📦' },
            { id: 'Orders', label: 'অর্ডার', icon: '🛒' },
            { id: 'Customers', label: 'গ্রাহক', icon: '👥' },
            { id: 'Notifications', label: 'নোটিফিকেশন', icon: '🔔' },
            { id: 'Staff', label: 'ইউজার কন্ট্রোল', icon: '🛡️' },
            { id: 'Categories', label: 'ক্যাটাগরি', icon: '🏷️' },
            { id: 'Settings', label: 'সেটিংস', icon: '⚙️' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 font-black overflow-hidden group ${activeTab === tab.id ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              {activeTab !== tab.id && <div className="absolute inset-0 bg-green-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0"></div>}
              <span className="relative z-10 text-lg">{tab.icon}</span>
              <span className="relative z-10 text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t space-y-1">
          <button onClick={onBackToSite} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:scale-[1.02] transition-all">🏠 ওয়েবসাইট</button>
          <button onClick={handleLogout} className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-black text-xs hover:bg-red-100 transition-all">🚪 লগ আউট</button>
        </div>
      </aside>

      <main className="flex-grow ml-64 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeTab}</h1>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="মোট পণ্য" val={products.length} icon="📦" color="green" />
            <StatCard label="মোট অর্ডার" val={orders.length} icon="🛍️" color="blue" />
            <StatCard label="মোট গ্রাহক" val={customers.length} icon="👥" color="purple" />
            <StatCard label="মোট আয়" val={`৳${orders.reduce((s,o)=>s+o.totalPrice, 0)}`} icon="💸" color="orange" />
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="space-y-8 text-slate-900 pb-20 max-w-4xl">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
              <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="text-orange-500">🔔</span> অর্ডার নোটিফিকেশন সিস্টেম
              </h3>
              <p className="text-slate-500 mb-8 font-medium leading-relaxed">
                নতুন অর্ডার আসার সাথে সাথে ইমেইল বা মেসেজ পেতে নিচের যেকোনো একটি মাধ্যম ব্যবহার করুন। আমরা সার্ভার-সাইড নোটিফিকেশন রিকমেন্ড করি।
              </p>

              <div className="space-y-10">
                {/* Discord/Slack/Zapier Option */}
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-2">Webhook URL (Zapier, Discord, or Make)</h4>
                  <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">সহজ ও দ্রুত মাধ্যম</p>
                  <input 
                    type="text" 
                    value={settings.notification_webhook_url || ''} 
                    onChange={e => onUpdateSetting('notification_webhook_url', e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-xl p-4 font-black text-sm outline-none focus:border-green-500 transition-all mb-4" 
                    placeholder="https://hooks.zapier.com/..."
                  />
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl text-blue-800 text-xs font-bold leading-relaxed">
                    <span className="text-lg">💡</span>
                    <span>আপনি যদি Discord ব্যবহার করেন, তবে আপনার চ্যানেলের Webhook URL এখানে দিন। নতুন অর্ডার আসলে সেখানে অটোমেটিক মেসেজ চলে যাবে।</span>
                  </div>
                </div>

                {/* Resend/Supabase Instructions */}
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                    📧 ইমেইল নোটিফিকেশন (Advanced)
                  </h4>
                  <div className="space-y-4 text-sm text-slate-600 font-medium">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-black text-[10px]">১</div>
                      <p><a href="https://resend.com" target="_blank" className="text-green-600 underline">Resend.com</a>-এ একটি ফ্রি অ্যাকাউন্ট খুলুন।</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-black text-[10px]">২</div>
                      <p>Supabase-এ একটি "Edge Function" তৈরি করুন যা নতুন অর্ডারে ইমেইল পাঠাবে।</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Orders' && (
           <div className="bg-white p-8 rounded-[2rem] shadow-sm text-slate-900">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">অর্ডার রেকর্ড</h2>
                <button onClick={() => downloadCSV(orders, 'orders')} className="text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-all">📥 CSV ডাউনলোড</button>
             </div>
             <table className="w-full text-left border-separate border-spacing-y-2">
               <thead><tr className="text-[10px] uppercase font-black text-slate-400"><th className="pb-4 pl-4">আইডি</th><th className="pb-4">কাস্টমার</th><th className="pb-4">টাকা</th><th className="pb-4">স্ট্যাটাস</th><th className="pb-4 text-right pr-4">অ্যাকশন</th></tr></thead>
               <tbody className="font-bold">
                 {orders.map(o => (
                   <tr key={o.id} onClick={() => setSelectedOrder(o)} className="group bg-slate-50/50 hover:bg-white hover:shadow-md transition-all rounded-xl cursor-pointer overflow-hidden">
                     <td className="py-5 pl-4 font-black text-sm rounded-l-xl">{o.id}</td>
                     <td className="py-5">
                       <div className="font-black text-slate-800">{o.customerName}</div>
                       <div className="text-[10px] text-slate-400">{o.customerPhone}</div>
                     </td>
                     <td className="py-5 font-black text-green-700">৳{o.totalPrice}</td>
                     <td className="py-5">
                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : o.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                         {o.status}
                       </span>
                     </td>
                     <td className="py-5 text-right pr-4 rounded-r-xl">
                       <div className="flex items-center justify-end gap-2">
                         <select value={o.status} onClick={(e) => e.stopPropagation()} onChange={e => onUpdateOrderStatus(o.id, e.target.value as Order['status'])} className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-700 outline-none shadow-sm cursor-pointer">
                           <option value="Pending">Pending</option>
                           <option value="Delivered">Delivered</option>
                           <option value="Cancelled">Cancelled</option>
                         </select>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
        
        {activeTab === 'Products' && (
           <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900">পণ্য ব্যবস্থাপনা</h2>
              <button onClick={() => { setEditingProduct(null); setFormState({name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি'}); setShowProductModal(true); }} className="px-5 py-2.5 bg-green-600 text-white font-black rounded-xl text-sm shadow-md hover:bg-green-700 transition-all">+ নতুন পণ্য</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl flex gap-4 border border-slate-100 hover:shadow-md transition-shadow relative">
                  <img src={p.image || FALLBACK_IMAGE} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-black text-sm truncate text-slate-800">{p.name}</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-green-700">৳{p.price}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingProduct(p); setFormState({...p}); setShowProductModal(true); }} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">✏️</button>
                        <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
             <button onClick={() => setShowProductModal(false)} className="absolute top-6 right-6 text-slate-400 text-xl">✕</button>
             <h3 className="text-2xl font-black mb-6">পণ্যের তথ্য</h3>
             <div className="grid grid-cols-2 gap-6">
                <input type="text" placeholder="নাম" className="col-span-2 p-4 bg-slate-50 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-green-500" value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} />
                <input type="number" placeholder="মূল্য" className="p-4 bg-slate-50 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-green-500" value={formState.price} onChange={e=>setFormState({...formState, price: Number(e.target.value)})} />
                <select className="p-4 bg-slate-50 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-green-500" value={formState.category} onChange={e=>setFormState({...formState, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="mt-8 flex gap-4">
               <button onClick={() => setShowProductModal(false)} className="flex-grow py-4 bg-slate-100 rounded-xl font-black text-slate-500">বাতিল</button>
               <button onClick={() => { if(editingProduct) onUpdateProduct({...formState, id: editingProduct.id}); else onAddProduct(formState); setShowProductModal(false); }} className="flex-grow py-4 bg-green-600 text-white rounded-xl font-black">সংরক্ষণ</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, val, icon, color }: any) => {
  const bgClasses: any = { green: 'bg-green-50 text-green-500', blue: 'bg-blue-50 text-blue-500', purple: 'bg-purple-50 text-purple-500', orange: 'bg-orange-50 text-orange-500' };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 transition-all hover:scale-105 hover:shadow-xl group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-all group-hover:rotate-12 ${bgClasses[color]}`}>{icon}</div>
      <div className="text-3xl font-black text-slate-900 tracking-tighter">{val}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</div>
    </div>
  );
};
