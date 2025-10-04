// src/components/cart/CartDrawerBackend.jsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faTimes, faCreditCard, faCheckCircle, faPencilAlt, faMoneyBillAlt, faQrcode } from '@fortawesome/free-solid-svg-icons';
import OrderTracking from './OrderTracking';
import Button from '../ui/Button';
import { useToast } from '../ui/toastContext';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDrawer, setLastOrderId, clearCart } from '../../store/cartSlice';

const CartDrawerBackend = ({
  open,
  onClose,
  onCheckout,
  currentOrder = null,
}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items || []);
  const drawerOpen = useSelector((s) => s.cart.drawerOpen);
  const notes = useSelector((s) => s.cart.notes || '');
  const orderId = useSelector((s) => s.cart.lastOrderId);
  const checkoutStatus = useSelector((s) => s.cart.checkoutStatus || 'idle');

  const effectiveOpen = typeof open === 'boolean' ? open : drawerOpen;

  const subtotal = cartItems.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const [showReview, setShowReview] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [orderType, setOrderType] = useState('Dine in');
  const tableNo = '';
  const customerName = '';

  const { addToast } = useToast();

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') onClose();
    else dispatch(toggleDrawer(false));
  }, [onClose, dispatch]);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setShowReview(false);
    setOrderPlaced(true);
    setShowTracking(true);

    // Prepare the API payload
    const apiPayload = {
      customer_name: customerName,
      order_type: orderType === 'Dine in' ? 'dine_in' : 'take_out',
      items: cartItems.map(item => ({
        meal: item.id,
        quantity: item.qty
      }))
    };

    try {
      // Make API call to backend
      const response = await fetch('/api/orders/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update Redux state with the order ID from backend
      const backendOrderId = data.id || data.pk || `ORD-${Date.now().toString().slice(-6)}`;
      dispatch(setLastOrderId(backendOrderId));

      // Clear cart and show success message
      dispatch(clearCart());
      addToast({
        type: 'success',
        title: 'Order Placed!',
        message: `Order ${backendOrderId} has been placed successfully. Track your order below.`
      });

      // Call parent onCheckout handler if provided
      if (typeof onCheckout === 'function') {
        try {
          onCheckout({ method: paymentMethod, notes, orderId: backendOrderId });
        } catch {
          onCheckout();
        }
      }

    } catch (error) {
      console.error('Order creation failed:', error);
      addToast({
        type: 'error',
        title: 'Order Failed',
        message: 'Failed to place order. Please try again.'
      });

      // Fallback to local simulation
      const fallbackOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      dispatch(setLastOrderId(fallbackOrderId));
      dispatch(clearCart());

      if (typeof onCheckout === 'function') {
        try {
          onCheckout({ method: paymentMethod, notes, orderId: fallbackOrderId });
        } catch {
          onCheckout();
        }
      }
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
        className={`absolute left-0 right-0 bottom-0 sm:right-0 sm:left-auto sm:top-0 h-[calc(100vh-4rem)] sm:h-full w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${effectiveOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'} pointer-events-auto overflow-y-auto rounded-t-xl sm:rounded-none`}
        role="dialog"
        aria-modal="true"
        ref={sheetRef}
      >
        {/* Header */}
        <div className="p-4 bg-white sticky top-0 z-10 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{tableNo}</h1>
              <p className="text-xs sm:text-sm text-gray-500">{customerName}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Edit details">
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-full text-xs sm:text-sm md:text-base">
            {['Dine in', 'Take Away', 'Delivery'].map((type) => (
              <button
                key={type}
                className={`flex-1 py-2 rounded-full transition-colors font-medium ${orderType === type ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setOrderType(type)}
                aria-pressed={orderType === type}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile drag handle */}
        <div className="sm:hidden flex items-center justify-center mt-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Cart Content */}
        <div className="p-4 pb-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl">🍽️</div>
              <p className="mt-3 text-sm sm:text-base text-gray-600">
                Nothing on your plate yet. Hungry for something delicious? 🍲 Start browsing!
              </p>
            </div>
          ) : showTracking ? (
            <div className="py-6">
              <OrderTracking order={currentOrder} onReset={() => { setShowTracking(false); setOrderPlaced(false); }} />
            </div>
          ) : orderPlaced ? (
            <div className="text-center py-10">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-600" />
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-semibold">Order placed!</h3>
              {orderId && <div className="mt-2 text-sm sm:text-base text-gray-600">Order id: <span className="font-mono text-sm">{orderId}</span></div>}
              <p className="mt-2 text-sm sm:text-base text-gray-600">Thanks — your order is being prepared. We'll notify you when it's ready.</p>
              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                <Button onClick={() => { setShowTracking(true); }} bgClass="bg-blue-900" textColor="text-white">Track my order</Button>
                <Button onClick={handleClose} className="border border-blue-900" bgClass="bg-white" textColor="text-blue-900">Close</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
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
                        className="w-16 sm:w-20 h-16 sm:h-20 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">{item.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500 line-clamp-2">{item.description || ''}</div>
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
                            ${item.price ? Number(item.price).toFixed(2) : '0.00'}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">{item.qty ?? 1}x</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          ${(item.price && item.qty ? Number(item.price) * Number(item.qty) : 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary and Payment Options */}
              <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
                <div className="text-sm sm:text-base">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tax 5%</span>
                    <span className="font-semibold text-gray-900">${(subtotal * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center mt-2 font-bold text-lg">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="font-semibold text-gray-800 mb-3">Payment Method</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Cash', icon: faMoneyBillAlt },
                    { id: 'credit_card', label: 'Credit/Debit Card', icon: faCreditCard },
                    { id: 'qr_code', label: 'QR Code', icon: faQrcode },
                  ].map(({ id, label, icon }) => (
                    <button
                      key={id}
                      className={`
                        flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-colors
                        ${paymentMethod === id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-100'}
                      `}
                      onClick={() => setPaymentMethod(id)}
                    >
                      <div
                        className={`
                          w-12 h-12 flex items-center justify-center rounded-lg mb-1
                          ${paymentMethod === id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                        `}
                      >
                        <FontAwesomeIcon icon={icon} className="text-lg sm:text-xl" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white sticky bottom-0 border-t border-gray-200 -mx-4 -mb-6 sm:-mx-6 sm:-mb-8">
                <Button
                  onClick={() => setShowReview(true)}
                  fullWidth
                  bgClass="bg-green-600 hover:bg-green-700"
                  textColor="text-white"
                  disabled={cartItems.length === 0}
                >
                  Place Order - ${total}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Review Panel */}
        {showReview && (
          <div className="fixed z-50 inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="w-full sm:w-[420px] bg-white rounded-t-xl sm:rounded-xl p-4 shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold">Review your order</h3>
                <button onClick={() => setShowReview(false)} className="p-2 rounded-md hover:bg-gray-100">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-sm sm:text-base text-gray-700 font-semibold">Payment method</div>
                <div className="flex flex-col gap-2">
                  {['card','mobile','cash'].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="form-radio text-blue-900 focus:ring-blue-500"
                      />
                      <div className="text-sm sm:text-base font-medium text-gray-800">
                        {method === 'card' ? 'Card' : method === 'mobile' ? 'Mobile Money' : 'Cash on delivery'}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <div>Subtotal</div>
                    <div>${subtotal.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-600 mt-1">
                    <div>VAT / Tax</div>
                    <div>${tax.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center mt-2 font-bold text-lg sm:text-xl text-blue-900">
                    <div>Total</div>
                    <div>${total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    onClick={handlePlaceOrder}
                    fullWidth
                    bgClass="bg-blue-900"
                    textColor="text-white"
                    ariaLabel="Place my order"
                    disabled={checkoutStatus === 'pending'}
                  >
                    {checkoutStatus === 'pending' ? 'Placing order…' : 'Place my order'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawerBackend;
