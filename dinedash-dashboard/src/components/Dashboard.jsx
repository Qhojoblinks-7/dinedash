import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StaffSideBar } from './Sidebar';
import { TableStatus } from './Footer';
import { OrderDetailsPanel } from './OrderDetails';
import MainHeader from './ui/MainHeader';
import MenuItemCard from './ui/MenuItemCard';
import Accounting from './Accounting';
import { useToast } from './ui/toastContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMeals, createMeal } from '../store/mealsSlice';
import { fetchOrders, updateOrderStatus, finalizePayment } from '../store/ordersSlice';
import { EditMealModal } from './EditMealModal';

/* * NOTE: The getImageBaseUrl function and IMAGE_BASE_URL constant have been removed.
 * The meal.image URL is now used directly, as it should be an absolute URL 
 * returned by the Django backend.
 */

const Dashboard = () => {
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Menu');

  const mealsState = useSelector(state => state.meals);
  const { meals: menuItems, loading: mealsLoading, error: mealsError } = mealsState;
  const { meals } = mealsState;
  const { orders, loading: ordersLoading, error: ordersError } = useSelector(state => state.orders);

  // Local state for orders
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  
  // NEW STATE for Meal Management
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  
  const [newMeal, setNewMeal] = useState({
    name: '',
    description: '',
    price: '',
    prep_time: '',
    category: 'main_course',
    image: null,
    is_veg: false,
    is_available: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const matchingOrder = orders.find(order => order.tracking_code.toLowerCase().includes(query.toLowerCase()));
    if (matchingOrder) {
      setSelectedOrder(matchingOrder);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAddMealClick = () => {
    setShowAddMeal(true);
  };
  
  const handleEditMealClick = (meal) => {
    setMealToEdit(meal);
  };
  
  const handleCloseEditModal = () => {
    setMealToEdit(null);
  };


  useEffect(() => {
    dispatch(fetchMeals());
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const pollOrders = () => {
      dispatch(fetchOrders());
    };

    const interval = setInterval(pollOrders, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const calculateOrderedQuantities = () => {
    const quantities = {};
    if (Array.isArray(orders)) {
      orders.forEach(order => {
        if (order.status === 'pending' && order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const mealId = item.meal?.id?.toString() || item.meal_id?.toString();
            if (mealId) {
              quantities[mealId] = (quantities[mealId] || 0) + (item.quantity || 1);
            }
          });
        }
      });
    }
    return quantities;
  };

  const orderedQuantities = calculateOrderedQuantities();

  // FIX: Ensure menuItems is an array before calling .reduce()
  const menuItemsArray = Array.isArray(menuItems) ? menuItems : [];

  const categoryCounts = menuItemsArray.reduce((acc, meal) => {
    acc[meal.category] = (acc[meal.category] || 0) + 1;
    return acc;
  }, {});

  const categories = [
    { id: 'all', name: 'All', count: menuItemsArray.length },
    { id: 'main_course', name: 'Main Course', count: categoryCounts.main_course || 0 },
    { id: 'desserts', name: 'Desserts', count: categoryCounts.desserts || 0 },
    { id: 'drinks', name: 'Drinks', count: categoryCounts.drinks || 0 },
    { id: 'appetizers', name: 'Appetizers', count: categoryCounts.appetizers || 0 },
    { id: 'sides', name: 'Sides', count: categoryCounts.sides || 0 },
  ];

  // FIX: Ensure menuItems is an array before calling .filter()
  const filteredMeals = menuItemsArray.filter(meal => {
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            meal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const transformedMenuItems = filteredMeals.map(meal => {
    return {
      id: meal.id.toString(),
      name: meal.name,
      description: meal.description || '',
      // 👇 THE FIX: Use meal.image URL directly without prepending the domain
      image: meal.image || null, 
      price: parseFloat(meal.price),
      category: meal.category || 'main_course',
      isAvailable: meal.is_available,
      isVeg: meal.is_veg,
      orderedQuantity: orderedQuantities[meal.id.toString()] || 0,
    };
  });

  const loading = mealsLoading || ordersLoading;
  const error = mealsError || ordersError;

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };


  const handleFinalizePayment = async (paymentMethod) => {
    if (selectedOrder) {
      try {
        await dispatch(finalizePayment({ orderId: selectedOrder.id, paymentMethod, amount: selectedOrder.totalAmount })).unwrap();
        
        await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'completed' })).unwrap(); 
        
        dispatch(fetchOrders());
        addToast('Payment finalized successfully!', 'success');
        setSelectedOrder(null); 
      } catch (error) {
        addToast(error || 'Failed to finalize payment.', 'error');
      }
    }
  };

  const handleSendToKitchen = async () => {
    if (selectedOrder) {
      try {
        await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'in progress' })).unwrap();
        dispatch(fetchOrders());
        addToast('Order sent to kitchen successfully!', 'success');
      } catch {
        addToast('Failed to send order to kitchen.', 'error');
      }
    }
  };

  const handleVerifyPayment = async () => {
    if (selectedOrder) {
      setVerifyingPayment(true);
      try {
        await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'in progress' })).unwrap();
        dispatch(fetchOrders());
        
        addToast('Payment verified successfully and sent to kitchen!', 'success');
        setSelectedOrder(null); 
      } catch (e) {
          addToast('Failed to verify payment.', 'error');
      } finally {
        setVerifyingPayment(false);
      }
    } else {
      addToast('No order selected.', 'error');
    }
  };

  const handleAddMeal = async () => {
    setIsCreatingMeal(true); 
    const formData = new FormData();
    formData.append('name', newMeal.name);
    formData.append('description', newMeal.description);
    formData.append('price', newMeal.price);
    formData.append('prep_time', newMeal.prep_time);
    formData.append('category', newMeal.category);
    formData.append('is_veg', newMeal.is_veg.toString());
    formData.append('is_available', newMeal.is_available.toString());
    if (newMeal.image) {
      formData.append('image', newMeal.image);
    }
    
    if (!newMeal.name || !newMeal.price || !newMeal.prep_time) {
        addToast('Please fill in Name, Price, and Prep Time.', 'error');
        setIsCreatingMeal(false);
        return;
    }


    try {
      await dispatch(createMeal(formData)).unwrap();
      setShowAddMeal(false);
      // Clear form on success
      setNewMeal({
        name: '',
        description: '',
        price: '',
        prep_time: '',
        category: 'main_course',
        image: null,
        is_veg: false,
        is_available: true,
      });
      addToast('Meal added successfully!', 'success');
    } catch (error) {
      console.error('Meal creation failed:', error);
      if (error && typeof error === 'object') {
        const errorMessages = Object.entries(error)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        addToast(`Failed to add meal: ${errorMessages}`, 'error');
      } else {
        addToast(`Failed to add meal: ${JSON.stringify(error)}`, 'error');
      }
    } finally {
        setIsCreatingMeal(false); 
    }
  };

  // CLEANUP: Use selectedOrder.status directly
  const tableDetails = selectedOrder ? {
    tableNumber: selectedOrder.tracking_code,
    orderType: selectedOrder.order_type,
    status: selectedOrder.status, // Use server status
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
      <StaffSideBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {activeTab === 'Menu' && (
          <div className="p-6 pb-32">
            <MainHeader
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onAddMeal={handleAddMealClick}
            />
            <div className="mt-40 grid grid-cols-2 md:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-lg">Loading menu items...</div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-red-600 text-lg">Error loading menu: {typeof error === 'object' ? JSON.stringify(error) : error}</div>
                </div>
              ) : (
                transformedMenuItems.map((item) => {
                  const originalMeal = menuItemsArray.find(m => m.id.toString() === item.id);
                  return (
                      <MenuItemCard
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          description={item.description}
                          image={item.image}
                          price={item.price}
                          isVeg={item.isVeg}
                          isAvailable={item.isAvailable}
                          quantity={item.orderedQuantity}
                          onClick={() => handleEditMealClick(originalMeal)}
                      />
                  );
                })
              )}
            </div>
          </div>
        )}
        {activeTab === 'Accounting' && <Accounting />}
      </div>

      {/* Footer */}
      <TableStatus activeOrders={orders} onSelectOrder={handleOrderClick} />

      {/* Right Sidebar - Conditional and Dynamic */}
      {selectedOrder && (
        <OrderDetailsPanel
          isOpen={true}
          tableDetails={tableDetails}
          orderDetails={orderDetails}
          order={selectedOrder}
          meals={meals}
          verifyingPayment={verifyingPayment}
          onRemoveItem={() => {}}
          onSendToKitchen={handleSendToKitchen}
          onFinalizePayment={handleFinalizePayment}
          onVerifyPayment={handleVerifyPayment}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      
      {/* NEW: Edit Meal Modal */}
      {mealToEdit && (
        <EditMealModal
          isOpen={!!mealToEdit}
          meal={mealToEdit}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Meal</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Description"
                value={newMeal.description}
                onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={newMeal.price}
                onChange={(e) => setNewMeal({ ...newMeal, price: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Preparation Time (minutes)"
                value={newMeal.prep_time}
                onChange={(e) => setNewMeal({ ...newMeal, prep_time: e.target.value })}
                required
                className="w-full p-2 border rounded"
              />
              <select
                value={newMeal.category}
                onChange={(e) => setNewMeal({ ...newMeal, category: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="main_course">Main Course</option>
                <option value="desserts">Desserts</option>
                <option value="drinks">Drinks</option>
                <option value="appetizers">Appetizers</option>
                <option value="sides">Sides</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewMeal({ ...newMeal, image: e.target.files[0] })}
                className="w-full p-2 border rounded"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMeal.is_veg}
                  onChange={(e) => setNewMeal({ ...newMeal, is_veg: e.target.checked })}
                  className="mr-2"
                />
                Vegetarian
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMeal.is_available}
                  onChange={(e) => setNewMeal({ ...newMeal, is_available: e.target.checked })}
                  className="mr-2"
                />
                Available
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleAddMeal} 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                disabled={isCreatingMeal}
              >
                {isCreatingMeal ? 'Adding...' : 'Add Meal'}
              </button>
              <button onClick={() => setShowAddMeal(false)} className="border px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;