import { useState, useEffect } from 'react';
import Header from "./components/features/Header";
import Menu from "./components/features/Menu";
import CartDrawer from './components/features/CartDrawer';
import { ToastProvider } from './components/ui/Toast';

function App (){
  const [cart, setCart] = useState([]); // {id,name,price,qty,image,available}
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [lastOrderId, setLastOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  const orderCount = cart.reduce((s, it) => s + it.qty, 0);

  // Load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('dinedash-orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
      }
    }
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('dinedash-orders', JSON.stringify(orders));
  }, [orders]);

  const handleAdd = (item) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === item.id);
      if (idx === -1) {
        return [...prev, {...item, qty: 1}];
      }
      const copy = [...prev];
      copy[idx] = {...copy[idx], qty: copy[idx].qty + 1};
      return copy;
    });
    setDrawerOpen(true);
  };

  const handleChangeQty = (id, qty) => {
    setCart(prev => prev.map(p => p.id === id ? {...p, qty} : p).filter(p => p.qty > 0));
  };

  const handleRemove = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const handleCheckout = (payload = {}) => {
    console.log('Checkout', { cart, notes, payload });
    // simulate order creation
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    setLastOrderId(orderId);

    // Create order object
    const newOrder = {
      id: orderId,
      items: [...cart],
      notes,
      paymentMethod: payload.method || 'card',
      total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
      tax: cart.reduce((sum, item) => sum + (item.price * item.qty), 0) * 0.08,
      status: 'received',
      createdAt: new Date().toISOString(),
    };

    // Add to orders array
    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);

    // Clear cart
    setCart([]);

    // keep drawer open so users can see confirmation/tracking
    setDrawerOpen(true);
  };

  return (
    <ToastProvider>
      <div className="text-3xl font-bold">
        <Header orderCount={orderCount} onOpenCart={() => setDrawerOpen(true)} />
        <Menu onAdd={handleAdd} cartItems={cart} />
        <CartDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          cartItems={cart}
          onChangeQty={handleChangeQty}
          onRemove={handleRemove}
          notes={notes}
          onNotesChange={setNotes}
          onCheckout={handleCheckout}
          orderId={lastOrderId}
          currentOrder={currentOrder}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
