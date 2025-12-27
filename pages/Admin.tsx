import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, AdminUser } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { FALLBACK_IMAGE } from '../constants';

type AdminTab = 'Dashboard' | 'Products' | 'Orders' | 'Customers' | 'Staff' | 'Categories' | 'Settings';

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');

  // Refs for direct file uploads
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formState, setFormState] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি'
  });

  const [staffForm, setStaffForm] = useState<Omit<AdminUser, 'id'>>({
    username: '', phone: '', password: '', role: 'staff'
  });

  useEffect(() => {
    const session = sessionStorage.getItem('fp_admin_session');
    if (session) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(session));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const masterAdmin = (usernameInput === 'fpadmin2025' && passwordInput === 'Fp2025@2030');
    const staffMatch = staff.find(s => s.username === usernameInput && s.password === passwordInput);
    
    if (masterAdmin || staffMatch) {
      const user: AdminUser = masterAdmin 
        ? { id: '0', username: 'fpadmin2025', phone: '', password: '', role: 'admin' }
        : staffMatch!;
      setIsLoggedIn(true);
      setCurrentUser(user);
      sessionStorage.setItem('fp_admin_session', JSON.stringify(user));
    } else {
      alert('ভুল ইউজারনেম বা পাসওয়ার্ড!');
    }
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

  const toggleStock = () => setFormState(prev => ({ ...prev, stock: prev.stock > 0 ? 0 : 10 }));

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
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black">A</div>
          <div className="font-black text-slate-800 text-sm truncate">{currentUser?.username}</div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: 'Dashboard', label: 'ড্যাশবোর্ড', icon: '📊' },
            { id: 'Products', label: 'পণ্য', icon: '📦' },
            { id: 'Orders', label: 'অর্ডার', icon: '🛒' },
            { id: 'Customers', label: 'গ্রাহক', icon: '👥' },
            { id: 'Staff', label: 'ইউজার কন্ট্রোল', icon: '🛡️' },
            { id: 'Categories', label: 'ক্যাটাগরি', icon: '🏷️' },
            { id: 'Settings', label: 'সেটিংস', icon: '⚙️' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as AdminTab)} 
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-black overflow-hidden group ${
                activeTab === tab.id ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {activeTab !== tab.id && (
                <div className="absolute inset-0 bg-green-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0"></div>
              )}
              <span className="relative z-10 text-lg">{tab.icon}</span>
              <span className="relative z-10 text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 space-y-2">
          <button onClick={onBackToSite} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-xs hover:scale-105 transition-all">🏠 ওয়েবসাইট</button>
          <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-black text-xs hover:bg-red-100 transition-all">🚪 লগ আউট</button>
        </div>
      </aside>

      <main className="flex-grow ml-64 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeTab === 'Staff' ? 'ইউজার কন্ট্রোল' : activeTab}</h1>
          <button onClick={onSeedDatabase} className="text-[10px] font-black text-green-600 hover:underline uppercase tracking-tighter">🔄 ডাটা রিফ্রেশ</button>
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
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900">পণ্য ব্যবস্থাপনা</h2>
              <button onClick={() => { 
                setEditingProduct(null); 
                setFormState({name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি'}); 
                setShowProductModal(true); 
              }} className="px-5 py-2.5 bg-green-600 text-white font-black rounded-xl text-sm shadow-md hover:bg-green-700 transition-all">+ নতুন পণ্য</button>
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
                        <button onClick={() => { 
                          setEditingProduct(p); 
                          setFormState({...p}); 
                          setShowProductModal(true); 
                        }} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all">✏️</button>
                        <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Orders' && (
           <div className="bg-white p-8 rounded-[2rem] shadow-sm text-slate-900">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">অর্ডার রেকর্ড</h2>
                <button onClick={() => downloadCSV(orders, 'orders')} className="text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-all">📥 CSV ডাউনলোড</button>
             </div>
             <table className="w-full text-left">
               <thead><tr className="border-b text-[10px] uppercase font-black text-slate-400"><th className="pb-4">আইডি</th><th className="pb-4">কাস্টমার</th><th className="pb-4">টাকা</th><th className="pb-4">স্ট্যাটাস</th><th className="pb-4 text-right">অ্যাকশন</th></tr></thead>
               <tbody className="divide-y font-bold">
                 {orders.map(o => (
                   <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                     <td className="py-4 font-black text-sm">{o.id}</td>
                     <td className="py-4 font-black"><div>{o.customerName}</div><div className="text-[10px] text-slate-400">{o.customerPhone}</div></td>
                     <td className="py-4 font-black text-green-700">৳{o.totalPrice}</td>
                     <td className="py-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span></td>
                     <td className="py-4 text-right">
                       <select value={o.status} onChange={e => onUpdateOrderStatus(o.id, e.target.value as Order['status'])} className="bg-white border-2 rounded p-1 text-[10px] font-black text-slate-900 outline-none focus:border-green-500">
                         <option value="Pending">Pending</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
                       </select>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'Customers' && (
           <div className="bg-white p-8 rounded-[2rem] shadow-sm text-slate-900">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">গ্রাহক তালিকা</h2>
                <button onClick={() => downloadCSV(customers, 'customers')} className="text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-all">📥 CSV ডাউনলোড</button>
             </div>
              <table className="w-full text-left">
                <thead><tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="pb-4">ফোন</th><th className="pb-4">নাম</th><th className="pb-4">অর্ডার</th><th className="pb-4">মোট কেনাকাটা</th></tr></thead>
                <tbody className="divide-y">
                  {customers.map(c => (
                    <tr key={c.customer_phone} className="hover:bg-slate-50 transition-colors font-bold">
                      <td className="py-4 font-black text-sm">{c.customer_phone}</td>
                      <td className="py-4 text-sm font-black">{c.customer_name}</td>
                      <td className="py-4 font-black text-slate-500">{c.total_orders}</td>
                      <td className="py-4 font-black text-green-700">৳{c.total_spent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}

        {activeTab === 'Staff' && (
           <div className="bg-white p-8 rounded-[2rem] shadow-sm text-slate-900">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black">স্টাফ/ইউজার ম্যানেজমেন্ট</h2>
               {currentUser?.role === 'admin' && (
                 <button onClick={() => setShowStaffModal(true)} className="px-5 py-2.5 bg-slate-900 text-white font-black rounded-xl text-sm shadow-md hover:bg-black transition-all">+ নতুন ইউজার</button>
               )}
             </div>
             <table className="w-full text-left">
               <thead><tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="pb-4">ইউজারনেম</th><th className="pb-4">ফোন</th><th className="pb-4">রোল</th><th className="pb-4 text-right">অ্যাকশন</th></tr></thead>
               <tbody className="divide-y">
                 {staff.map(s => (
                   <tr key={s.id} className="hover:bg-slate-50 transition-colors font-bold">
                     <td className="py-4 font-black text-sm">{s.username}</td>
                     <td className="py-4 text-sm font-black text-slate-500">{s.phone || 'N/A'}</td>
                     <td className="py-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${s.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{s.role}</span></td>
                     <td className="py-4 text-right">
                       {currentUser?.role === 'admin' && s.id !== '0' && (
                         <button onClick={() => onDeleteStaff(s.id)} className="text-red-500 hover:underline text-xs font-black">রিমুভ</button>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'Categories' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm max-w-2xl text-slate-900">
            <h2 className="text-xl font-black mb-8">ক্যাটাগরি</h2>
            <div className="flex gap-3 mb-8">
              <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} className="flex-grow bg-slate-50 border-2 rounded-xl p-4 font-black outline-none focus:border-green-500 text-slate-900 placeholder:text-slate-400" placeholder="নতুন ক্যাটাগরি" />
              <button onClick={() => { if(newCatName){ onAddCategory(newCatName); setNewCatName(''); } }} className="px-8 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all">যোগ</button>
            </div>
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border-2 border-slate-50 hover:border-slate-100 transition-all">
                  <span className="font-black text-slate-700">{cat}</span>
                  <button onClick={() => onDeleteCategory(cat)} className="text-red-500 font-black text-sm hover:underline transition-all">মুছুন</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
           <div className="space-y-8 text-slate-900 pb-20">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
                <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight uppercase">ব্র্যান্ডিং ও ডিজাইন (Logo & Hero)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Logo Section */}
                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-2">সাইট লোগো</label>
                     <div className="flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                             {settings.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-slate-300">None</span>}
                          </div>
                          <div className="flex flex-col gap-2 flex-grow">
                             <button 
                                onClick={() => logoInputRef.current?.click()} 
                                className="w-full py-3 bg-green-600 text-white font-black rounded-xl text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                               </svg>
                               ছবি আপলোড
                             </button>
                             <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                             <input type="text" value={settings.logo || ''} onChange={e=>onUpdateSetting('logo', e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2 font-black text-slate-900 text-[10px] outline-none focus:border-green-500 transition-all" placeholder="অথবা লোগো লিংক (URL) দিন" />
                          </div>
                        </div>
                     </div>
                   </div>

                   {/* Hero Section */}
                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-2">হিরো ব্যানার ইমেজ</label>
                     <div className="flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                             {settings.hero_image ? <img src={settings.hero_image} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-slate-300">None</span>}
                          </div>
                          <div className="flex flex-col gap-2 flex-grow">
                             <button 
                                onClick={() => heroInputRef.current?.click()} 
                                className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                               </svg>
                               ছবি আপলোড
                             </button>
                             {/* Fixed: Use 'hero' instead of 'hero_image' to match handleFileUpload parameters */}
                             <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero')} />
                             <input type="text" value={settings.hero_image || ''} onChange={e=>onUpdateSetting('hero_image', e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2 font-black text-slate-900 text-[10px] outline-none focus:border-green-500 transition-all" placeholder="অথবা হিরো ব্যানার লিংক (URL) দিন" />
                          </div>
                        </div>
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
                <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight uppercase">সাইট ইনফরমেশন</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-2">সাইটের নাম</label>
                     <input type="text" value={settings.site_name} onChange={e=>onUpdateSetting('site_name', e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black text-slate-900 outline-none focus:border-green-500 transition-all" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-2">হোয়াটসঅ্যাপ নম্বর</label>
                     <input type="text" value={settings.whatsapp_number} onChange={e=>onUpdateSetting('whatsapp_number', e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black text-slate-900 outline-none focus:border-green-500 transition-all" />
                   </div>
                </div>
              </div>
           </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-900">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tighter text-slate-800">{editingProduct ? 'সংশোধন' : 'নতুন পণ্য'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">নাম</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black outline-none text-slate-900 focus:border-green-500 transition-all" value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ক্যাটাগরি</label>
                <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black text-slate-900 outline-none focus:border-green-500 transition-all" value={formState.category} onChange={e=>setFormState({...formState, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">মূল্য</label>
                <input type="number" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black text-slate-900 outline-none focus:border-green-500 transition-all" value={formState.price} onChange={e=>setFormState({...formState, price: Number(e.target.value)})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">সংক্ষিপ্ত বিবরণ</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black text-slate-900 outline-none focus:border-green-500 transition-all" value={formState.description} onChange={e=>setFormState({...formState, description: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">পণ্যের ছবি (URL অথবা আপলোড)</label>
                <div className="space-y-3">
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-black text-slate-900 text-xs outline-none focus:border-blue-500 transition-all" value={formState.image} onChange={e=>setFormState({...formState, image: e.target.value})} placeholder="ইমেজ লিংক এখানে পেস্ট করুন" />
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                       {formState.image ? <img src={formState.image} className="w-full h-full object-cover" /> : <div className="text-[10px] font-black text-slate-300">No Image</div>}
                    </div>
                    <button onClick={() => productFileInputRef.current?.click()} className="flex-grow py-3 border-2 border-dashed border-slate-200 rounded-xl font-black text-slate-400 text-[10px] hover:border-green-500 hover:text-green-600 transition-all">গ্যালারি থেকে ফটো আপলোড</button>
                    <input type="file" ref={productFileInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} />
                  </div>
                </div>
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">স্টক</label>
                 <button onClick={toggleStock} className={`w-full py-4 rounded-xl font-black text-sm border-2 transition-all ${formState.stock > 0 ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-red-50 border-red-200 text-red-700'}`}>{formState.stock > 0 ? '✅ স্টক আছে' : '❌ স্টক নেই'}</button>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ইউনিট</label>
                <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black text-slate-900 outline-none focus:border-green-500 transition-all" value={formState.unit} onChange={e=>setFormState({...formState, unit: e.target.value})}>
                  {UNIT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setShowProductModal(false)} className="flex-grow py-5 rounded-2xl bg-slate-100 font-black text-slate-500 transition-all hover:bg-slate-200">বাতিল</button>
              <button onClick={() => { 
                if (editingProduct) onUpdateProduct({ ...formState, id: editingProduct.id });
                else onAddProduct(formState);
                setShowProductModal(false); 
              }} className="flex-grow py-5 rounded-2xl bg-green-600 text-white font-black transition-all hover:bg-green-700 shadow-lg shadow-green-100">সংরক্ষণ করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal (User Control) */}
      {showStaffModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-slate-900">
            <h3 className="text-2xl font-black mb-6 tracking-tighter">নতুন স্টাফ যুক্ত করুন</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ইউজারনেম</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black outline-none focus:border-green-500 transition-all" value={staffForm.username} onChange={e=>setStaffForm({...staffForm, username: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">পাসওয়ার্ড</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black outline-none focus:border-green-500 transition-all" value={staffForm.password} onChange={e=>setStaffForm({...staffForm, password: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ফোন নম্বর (ঐচ্ছিক)</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 font-black outline-none focus:border-green-500 transition-all" value={staffForm.phone} onChange={e=>setStaffForm({...staffForm, phone: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">রোল</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black outline-none focus:border-green-500 transition-all" value={staffForm.role} onChange={e=>setStaffForm({...staffForm, role: e.target.value as 'staff' | 'admin'})}>
                    <option value="staff">স্টাফ</option>
                    <option value="admin">সাব-অ্যাডমিন</option>
                  </select>
               </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowStaffModal(false)} className="flex-grow py-4 rounded-xl bg-slate-100 font-black text-slate-500">বাতিল</button>
              <button onClick={() => { onAddStaff(staffForm); setShowStaffModal(false); setStaffForm({username:'', phone:'', password:'', role:'staff'}); }} className="flex-grow py-4 rounded-xl bg-slate-900 text-white font-black shadow-lg">সংরক্ষণ করুন</button>
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