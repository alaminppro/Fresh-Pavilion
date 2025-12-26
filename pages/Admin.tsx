import React, { useState, useRef, useEffect } from 'react';
import { COLORS, INITIAL_PRODUCTS } from '../constants';
import { Product, Order, AdminUser } from '../types';

type AdminTab = 'Dashboard' | 'Products' | 'Orders' | 'Customers' | 'Settings';

interface AdminProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (p: Product) => void;
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onBackToSite: () => void;
}

export const Admin: React.FC<AdminProps> = ({ 
  products, 
  orders, 
  onAddProduct, 
  onDeleteProduct, 
  onUpdateProduct,
  onUpdateOrderStatus,
  onBackToSite
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);

  // Sub-Admin State
  const [subAdmins, setSubAdmins] = useState<AdminUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Modal Form State for Products
  const [formState, setFormState] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    longDescription: '',
    image: '',
    category: 'খাবার',
    stock: 0,
    unit: 'টি'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAdmins = localStorage.getItem('fp_subadmins');
    if (savedAdmins) setSubAdmins(JSON.parse(savedAdmins));
    
    const session = sessionStorage.getItem('fp_admin_session');
    if (session) {
      const user = JSON.parse(session);
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
    
    calculateStorage();
  }, [products, orders, subAdmins]);

  useEffect(() => {
    localStorage.setItem('fp_subadmins', JSON.stringify(subAdmins));
  }, [subAdmins]);

  const calculateStorage = () => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length * 2) / 1024 / 1024; // MB
      }
    }
    setStorageUsage(total);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleAddUser = () => {
    if (!newUserEmail || !newUserPhone) {
      alert("ইমেইল ও ফোন নম্বর দিন");
      return;
    }
    const pass = generatePassword();
    const newUser: AdminUser = {
      id: Date.now().toString(),
      username: newUserEmail,
      phone: newUserPhone,
      password: pass,
      role: 'staff'
    };
    setSubAdmins([...subAdmins, newUser]);
    setNewUserEmail('');
    setNewUserPhone('');
    alert(`নতুন ইউজার তৈরি হয়েছে!\nইউজারনেম: ${newUserEmail}\nপাসওয়ার্ড: ${pass}\n\nদয়া করে এটি কপি করে রাখুন।`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let authenticatedUser: AdminUser | null = null;

    if (username === 'admin' && password === '1234') {
      authenticatedUser = { id: '0', username: 'Master Admin', phone: '', password: '', role: 'admin' };
    } else {
      const found = subAdmins.find(a => a.username === username && a.password === password);
      if (found) authenticatedUser = found;
    }

    if (authenticatedUser) {
      setIsLoggedIn(true);
      setCurrentUser(authenticatedUser);
      sessionStorage.setItem('fp_admin_session', JSON.stringify(authenticatedUser));
    } else {
      alert('ভুল ইউজারনেম বা পাসওয়ার্ড!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    sessionStorage.removeItem('fp_admin_session');
  };

  const handleResetProducts = () => {
    if (window.confirm('পণ্য তালিকা রিসেট করতে চান? আপনার বর্তমান সকল পণ্য তথ্য মুছে যাবে।')) {
      localStorage.setItem('fp_products', JSON.stringify(INITIAL_PRODUCTS));
      window.location.reload();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert('ইমেজ সাইজ ৫০০KB এর নিচে হতে হবে। বড় ইমেজ আপনার ব্রাউজার স্টোরেজ দ্রুত শেষ করে ফেলবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setFormState({
        name: p.name,
        price: p.price,
        description: p.description,
        longDescription: p.longDescription || '',
        image: p.image,
        category: p.category,
        stock: p.stock,
        unit: p.unit || 'টি'
      });
    } else {
      setEditingProduct(null);
      setFormState({
        name: '',
        price: 0,
        description: '',
        longDescription: '',
        image: '',
        category: 'খাবার',
        stock: 0,
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
    if (editingProduct) {
      onUpdateProduct({ ...formState, id: editingProduct.id });
    } else {
      onAddProduct(formState);
    }
    setShowProductModal(false);
  };

  const customers = Array.from(new Set(orders.map(o => o.customerPhone))).map(phone => {
    const customerOrders = orders.filter(o => o.customerPhone === phone);
    const firstName = customerOrders[0].customerName;
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const lastOrder = customerOrders[customerOrders.length - 1].date;
    return { phone, name: firstName, orderCount: customerOrders.length, totalSpent, lastOrder };
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-['Hind_Siliguri']">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-900/20">
              <span className="text-white font-black text-4xl">FP</span>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">অ্যাডমিন প্যানেল</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-3">Secure Access Terminal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 outline-none focus:border-green-500 transition-all font-bold text-slate-800" 
                placeholder="ইউজারনেম দিন"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 outline-none focus:border-green-500 transition-all font-bold text-slate-800" 
                placeholder="পাসওয়ার্ড দিন"
              />
            </div>
            <button type="submit" className="w-full py-5 rounded-2xl text-white font-black text-xl shadow-2xl shadow-green-500/30 bg-[#2E7D32] hover:bg-green-700 transition-all active:scale-[0.98]">
              প্রবেশ করুন
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={onBackToSite} className="text-slate-400 font-bold text-sm hover:text-green-600 transition-colors flex items-center justify-center gap-2 mx-auto">
              ওয়েবসাইটে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Hind_Siliguri'] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-40 shadow-xl sidebar-no-scrollbar">
        <div className="p-6 flex items-center gap-4 border-b border-slate-50">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
            {currentUser?.username[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="font-black text-slate-800 text-sm truncate">{currentUser?.username}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{currentUser?.role}</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-grow px-4 py-6 space-y-1.5 overflow-y-auto sidebar-no-scrollbar">
          {(['Dashboard', 'Products', 'Orders', 'Customers', 'Settings'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold group ${
                activeTab === tab 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg transition-transform group-hover:scale-110">
                {tab === 'Dashboard' && '📊'}
                {tab === 'Products' && '📦'}
                {tab === 'Orders' && '🛒'}
                {tab === 'Customers' && '👥'}
                {tab === 'Settings' && '⚙️'}
              </span>
              <span className="text-sm">{tab}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-slate-50/20 space-y-2">
          <button 
            onClick={onBackToSite} 
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs transition-all hover:bg-slate-800 active:scale-95"
          >
            <span>🏠</span> ওয়েবসাইট হোম
          </button>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-black text-xs border border-red-100 transition-all hover:bg-red-600 hover:text-white active:scale-95"
          >
            <span>🚪</span> লগ আউট (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow ml-64 p-10 h-screen overflow-y-auto scroll-smooth">
        <header className="mb-10 flex justify-between items-start">
          <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{activeTab}</h1>
             <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-md">V2.0</span>
               <p className="text-slate-400 font-bold text-[11px]">ম্যানেজমেন্ট কন্ট্রোল</p>
             </div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-50 text-right min-w-[160px]">
             <div className="text-lg font-black text-slate-800 tabular-nums">{new Date().toLocaleTimeString()}</div>
             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
               {new Date().toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="মোট পণ্য" val={products.length} icon="📦" color="green" />
              <StatCard label="মোট অর্ডার" val={orders.length} icon="🛍️" color="blue" />
              <StatCard label="মোট আয়" val={`৳${orders.reduce((s,o)=>s+o.totalPrice, 0)}`} icon="💸" color="orange" />
              
              {/* Storage Health Card */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${storageUsage > 4 ? 'bg-red-50 text-red-500' : 'bg-purple-50 text-purple-500'} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-inner`}>
                  💾
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <div className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{storageUsage.toFixed(2)}</div>
                  <div className="text-[10px] font-black text-slate-400 mb-1">MB / 5MB</div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${storageUsage > 4 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${(storageUsage / 5) * 100}%` }}></div>
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">স্টোরেজ স্বাস্থ্য</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                      <span className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">📈</span>
                      সাম্প্রতিক সেলস রিপোর্ট
                    </h3>
                    <button onClick={() => setActiveTab('Orders')} className="text-green-600 font-black text-xs hover:underline">সব দেখুন</button>
                  </div>
                  <div className="space-y-3">
                    {orders.length > 0 ? orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-black text-slate-300 border border-slate-100 text-[10px]">#</div>
                          <div>
                            <div className="font-black text-slate-800 text-sm">{o.customerName}</div>
                            <div className="text-[9px] text-slate-400 font-bold tracking-wider">{o.id} • {new Date(o.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-green-700 text-base">৳{o.totalPrice}</div>
                          <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${o.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{o.status}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="py-12 text-center text-slate-300 font-bold">এখনো কোনো অর্ডার আসেনি</div>
                    )}
                  </div>
               </div>
               
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mb-5">⚠️</div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 tracking-tight">সিস্টেম কন্ট্রোল</h3>
                  <p className="text-slate-500 font-medium mb-6 leading-relaxed text-[10px]">
                    Netlify তে ডেপ্লয় করার পর, ব্রাউজার স্টোরেজ লিমিট পার হয়ে গেলে আপনার নতুন পণ্য সেভ হবে না। সেক্ষেত্রে আপনাকে ডাটাবেজ (Supabase) এ মুভ করতে হবে।
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <button onClick={handleResetProducts} className="w-full py-3.5 bg-red-500 text-white font-black rounded-xl shadow-md shadow-red-100 hover:bg-red-600 transition-all text-xs">
                      ফ্যাক্টরি রিসেট করুন
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Other Tabs remain largely the same, but Products Tab improved for long lists */}
        {activeTab === 'Products' && (
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800">পণ্য ব্যবস্থাপনা</h2>
                <p className="text-slate-400 font-bold text-[10px]">মোট {products.length} টি পণ্য আপনার ক্যাটালগে আছে</p>
              </div>
              <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-green-600 text-white font-black rounded-xl flex items-center gap-2 shadow-md shadow-green-100 hover:-translate-y-1 transition-all text-sm">
                <span className="text-lg">+</span> পণ্য যোগ করুন
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2 sidebar-no-scrollbar">
               {products.map(p => (
                 <div key={p.id} className="group p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-green-200 hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex gap-4 mb-4">
                       <img src={p.image} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                       <div className="overflow-hidden">
                          <h4 className="font-black text-slate-800 truncate leading-tight">{p.name}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{p.category}</span>
                       </div>
                    </div>
                    <div className="flex justify-between items-end">
                       <div>
                          <div className="text-lg font-black text-green-700 tracking-tighter">৳{p.price}</div>
                          <div className="text-[10px] text-slate-400 font-bold">স্টক: {p.stock} {p.unit}</div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleOpenModal(p)} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => onDeleteProduct(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
            <h2 className="text-xl font-black text-slate-800 mb-8">অর্ডার ট্র্যাকিং</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">
                    <th className="pb-5">আইডি</th>
                    <th className="pb-5">গ্রাহক</th>
                    <th className="pb-5">লোকেশন</th>
                    <th className="pb-5">টাকা</th>
                    <th className="pb-5">অবস্থা</th>
                    <th className="pb-5 text-right">আপডেট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 font-black text-slate-800 text-sm tabular-nums">{o.id}</td>
                      <td className="py-5">
                        <div className="font-black text-slate-800 text-xs">{o.customerName}</div>
                        <div className="text-[9px] text-slate-400 font-bold">{o.customerPhone}</div>
                      </td>
                      <td className="py-5 text-slate-500 font-bold text-[10px] tracking-tight">{o.location}</td>
                      <td className="py-5 font-black text-slate-900 text-lg tracking-tighter">৳{o.totalPrice}</td>
                      <td className="py-5">
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                          o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          o.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <select 
                          className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[9px] font-black outline-none text-slate-800 focus:border-green-500 transition-all cursor-pointer"
                          value={o.status}
                          onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as Order['status'])}
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
          </div>
        )}

        {activeTab === 'Customers' && (
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
            <h2 className="text-xl font-black text-slate-800 mb-8">গ্রাহক এনালিটিক্স</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">
                    <th className="pb-5">গ্রাহক</th>
                    <th className="pb-5">অর্ডার</th>
                    <th className="pb-5">আয়</th>
                    <th className="pb-5">শেষ ক্রয়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customers.map(c => (
                    <tr key={c.phone}>
                      <td className="py-5">
                        <div className="font-black text-slate-800 text-base">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold tracking-widest">{c.phone}</div>
                      </td>
                      <td className="py-5 font-black text-slate-600 text-sm">{c.orderCount} টি</td>
                      <td className="py-5 font-black text-green-700 text-lg tracking-tighter">৳{c.totalSpent}</td>
                      <td className="py-5 text-slate-500 font-bold text-[10px]">{new Date(c.lastOrder).toLocaleDateString('bn-BD')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
               <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4">
                 <span className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">👥</span>
                 ইউজার ম্যানেজমেন্ট
               </h2>
               
               <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-10">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">নতুন অ্যাডমিন/স্টাফ যোগ করুন</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Username</label>
                      <input type="email" value={newUserEmail} onChange={e=>setNewUserEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:border-blue-500 text-xs" placeholder="user@freshpavilion.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input type="tel" value={newUserPhone} onChange={e=>setNewUserPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:border-blue-500 text-xs" placeholder="০১........." />
                    </div>
                    <div className="flex items-end">
                      <button onClick={handleAddUser} className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 shadow-md active:scale-95 text-xs">
                        জেনারেট করুন
                      </button>
                    </div>
                  </div>
               </div>
               
               {/* Security Audit Section */}
               <div className="p-8 bg-orange-50 border border-orange-200 rounded-[2rem] mb-10">
                  <h3 className="text-xl font-black text-orange-800 mb-4 flex items-center gap-3">
                    <span className="text-2xl">🛡️</span> সিকিউরিটি অডিট ও প্রোডাকশন গাইড
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</div>
                      <p className="text-sm text-orange-900 font-medium"><strong>পাসওয়ার্ড রিস্ক:</strong> বর্তমান পাসওয়ার্ড (1234) কোডের ভেতরে হার্ডকোডেড। লঞ্চ করার আগে অবশ্যই ডাটাবেজ ইন্টিগ্রেশন করতে হবে।</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</div>
                      <p className="text-sm text-orange-900 font-medium"><strong>স্টোরেজ লিমিট:</strong> বর্তমানে ডাটা আপনার ব্রাউজারে সেভ হচ্ছে। Netlify তে ডেপ্লয় করার পর ডাটা সবার জন্য কমন হবে না।</p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-orange-200">
                       <p className="text-xs font-black text-orange-700 uppercase tracking-widest mb-3">Recommended Next Step:</p>
                       <button className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-200">Connect to Supabase Database</button>
                    </div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest">
                        <th className="pb-5">ইউজার</th>
                        <th className="pb-5">যোগাযোগ</th>
                        <th className="pb-5">পারমিশন</th>
                        <th className="pb-5 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {subAdmins.map(admin => (
                        <tr key={admin.id} className="hover:bg-slate-50">
                          <td className="py-5 font-black text-slate-800 text-sm">{admin.username}</td>
                          <td className="py-5 font-bold text-slate-500 text-[10px]">{admin.phone}</td>
                          <td className="py-5"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">{admin.role}</span></td>
                          <td className="py-5 text-right">
                             <button onClick={() => setSubAdmins(subAdmins.filter(a => a.id !== admin.id))} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-black text-[9px] hover:bg-red-500 hover:text-white">বন্ধ করুন</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Management Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh] animate-modal-up">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{editingProduct ? 'সংশোধন' : 'নতুন পণ্যের এন্ট্রি'}</h3>
               <button onClick={() => setShowProductModal(false)} className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 text-base outline-none focus:border-green-500" value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} placeholder="যেমন: অর্গানিক মধু" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 outline-none focus:border-green-500 cursor-pointer text-sm" value={formState.category} onChange={e=>setFormState({...formState, category: e.target.value})}>
                  <option>খাবার</option>
                  <option>পানীয়</option>
                  <option>স্বাস্থ্য</option>
                  <option>অন্যান্য</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Measurement Unit</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 outline-none focus:border-green-500 cursor-pointer text-sm" value={formState.unit} onChange={e=>setFormState({...formState, unit: e.target.value})}>
                  <option value="টি">টি (Piece)</option>
                  <option value="কেজি">কেজি (kg)</option>
                  <option value="গ্রাম">গ্রাম (gm)</option>
                  <option value="মিলি">মিলি (ml)</option>
                  <option value="লিটার">লিটার (L)</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (৳)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 text-lg outline-none focus:border-green-500" value={formState.price} onChange={e=>setFormState({...formState, price: Number(e.target.value)})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 text-lg outline-none focus:border-green-500" value={formState.stock} onChange={e=>setFormState({...formState, stock: Number(e.target.value)})} />
              </div>
              
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Media (Max 500KB)</label>
                <div className="flex items-center gap-5">
                  <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    {formState.image ? <img src={formState.image} className="w-full h-full object-cover" alt="preview" /> : <div className="w-full h-full flex items-center justify-center text-xl">📸</div>}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="flex-grow py-6 border-2 border-dashed border-slate-100 rounded-xl font-black text-slate-300 hover:border-green-200 hover:text-green-400 transition-all text-sm">
                    ছবি আপলোড করুন
                  </button>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex gap-4">
              <button onClick={() => setShowProductModal(false)} className="flex-grow py-4 rounded-xl bg-slate-50 text-slate-400 font-black text-base hover:bg-slate-100 transition-all">বাতিল</button>
              <button onClick={handleSaveProduct} className="flex-grow py-4 rounded-xl text-white font-black bg-green-600 shadow-lg shadow-green-100 text-base hover:bg-green-700 transition-all">সংরক্ষণ করুন</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-modal-up { animation: modal-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .sidebar-no-scrollbar::-webkit-scrollbar { display: none; }
        .sidebar-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const StatCard = ({ label, val, icon, color }: { label: string; val: any; icon: string; color: string }) => {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-500',
    blue: 'bg-blue-50 text-blue-500',
    orange: 'bg-orange-50 text-orange-500',
    purple: 'bg-purple-50 text-purple-500'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-md transition-all">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-inner`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-slate-900 mb-0.5 tracking-tighter tabular-nums">{val}</div>
      <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
};
