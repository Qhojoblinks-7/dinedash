import { useState } from 'react';
import Header from "./components/features/Header";
import Menu from "./components/features/Menu";
import CartDrawerFixed from './components/features/CartDrawerFixed';
import { ToastProvider } from './components/ui/Toast';

function AppFixed() {
  const [cart, setCart] = useState([]); // {id,name,price,qty,image,available}
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [lastOrderId, setLastOrderId] = useState(null);

  const orderCount = cart.reduce((s, it) => s + it.qty, 0);

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
    // in a real flow you'd send cart + payload to the backend here
    setCart([]);
    // keep drawer open so users can see confirmation/tracking
    setDrawerOpen(true);
  };

  return (
    <ToastProvider>
      <div className="text-3xl font-bold">
        <Header orderCount={orderCount} onOpenCart={() => setDrawerOpen(true)} />
        <Menu onAdd={handleAdd} cartItems={cart} />
        <CartDrawerFixed open={drawerOpen} onClose={() => setDrawerOpen(false)} cartItems={cart} onChangeQty={handleChangeQty} onRemove={handleRemove} notes={notes} onNotesChange={setNotes} onCheckout={handleCheckout} orderId={lastOrderId} />
      </div>
    </ToastProvider>
  );
}

export default AppFixed;
