
import React, { useState, useRef, useEffect } from 'react';
import { COLORS } from '../constants';
import { Product, Order, AdminUser } from '../types';

type AdminTab = 'Dashboard' | 'Products' | 'Orders' | 'Customers' | 'Categories' | 'Settings';

interface AdminProps {
  products: Product[];
  orders: Order[];
  categories: string[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (p: Product) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onSeedDatabase: () => void;
  onBackToSite: () => void;
}

export const Admin: React.FC<AdminProps> = ({ 
  products, 
  orders, 
  categories,
  onAddProduct, 
  onDeleteProduct, 
  onUpdateProduct,
  onAddCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onSeedDatabase,
  onBackToSite
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const [formState, setFormState] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    longDescription: '',
    image: '',
    category: categories[0] || 'খাবার',
    stock: 10,
    unit: 'টি'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('fp_admin_session');
    if (session) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(session));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      const user: AdminUser = { id: '0', username: 'Master Admin', phone: '', password: '', role: 'admin' };
      setIsLoggedIn(true);
      setCurrentUser(user);
      sessionStorage.setItem('fp_admin_session', JSON.stringify(user));
    } else {
      alert('ভুল ইউজারনেম বা পাসওয়ার্ড!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('fp_admin_session');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert('ইমেজ সাইজ ৫০০KB এর নিচে হতে হবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormState(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setFormState({ ...p });
    } else {
      setEditingProduct(null);
      setFormState({
        name: '',
        price: 0,
        description: '',
        longDescription: '',
        image: '',
        category: categories[0] || 'খাবার',
        stock: 10,
        unit: 'টি'
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!formState.name || formState.price <= 0 || !formState.image) {
      alert('সঠিক তথ্য ও ছবি দিন');
      return;
    }
    editingProduct ? onUpdateProduct({ ...formState, id: editingProduct.id }) : onAddProduct(formState);
    setShowProductModal(false);
  };

  const customers = Array.from(new Set(orders.map(o => o.customerPhone))).map(phone => {
    const customerOrders = orders.filter(o => o.customerPhone === phone);
    return { 
      phone, 
      name: customerOrders[0].customerName, 
      orderCount: customerOrders.length, 
      totalSpent: customerOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      lastOrder: customerOrders[customerOrders.length - 1].date 
    };
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-['Hind_Siliguri']">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-white font-black text-3xl">FP</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">অ্যাডমিন প্যানেল</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-green-500" placeholder="ইউজারনেম দিন" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-green-500" placeholder="পাসওয়ার্ড দিন" />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-black text-xl shadow-lg bg-[#2E7D32] hover:bg-green-700 transition-all">প্রবেশ করুন</button>
          </form>
          <div className="mt-8 text-center"><button onClick={onBackToSite} className="text-slate-400 font-bold text-sm">ওয়েবসাইটে ফিরে যান</button></div>
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
              <span className="text-lg">
                {tab === 'Dashboard' ? '📊' : tab === 'Products' ? '📦' : tab === 'Orders' ? '🛒' : tab === 'Customers' ? '👥' : tab === 'Categories' ? '🏷️' : '⚙️'}
              </span>
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
          <div><h1 className="text-3xl font-black text-slate-900">{activeTab}</h1></div>
          <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="মোট পণ্য" val={products.length} icon="📦" color="green" />
            <StatCard label="মোট অর্ডার" val={orders.length} icon="🛍️" color="blue" />
            <StatCard label="মোট ক্যাটাগরি" val={categories.length} icon="🏷️" color="purple" />
            <StatCard label="মোট আয়" val={`৳${orders.reduce((s,o)=>s+o.totalPrice, 0)}`} icon="💸" color="orange" />
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">পণ্য ব্যবস্থাপনা</h2>
              <button onClick={() => handleOpenModal()} className="px-5 py-2.5 bg-green-600 text-white font-black rounded-xl text-sm shadow-md hover:bg-green-700 transition-all">+ নতুন পণ্য</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl flex gap-4 border border-slate-100 hover:shadow-md transition-shadow">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-black text-sm truncate text-slate-800">{p.name}</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-green-700">৳{p.price}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenModal(p)} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">✏️</button>
                        <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm max-w-2xl">
            <h2 className="text-xl font-black mb-8">ক্যাটাগরি কন্ট্রোল</h2>
            <div className="flex gap-3 mb-8">
              <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} className="flex-grow bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-green-500" placeholder="নতুন ক্যাটাগরি নাম (যেমন: ফল)" />
              <button onClick={() => { if(newCatName){ onAddCategory(newCatName); setNewCatName(''); } }} className="px-8 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all">যোগ করুন</button>
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

        {activeTab === 'Orders' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b text-[10px] uppercase font-black text-slate-400"><th className="pb-4">আইডি</th><th className="pb-4">গ্রাহক</th><th className="pb-4">লোকেশন</th><th className="pb-4">টাকা</th><th className="pb-4">অবস্থা</th><th className="pb-4 text-right">আপডেট</th></tr></thead>
              <tbody className="divide-y">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-black text-sm">{o.id}</td>
                    <td className="py-4"><div className="font-black text-xs">{o.customerName}</div><div className="text-[10px] text-slate-400">{o.customerPhone}</div></td>
                    <td className="py-4 text-[10px] font-bold">{o.location}</td>
                    <td className="py-4 font-black text-green-700">৳{o.totalPrice}</td>
                    <td className="py-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span></td>
                    <td className="py-4 text-right">
                      <select value={o.status} onChange={e => onUpdateOrderStatus(o.id, e.target.value as Order['status'])} className="bg-slate-50 border rounded p-1 text-[10px] font-black outline-none cursor-pointer">
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
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <table className="w-full text-left">
              <thead><tr className="border-b text-[10px] font-black text-slate-400"><th className="pb-4">গ্রাহক</th><th className="pb-4">অর্ডার সংখ্যা</th><th className="pb-4">মোট কেনাকাটা</th><th className="pb-4">শেষ অর্ডার</th></tr></thead>
              <tbody className="divide-y">
                {customers.map(c => (
                  <tr key={c.phone}>
                    <td className="py-4"><div className="font-black text-sm">{c.name}</div><div className="text-[10px] text-slate-400">{c.phone}</div></td>
                    <td className="py-4 font-black">{c.orderCount} টি</td>
                    <td className="py-4 font-black text-green-700">৳{c.totalSpent}</td>
                    <td className="py-4 text-[10px] font-bold text-slate-500">{new Date(c.lastOrder).toLocaleDateString('bn-BD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 max-w-2xl">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">🚀 সিস্টেম টুলস</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                আপনার ডাটাবেজ যদি খালি থাকে, তাহলে নিচের বাটনটি ক্লিক করে ডামি ডাটা দিয়ে শুরু করতে পারেন। এটি আপনার Supabase একাউন্টে ১২টি অর্গানিক প্রোডাক্ট আপলোড করে দিবে।
              </p>
              <button 
                onClick={onSeedDatabase}
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <span>🌱</span> সিস্টেম ডাটা দিয়ে শুরু করুন
              </button>
            </div>
          </div>
        )}
      </main>

      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black mb-8 tracking-tighter">{editingProduct ? 'সংশোধন' : 'নতুন পণ্য এন্ট্রি'}</h3>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পণ্যের নাম</label>
                <input type="text" className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none focus:border-green-500 mt-1" value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} placeholder="যেমন: অর্গানিক মধু" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ক্যাটাগরি</label>
                <select className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none cursor-pointer mt-1" value={formState.category} onChange={e=>setFormState({...formState, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">মূল্য (৳)</label>
                <input type="number" className="w-full bg-slate-50 border rounded-xl p-4 font-bold outline-none focus:border-green-500 mt-1" value={formState.price} onChange={e=>setFormState({...formState, price: Number(e.target.value)})} placeholder="৳" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পণ্যের ছবি (Max 500KB)</label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden border">{formState.image && <img src={formState.image} className="w-full h-full object-cover" />}</div>
                  <button onClick={() => fileInputRef.current?.click()} className="flex-grow py-4 border-2 border-dashed rounded-xl font-black text-slate-400 hover:border-green-400 hover:text-green-500 transition-all">ছবি নির্বাচন করুন</button>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setShowProductModal(false)} className="flex-grow py-4 rounded-xl bg-slate-100 font-black text-slate-500 hover:bg-slate-200 transition-all">বাতিল</button>
              <button onClick={handleSaveProduct} className="flex-grow py-4 rounded-xl bg-green-600 text-white font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all">সংরক্ষণ করুন</button>
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
