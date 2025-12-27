
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Admin } from './pages/Admin';
import { ProductDetail } from './pages/ProductDetail';
import { CartSidebar } from './components/CartSidebar';
import { WishlistSidebar } from './components/WishlistSidebar';
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['খাবার', 'পানীয়', 'স্বাস্থ্য', 'অন্যান্য']);
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
    whatsapp_number: '01400065088',
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
      if (dbCategories) setCategories(dbCategories.map(c => c.name));
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

      // 1. Insert Order first
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

      // 2. Synchronize Customer Information
      // Try to get existing customer data
      const { data: existingCust, error: fetchCustError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', orderData.customerPhone)
        .maybeSingle();

      if (fetchCustError) console.warn("Failed to check existing customer:", fetchCustError);

      const customerPayload = {
        phone: orderData.customerPhone,
        name: orderData.customerName,
        last_location: orderData.location,
        total_orders: (existingCust?.total_orders || 0) + 1,
        total_spent: (existingCust?.total_spent || 0) + orderData.totalPrice,
        updated_at: now
      };

      // UPSERT will insert if doesn't exist, or update if phone matches
      const { error: upsertError } = await supabase
        .from('customers')
        .upsert([customerPayload], { onConflict: 'phone' });

      if (upsertError) {
        console.error("Customer upsert failed:", upsertError);
        // We don't fail the whole function if customer sync fails, but we log it.
      }
      
      setCart([]);
      // Crucial: Refresh all data so the Admin panel sees the new order and customer
      await fetchInitialData(); 
      return true;
    } catch (err: any) {
      console.error("Critical order processing failure:", err);
      alert("অর্ডার সম্পন্ন করা যায়নি: " + (err.message || "সার্ভার সংযোগ সমস্যা"));
      return false;
    }
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
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('site_settings').upsert([{ key, value }], { onConflict: 'key' });
      } catch (err) {
        console.error("Failed to update setting in database:", err);
      }
    }
  };

  const isAdminMode = currentPage === 'admin';

  if (isLoading) return <div className="min-h-screen flex flex-col items-center justify-center font-black text-green-600 bg-white"><div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>লোডিং হচ্ছে...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      {!isAdminMode && (
        <Navbar 
          onNavigate={(p) => { setCurrentPage(p as Page); setSelectedProductId(null); }} 
          currentPage={currentPage} 
          cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
          wishlistCount={wishlist.length} 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenWishlist={() => setIsWishlistOpen(true)} 
          logo={settings.logo}
          siteName={settings.site_name}
        />
      )}
      <main className={`flex-grow ${isAdminMode ? '' : 'pt-20'}`}>
        {currentPage === 'home' && (
          <Home 
            products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} 
            onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} 
            onProductClick={openProductDetail} 
            heroImage={settings.hero_image} siteName={settings.site_name} whatsappNumber={settings.whatsapp_number}
          />
        )}
        {currentPage === 'shop' && (
          <Shop 
            products={products} wishlist={wishlist} onAddToCart={addToCart} 
            onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} 
            onProductClick={openProductDetail} 
          />
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
            onBackToSite={() => setCurrentPage('home')} 
            settings={{ ...settings, lastSync }} onUpdateSetting={handleUpdateSetting}
          />
        )}
        {currentPage === 'product-detail' && products.find(p => p.id === selectedProductId) && (
          <ProductDetail 
            product={products.find(p => p.id === selectedProductId)!} allProducts={products} 
            onAddToCart={addToCart} onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} 
            isWishlisted={wishlist.some(p => p.id === selectedProductId)} 
            onProductClick={openProductDetail} wishlist={wishlist} whatsappNumber={settings.whatsapp_number} 
          />
        )}
      </main>
      {!isAdminMode && <Footer siteName={settings.site_name} supportPhone={settings.support_phone} />}
      <CartSidebar 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} 
        onRemove={(id) => setCart(cart.filter(i => i.id !== id))} 
        onUpdateQuantity={(id, d) => setCart(cart.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} 
        onCheckout={createOrder} 
      />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlist} onAddToCart={addToCart} onRemove={(p) => setWishlist(prev => prev.filter(it => it.id !== p.id))} />
    </div>
  );
};

export default App;
