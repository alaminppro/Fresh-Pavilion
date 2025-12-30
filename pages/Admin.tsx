
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

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

  const handleAddWebhook = () => {
    if (!newWebhookUrl.trim()) return;
    const currentWebhooks: string[] = JSON.parse(settings.discord_webhooks || '[]');
    if (!currentWebhooks.includes(newWebhookUrl)) {
      const updated = JSON.stringify([...currentWebhooks, newWebhookUrl]);
      onUpdateSetting('discord_webhooks', updated);
    }
    setNewWebhookUrl('');
  };

  const handleRemoveWebhook = (urlToRemove: string) => {
    const currentWebhooks: string[] = JSON.parse(settings.discord_webhooks || '[]');
    const updated = JSON.stringify(currentWebhooks.filter(url => url !== urlToRemove));
    onUpdateSetting('discord_webhooks', updated);
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
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black shrink-0">A</div>
          <div className="font-black text-slate-800 text-sm truncate">{currentUser?.username}</div>
        </div>
        <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
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
              className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-black overflow-hidden group ${
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
        <div className="p-2 space-y-1 border-t">
          <button onClick={onBackToSite} className="w-full py-2 rounded-xl bg-slate-900 text-white font-black text-xs hover:scale-[1.02] transition-all">🏠 ওয়েবসাইট</button>
          <button onClick={handleLogout} className="w-full py-2 rounded-xl bg-red-50 text-red-600 font-black text-xs hover:bg-red-100 transition-all">🚪 লগ আউট</button>
        </div>
      </aside>

      <main className="flex-grow ml-64 p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-end">
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
                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                         o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                         o.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                         'bg-orange-100 text-orange-700'
                       }`}>
                         {o.status}
                       </span>
                     </td>
                     <td className="py-5 text-right pr-4 rounded-r-xl">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                           className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-green-600 rounded-lg shadow-sm transition-all"
                           title="বিস্তারিত দেখুন"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                         </button>
                         <select 
                           value={o.status} 
                           onClick={(e) => e.stopPropagation()}
                           onChange={e => onUpdateOrderStatus(o.id, e.target.value as Order['status'])} 
                           className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-700 outline-none focus:border-green-500 shadow-sm cursor-pointer"
                         >
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

              {/* Webhooks Integration Section */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
                <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight uppercase flex items-center gap-3">
                  <span className="text-blue-500">🔗</span> ওয়েবহুক ইন্টিগ্রেশন (Discord)
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-6">আপনার সার্ভারে নতুন অর্ডারের নোটিফিকেশন পেতে ডিসকর্ড ওয়েবহুক ইউআরএল যুক্ত করুন।</p>
                
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newWebhookUrl} 
                      onChange={e => setNewWebhookUrl(e.target.value)} 
                      className="flex-grow bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-black text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" 
                      placeholder="Discord Webhook URL এখানে দিন..." 
                    />
                    <button 
                      onClick={handleAddWebhook}
                      className="px-8 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      যুক্ত করুন
                    </button>
                  </div>

                  <div className="space-y-3">
                    {JSON.parse(settings.discord_webhooks || '[]').map((url: string, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border-2 border-slate-50 hover:border-blue-100 transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0095c.1201.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
                          </div>
                          <span className="font-bold text-slate-700 text-sm truncate max-w-[400px]">{url}</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveWebhook(url)} 
                          className="text-red-400 hover:text-red-600 font-black text-xs hover:underline transition-all p-2"
                        >
                          মুছুন
                        </button>
                      </div>
                    ))}
                    {JSON.parse(settings.discord_webhooks || '[]').length === 0 && (
                      <div className="text-center py-6 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl">
                        এখনো কোনো ডিসকর্ড ওয়েবহুক যুক্ত করা হয়নি
                      </div>
                    )}
                  </div>
                </div>
              </div>
           </div>
        )}
      </main>

      {/* Improved Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-900 relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-800 transition-colors text-2xl p-2 hover:bg-slate-50 rounded-full"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
               <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedOrder.status === 'Delivered' ? 'ডেলিভারি সম্পন্ন' : selectedOrder.status === 'Cancelled' ? 'বাতিল' : 'প্রসেসিং'}
                    </span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">অর্ডার নং: {selectedOrder.id}</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">অর্ডার ডিটেইলস</h3>
                  <p className="text-slate-400 text-xs font-bold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(selectedOrder.created_at).toLocaleString('bn-BD', { dateStyle: 'long', timeStyle: 'short' })}
                  </p>
               </div>
               <div className="flex gap-3">
                  <a 
                    href={`https://wa.me/88${selectedOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`আপনার অর্ডার #${selectedOrder.id} নিয়ে কিছু তথ্য জানতে চাচ্ছি।`)}`} 
                    target="_blank" 
                    className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-green-100"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    হোয়াটসঅ্যাপ মেসেজ
                  </a>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">কাস্টমার প্রোফাইল</h4>
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">👤</div>
                     <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">নাম</div>
                        <div className="font-black text-slate-800 text-lg">{selectedOrder.customerName}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">📞</div>
                     <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">মোবাইল</div>
                        <a href={`tel:${selectedOrder.customerPhone}`} className="font-black text-green-700 text-lg hover:underline">{selectedOrder.customerPhone}</a>
                     </div>
                   </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">ডেলিভারি পয়েন্ট</h4>
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">📍</div>
                     <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">লোকেশন (চবি ক্যাম্পাস)</div>
                        <div className="font-black text-slate-800 text-lg">{selectedOrder.location}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-4 opacity-50">
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">🚚</div>
                     <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">ডেলিভারি সার্ভিস</div>
                        <div className="font-black text-slate-800 text-lg">ফ্রেশ প্যাভিলিয়ন ওন-ক্যাম্পাস</div>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-12">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">অর্ডার আইটেম লিস্ট</h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{selectedOrder.items.length} টি পণ্য</span>
               </div>
               <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <th className="px-6 py-4">পণ্য</th>
                           <th className="px-6 py-4 text-center">পরিমাণ</th>
                           <th className="px-6 py-4 text-right">দাম</th>
                           <th className="px-6 py-4 text-right">মোট</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                   <img src={item.image || FALLBACK_IMAGE} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" />
                                   <div className="font-black text-slate-800 text-sm">{item.name}</div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-600">
                                   {item.quantity} {item.unit}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right font-black text-slate-400 text-sm">৳{item.price}</td>
                             <td className="px-6 py-4 text-right font-black text-slate-900">৳{item.price * item.quantity}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl">
               <div className="w-full md:w-auto text-center md:text-left">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">সর্বমোট পরিশোধযোগ্য (Grand Total)</span>
                  <div className="text-5xl font-black tracking-tighter text-green-400">৳{selectedOrder.totalPrice}</div>
               </div>
               <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="flex flex-col gap-2 w-full sm:w-48">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">অর্ডার স্ট্যাটাস আপডেট</span>
                    <select 
                      value={selectedOrder.status} 
                      onChange={e => {
                        const newStatus = e.target.value as Order['status'];
                        onUpdateOrderStatus(selectedOrder.id, newStatus);
                        setSelectedOrder({...selectedOrder, status: newStatus});
                      }} 
                      className="w-full bg-white/10 border-2 border-white/10 rounded-2xl px-5 py-4 font-black text-white text-sm outline-none focus:border-green-500 focus:bg-white/20 transition-all cursor-pointer appearance-none"
                    >
                      <option value="Pending" className="text-slate-900">Pending (প্রসেসিং)</option>
                      <option value="Delivered" className="text-slate-900">Delivered (সম্পন্ন)</option>
                      <option value="Cancelled" className="text-slate-900">Cancelled (বাতিল)</option>
                    </select>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 hover:scale-105 transition-all text-sm mt-4 sm:mt-0">বন্ধ করুন</button>
               </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="bg-white w-full max-md rounded-[2.5rem] p-10 shadow-2xl text-slate-900">
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
