
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

  const [formState, setFormState] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি',
    isFeatured: false, isBestSelling: false, isNew: false
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
      const user: AdminUser = masterAdmin ? { id: '0', username: 'fpadmin2025', phone: '', password: '', role: 'admin' } : staffMatch!;
      setIsLoggedIn(true);
      setCurrentUser(user);
      sessionStorage.setItem('fp_admin_session', JSON.stringify(user));
    } else { alert('ভুল ইউজারনেম বা পাসওয়ার্ড!'); }
  };

  const handleLogout = () => { setIsLoggedIn(false); sessionStorage.removeItem('fp_admin_session'); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
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

        {activeTab === 'Products' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">পণ্য ব্যবস্থাপনা</h2>
              <button onClick={() => { 
                setEditingProduct(null); 
                setFormState({name: '', price: 0, description: '', longDescription: '', image: '', category: categories[0] || 'খাবার', stock: 10, unit: 'টি', isFeatured: false, isBestSelling: false, isNew: false }); 
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
                    <div className="flex gap-1 mt-1">
                       {p.isFeatured && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[7px] font-black uppercase">Popular</span>}
                       {p.isBestSelling && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[7px] font-black uppercase">Best Selling</span>}
                       {p.isNew && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[7px] font-black uppercase">New</span>}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-green-700">৳{p.price}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { 
                          setEditingProduct(p); 
                          setFormState({
                            name: p.name,
                            price: p.price,
                            description: p.description,
                            longDescription: p.longDescription || '',
                            image: p.image,
                            category: p.category,
                            stock: p.stock,
                            unit: p.unit,
                            isFeatured: p.isFeatured === true,
                            isBestSelling: p.isBestSelling === true,
                            isNew: p.isNew === true
                          }); 
                          setShowProductModal(true); 
                        }} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">✏️</button>
                        <button onClick={() => { if(window.confirm('নিশ্চিত?')) onDeleteProduct(p.id); }} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                      </div>
                    </div>
                  </div>
                  {p.stock <= 0 && <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full uppercase">Stock Out</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs (Dashboard, Orders, etc) */}
        {activeTab === 'Dashboard' && <div className="p-10 text-center font-bold text-slate-400">Dashboard functionality is limited in this view.</div>}
        {activeTab === 'Orders' && <div className="p-10 text-center font-bold text-slate-400">Orders view...</div>}
      </main>

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

              {/* Persisting Homepage Selection Controls */}
              <div className="col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200/50">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 block">হোমপেজ সেটিংস (Section Selection)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setFormState(prev => ({...prev, isFeatured: !prev.isFeatured}))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-black text-xs transition-all border-2 ${formState.isFeatured ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-green-200'}`}
                  >
                    <span>{formState.isFeatured ? '✓' : '+'}</span> জনপ্রিয় পণ্যসমূহ
                  </button>
                  <button 
                    onClick={() => setFormState(prev => ({...prev, isBestSelling: !prev.isBestSelling}))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-black text-xs transition-all border-2 ${formState.isBestSelling ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'}`}
                  >
                    <span>{formState.isBestSelling ? '✓' : '+'}</span> বেস্ট সেলিং
                  </button>
                  <button 
                    onClick={() => setFormState(prev => ({...prev, isNew: !prev.isNew}))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-black text-xs transition-all border-2 ${formState.isNew ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-orange-200'}`}
                  >
                    <span>{formState.isNew ? '✓' : '+'}</span> নতুন পণ্য
                  </button>
                </div>
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
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">পণ্যের ছবি (URL)</label>
                <input type="text" className="w-full bg-slate-50 border rounded-xl p-3 font-bold outline-none text-slate-900 focus:border-blue-500 text-xs" value={formState.image} onChange={e=>setFormState({...formState, image: e.target.value})} placeholder="ইমেজ লিংক এখানে পেস্ট করুন" />
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">স্টক স্ট্যাটাস</label>
                 <button onClick={toggleStock} className={`w-full py-4 rounded-xl font-black text-sm transition-all border-2 ${formState.stock > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                   {formState.stock > 0 ? '✅ স্টক আছে' : '❌ স্টক নেই'}
                 </button>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">একক (Unit)</label>
                <select className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none cursor-pointer text-slate-900" value={formState.unit} onChange={e=>setFormState({...formState, unit: e.target.value})}>
                  {UNIT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setShowProductModal(false)} className="flex-grow py-4 rounded-xl bg-slate-100 font-black text-slate-500">বাতিল</button>
              <button onClick={() => { 
                if (editingProduct) onUpdateProduct({ ...formState, id: editingProduct.id });
                else onAddProduct(formState);
                setShowProductModal(false); 
              }} className="flex-grow py-4 rounded-xl bg-green-600 text-white font-black">সংরক্ষণ করুন</button>
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
