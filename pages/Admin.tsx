
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
      {/* COMPACT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-40 shadow-xl">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black shrink-0">A</div>
          <div className="font-black text-slate-800 text-xs truncate">অ্যাডমিন: {currentUser?.username}</div>
        </div>
        <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 font-black text-sm ${activeTab === tab.id ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t space-y-1">
          <button onClick={onBackToSite} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:scale-[1.02] transition-all">🏠 ওয়েবসাইট</button>
          <button onClick={handleLogout} className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-black text-xs hover:bg-red-100 transition-all">🚪 লগ আউট</button>
        </div>
      </aside>

      <main className="flex-grow ml-64 p-10 overflow-y-auto">
        <header className="mb-8">
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

        {activeTab === 'Products' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-800">পণ্য ব্যবস্থাপনা</h2>
              <button onClick={() => { setEditingProduct(null); setFormState({name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি'}); setShowProductModal(true); }} className="px-6 py-3 bg-green-600 text-white font-black rounded-2xl shadow-lg hover:bg-green-700 transition-all">+ নতুন পণ্য</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-3xl flex gap-4 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                    <img src={p.image || FALLBACK_IMAGE} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-black text-sm truncate text-slate-800 mb-1">{p.name}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{p.category}</span>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-green-700 text-lg">৳{p.price}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingProduct(p); setFormState({...p}); setShowProductModal(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">✏️</button>
                        <button onClick={() => { if(confirm('ডিলিট করতে চান?')) onDeleteProduct(p.id); }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 text-slate-900">
             <table className="w-full text-left border-separate border-spacing-y-2">
               <thead>
                 <tr className="text-[10px] uppercase font-black text-slate-400">
                   <th className="pb-4 pl-4">আইডি</th>
                   <th className="pb-4">গ্রাহক</th>
                   <th className="pb-4">মোট টাকা</th>
                   <th className="pb-4">স্ট্যাটাস</th>
                   <th className="pb-4 text-right pr-4">অ্যাকশন</th>
                 </tr>
               </thead>
               <tbody className="font-bold">
                 {orders.map(o => (
                   <tr key={o.id} onClick={() => setSelectedOrder(o)} className="group bg-slate-50/50 hover:bg-white hover:shadow-md transition-all rounded-2xl cursor-pointer overflow-hidden">
                     <td className="py-5 pl-4 font-black text-xs rounded-l-2xl">{o.id}</td>
                     <td className="py-5">
                       <div className="font-black text-slate-800 text-sm">{o.customerName}</div>
                       <div className="text-[10px] text-slate-400">{o.customerPhone}</div>
                     </td>
                     <td className="py-5 font-black text-green-700">৳{o.totalPrice}</td>
                     <td className="py-5">
                       <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : o.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                         {o.status}
                       </span>
                     </td>
                     <td className="py-5 text-right pr-4 rounded-r-2xl">
                        <select 
                          value={o.status} 
                          onClick={(e) => e.stopPropagation()} 
                          onChange={e => onUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black text-slate-700 outline-none shadow-sm cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'Customers' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
             <table className="w-full text-left border-separate border-spacing-y-2">
               <thead>
                 <tr className="text-[10px] uppercase font-black text-slate-400">
                   <th className="pb-4 pl-4">গ্রাহক</th>
                   <th className="pb-4">মোট অর্ডার</th>
                   <th className="pb-4">মোট খরচ</th>
                   <th className="pb-4">সর্বশেষ লোকেশন</th>
                 </tr>
               </thead>
               <tbody className="font-bold">
                 {customers.map(c => (
                   <tr key={c.customer_phone} className="bg-slate-50/50 rounded-2xl overflow-hidden">
                     <td className="py-5 pl-4 rounded-l-2xl">
                       <div className="font-black text-slate-800 text-sm">{c.customer_name}</div>
                       <div className="text-[10px] text-slate-400">{c.customer_phone}</div>
                     </td>
                     <td className="py-5 text-slate-700">{c.total_orders} বার</td>
                     <td className="py-5 text-green-700 font-black">৳{c.total_spent}</td>
                     <td className="py-5 text-slate-500 rounded-r-2xl">{c.last_location}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'Staff' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-800">অ্যাডমিন ইউজার লিস্ট</h2>
              <button onClick={() => setShowStaffModal(true)} className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-lg">+ নতুন স্টাফ</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staff.map(s => (
                <div key={s.id} className="p-6 bg-slate-50 rounded-[2rem] flex justify-between items-center border border-slate-100">
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{s.username}</h4>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.role} | {s.phone}</p>
                  </div>
                  <button onClick={() => onDeleteStaff(s.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="max-w-xl bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <div className="flex gap-4 mb-8">
              <input type="text" placeholder="ক্যাটাগরি নাম..." value={newCatName} onChange={e=>setNewCatName(e.target.value)} className="flex-grow p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-green-600" />
              <button onClick={() => { if(newCatName) onAddCategory(newCatName); setNewCatName(''); }} className="px-8 bg-green-600 text-white font-black rounded-2xl shadow-lg">যোগ</button>
            </div>
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                  <span className="font-black text-slate-800">{c}</span>
                  <button onClick={() => onDeleteCategory(c)} className="text-red-500 hover:scale-110 transition-transform">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="max-w-3xl space-y-8 pb-20">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
              <h3 className="text-2xl font-black text-slate-800 mb-8">বেসিক সেটিংস</h3>
              <div className="space-y-6">
                <SettingInput label="সাইটের নাম" val={settings.site_name} onSave={v => onUpdateSetting('site_name', v)} />
                <SettingInput label="হোয়াটসঅ্যাপ নম্বর" val={settings.whatsapp_number} onSave={v => onUpdateSetting('whatsapp_number', v)} />
                <SettingInput label="সাপোর্ট ফোন" val={settings.support_phone} onSave={v => onUpdateSetting('support_phone', v)} />
                
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">সাইট লোগো</label>
                    <div onClick={() => logoInputRef.current?.click()} className="h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-green-600 transition-all overflow-hidden group">
                      {settings.logo ? <img src={settings.logo} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" /> : <span className="text-4xl text-slate-300">+</span>}
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">হিরো ইমেজ</label>
                    <div onClick={() => heroInputRef.current?.click()} className="h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-green-600 transition-all overflow-hidden group">
                      {settings.hero_image ? <img src={settings.hero_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-4xl text-slate-300">+</span>}
                      <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'hero')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 max-w-2xl">
            <h3 className="text-2xl font-black text-slate-800 mb-6">🔔 নোটিফিকেশন কনফিগারেশন</h3>
            <p className="text-slate-500 mb-8 font-medium">অর্ডার আসার সাথে সাথে অটোমেটিক মেসেজ পেতে Webhook URL ব্যবহার করুন।</p>
            <div className="space-y-6">
               <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2 block">Discord/Slack Webhook URL</label>
                  <input type="text" value={settings.notification_webhook_url || ''} onChange={e=>onUpdateSetting('notification_webhook_url', e.target.value)} className="w-full p-4 bg-white border-none rounded-xl font-bold shadow-inner outline-none focus:ring-2 focus:ring-orange-500" placeholder="https://..." />
               </div>
               <div className="text-xs font-bold text-slate-400 leading-relaxed pl-2 italic">
                 *আপনি ডিসকর্ড চ্যানেলের Webhook URL দিলে প্রতিবার অর্ডারে সেখানে বিস্তারিত মেসেজ চলে যাবে।
               </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-3xl font-black text-slate-800">অর্ডার ডিটেইলস</h3>
                 <button onClick={() => setSelectedOrder(null)} className="text-2xl text-slate-400">✕</button>
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-3xl grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-black uppercase text-slate-400">অর্ডার আইডি</label><div className="font-black">{selectedOrder.id}</div></div>
                    <div><label className="text-[10px] font-black uppercase text-slate-400">লোকেশন</label><div className="font-black text-green-700">{selectedOrder.location}</div></div>
                    <div><label className="text-[10px] font-black uppercase text-slate-400">গ্রাহক</label><div className="font-black">{selectedOrder.customerName}</div></div>
                    <div><label className="text-[10px] font-black uppercase text-slate-400">ফোন</label><div className="font-black">{selectedOrder.customerPhone}</div></div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-2">পণ্যসমূহ</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                       {selectedOrder.items.map((it,idx) => (
                         <div key={idx} className="flex justify-between p-3 bg-white border border-slate-100 rounded-xl font-bold text-sm">
                            <span>{it.name} x{it.quantity}</span>
                            <span className="text-green-700">৳{it.price * it.quantity}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-black text-xl">মোট পরিশোধযোগ্য:</span>
                    <span className="text-3xl font-black text-green-700">৳{selectedOrder.totalPrice}</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-black text-slate-800">{editingProduct ? 'পণ্য এডিট' : 'নতুন পণ্য'}</h3>
               <button onClick={() => setShowProductModal(false)} className="text-2xl text-slate-400">✕</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div>
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">পণ্যের নাম</label>
                     <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-green-600 outline-none font-bold" value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">মূল্য</label>
                        <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-green-600 outline-none font-bold" value={formState.price} onChange={e=>setFormState({...formState, price: Number(e.target.value)})} />
                     </div>
                     <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">স্টক</label>
                        <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-green-600 outline-none font-bold" value={formState.stock} onChange={e=>setFormState({...formState, stock: Number(e.target.value)})} />
                     </div>
                   </div>
                   <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">ক্যাটাগরি</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-green-600 outline-none font-bold appearance-none" value={formState.category} onChange={e=>setFormState({...formState, category: e.target.value})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>
                <div className="space-y-6">
                   <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">ইমেজ</label>
                      <div className="h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => document.getElementById('p-file')?.click()}>
                         {formState.image ? <img src={formState.image} className="w-full h-full object-cover" /> : <span className="text-4xl text-slate-300">+</span>}
                         <input type="file" id="p-file" className="hidden" onChange={e => handleFileUpload(e, 'product')} />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">সংক্ষিপ্ত বর্ণনা</label>
                      <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-green-600 outline-none font-bold h-24" value={formState.description} onChange={e=>setFormState({...formState, description: e.target.value})} />
                   </div>
                </div>
             </div>
             <div className="flex gap-4 mt-10">
               <button onClick={() => setShowProductModal(false)} className="flex-grow py-5 bg-slate-100 text-slate-500 font-black rounded-3xl">বাতিল</button>
               <button onClick={() => { if(editingProduct) onUpdateProduct({...formState, id: editingProduct.id}); else onAddProduct(formState); setShowProductModal(false); }} className="flex-grow py-5 bg-green-600 text-white font-black rounded-3xl shadow-xl">সংরক্ষণ করুন</button>
             </div>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">নতুন স্টাফ যোগ করুন</h3>
            <div className="space-y-4">
               <input type="text" placeholder="ইউজারনেম" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={staffForm.username} onChange={e=>setStaffForm({...staffForm, username: e.target.value})} />
               <input type="password" placeholder="পাসওয়ার্ড" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={staffForm.password} onChange={e=>setStaffForm({...staffForm, password: e.target.value})} />
               <input type="tel" placeholder="ফোন নম্বর" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={staffForm.phone} onChange={e=>setStaffForm({...staffForm, phone: e.target.value})} />
               <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold appearance-none" value={staffForm.role} onChange={e=>setStaffForm({...staffForm, role: e.target.value as any})}>
                 <option value="staff">স্টাফ</option>
                 <option value="admin">অ্যাডমিন</option>
               </select>
               <div className="flex gap-4 pt-4">
                 <button onClick={() => setShowStaffModal(false)} className="flex-grow py-4 bg-slate-100 text-slate-500 font-black rounded-2xl">বন্ধ</button>
                 <button onClick={() => { onAddStaff(staffForm); setShowStaffModal(false); }} className="flex-grow py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl">যোগ করুন</button>
               </div>
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

const SettingInput = ({ label, val, onSave }: { label: string, val: string, onSave: (v: string) => void }) => {
  const [value, setValue] = useState(val);
  const [isChanged, setIsChanged] = useState(false);
  useEffect(() => { setValue(val); setIsChanged(false); }, [val]);
  return (
    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 pl-2">{label}</label>
      <div className="flex gap-3">
        <input type="text" value={value} onChange={e => { setValue(e.target.value); setIsChanged(true); }} className="flex-grow p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-green-600 outline-none font-bold" />
        {isChanged && <button onClick={() => onSave(value)} className="px-6 bg-green-600 text-white font-black rounded-2xl shadow-lg">সেভ</button>}
      </div>
    </div>
  );
};
