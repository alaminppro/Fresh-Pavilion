
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
      notification_webhook_url?: string;
    }

    const App: React.FC = () => {
      const [currentPage, setCurrentPage] = useState<Page>('home');
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
        support_phone: '01630145305',
        notification_webhook_url: ''
      });

      // Routing Logic
      useEffect(() => {
        const handleRouting = () => {
          const hash = window.location.hash.replace('#', '');
          if (hash === 'shop') {
            setCurrentPage('shop');
          } else if (hash === 'admin') {
            setCurrentPage('admin');
          } else if (hash.startsWith('product-')) {
            setSelectedProductId(hash.replace('product-', ''));
            setCurrentPage('product-detail');
          } else {
            setCurrentPage('home');
          }
        };
        window.addEventListener('hashchange', handleRouting);
        handleRouting();
        return () => window.removeEventListener('hashchange', handleRouting);
      }, []);

      const navigateTo = (page: string) => {
        window.location.hash = page === 'home' ? '' : page;
      };

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
          
          if (dbProducts) setProducts(dbProducts.length > 0 ? dbProducts as Product[] : INITIAL_PRODUCTS as Product[]);
          if (dbOrders) {
            setOrders(dbOrders.map((o: any) => ({
              id: o.id, 
              customerName: o.customer_name, 
              customerPhone: o.customer_phone,
              location: o.location, 
              items: o.items, 
              totalPrice: Number(o.total_price),
              status: o.status, 
              created_at: o.created_at
            })));
          }
          if (dbStaff) setStaff(dbStaff as AdminUser[]);
          if (dbCategories) setCategories(dbCategories.map(c => c.name));
          if (dbCustomers) setCustomers(dbCustomers);
          if (dbSettings) {
            const newSettings = { ...settings };
            dbSettings.forEach(s => { if (s.key in newSettings) (newSettings as any)[s.key] = s.value; });
            setSettings(newSettings);
          }
          setLastSync(new Date());
        } catch (err) {
          console.error("Sync error:", err);
        } finally {
          setIsLoading(false);
        }
      };

      const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<boolean> => {
        const orderId = `#FP-${Math.floor(Math.random() * 900000 + 100000)}`;
        const now = new Date().toISOString();

        if (!isSupabaseConfigured || !supabase) {
          const localOrder: Order = { ...orderData, id: orderId, status: 'Pending', created_at: now };
          setOrders(prev => [localOrder, ...prev]);
          setCart([]);
          return true;
        }

        try {
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

          // Notification Trigger via Webhook (e.g. Discord)
          if (settings.notification_webhook_url && settings.notification_webhook_url.trim() !== '') {
            fetch(settings.notification_webhook_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                content: `🚀 **নতুন অর্ডার!**\nঅর্ডার আইডি: ${orderId}\nগ্রাহক: ${orderData.customerName}\nফোন: ${orderData.customerPhone}\nমোট: ৳${orderData.totalPrice}\nডেলিভারি লোকেশন: ${orderData.location}` 
              })
            }).catch(e => console.error("Webhook notification failed:", e));
          }

          setCart([]);
          await fetchInitialData(); 
          return true;
        } catch (err: any) {
          console.error("Order processing error:", err);
          alert("অর্ডার সম্পন্ন করা যায়নি।");
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
        window.location.hash = `product-${id}`; 
        window.scrollTo(0, 0); 
      };
      
      const closeProductDetail = () => { 
        window.history.back(); 
      };

      const handleUpdateSetting = async (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (isSupabaseConfigured && supabase) {
          await supabase.from('site_settings').upsert([{ key, value }], { onConflict: 'key' });
        }
      };

      const isAdminMode = currentPage === 'admin';

      if (isLoading) return <div className="min-h-screen flex flex-col items-center justify-center font-black text-green-600 bg-white"><div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>লোডিং হচ্ছে...</div>;

      // Helper for wishlist toggling
      const toggleWishlist = (product: Product) => {
        setWishlist(prev => {
          const exists = prev.find(i => i.id === product.id);
          if (exists) return prev.filter(i => i.id !== product.id);
          return [...prev, product];
        });
      };

      // Fix: Added missing return block and export default to fix index.tsx error
      return (
        <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
          {!isAdminMode && (
            <Navbar 
              onNavigate={navigateTo} 
              currentPage={currentPage} 
              cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
              wishlistCount={wishlist.length}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenWishlist={() => setIsWishlistOpen(true)}
              logo={settings.logo}
              siteName={settings.site_name}
            />
          )}

          <main className={`flex-grow ${!isAdminMode ? 'pt-16 md:pt-20' : ''}`}>
            {currentPage === 'home' && (
              <Home 
                products={products}
                wishlist={wishlist}
                onShopNow={() => navigateTo('shop')}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onProductClick={openProductDetail}
                heroImage={settings.hero_image}
                siteName={settings.site_name}
                whatsappNumber={settings.whatsapp_number}
              />
            )}
            {currentPage === 'shop' && (
              <Shop 
                products={products}
                wishlist={wishlist}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onProductClick={openProductDetail}
              />
            )}
            {currentPage === 'product-detail' && selectedProductId && (
              <ProductDetail 
                product={products.find(p => p.id === selectedProductId) || products[0]}
                allProducts={products}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onProductClick={openProductDetail}
                onClose={closeProductDetail}
                isWishlisted={wishlist.some(p => p.id === selectedProductId)}
                wishlist={wishlist}
                whatsappNumber={settings.whatsapp_number}
              />
            )}
            {currentPage === 'admin' && (
              <Admin 
                products={products}
                orders={orders}
                categories={categories}
                staff={staff}
                customers={customers}
                onAddProduct={(p) => setProducts([...products, { ...p, id: Math.random().toString() }])}
                onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
                onUpdateProduct={(p) => setProducts(products.map(i => i.id === p.id ? p : i))}
                onAddCategory={(c) => setCategories([...categories, c])}
                onDeleteCategory={(c) => setCategories(categories.filter(i => i !== c))}
                onAddStaff={(s) => setStaff([...staff, { ...s, id: Math.random().toString() }])}
                onDeleteStaff={(id) => setStaff(staff.filter(i => i.id !== id))}
                onUpdateOrderStatus={(id, status) => setOrders(orders.map(o => o.id === id ? { ...o, status } : o))}
                onSeedDatabase={() => {}}
                onSyncCustomers={() => {}}
                onBackToSite={() => navigateTo('home')}
                settings={settings}
                onUpdateSetting={handleUpdateSetting}
              />
            )}
          </main>

          {!isAdminMode && (
            <>
              <Footer siteName={settings.site_name} supportPhone={settings.support_phone} logo={settings.logo} />
              <CartSidebar 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                items={cart}
                onRemove={(id) => setCart(cart.filter(i => i.id !== id))}
                onUpdateQuantity={(id, delta) => setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))}
                onCheckout={createOrder}
              />
              <WishlistSidebar 
                isOpen={isWishlistOpen} 
                onClose={() => setIsWishlistOpen(false)} 
                items={wishlist}
                onAddToCart={addToCart}
                onRemove={(p) => setWishlist(wishlist.filter(i => i.id !== p.id))}
              />
              <FloatingWhatsApp phoneNumber={settings.whatsapp_number} />
            </>
          )}
        </div>
      );
    };

    export default App;
