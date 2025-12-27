
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
  const [categories, setCategories] = useState<string[]>(['খাবার', 'পানীয়', 'স্বাস্থ্য', 'অন্যান্য']);
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
      const { data: dbCategories } = await supabase.from('categories').select('name');
      
      // If DB is empty, show initial products in UI but they aren't "in" DB yet
      setProducts(dbProducts && dbProducts.length > 0 ? (dbProducts as Product[]) : (INITIAL_PRODUCTS as Product[]));
      if (dbOrders) setOrders(dbOrders as Order[]);
      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories.map(c => c.name));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setProducts(INITIAL_PRODUCTS as Product[]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- DATABASE SEEDING ---
  const handleSeedDatabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert("Supabase is not configured!");
      return;
    }

    const confirm = window.confirm("আপনি কি সব ডামি প্রোডাক্ট ডাটাবেজে আপলোড করতে চান?");
    if (!confirm) return;

    try {
      // Create categories first
      const uniqueCats = Array.from(new Set(INITIAL_PRODUCTS.map(p => p.category)));
      for (const cat of uniqueCats) {
        await supabase.from('categories').insert([{ name: cat }]).select();
      }

      // Format products for insertion (removing manual IDs to let Supabase handle them if needed, 
      // or keep them if your schema allows)
      const productsToSeed = INITIAL_PRODUCTS.map(({ id, ...rest }) => rest);
      
      const { error } = await supabase.from('products').insert(productsToSeed);
      
      if (error) throw error;
      
      alert("সাফল্য! ডাটাবেজ সিড করা হয়েছে।");
      fetchInitialData();
    } catch (err: any) {
      alert("Error seeding data: " + err.message);
    }
  };

  // --- ADMIN HANDLERS ---
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').insert([productData]).select();
      if (error) {
        alert("Error adding product: " + error.message);
        return;
      }
      if (data) setProducts([data[0] as Product, ...products]);
    } else {
      const newProduct = { ...productData, id: Date.now().toString() };
      setProducts([newProduct, ...products]);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
      if (error) {
        alert("Error updating product: " + error.message);
        return;
      }
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    } else {
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert("Error deleting product: " + error.message);
        return;
      }
      setProducts(products.filter(p => p.id !== id));
    } else {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddCategory = async (name: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').insert([{ name }]);
      if (error) {
        alert("Error adding category: " + error.message);
        return;
      }
      setCategories([...categories, name]);
    } else {
      setCategories([...categories, name]);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').delete().eq('name', name);
      if (error) {
        alert("Error deleting category: " + error.message);
        return;
      }
      setCategories(categories.filter(c => c !== name));
    } else {
      setCategories(categories.filter(c => c !== name));
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) {
        alert("Error updating order: " + error.message);
        return;
      }
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } else {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  // --- SHOP HANDLERS ---
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
      if (error) {
        alert("Order placement failed: " + error.message);
        return;
      }
      setOrders(prev => [newOrder as Order, ...prev]);
      setCart([]);
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
        />
      )}
      <main className={`flex-grow ${isAdminMode ? '' : 'pt-20'}`}>
        {currentPage === 'home' && (
          <Home products={products} wishlist={wishlist} onShopNow={() => setCurrentPage('shop')} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />
        )}
        {currentPage === 'shop' && (
          <Shop products={products} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onProductClick={openProductDetail} />
        )}
        {currentPage === 'admin' && (
          <Admin 
            products={products} 
            orders={orders} 
            categories={categories}
            onAddProduct={handleAddProduct} 
            onDeleteProduct={handleDeleteProduct} 
            onUpdateProduct={handleUpdateProduct} 
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateOrderStatus={handleUpdateOrderStatus} 
            onSeedDatabase={handleSeedDatabase}
            onBackToSite={() => setCurrentPage('home')} 
          />
        )}
        {currentPage === 'product-detail' && products.find(p => p.id === selectedProductId) && (
          <ProductDetail 
            product={products.find(p => p.id === selectedProductId)!} 
            allProducts={products} 
            onAddToCart={addToCart} 
            onToggleWishlist={toggleWishlist} 
            isWishlisted={wishlist.some(p => p.id === selectedProductId)} 
            onProductClick={openProductDetail} 
            wishlist={wishlist} 
          />
        )}
      </main>
      {!isAdminMode && <Footer />}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.id !== id))} onUpdateQuantity={(id, d) => setCart(cart.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onCheckout={createOrder} />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlist} onAddToCart={addToCart} onRemove={toggleWishlist} />
    </div>
  );
};

export default App;
