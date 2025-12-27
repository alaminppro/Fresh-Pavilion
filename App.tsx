
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
      const { data: dbProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: dbOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setProducts(dbProducts && dbProducts.length > 0 ? (dbProducts as Product[]) : (INITIAL_PRODUCTS as Product[]));
      if (dbOrders) setOrders(dbOrders as Order[]);
    } catch (err) {
      setProducts(INITIAL_PRODUCTS as Product[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('fp_cart', JSON.stringify(cart));
    localStorage.setItem('fp_wishlist', JSON.stringify(wishlist));
    if (!isSupabaseConfigured) {
      localStorage.setItem('fp_products', JSON.stringify(products));
      localStorage.setItem('fp_orders', JSON.stringify(orders));
    }
  }, [cart, wishlist, products, orders]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => prev.some(p => p.id === product.id) ? prev.filter(p => p.id !== product.id) : [...prev, product]);
  };

  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
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
      }
    } else {
      setOrders(prev => [newOrder as Order, ...prev]);
      setCart([]);
    }
  };

  const handleSupportClick = () => {
    const message = encodeURIComponent("হ্যালো ফ্রেশ প্যাভিলিয়ন, আমি একটি পণ্য সম্পর্কে জানতে চাই।");
    window.open(`https://wa.me/8801630145305?text=${message}`, '_blank');
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
        />
      )}
      <main className={`flex-grow ${isAdminMode ? '' : 'pt-20'}`}>
        {currentPage === 'home' && <Home products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />}
        {currentPage === 'shop' && <Shop products={products} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />}
        {currentPage === 'admin' && <Admin products={products} orders={orders} onAddProduct={(p) => setProducts([{...p, id: Date.now().toString()}, ...products])} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} onUpdateProduct={(p) => setProducts(products.map(x => x.id === p.id ? p : x))} onUpdateOrderStatus={(id, status) => setOrders(orders.map(o => o.id === id ? {...o, status} : o))} onBackToSite={() => setCurrentPage('home')} />}
        {currentPage === 'product-detail' && products.find(p => p.id === selectedProductId) && (
          <ProductDetail product={products.find(p => p.id === selectedProductId)!} allProducts={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isWishlisted={wishlist.some(p => p.id === selectedProductId)} onProductClick={openProductDetail} wishlist={wishlist} />
        )}
      </main>
      {!isAdminMode && <Footer />}
      
      {/* Floating Support Button */}
      {!isAdminMode && (
        <button 
          onClick={handleSupportClick}
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-[90] animate-bounce"
          title="সরাসরি সহায়তা"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
          </svg>
        </button>
      )}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.id !== id))} onUpdateQuantity={(id, d) => setCart(cart.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onCheckout={createOrder} />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlist} onAddToCart={addToCart} onRemove={toggleWishlist} />
    </div>
  );
};

export default App;