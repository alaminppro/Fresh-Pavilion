
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Admin } from './pages/Admin';
import { ProductDetail } from './pages/ProductDetail';
import { CartSidebar } from './components/CartSidebar';
import { WishlistSidebar } from './components/WishlistSidebar';
import { Product, CartItem, Order } from './types';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabase';

type Page = 'home' | 'shop' | 'admin' | 'product-detail';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    fetchInitialData();
    
    // Persistence for user-specific items (Cart/Wishlist always local)
    const savedCart = localStorage.getItem('fp_cart');
    const savedWishlist = localStorage.getItem('fp_wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    
    if (!isSupabaseConfigured || !supabase) {
      console.warn("Supabase is not configured. Falling back to local constants and localStorage.");
      
      // Fallback: Check localStorage for products first (for admin demo)
      const savedProducts = localStorage.getItem('fp_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS as Product[]);
      }

      const savedOrders = localStorage.getItem('fp_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      
      setIsLoading(false);
      return;
    }

    try {
      const { data: dbProducts, error: pError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: dbOrders, error: oError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts as Product[]);
      } else {
        setProducts(INITIAL_PRODUCTS as Product[]);
      }

      if (dbOrders) {
        setOrders(dbOrders as Order[]);
      }
    } catch (err) {
      console.error('Error fetching from Supabase:', err);
      // Even on network error, ensure products are set
      setProducts(INITIAL_PRODUCTS as Product[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('fp_cart', JSON.stringify(cart));
    localStorage.setItem('fp_wishlist', JSON.stringify(wishlist));
    // If Supabase isn't configured, we store products/orders locally too
    if (!isSupabaseConfigured) {
      localStorage.setItem('fp_products', JSON.stringify(products));
      localStorage.setItem('fp_orders', JSON.stringify(orders));
    }
  }, [cart, wishlist, products, orders]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isExist = prev.some(p => p.id === product.id);
      if (isExist) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').insert([product]).select();
      if (data) setProducts(prev => [data[0] as Product, ...prev]);
      if (error) alert('Database Error: ' + error.message);
    } else {
      // Local fallback for demo
      const newProduct = { ...product, id: Date.now().toString() };
      setProducts(prev => [newProduct as Product, ...prev]);
    }
  };

  const deleteProduct = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) setProducts(prev => prev.filter(p => p.id !== id));
      else alert('Database Error: ' + error.message);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateProduct = async (updated: Product) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').update(updated).eq('id', updated.id);
      if (!error) setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      else alert('Database Error: ' + error.message);
    } else {
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
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
      if (!error) {
        setOrders(prev => [newOrder as Order, ...prev]);
        setCart([]);
      } else {
        alert('Database Order failed: ' + error.message);
      }
    } else {
      // Local fallback
      setOrders(prev => [newOrder as Order, ...prev]);
      setCart([]);
    }
  };

  const isAdminMode = currentPage === 'admin';

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-['Hind_Siliguri']">
        <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">ক্যাম্পাস শপ লোড হচ্ছে...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': 
        return <Home products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />;
      case 'shop': 
        return <Shop products={products} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />;
      case 'admin': 
        return <Admin products={products} orders={orders} onAddProduct={addProduct} onDeleteProduct={deleteProduct} onUpdateProduct={updateProduct} onUpdateOrderStatus={updateOrderStatus} onBackToSite={() => setCurrentPage('home')} />;
      case 'product-detail':
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return <Home products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />;
        return <ProductDetail product={product} allProducts={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isWishlisted={wishlist.some(p => p.id === product.id)} onProductClick={openProductDetail} wishlist={wishlist} />;
      default: 
        return <Home products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      {!isAdminMode && (
        <Navbar onNavigate={(p) => { setCurrentPage(p as Page); setSelectedProductId(null); }} currentPage={currentPage} cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} wishlistCount={wishlist.length} onOpenCart={() => setIsCartOpen(true)} onOpenWishlist={() => setIsWishlistOpen(true)} />
      )}
      <main className={`flex-grow ${isAdminMode ? '' : 'pt-20'}`}>
        {!isSupabaseConfigured && isAdminMode && (
          <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center">
            Demo Mode: Not connected to Supabase Cloud
          </div>
        )}
        {renderPage()}
      </main>
      {!isAdminMode && <Footer />}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} onCheckout={createOrder} />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlist} onAddToCart={addToCart} onRemove={toggleWishlist} />
    </div>
  );
};

export default App;
