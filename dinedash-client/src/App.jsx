import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, toggleDrawer, setLastOrderId, clearCart } from './store/cartSlice';
import Menu from "./components/features/Menu";
import CartDrawer from './components/features/CartDrawer';
import { ToastProvider } from './components/ui/Toast';

function App (){
  const cart = useSelector((s) => s.cart.items);
  const drawerOpen = useSelector((s) => s.cart.drawerOpen);
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



  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Menu
          onAdd={handleAdd}
          cartItems={cart}
          orderCount={orderCount}
          onOpenCart={() => dispatch(toggleDrawer(true))}
        />
        <CartDrawer
          open={drawerOpen}
          onClose={() => dispatch(toggleDrawer(false))}
          currentOrder={currentOrder}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
