
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
  
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'ফ্রেশ প্যাভিলিয়ন',
    logo: null,
    hero_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600',
    whatsapp_number: '01400065088',
    support_phone: '01630145305'
  });

  useEffect(() => {
    fetchInitialData();
    const savedCart = localStorage.getItem('fp_cart');
    const savedWishlist = localStorage.getItem('fp_wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      const savedProducts = localStorage.getItem('fp_products');
      setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS as Product[]);
      const savedOrders = localStorage.getItem('fp_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
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
      
      setProducts(dbProducts && dbProducts.length > 0 ? (dbProducts as Product[]) : (INITIAL_PRODUCTS as Product[]));
      if (dbOrders) setOrders(dbOrders as Order[]);
      if (dbStaff) setStaff(dbStaff as AdminUser[]);
      if (dbCategories) setCategories(dbCategories.map(c => c.name));
      if (dbCustomers) setCustomers(dbCustomers);
      
      if (dbSettings) {
        const newSettings = { ...settings };
        dbSettings.forEach(s => {
          if (s.key in newSettings) (newSettings as any)[s.key] = s.value;
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setProducts(INITIAL_PRODUCTS as Product[]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = async (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('site_settings').upsert({ key, value });
    }
  };

  const handleSeedDatabase = async () => {
    if (!isSupabaseConfigured || !supabase) { alert("Supabase is not configured!"); return; }
    const confirm = window.confirm("আপনি কি সব ডামি প্রোডাক্ট ডাটাবেজে আপলোড করতে চান?");
    if (!confirm) return;
    try {
      const uniqueCats = Array.from(new Set(INITIAL_PRODUCTS.map(p => p.category)));
      for (const cat of uniqueCats) { await supabase.from('categories').upsert([{ name: cat }], { onConflict: 'name' }); }
      const productsToSeed = INITIAL_PRODUCTS.map(({ id, ...rest }) => rest);
      const { error } = await supabase.from('products').insert(productsToSeed);
      if (error) throw error;
      alert("সাফল্য! ডাটাবেজ সিড করা হয়েছে।");
      fetchInitialData();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleAddStaff = async (staffData: Omit<AdminUser, 'id'>) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('admin_users').insert([staffData]).select();
      if (error) { alert("Error: " + error.message); return; }
      if (data) setStaff([...staff, data[0] as AdminUser]);
    } else { setStaff([...staff, { ...staffData, id: Date.now().toString() }]); }
  };

  const handleDeleteStaff = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('admin_users').delete().eq('id', id);
      setStaff(staff.filter(s => s.id !== id));
    } else { setStaff(staff.filter(s => s.id !== id)); }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').insert([productData]).select();
      if (error) { alert("Error: " + error.message); return; }
      if (data) setProducts([data[0] as Product, ...products]);
    } else { setProducts([{ ...productData, id: Date.now().toString() }, ...products]); }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
    }
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = async (id: string) => {
    if (isSupabaseConfigured && supabase) { await supabase.from('products').delete().eq('id', id); }
    setProducts(products.filter(p => p.id !== id));
  };

  const handleAddCategory = async (name: string) => {
    if (isSupabaseConfigured && supabase) { await supabase.from('categories').insert([{ name }]); }
    setCategories([...categories, name]);
  };

  const handleDeleteCategory = async (name: string) => {
    if (isSupabaseConfigured && supabase) { await supabase.from('categories').delete().eq('name', name); }
    setCategories(categories.filter(c => c !== name));
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    if (isSupabaseConfigured && supabase) { await supabase.from('orders').update({ status }).eq('id', id); }
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder = {
      ...orderData,
      id: `#FP-${Math.floor(Math.random() * 900000 + 100000)}`,
      status: 'Pending',
      date: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').insert([newOrder]);
      if (error) { alert("Order failed: " + error.message); return; }
      
      // Upsert customer info
      const { data: existingCust } = await supabase.from('customers').select('*').eq('phone', orderData.customerPhone).single();
      const customerPayload = {
        phone: orderData.customerPhone,
        name: orderData.customerName,
        last_location: orderData.location,
        total_orders: (existingCust?.total_orders || 0) + 1,
        total_spent: (existingCust?.total_spent || 0) + orderData.totalPrice
      };
      await supabase.from('customers').upsert([customerPayload]);
      
      setOrders(prev => [newOrder as Order, ...prev]);
      setCart([]);
      fetchInitialData(); // Refresh customers list
    } else {
      setOrders(prev => [newOrder as Order, ...prev]);
      setCart([]);
    }
  };

  const isAdminMode = currentPage === 'admin';

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-['Hind_Siliguri']">
        <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">লোড হচ্ছে...</p>
      </div>
    );
  }

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
          /* Fixed Error: openProductDetail signature mismatch by wrapping in an arrow function */
          <Home 
            products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} onProductClick={(id) => openProductDetail(id, setSelectedProductId, setCurrentPage)} 
            heroImage={settings.hero_image}
            siteName={settings.site_name}
            whatsappNumber={settings.whatsapp_number}
          />
        )}
        {currentPage === 'shop' && (
          /* Fixed Error: openProductDetail signature mismatch by wrapping in an arrow function */
          <Shop products={products} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} onProductClick={(id) => openProductDetail(id, setSelectedProductId, setCurrentPage)} />
        )}
        {currentPage === 'admin' && (
          <Admin 
            products={products} orders={orders} categories={categories} staff={staff} customers={customers}
            onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onUpdateProduct={handleUpdateProduct} 
            onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} 
            onAddStaff={handleAddStaff} onDeleteStaff={handleDeleteStaff} 
            onUpdateOrderStatus={handleUpdateOrderStatus} onSeedDatabase={handleSeedDatabase} 
            onBackToSite={() => setCurrentPage('home')} 
            settings={settings} onUpdateSetting={handleUpdateSetting}
          />
        )}
        {currentPage === 'product-detail' && products.find(p => p.id === selectedProductId) && (
          <ProductDetail product={products.find(p => p.id === selectedProductId)!} allProducts={products} onAddToCart={addToCart} onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} isWishlisted={wishlist.some(p => p.id === selectedProductId)} onProductClick={(id) => { setSelectedProductId(id); window.scrollTo(0,0); }} wishlist={wishlist} whatsappNumber={settings.whatsapp_number} />
        )}
      </main>
      {!isAdminMode && <Footer siteName={settings.site_name} supportPhone={settings.support_phone} />}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.id !== id))} onUpdateQuantity={(id, d) => setCart(cart.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onCheckout={createOrder} />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlist} onAddToCart={addToCart} onRemove={(p) => setWishlist(prev => prev.filter(it => it.id !== p.id))} />
    </div>
  );
};

const openProductDetail = (id: string, setSelectedProductId: any, setCurrentPage: any) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
};

export default App;
