import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, changeQty, removeItem, toggleDrawer, setNotes, setLastOrderId, clearCart } from './store/cartSlice';
import Menu from "./components/features/Menu";
import CartDrawerFixed from './components/features/CartDrawer';
import { ToastProvider } from './components/ui/Toast';

function App (){
  const cart = useSelector((s) => s.cart.items);
  const drawerOpen = useSelector((s) => s.cart.drawerOpen);
  const notes = useSelector((s) => s.cart.notes);
  const lastOrderId = useSelector((s) => s.cart.lastOrderId);
  const dispatch = useDispatch();
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
    dispatch(addItem(item));
  };

  const handleChangeQty = (id, qty) => dispatch(changeQty({ id, qty }));
  const handleRemove = (id) => dispatch(removeItem(id));

  const handleCheckout = (payload = {}) => {
    // Build payload for backend
    const apiPayload = {
      customer_name: payload.customer_name || '',
      order_type: payload.order_type || 'dine_in',
      items: cart.map((it) => ({ meal: it.id, quantity: it.qty })),
    };

  // POST to backend order create endpoint
  dispatch({ type: 'cart/setCheckoutStatus', payload: 'pending' });
    fetch('/api/orders/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Order create failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        dispatch({ type: 'cart/setCheckoutStatus', payload: 'succeeded' });
        const orderId = data.id || data.pk || `ORD-${Date.now().toString().slice(-6)}`;
        dispatch(setLastOrderId(orderId));

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

        setOrders((prev) => [newOrder, ...prev]);
        setCurrentOrder(newOrder);
        dispatch(clearCart());
        // open drawer so users can see confirmation/tracking
        dispatch(toggleDrawer(true));
      })
      .catch((err) => {
        dispatch({ type: 'cart/setCheckoutStatus', payload: 'failed' });
        console.error('Order create failed, falling back to local simulation', err);
        // fallback to local simulated order
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        dispatch(setLastOrderId(orderId));
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
        setOrders((prev) => [newOrder, ...prev]);
        setCurrentOrder(newOrder);
        dispatch(clearCart());
        dispatch(toggleDrawer(true));
      });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Menu
          onAdd={handleAdd}
          cartItems={cart}
          orderCount={orderCount}
          onOpenCart={() => dispatch(toggleDrawer(true))}
        />
        <CartDrawerFixed
          open={drawerOpen}
          onClose={() => dispatch(toggleDrawer(false))}
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
