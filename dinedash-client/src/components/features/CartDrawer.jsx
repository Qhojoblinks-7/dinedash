import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import { CreditCardIcon, CurrencyDollarIcon,DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import OrderTracking from './OrderTracking';
import CartHeader from './CartHeader';
import Button from '../ui/Button';
import { useToast } from '../ui/toastContext';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDrawer, setLastOrderId, clearCart } from '../../store/cartSlice';
import { apiService } from '../../services/api';

const CartDrawer = ({
  open,
  onClose,
  onCheckout,
  currentOrder = null,
}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items || []);
  const drawerOpen = useSelector((s) => s.cart.drawerOpen);
  const orderId = useSelector((s) => s.cart.lastOrderId);

  const effectiveOpen = typeof open === 'boolean' ? open : drawerOpen;

  const subtotal = cartItems.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [orderType, setOrderType] = useState('Dine in');
  const [tableNo] = useState('Table 4');
  const [customerName] = useState('Floyd Miles');
  const [fetchedOrder, setFetchedOrder] = useState(null);

  // Checkout form state
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    tableNumber: '',
    deliveryAddress: '',
    contactPhone: '',
    deliveryInstructions: '',
    pickupTime: '',
    paymentProvider: '',
    paymentPhone: '',
    transactionRef: '',
  });

  const { addToast } = useToast();

  const mapOrderType = (type) => {
    switch (type) {
      case 'Dine in': return 'dine_in';
      case 'Take Away': return 'takeaway';
      case 'Delivery': return 'delivery';
      default: return 'dine_in';
    }
  };

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') onClose();
    else dispatch(toggleDrawer(false));
  }, [onClose, dispatch]);
  
  const handlePlaceOrder = async () => {
    // Validate required fields
    if (orderType === 'Dine in' && !checkoutData.tableNumber) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Table number is required for dine-in orders.' });
      return;
    }
    if (orderType === 'Delivery' && (!checkoutData.deliveryAddress || !checkoutData.contactPhone)) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Delivery address and contact phone are required.' });
      return;
    }
    if (selectedPaymentMethod === 'momo' && (!checkoutData.paymentProvider || !checkoutData.paymentPhone)) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Provider and phone number are required for Momo payments.' });
      return;
    }

    try {
      const checkoutPayload = {
        order: {
          customer_name: checkoutData.customerName || customerName,
          customer_email: '', // Can be added later
          contact_phone: checkoutData.contactPhone,
          table_number: checkoutData.tableNumber,
          delivery_address: checkoutData.deliveryAddress,
          delivery_instructions: checkoutData.deliveryInstructions,
          pickup_time: checkoutData.pickupTime || null,
          order_type: mapOrderType(orderType),
          items: cartItems.map(item => ({ meal: item.id, quantity: item.qty }))
        },
        payment: {
          method: selectedPaymentMethod,
          provider: checkoutData.paymentProvider,
          phone: checkoutData.paymentPhone,
          transaction_ref: checkoutData.transactionRef,
        }
      };

      console.log('Placing order with payload:', checkoutPayload);
      const response = await apiService.checkout(checkoutPayload);
      console.log('Order placed successfully:', response);

      // Fetch the created order for tracking
      const fetched = await apiService.getOrder(response.order.tracking_code);
      setFetchedOrder(fetched);

      dispatch(setLastOrderId(response.order.id));
      dispatch(clearCart());
      setOrderPlaced(true);
      setShowTracking(true);
      setSelectedPaymentMethod(null); // Reset payment selection

      // Contextual success messages
      let successMessage = 'Order placed successfully!';
      if (orderType === 'Dine in') {
        successMessage = `Order for Table ${checkoutData.tableNumber} received!`;
      } else if (orderType === 'Delivery') {
        successMessage = 'Delivery order placed!';
      } else if (orderType === 'Take Away') {
        successMessage = 'Takeaway order confirmed!';
      }

      addToast({ type: 'success', title: 'Order Placed!', message: successMessage });

      if (typeof onCheckout === 'function') {
        onCheckout({ method: selectedPaymentMethod, orderId: response.order.id });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      addToast({ type: 'error', title: 'Order Failed', message: 'Failed to place order. Please try again.' });
    }
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const isSmall = () => window.matchMedia('(max-width: 639px)').matches;

    function onTouchStart(e) {
      if (!isSmall()) return;
      draggingRef.current = true;
      startYRef.current = e.touches[0].clientY;
      sheet.style.transition = 'none';
    }

    function onTouchMove(e) {
      if (!draggingRef.current) return;
      currentYRef.current = e.touches[0].clientY - startYRef.current;
      if (currentYRef.current < 0) currentYRef.current = 0;
      sheet.style.transform = `translateY(${currentYRef.current}px)`;
    }

    function onTouchEnd() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      sheet.style.transition = '';
      const THRESH = 120;
      if (currentYRef.current > THRESH) {
        sheet.style.transform = '';
        handleClose();
      } else {
        sheet.style.transform = '';
      }
      currentYRef.current = 0;
    }

    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: true });
    sheet.addEventListener('touchend', onTouchEnd);

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleClose]);

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none ${effectiveOpen ? '' : 'opacity-0'}`} aria-hidden={!effectiveOpen}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${effectiveOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <aside
        className={`
          absolute right-0 bottom-0 top-0 h-full w-full 
          sm:w-[500px] 
          bg-white shadow-2xl transform transition-transform duration-300 ease-out 
          ${effectiveOpen ? 'translate-x-0' : 'translate-x-full'} 
          pointer-events-auto overflow-y-auto rounded-t-xl 
          sm:rounded-none
        `}
        role="dialog"
        aria-modal="true"
        ref={sheetRef}
      >
        {/* Header */}
        <CartHeader
          tableNo={tableNo}
          customerName={customerName}
          orderType={orderType}
          onOrderTypeChange={setOrderType}
        />

        {/* Mobile drag handle */}
        <div className="sm:hidden flex items-center justify-center mt-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Cart Content */}
        <div className="p-3 sm:p-4 pb-6 space-y-3 sm:space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <div className="text-4xl sm:text-5xl">🍽️</div>
              <p className="mt-3 text-sm sm:text-base text-gray-600 px-4">
                Nothing on your plate yet. Hungry for something delicious? 🍲 Start browsing!
              </p>
            </div>
          ) : showTracking ? (
            <div className="py-6">
              <OrderTracking order={fetchedOrder || currentOrder} onReset={() => { setShowTracking(false); setOrderPlaced(false); setFetchedOrder(null); }} />
            </div>
          ) : orderPlaced ? (
            <div className="text-center py-8 sm:py-10 px-4">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-50 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl sm:text-3xl text-green-600" />
              </div>
              <h3 className="mt-4 text-base sm:text-lg font-semibold">Order placed!</h3>
              {orderId && <div className="mt-2 text-sm text-gray-600">Order id: <span className="font-mono text-xs sm:text-sm">{orderId}</span></div>}
              <p className="mt-2 text-sm text-gray-600">Thanks — your order is being prepared. We'll notify you when it's ready.</p>
              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                <Button onClick={() => { setShowTracking(true); }} bgClass="bg-blue-900" textColor="text-white" className="text-sm">Track my order</Button>
                <Button onClick={handleClose} className="border border-blue-900 bg-white text-blue-900 text-sm">Close</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || null}
                        alt={item.name}
                        loading="lazy"
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="text-sm sm:text-base font-semibold text-gray-800 truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{item.description || ''}</div>
                      </div>
                      {!item.isVeg && (
                        <div className="mt-1 text-xs sm:text-sm text-red-500 font-medium flex items-center gap-1">
                          <FontAwesomeIcon icon={faUtensils} />
                          <span>Non Veg</span>
                        </div>
                      )}
                      <div className="mt-1 flex items-center justify-between text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">
                            ₵{item.price ? Number(item.price).toFixed(2) : '0.00'}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">{item.qty ?? 1}x</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {(item.price && item.qty ? Number(item.price) * Number(item.qty) : 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary and Payment Options */}
              <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 text-sm">Sub Total</span>
                    <span className="font-semibold text-gray-900 text-sm">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Tax 5%</span>
                    <span className="font-semibold text-gray-900 text-sm">${(subtotal * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center mt-2 font-bold text-base sm:text-lg">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
                <div className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Payment Method</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Cash', icon: CurrencyDollarIcon },
                    { id: 'flutterwave', label: 'Flutterwave', icon: CreditCardIcon  },
                    { id: 'momo', label: 'Momo', icon: DevicePhoneMobileIcon },
                  ].map(({ id, label, icon }) => (
                    <button
                      key={id}
                      className={`
                        flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border-2 transition-colors
                        ${selectedPaymentMethod === id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-100'}
                      `}
                      onClick={() => setSelectedPaymentMethod(id)}
                    >
                      <div
                        className={`
                          w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg mb-1
                          ${selectedPaymentMethod === id ? 'bg-green-100 text-green-700' : ' text-gray-900'}
                        `}
                      >
                        {React.createElement(icon, { className: "text-sm sm:text-base md:text-lg lg:text-sm" })}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inline Checkout Form */}
              {selectedPaymentMethod && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg animate-slide-up">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Complete Your Order</h3>

                  {/* Order Context Fields */}
                  {orderType === 'Dine in' && (
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={checkoutData.customerName}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Table Number *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.tableNumber}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, tableNumber: e.target.value }))}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="e.g., A12"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {(orderType === 'Take Away' || orderType === 'Delivery') && (
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={checkoutData.customerName}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Enter customer name"
                        />
                      </div>
                      {orderType === 'Delivery' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delivery Address *
                            </label>
                            <textarea
                              value={checkoutData.deliveryAddress}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500  text-sm sm:text-base focus:border-transparent"
                              rows={3}
                              placeholder="Enter full delivery address"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Contact Phone *
                            </label>
                            <input
                              type="tel"
                              value={checkoutData.contactPhone}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, contactPhone: e.target.value }))}
                              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500  text-sm sm:text-base focus:border-transparent"
                              placeholder="+233501234567"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delivery Instructions
                            </label>
                            <textarea
                              value={checkoutData.deliveryInstructions}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                              rows={2}
                              placeholder="Ring the bell twice, etc."
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Payment Method Fields */}
                  {selectedPaymentMethod === 'momo' && (
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provider *
                        </label>
                        <select
                          value={checkoutData.paymentProvider}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, paymentProvider: e.target.value }))}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500  text-sm sm:text-base focus:border-transparent"
                          required
                        >
                          <option value="">Select Provider</option>
                          <option value="MTN">MTN</option>
                          <option value="Vodafone">Vodafone</option>
                          <option value="AirtelTigo">AirtelTigo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={checkoutData.paymentPhone}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, paymentPhone: e.target.value }))}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="+233501234567"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transaction Reference
                        </label>
                        <input
                          type="text"
                          value={checkoutData.transactionRef}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, transactionRef: e.target.value }))}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Enter transaction reference"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'flutterwave' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        You will be redirected to Flutterwave to complete your payment securely.
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === 'cash' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Pay with cash when your order is ready.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-white sticky bottom-0 border-t border-gray-200 -mx-4 -mb-6 sm:-mx-6 sm:-mb-8">
                <Button
                  onClick={handlePlaceOrder}
                  fullWidth
                  bgClass="bg-green-600 hover:bg-green-700"
                  textColor="text-white"
                  disabled={cartItems.length === 0 || !selectedPaymentMethod}
                >
                  Place Order - ${total}
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
