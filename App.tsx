
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Admin } from './pages/Admin';
import { ProductDetail } from './pages/ProductDetail';
import { CartSidebar } from './components/CartSidebar';
import { WishlistSidebar } from './components/WishlistSidebar';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Product, CartItem, Order, AdminUser } from './types';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabase';

type Page = 'home' | 'shop' | 'admin' | 'product-detail';

interface SiteSettings {
  site_name: string;
  logo: string | null;
  hero_image: string | null;
  whatsapp_number: string;
  support_phone: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [prevPage, setPrevPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['মধু ও তেল', 'শুকনো খাবার', 'মশলা ও গুড়', 'ফল ও সবজি', 'স্বাস্থ্য', 'অন্যান্য']);
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'ফ্রেশ প্যাভিলিয়ন',
    logo: null,
    hero_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600',
    whatsapp_number: '01630145305',
    support_phone: '01630145305'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (!isSupabaseConfigured || !supabase) {
      const savedProducts = localStorage.getItem('fp_products');
      setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS as Product[]);
      setIsLoading(false);
      return;
    }
    try {
      const [
        { data: dbProducts },
        { data: dbOrders },
        { data: dbCategories },
        { data: dbStaff },
        { data: dbSettings },
        { data: dbCustomers }
      ] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('name'),
        supabase.from('admin_users').select('*'),
        supabase.from('site_settings').select('*'),
        supabase.from('customers').select('*').order('total_spent', { ascending: false })
      ]);
      
      if (dbProducts && dbProducts.length > 0) setProducts(dbProducts as Product[]);
      else setProducts(INITIAL_PRODUCTS as Product[]);
      
      if (dbOrders) {
        const mappedOrders: Order[] = dbOrders.map((o: any) => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          location: o.location,
          items: o.items,
          totalPrice: Number(o.total_price),
          status: o.status,
          created_at: o.created_at
        }));
        setOrders(mappedOrders);
      }

      if (dbStaff) setStaff(dbStaff as AdminUser[]);
      if (dbCategories && dbCategories.length > 0) setCategories(dbCategories.map(c => c.name));
      if (dbCustomers) setCustomers(dbCustomers || []);
      
      if (dbSettings) {
        const newSettings = { ...settings };
        dbSettings.forEach(s => {
          if (s.key in newSettings) (newSettings as any)[s.key] = s.value;
        });
        setSettings(newSettings);
      }
      setLastSync(new Date());
    } catch (err) {
      console.error("Critical error fetching data from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      const orderId = `#FP-${Math.floor(Math.random() * 900000 + 100000)}`;
      const now = new Date().toISOString();
      const localOrder: Order = { ...orderData, id: orderId, status: 'Pending', created_at: now };
      setOrders(prev => [localOrder, ...prev]);
      setCart([]);
      return true;
    }

    try {
      const orderId = `#FP-${Math.floor(Math.random() * 900000 + 100000)}`;
      const now = new Date().toISOString();

      const { error: orderError } = await supabase.from('orders').insert([{
        id: orderId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        location: orderData.location,
        items: orderData.items,
        total_price: orderData.totalPrice,
        status: 'Pending',
        created_at: now
      }]);

      if (orderError) throw orderError;

      const { data: existingCust } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_phone', orderData.customerPhone)
        .maybeSingle();

      const customerPayload = {
        customer_phone: orderData.customerPhone,
        customer_name: orderData.customerName,
        total_orders: (existingCust?.total_orders || 0) + 1,
        total_spent: Number(existingCust?.total_spent || 0) + Number(orderData.totalPrice)
      };

      await supabase.from('customers').upsert([customerPayload], { onConflict: 'customer_phone' });
      
      setCart([]);
      await fetchInitialData(); 
      return true;
    } catch (err: any) {
      console.error("Order processing error:", err);
      alert("অর্ডার সম্পন্ন করা যায়নি: " + (err.message || "সার্ভার সংযোগ সমস্যা"));
      return false;
    }
  };

  const syncCustomersFromOrders = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: allOrders, error: orderErr } = await supabase.from('orders').select('*');
      if (orderErr) throw orderErr;
      if (!allOrders || allOrders.length === 0) return;

      const customerMap = new Map();
      allOrders.forEach(order => {
        const phone = order.customer_phone;
        const current = customerMap.get(phone) || { 
          customer_phone: phone, customer_name: order.customer_name, total_orders: 0, total_spent: 0 
        };
        current.total_orders += 1;
        current.total_spent += Number(order.total_price);
        customerMap.set(phone, current);
      });

      const customerPayloads = Array.from(customerMap.values());
      await supabase.from('customers').upsert(customerPayloads, { onConflict: 'customer_phone' });
      await fetchInitialData();
    } catch (err) { console.error(err); }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const openProductDetail = (id: string) => {
    setPrevPage(currentPage);
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const closeProductDetail = () => {
    setCurrentPage(prevPage);
    setSelectedProductId(null);
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('site_settings').upsert([{ key, value }], { onConflict: 'key' });
      } catch (err) { console.error(err); }
    }
  };

  // Define isAdminMode to be used in narrowing blocks
  const isAdminMode = currentPage === 'admin';

  if (isLoading) return <div className="min-h-screen flex flex-col items-center justify-center font-black text-green-600 bg-white"><div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>লোডিং হচ্ছে...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      {!isAdminMode && (
        <Navbar 
          onNavigate={(p) => { setPrevPage(currentPage); setCurrentPage(p as Page); setSelectedProductId(null); }} 
          currentPage={currentPage} 
          cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
          wishlistCount={wishlist.length} 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenWishlist={() => setIsWishlistOpen(true)} 
          logo={settings.logo}
          siteName={settings.site_name}
        />
      )}
      
      <main className={`flex-grow ${isAdminMode ? '' : 'pt-16 md:pt-20'} mx-auto w-full pb-16 md:pb-0`}>
        {currentPage === 'home' && (
          <Home 
            products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} 
            onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} 
            onProductClick={openProductDetail} 
            heroImage={settings.hero_image} siteName={settings.site_name} whatsappNumber={settings.whatsapp_number}
          />
        )}
        {currentPage === 'shop' && (
          <div className="px-0 md:px-12 max-w-[1600px] mx-auto">
            <Shop 
              products={products} wishlist={wishlist} onAddToCart={addToCart} 
              onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} 
              onProductClick={openProductDetail} 
            />
          </div>
        )}
        {currentPage === 'admin' && (
          <Admin 
            products={products} orders={orders} categories={categories} staff={staff} customers={customers}
            onAddProduct={async (p) => { if (supabase) { const { data } = await supabase.from('products').insert([p]).select(); if (data) setProducts([data[0], ...products]); } }}
            onDeleteProduct={async (id) => { if (supabase) await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p => p.id !== id)); }} 
            onUpdateProduct={async (p) => { if (supabase) await supabase.from('products').update(p).eq('id', p.id); setProducts(products.map(pr => pr.id === p.id ? p : pr)); }} 
            onAddCategory={async (name) => { if (supabase) await supabase.from('categories').insert([{ name }]); setCategories([...categories, name]); }}
            onDeleteCategory={async (name) => { if (supabase) await supabase.from('categories').delete().eq('name', name); setCategories(categories.filter(c => c !== name)); }}
            onAddStaff={async (s) => { if (supabase) { const { data } = await supabase.from('admin_users').insert([s]).select(); if (data) setStaff([...staff, data[0]]); } }}
            onDeleteStaff={async (id) => { if (supabase) await supabase.from('admin_users').delete().eq('id', id); setStaff(staff.filter(s => s.id !== id)); }}
            onUpdateOrderStatus={async (id, status) => { if (supabase) await supabase.from('orders').update({ status }).eq('id', id); setOrders(orders.map(o => o.id === id ? { ...o, status } : o)); }}
            onSeedDatabase={fetchInitialData}
            onSyncCustomers={syncCustomersFromOrders}
            onBackToSite={() => setCurrentPage('home')} 
            settings={{ ...settings, lastSync }} onUpdateSetting={handleUpdateSetting}
          />
        )}
        {currentPage === 'product-detail' && products.find(p => p.id === selectedProductId) && (
          <div className="px-0 md:px-12 max-w-[1600px] mx-auto">
            <ProductDetail 
              product={products.find(p => p.id === selectedProductId)!} allProducts={products} 
              onAddToCart={addToCart} onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} 
              isWishlisted={wishlist.some(p => p.id === selectedProductId)} 
              onProductClick={openProductDetail} 
              onClose={closeProductDetail}
              wishlist={wishlist} whatsappNumber={settings.whatsapp_number} 
            />
          </div>
        )}
      </main>

      {!isAdminMode && (
        <>
          <Footer siteName={settings.site_name} supportPhone={settings.support_phone} logo={settings.logo} />
          {/* Mobile Bottom Navigation Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 z-[140] h-16 px-6 flex items-center justify-between pb-safe">
            <BottomNavItem 
              active={currentPage === 'home'} 
              onClick={() => setCurrentPage('home')} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>} 
              label="হোম"
            />
            <BottomNavItem 
              active={currentPage === 'shop'} 
              onClick={() => setCurrentPage('shop')} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>} 
              label="শপ"
            />
            <BottomNavItem 
              active={isWishlistOpen} 
              onClick={() => setIsWishlistOpen(true)} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>} 
              label="উইশ"
            />
            <BottomNavItem 
              /* Fix: Use pre-calculated isAdminMode to avoid type narrowing issues in narrowed scope where currentPage is known not to be 'admin' */
              active={isAdminMode} 
              onClick={() => setCurrentPage('admin')} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>} 
              label="অ্যাডমিন"
            />
          </div>
        </>
      )}

      <CartSidebar 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} 
        onRemove={(id) => setCart(cart.filter(i => i.id !== id))} 
        onUpdateQuantity={(id, d) => setCart(cart.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} 
        onCheckout={createOrder} 
      />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlist} onAddToCart={addToCart} onRemove={(p) => setWishlist(prev => prev.filter(it => it.id !== p.id))} />
      <FloatingWhatsApp phoneNumber={settings.whatsapp_number} />
    </div>
  );
};

const BottomNavItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center gap-1 transition-all ${
      active ? 'text-green-600 scale-110' : 'text-slate-400'
    }`}
  >
    <div className={`transition-all duration-300 ${active ? 'drop-shadow-[0_0_8px_rgba(22,163,74,0.4)]' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
