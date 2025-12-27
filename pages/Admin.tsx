
import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, AdminUser } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { FALLBACK_IMAGE } from '../constants';

type AdminTab = 'Dashboard' | 'Products' | 'Orders' | 'Customers' | 'Categories' | 'Settings';

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
  const [newStaff, setNewStaff] = useState<Omit<AdminUser, 'id'>>({ username: '', password: '', phone: '', role: 'staff' });
  const [isSyncing, setIsSyncing] = useState(false);

  const [formState, setFormState] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { alert('ইমেজ সাইজ ৮০০KB এর নিচে হতে হবে।'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === 'product') setFormState(prev => ({ ...prev, image: result }));
        else if (target === 'logo') onUpdateSetting('logo', result);
        else if (target === 'hero') onUpdateSetting('hero_image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSync = async () => {
    if (window.confirm('অর্ডার হিস্টোরি থেকে গ্রাহক তালিকা তৈরি করতে চান?')) {
      setIsSyncing(true);
      await onSyncCustomers();
      setIsSyncing(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) { alert("কোন ডাটা নেই!"); return; }
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
    link.href = url; link.download = `${filename}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
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
          {(['Dashboard', 'Products', 'Orders', 'Customers', 'Categories', 'Settings'] as AdminTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === tab ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="text-lg">{tab === 'Dashboard' ? '📊' : tab === 'Products' ? '📦' : tab === 'Orders' ? '🛒' : tab === 'Customers' ? '👥' : tab === 'Categories' ? '🏷️' : '⚙️'}</span>
              <span className="text-sm">{tab === 'Dashboard' ? 'ড্যাশবোর্ড' : tab === 'Products' ? 'পণ্য' : tab === 'Orders' ? 'অর্ডার' : tab === 'Customers' ? 'গ্রাহক' : tab === 'Categories' ? 'ক্যাটাগরি' : 'সেটিংস'}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 space-y-2">
          <button onClick={onBackToSite} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-xs">🏠 ওয়েবসাইট</button>
          <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-black text-xs">🚪 লগ আউট</button>
        </div>
      </aside>

      <main className="flex-grow ml-64 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div><h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeTab}</h1></div>
          <div className="flex flex-col items-end">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('bn-BD')}</div>
             <button onClick={onSeedDatabase} className="text-[10px] font-black text-green-600 hover:underline uppercase tracking-tighter flex items-center gap-1">🔄 রিফ্রেশ ডাটা</button>
          </div>
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
              <h2 className="text-xl font-black">পণ্য ব্যবস্থাপনা</h2>
              <button onClick={() => { setEditingProduct(null); setFormState({name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি'}); setShowProductModal(true); }} className="px-5 py-2.5 bg-green-600 text-white font-black rounded-xl text-sm shadow-md hover:bg-green-700 transition-all">+ নতুন পণ্য</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl flex gap-4 border border-slate-100 hover:shadow-md transition-shadow relative">
                  <img src={p.image || FALLBACK_IMAGE} onError={(e) => e.currentTarget.src = FALLBACK_IMAGE} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-black text-sm truncate text-slate-800">{p.name}</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-green-700">৳{p.price}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingProduct(p); setFormState({...p}); setShowProductModal(true); }} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">✏️</button>
                        <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                      </div>
                    </div>
                  </div>
                  {p.stock <= 0 && <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full uppercase">Stock Out</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Customers' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black">গ্রাহক তালিকা ({customers.length})</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-1">স্বয়ংক্রিয়ভাবে সিঙ্ক হয়</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSync} disabled={isSyncing} className={`px-4 py-2 border-2 border-green-600 text-green-700 font-black rounded-xl text-xs transition-all flex items-center gap-2 ${isSyncing ? 'opacity-50' : 'hover:bg-green-50'}`}>{isSyncing ? 'সিঙ্ক হচ্ছে...' : '🔄 গ্রাহক ডাটা সিঙ্ক'}</button>
                <button onClick={() => downloadCSV(customers, 'fp_customers')} className="px-4 py-2 bg-slate-900 text-white font-black rounded-xl text-xs shadow-md">📥 CSV ডাউনলোড</button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead><tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="pb-4">নাম ও ফোন</th><th className="pb-4">অর্ডার সংখ্যা</th><th className="pb-4">মোট কেনাকাটা</th><th className="pb-4">নিবন্ধনের সময়</th></tr></thead>
              <tbody className="divide-y">
                {customers.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold">কোনো গ্রাহক ডাটা পাওয়া যায়নি।</td></tr>
                ) : customers.map(c => (
                  <tr key={c.customer_phone} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4"><div className="font-black text-sm text-slate-900">{c.customer_name || 'নাম নেই'}</div><div className="text-[10px] text-slate-400 font-bold">{c.customer_phone}</div></td>
                    <td className="py-4 font-black text-slate-700">{c.total_orders || 0} টি</td>
                    <td className="py-4 font-black text-green-700">৳{c.total_spent || 0}</td>
                    <td className="py-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-600">{c.created_at ? new Date(c.created_at).toLocaleDateString('bn-BD') : '-'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">অর্ডার রেকর্ড ({orders.length})</h2>
              <button onClick={() => downloadCSV(orders, 'fp_orders')} className="px-4 py-2 bg-slate-900 text-white font-black rounded-xl text-xs shadow-md">📥 CSV ডাউনলোড</button>
            </div>
            <table className="w-full text-left">
              <thead><tr className="border-b text-[10px] uppercase font-black text-slate-400"><th className="pb-4">আইডি</th><th className="pb-4">গ্রাহক</th><th className="pb-4">লোকেশন</th><th className="pb-4">টাকা</th><th className="pb-4">অবস্থা</th><th className="pb-4 text-right">আপডেট</th></tr></thead>
              <tbody className="divide-y">
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">কোনো অর্ডার পাওয়া যায়নি।</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors text-slate-900">
                    <td className="py-4 font-black text-sm">{o.id}</td>
                    <td className="py-4"><div className="font-black text-xs">{o.customerName}</div><div className="text-[10px] text-slate-400">{o.customerPhone}</div></td>
                    <td className="py-4 text-[10px] font-bold">{o.location}</td>
                    <td className="py-4 font-black text-green-700">৳{o.totalPrice}</td>
                    <td className="py-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span></td>
                    <td className="py-4 text-right">
                      <select value={o.status} onChange={e => onUpdateOrderStatus(o.id, e.target.value as Order['status'])} className="bg-slate-50 border rounded p-1 text-[10px] font-black outline-none focus:border-green-500 text-slate-900">
                        <option value="Pending">Pending</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm max-w-2xl">
            <h2 className="text-xl font-black mb-8">ক্যাটাগরি ব্যবস্থাপনা</h2>
            <div className="flex gap-3 mb-8">
              <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} className="flex-grow bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold outline-none text-slate-900 focus:border-green-500" placeholder="নতুন ক্যাটাগরি" />
              <button onClick={() => { if(newCatName){ onAddCategory(newCatName); setNewCatName(''); } }} className="px-8 py-4 bg-slate-900 text-white font-black rounded-xl">যোগ করুন</button>
            </div>
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-black text-slate-700">{cat}</span>
                  <button onClick={() => { if(window.confirm('নিশ্চিত?')) onDeleteCategory(cat); }} className="text-red-500 font-bold hover:underline text-sm">মুছে ফেলুন</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="space-y-10">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
               <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">🎨 সাইট ব্র্যান্ডিং ও ভিজ্যুয়াল</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">সাইট লোগো (Square)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden border flex items-center justify-center">
                        {settings.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <span className="font-black text-green-600">FP</span>}
                      </div>
                      <button onClick={() => logoInputRef.current?.click()} className="flex-grow py-4 border-2 border-dashed rounded-xl font-black text-slate-400 hover:border-green-400 hover:text-green-500 transition-all text-xs">লোগো পরিবর্তন করুন</button>
                      <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">হিরো ব্যানার ইমেজ (Landing Page)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden border">
                        <img src={settings.hero_image} className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => heroInputRef.current?.click()} className="flex-grow py-4 border-2 border-dashed rounded-xl font-black text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all text-xs">ব্যানার পরিবর্তন করুন</button>
                      <input type="file" ref={heroInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-4">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">সাইট সেটিংস</label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500">সাইটের নাম</span>
                          <input type="text" value={settings.site_name} onChange={e => onUpdateSetting('site_name', e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 font-bold text-sm outline-none focus:border-green-500 text-slate-900" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500">পায়রা হোয়াটসঅ্যাপ নম্বর</span>
                          <input type="text" value={settings.whatsapp_number} onChange={e => onUpdateSetting('whatsapp_number', e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 font-bold text-sm outline-none focus:border-green-500 text-slate-900" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500">সাপোর্ট ফোন নম্বর</span>
                          <input type="text" value={settings.support_phone} onChange={e => onUpdateSetting('support_phone', e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 font-bold text-sm outline-none focus:border-green-500 text-slate-900" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">👥 ইউজার ও স্টাফ ব্যবস্থাপনা</h3>
                <button onClick={() => setShowStaffModal(true)} className="px-4 py-2 bg-blue-600 text-white font-black rounded-xl text-xs shadow-md">+ স্টাফ যোগ করুন</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-black text-sm text-slate-900">fpadmin2025 (Master)</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Admin</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-black">সিস্টেম</span>
                </div>
                {staff.map(s => (
                  <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-slate-900">{s.username}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.role === 'staff' ? 'Staff' : 'Sub-Admin'}</div>
                    </div>
                    <button onClick={() => onDeleteStaff(s.id)} className="text-red-500 hover:text-red-700 transition-colors">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showStaffModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur" onClick={() => setShowStaffModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-black mb-8 text-slate-800">নতুন স্টাফ যোগ করুন</h3>
            <div className="space-y-4">
              <input type="text" className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none text-slate-900 focus:border-green-500" value={newStaff.username} onChange={e=>setNewStaff({...newStaff, username: e.target.value})} placeholder="ইউজারনেম" />
              <input type="password" className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none text-slate-900 focus:border-green-500" value={newStaff.password} onChange={e=>setNewStaff({...newStaff, password: e.target.value})} placeholder="পাসওয়ার্ড" />
              <select className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none cursor-pointer text-slate-900" value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role: e.target.value as 'staff' | 'admin'})}>
                <option value="staff">স্টাফ (Staff)</option>
                <option value="admin">সাব-অ্যাডমিন (Sub-Admin)</option>
              </select>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowStaffModal(false)} className="flex-grow py-4 rounded-xl bg-slate-100 font-black text-slate-500">বাতিল</button>
              <button onClick={() => { onAddStaff(newStaff); setShowStaffModal(false); }} className="flex-grow py-4 rounded-xl bg-blue-600 text-white font-black">যোগ করুন</button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black mb-8 tracking-tighter text-slate-800">{editingProduct ? 'সংশোধন' : 'নতুন পণ্য এন্ট্রি'}</h3>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">পণ্যের নাম</label>
                <input type="text" className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none text-slate-900 focus:border-green-500" value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} placeholder="উদা: অর্গানিক মধু" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">ক্যাটাগরি</label>
                <select className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none cursor-pointer text-slate-900" value={formState.category} onChange={e=>setFormState({...formState, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">মূল্য (৳)</label>
                <input type="number" className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none text-slate-900 focus:border-green-500" value={formState.price} onChange={e=>setFormState({...formState, price: Number(e.target.value)})} placeholder="৳৪৫০" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">সংক্ষিপ্ত বিবরণ</label>
                <input type="text" className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none text-slate-900 focus:border-green-500" value={formState.description} onChange={e=>setFormState({...formState, description: e.target.value})} placeholder="উদা: ১০০% খাঁটি প্রাকৃতিক মধু" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">বিস্তারিত বিবরণ (Description)</label>
                <textarea className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none text-slate-900 focus:border-green-500 h-32 resize-none" value={formState.longDescription} onChange={e=>setFormState({...formState, longDescription: e.target.value})} placeholder="পণ্যের গুণাগুণ ও বিস্তারিত এখানে লিখুন..." />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">পণ্যের ছবি (URL অথবা আপলোড)</label>
                <div className="space-y-3">
                  <input type="text" className="w-full bg-slate-50 border rounded-xl p-3 font-bold outline-none text-slate-900 focus:border-blue-500 text-xs" value={formState.image} onChange={e=>setFormState({...formState, image: e.target.value})} placeholder="ইমেজ লিংক এখানে পেস্ট করুন (Optional)" />
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                       {formState.image ? <img src={formState.image} onError={(e) => e.currentTarget.src = FALLBACK_IMAGE} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No Image</div>}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-grow py-3 border-2 border-dashed rounded-xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">গ্যালারি থেকে ফটো আপলোড</button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} />
                  </div>
                </div>
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">স্টক স্ট্যাটাস</label>
                 <button onClick={toggleStock} className={`w-full py-4 rounded-xl font-black text-sm transition-all border-2 ${formState.stock > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                   {formState.stock > 0 ? '✅ স্টক আছে (In Stock)' : '❌ স্টক নেই (Stock Out)'}
                 </button>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">একক (Unit)</label>
                <select 
                  className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none cursor-pointer text-slate-900" 
                  value={formState.unit} 
                  onChange={e=>setFormState({...formState, unit: e.target.value})}
                >
                  {UNIT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setShowProductModal(false)} className="flex-grow py-4 rounded-xl bg-slate-100 font-black text-slate-500">বাতিল</button>
              <button onClick={() => { editingProduct ? onUpdateProduct({ ...formState, id: editingProduct.id }) : onAddProduct(formState); setShowProductModal(false); }} className="flex-grow py-4 rounded-xl bg-green-600 text-white font-black">সংরক্ষণ করুন</button>
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
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 shadow-inner ${bgClasses[color]}`}>{icon}</div>
      <div className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">{val}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
};
