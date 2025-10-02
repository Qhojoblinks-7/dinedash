import React, { useState, useEffect } from 'react';
import { StaffSideBar } from './Sidebar';
import { TableStatus } from './Footer';
import { OrderDetailsPanel } from './OrderDetails';
import MainHeader from './ui/MainHeader';
import MenuItemCard from './ui/MenuItemCard';
import { useToast } from './ui/toastContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMeals } from '../store/mealsSlice';
import { fetchOrders } from '../store/ordersSlice';
import { apiService } from '../services/api';

// --- Data Fetching and State ---

// --- Dashboard Component ---
const Dashboard = () => {
  const { addToast } = useToast();
  const dispatch = useDispatch();

  // Use Redux state for meals and orders
  const { meals: menuItems, loading: mealsLoading, error: mealsError } = useSelector(state => state.meals);
  const { orders, loading: ordersLoading, error: ordersError } = useSelector(state => state.orders);

  // Local state for tables
  const [activeTables, setActiveTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tablesLoading, setTablesLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    // Dispatch Redux actions to fetch meals and orders
    dispatch(fetchMeals());
    dispatch(fetchOrders());

    // Fetch tables locally
    const fetchTables = async () => {
      try {
        setTablesLoading(true);
        const tablesResponse = await apiService.getTables();
        setActiveTables(tablesResponse);
      } catch (err) {
        console.error('Error fetching tables:', err);
        addToast({
          type: 'error',
          title: 'Data Loading Error',
          message: 'Failed to load tables data'
        });
      } finally {
        setTablesLoading(false);
      }
    };

    fetchTables();
  }, [dispatch, addToast]);

  // Periodic polling for orders (every 1 second)
  useEffect(() => {
    const pollOrders = () => {
      dispatch(fetchOrders());
    };

    const interval = setInterval(pollOrders, 1000); // 1 second
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

  const loading = mealsLoading || tablesLoading || ordersLoading;
  const error = mealsError || ordersError;


  const handleTableClick = (table) => {
    setSelectedTable(table);
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
      <TableStatus activeTables={activeTables} onPlaceOrder={() => handleTableClick(activeTables[0])} />

      {/* Right Sidebar - Conditional and Dynamic */}
      {selectedTable && (
        <OrderDetailsPanel
          isOpen={true} // Panel will now be truly open when selectedTable is set
          tableDetails={selectedTable}
          orderDetails={{
            tableNumber: selectedTable.tableNumber,
            orderType: 'Dine In',
            items: [], // Will be populated when orders are properly linked to tables
            subtotal: 0,
            tax: 0,
            totalAmount: 0,
          }}
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
        />
      )}
    </div>
  );
};

export default Dashboard;