import React, { useState, useEffect } from 'react';
import { StaffSideBar } from './Sidebar';
import { TableStatus } from './Footer';
import { OrderDetailsPanel } from './OrderDetails';
import MainHeader from './ui/MainHeader';
import MenuItemCard from './ui/MenuItemCard';
import { useToast } from './ui/toastContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMeals } from '../store/mealsSlice';
import { fetchOrders, updateOrderStatus, finalizePayment } from '../store/ordersSlice';

// --- Dashboard Component ---
const Dashboard = () => {
  const { addToast } = useToast();
  const dispatch = useDispatch();

  // Use Redux state for meals and orders
  const { meals: menuItems, loading: mealsLoading, error: mealsError } = useSelector(state => state.meals);
  const { orders, loading: ordersLoading, error: ordersError } = useSelector(state => state.orders);

  // Local state for orders
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    // Dispatch Redux actions to fetch meals and orders
    dispatch(fetchMeals());
    dispatch(fetchOrders());
  }, [dispatch]);

  // Periodic polling for orders (every 30 seconds)
  useEffect(() => {
    const pollOrders = () => {
      dispatch(fetchOrders());
    };

    const interval = setInterval(pollOrders, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  // Calculate ordered quantities from all orders
  const calculateOrderedQuantities = () => {
    const quantities = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const mealId = item.meal?.toString() || item.meal_id?.toString();
          if (mealId) {
            quantities[mealId] = (quantities[mealId] || 0) + (item.quantity || 1);
          }
        });
      }
    });
    return quantities;
  };

  const orderedQuantities = calculateOrderedQuantities();

  // Transform meals data to match component expectations
  const transformedMenuItems = menuItems.map(meal => ({
    id: meal.id.toString(),
    name: meal.name,
    description: meal.description || 'No description available',
    image: meal.image ? `http://localhost:8000${meal.image}` : null,
    price: parseFloat(meal.price),
    categoryId: 'main', // Default category since backend doesn't have categories yet
    isAvailable: meal.is_available,
    isVeg: meal.is_veg,
    orderedQuantity: orderedQuantities[meal.id.toString()] || 0,
    stats: [{
      value: meal.is_veg ? 1 : 0,
      type: meal.is_veg ? 'veg' : 'non-veg',
      color: meal.is_veg ? 'green' : 'red'
    }]
  }));

  const loading = mealsLoading || ordersLoading;
  const error = mealsError || ordersError;

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleSendToKitchen = async () => {
    if (selectedOrder) {
      try {
        await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'sentToKitchen' })).unwrap();
        addToast('Order sent to kitchen successfully!', 'success');
      } catch (error) {
        addToast('Failed to send order to kitchen.', 'error');
      }
    }
  };

  const handleFinalizePayment = async (paymentMethod) => {
    if (selectedOrder) {
      try {
        await dispatch(finalizePayment({ orderId: selectedOrder.id, paymentMethod, amount: selectedOrder.totalAmount })).unwrap();
        await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'completed' })).unwrap();
        addToast('Payment finalized successfully!', 'success');
      } catch (error) {
        addToast(error || 'Failed to finalize payment.', 'error');
      }
    }
  };

  const handleSendToKitchen = async (orderId) => {
    try {
      await apiService.updateOrderStatus(orderId, 'in_progress');
      dispatch(fetchOrders());
      addToast({ type: 'success', title: 'Order sent', message: 'Order sent to kitchen.' });
    } catch (err) {
      console.error('Failed to update order status', err);
      addToast({ type: 'error', title: 'Update failed', message: 'Could not send order to kitchen.' });
    }
  };

  const tableDetails = selectedOrder ? {
    tableNumber: selectedOrder.tracking_code,
    orderType: selectedOrder.order_type,
    status: selectedOrder.status,
  } : null;

  const orderDetails = selectedOrder ? {
    tableNumber: selectedOrder.tracking_code,
    orderType: selectedOrder.order_type,
    items: selectedOrder.items || [],
    subtotal: parseFloat(selectedOrder.total_amount) - parseFloat(selectedOrder.delivery_fee || 0),
    tax: 0,
    totalAmount: parseFloat(selectedOrder.total_amount),
    paymentMethod: selectedOrder.payment_method,
  } : null;

  return (
    <div className="flex bg-gray-50 min-h-screen relative">
      {/* Left Sidebar */}
      <StaffSideBar />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        <MainHeader />
        <div className="mt-40 grid grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="text-lg">Loading menu items...</div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <div className="text-red-600 text-lg">Error loading menu: {error}</div>
            </div>
          ) : (
            transformedMenuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                name={item.name}
                description={item.description}
                image={item.image}
                price={item.price}
                isVeg={item.isVeg}
                isAvailable={item.isAvailable}
                quantity={item.orderedQuantity}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <TableStatus activeOrders={orders} onSelectOrder={handleOrderClick} />

      {/* Right Sidebar - Conditional and Dynamic */}
      {selectedOrder && (
        <OrderDetailsPanel
          isOpen={true}
          tableDetails={tableDetails}
          orderDetails={orderDetails}
          onRemoveItem={() => {}}
          onSendToKitchen={() => {
            // TODO: wire selected order id; using first order as placeholder
            const firstOrderId = orders?.[0]?.id;
            if (firstOrderId) {
              handleSendToKitchen(firstOrderId);
            } else {
              addToast({ type: 'error', title: 'No order', message: 'No order to send.' });
            }
          }}
          onFinalizePayment={() => {}}
          onClose={() => setSelectedTable(null)}
          onSendToKitchen={handleSendToKitchen}
          onFinalizePayment={handleFinalizePayment}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
