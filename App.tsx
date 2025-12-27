
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
      
      if (dbProducts) {
        const mappedProducts: Product[] = dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          description: p.description,
          longDescription: p.long_description,
          image: p.image,
          category: p.category,
          stock: p.stock,
          unit: p.unit,
          isFeatured: p.is_featured === true,
          isBestSelling: p.is_bestselling === true,
          isNew: p.is_new === true
        }));
        setProducts(mappedProducts);
      }
      
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

  const handleAddProduct = async (p: Omit<Product, 'id'>) => {
    if (!supabase) return;
    const payload = {
      name: p.name,
      price: p.price,
      description: p.description,
      long_description: p.longDescription,
      image: p.image,
      category: p.category,
      stock: p.stock,
      unit: p.unit,
      is_featured: p.isFeatured || false,
      is_bestselling: p.isBestSelling || false,
      is_new: p.isNew || false
    };
    const { error } = await supabase.from('products').insert([payload]);
    if (error) console.error("Error adding product:", error);
    fetchInitialData();
  };

  const handleUpdateProduct = async (p: Product) => {
    if (!supabase) return;
    const payload = {
      name: p.name,
      price: p.price,
      description: p.description,
      long_description: p.longDescription,
      image: p.image,
      category: p.category,
      stock: p.stock,
      unit: p.unit,
      is_featured: p.isFeatured || false,
      is_bestselling: p.isBestSelling || false,
      is_new: p.isNew || false
    };
    const { error } = await supabase.from('products').update(payload).eq('id', p.id);
    if (error) console.error("Error updating product:", error);
    fetchInitialData();
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
      <main className={`flex-grow ${isAdminMode ? '' : 'pt-20'} mx-auto w-full`}>
        {currentPage === 'home' && (
          <Home 
            products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} 
            onToggleWishlist={(p) => setWishlist(prev => prev.some(it => it.id === p.id) ? prev.filter(it => it.id !== p.id) : [...prev, p])} 
            onProductClick={openProductDetail} 
            heroImage={settings.hero_image} siteName={settings.site_name} whatsappNumber={settings.whatsapp_number}
            categories={categories}
          />
        )}
        {currentPage === 'shop' && (
          <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
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
            onAddProduct={handleAddProduct}
            onDeleteProduct={async (id) => { if (supabase) await supabase.from('products').delete().eq('id', id); fetchInitialData(); }} 
            onUpdateProduct={handleUpdateProduct} 
            onAddCategory={async (name) => { if (supabase) await supabase.from('categories').insert([{ name }]); fetchInitialData(); }}
            onDeleteCategory={async (name) => { if (supabase) await supabase.from('categories').delete().eq('name', name); fetchInitialData(); }}
            onAddStaff={async (s) => { if (supabase) { await supabase.from('admin_users').insert([s]); fetchInitialData(); } }}
            onDeleteStaff={async (id) => { if (supabase) await supabase.from('admin_users').delete().eq('id', id); fetchInitialData(); }}
            onUpdateOrderStatus={async (id, status) => { if (supabase) await supabase.from('orders').update({ status }).eq('id', id); fetchInitialData(); }}
            onSeedDatabase={fetchInitialData}
            onSyncCustomers={() => {}} 
            onBackToSite={() => setCurrentPage('home')} 
            settings={{ ...settings, lastSync }} onUpdateSetting={handleUpdateSetting}
          />
        )}
        {currentPage === 'product-detail' && products.find(p => p.id === selectedProductId) && (
          <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
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
      {!isAdminMode && <Footer siteName={settings.site_name} supportPhone={settings.support_phone} logo={settings.logo} />}
      <CartSidebar 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} 
        onRemove={(id) => setCart(cart.filter(i => i.id !== id))} 
        onUpdateQuantity={(id, d) => setCart(cart.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} 
        onCheckout={async (data) => true} // Placeholder
      />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlist} onAddToCart={addToCart} onRemove={(p) => setWishlist(prev => prev.filter(it => it.id !== p.id))} />
      <FloatingWhatsApp phoneNumber={settings.whatsapp_number} />
    </div>
  );
};

export default App;
