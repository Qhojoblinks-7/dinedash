import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faTimes, faClock, faCreditCard, faTrashAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import OrderTracking from './OrderTracking';
import Button from '../ui/Button';
import { useToast } from '../ui/toastContext';
import { useSelector, useDispatch } from 'react-redux';
import { changeQty, removeItem, toggleDrawer, setNotes, setLastOrderId, clearCart } from '../../store/cartSlice';

const CartDrawer = ({
  open, // optional prop fallback
  onClose, // optional callback fallback
  onCheckout, // optional callback fallback
  currentOrder = null,
}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items || []);
  const drawerOpen = useSelector((s) => s.cart.drawerOpen);
  const notes = useSelector((s) => s.cart.notes || '');
  const orderId = useSelector((s) => s.cart.lastOrderId);
  const checkoutStatus = useSelector((s) => s.cart.checkoutStatus || 'idle');

  const effectiveOpen = typeof open === 'boolean' ? open : drawerOpen;

  const subtotal = cartItems.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const estTime = cartItems.length ? `${20 + cartItems.length * 3} mins` : '—';

  // Checkout local state
  const [showReview, setShowReview] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  const [showTracking, setShowTracking] = React.useState(false);

  const { addToast } = useToast();

  const handleClose = React.useCallback(() => {
    if (typeof onClose === 'function') onClose();
    else dispatch(toggleDrawer(false));
  }, [onClose, dispatch]);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  // Mobile swipe-to-close
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
      if (currentYRef.current < 0) currentYRef.current = 0; // don't drag up
      sheet.style.transform = `translateY(${currentYRef.current}px)`;
    }

    function onTouchEnd() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      sheet.style.transition = '';
      const THRESH = 120; // px
      if (currentYRef.current > THRESH) {
        // close
        sheet.style.transform = '';
        handleClose();
      } else {
        // snap back
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
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${
          effectiveOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <aside
        className={`absolute left-0 right-0 bottom-0 sm:right-0 sm:left-auto sm:top-0 h-[calc(100vh-4rem)] sm:h-full w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          effectiveOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'
        } pointer-events-auto overflow-y-auto rounded-t-xl sm:rounded-none`}
        role="dialog"
        aria-modal="true"
        ref={sheetRef}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-brand-100 to-white border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faUtensils} className="text-sm sm:text-base text-brand-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-brand-800">Your Order</h2>
          </div>
          <button onClick={handleClose} aria-label="Close cart" className="p-2 rounded-md hover:bg-gray-100">
            <FontAwesomeIcon icon={faTimes} className="text-sm sm:text-base text-gray-600" />
          </button>
        </div>

        {/* Mobile drag handle */}
        <div className="sm:hidden flex items-center justify-center mt-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-4 pb-6">
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
              <h3 className="mt-4 text-lg font-semibold">Order placed!</h3>
              {orderId && <div className="mt-2 text-sm text-gray-600">Order id: <span className="font-mono text-sm">{orderId}</span></div>}
              <p className="mt-2 text-sm text-gray-600">Thanks — your order is being prepared. We'll notify you when it's ready.</p>
              <div className="mt-4 flex gap-2 justify-center">
                <Button onClick={() => { setShowTracking(true); }} bgClass="bg-[#0015AA]" textColor="text-white">Track my order</Button>
                <Button onClick={handleClose} className="border" bgClass="bg-white" textColor="text-[#0015AA]">Close</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl w-full gap-3 p-3"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || null}
                      alt={item.name}
                      loading="lazy"
                      className="w-24 h-24 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <div className="text-sm sm:text-base font-medium text-gray-800">{item.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">{item.description || ''}</div>
                      </div>
                      <div className="text-sm sm:text-base font-medium mt-2 sm:mt-0 text-brand-700">
                        Ghs{(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => dispatch(changeQty({ id: item.id, qty: Math.max(0, item.qty - 1) }))}
                          className="w-11 h-11 rounded-full bg-red-500 text-white text-lg flex items-center justify-center hover:scale-105 transition-transform"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <div className="w-10 text-center font-medium text-base">{item.qty}</div>
                        <button
                          onClick={() => dispatch(changeQty({ id: item.id, qty: item.qty + 1 }))}
                          className="w-11 h-11 rounded-full bg-green-500 text-white text-lg flex items-center justify-center hover:scale-105 transition-transform"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                        <button onClick={() => dispatch(removeItem(item.id))} className="ml-2 text-xs sm:text-sm text-red-600 flex items-center gap-2">
                          <FontAwesomeIcon icon={faTrashAlt} />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                  </div>
                </div>
              ))}

              <div>
                <label htmlFor="order-notes" className="text-xs sm:text-sm font-medium text-gray-700">
                  Order notes
                </label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => dispatch(setNotes(e.target.value))}
                  placeholder="Add special instructions (e.g., less spicy, extra sauce)."
                  className="w-full mt-2 p-2 border rounded-md resize-none text-sm sm:text-base"
                  rows={3}
                  aria-describedby="notes-desc"
                />
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white p-4 border-t z-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Subtotal</div>
                  <div>Ghs {subtotal.toFixed(2)}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <div>VAT / Tax</div>
                  <div>Ghs {tax.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <FontAwesomeIcon icon={faClock} />
                    <span>Est. {estTime}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm sm:text-base font-semibold">
                    Ghs {total.toFixed(2)}
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    onClick={() => setShowReview(true)}
                    fullWidth
                    className={` ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    bgClass="bg-[#FBB03B]"
                    textColor="text-[#0015AA]"
                    ariaLabel="Proceed to Checkout"
                    disabled={cartItems.length === 0}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                      <FontAwesomeIcon icon={faCreditCard} />
                      <span className="font-semibold">Proceed to Checkout</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Review panel (simple in-drawer modal) - FIXED Z-INDEX */}
        {showReview && (
          <div className="fixed z-50 inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 " style={{ margin: 0 }}>
            <div className="w-full sm:w-[420px] bg-white rounded-t-xl sm:rounded-xl p-4 shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Review your order</h3>
                <button onClick={() => setShowReview(false)} className="p-2 rounded-md hover:bg-gray-100">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="mt-3 space-y-3">
                <div className="text-sm text-gray-700">Payment method</div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-2 rounded-md border hover:bg-gray-50">
                    <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <div className="text-sm">Card</div>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-md border hover:bg-gray-50">
                    <input type="radio" name="pay" checked={paymentMethod === 'mobile'} onChange={() => setPaymentMethod('mobile')} />
                    <div className="text-sm">Mobile Money</div>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-md border hover:bg-gray-50">
                    <input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                    <div className="text-sm">Cash on delivery</div>
                  </label>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>Subtotal</div>
                    <div>Ghs {subtotal.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <div>VAT / Tax</div>
                    <div>Ghs {tax.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm font-semibold">Total</div>
                    <div className="text-sm font-semibold">Ghs {total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    onClick={() => {
                      setShowReview(false);
                      setOrderPlaced(true);
                      setShowTracking(true); // Auto-open tracking

                      // If parent provided onCheckout, call it. Otherwise perform a local mock checkout.
                      if (typeof onCheckout === 'function') {
                        try {
                          onCheckout({ method: paymentMethod, notes });
                        } catch {
                          onCheckout();
                        }
                      } else {
                        const oid = `ORD-${Date.now().toString().slice(-6)}`;
                        dispatch(setLastOrderId(oid));
                        dispatch(clearCart());
                        addToast({ type: 'success', title: 'Order Placed!', message: `Order ${oid} has been placed successfully. Track your order below.` });
                      }
                    }}
                    fullWidth
                    bgClass="bg-[#0015AA]"
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

export default CartDrawer;
