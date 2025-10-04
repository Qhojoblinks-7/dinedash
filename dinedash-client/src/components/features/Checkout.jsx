import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCreditCard, faMoneyBillAlt, faMobileAlt, faUniversity, faUtensils } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import { useToast } from '../ui/toastContext';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../store/cartSlice';

const Checkout = ({ onClose, onSuccess, onCheckout }) => {
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);

  const [orderContext, setOrderContext] = useState({
    type: 'dine_in',
    customerName: '',
    tableNumber: '',
    deliveryAddress: '',
    contactPhone: '',
    deliveryInstructions: '',
    pickupTime: '',
  });

  const [payment, setPayment] = useState({
    method: 'cash',
    provider: '',
    phone: '',
    bankDetails: '',
    transactionRef: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const deliveryFee = orderContext.type === 'delivery' ? 3.50 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + tax + deliveryFee;

  const orderTypes = [
    { value: 'dine_in', label: 'Dine In', icon: faUtensils },
    { value: 'takeaway', label: 'Takeaway', icon: faMobileAlt },
    { value: 'delivery', label: 'Delivery', icon: faCreditCard },
    { value: 'pickup', label: 'Pickup', icon: faUniversity },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: faMoneyBillAlt },
    { value: 'momo', label: 'Mobile Money', icon: faMobileAlt },
    { value: 'mono', label: 'Mono', icon: faUniversity },
    { value: 'card', label: 'Card', icon: faCreditCard },
  ];

  const handleOrderContextChange = (field, value) => {
    setOrderContext(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { type, tableNumber, deliveryAddress, contactPhone } = orderContext;
    const { method, provider, phone } = payment;

    if (type === 'dine_in' && !tableNumber) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Table number is required for dine-in orders.' });
      return false;
    }

    if (type === 'delivery' && (!deliveryAddress || !contactPhone)) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Delivery address and contact phone are required for delivery.' });
      return false;
    }

    if (method === 'momo' && (!provider || !phone)) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Provider and phone number are required for mobile money.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const checkoutPayload = {
        customer_name: orderContext.customerName,
        order_type: orderContext.type,
        table_number: orderContext.tableNumber,
        delivery_address: orderContext.deliveryAddress,
        contact_phone: orderContext.contactPhone,
        delivery_instructions: orderContext.deliveryInstructions,
        pickup_time: orderContext.pickupTime,
        method: payment.method,
        provider: payment.provider,
        phone: payment.phone,
        bank_details: payment.bankDetails,
        transaction_ref: payment.transactionRef,
      };

      // Use the onCheckout prop from App.jsx
      await onCheckout(checkoutPayload);

      dispatch(clearCart());
      addToast({
        type: 'success',
        title: 'Order Placed!',
        message: 'Your order has been placed successfully.'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Checkout failed:', error);
      addToast({ type: 'error', title: 'Checkout Failed', message: 'Failed to process your order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Context */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {orderTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleOrderContextChange('type', type.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    orderContext.type === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Fields based on Order Type */}
          {orderContext.type === 'dine_in' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number *
                </label>
                <input
                  type="text"
                  value={orderContext.tableNumber}
                  onChange={(e) => handleOrderContextChange('tableNumber', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., A12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={orderContext.customerName}
                  onChange={(e) => handleOrderContextChange('customerName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
            </div>
          )}

          {(orderContext.type === 'takeaway' || orderContext.type === 'pickup') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={orderContext.customerName}
                  onChange={(e) => handleOrderContextChange('customerName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Pickup Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={orderContext.pickupTime}
                  onChange={(e) => handleOrderContextChange('pickupTime', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {orderContext.type === 'delivery' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  value={orderContext.deliveryAddress}
                  onChange={(e) => handleOrderContextChange('deliveryAddress', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter full delivery address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={orderContext.contactPhone}
                  onChange={(e) => handleOrderContextChange('contactPhone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+233501234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={orderContext.deliveryInstructions}
                  onChange={(e) => handleOrderContextChange('deliveryInstructions', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Ring the bell twice, etc."
                />
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(method => (
                <button
                  key={method.value}
                  onClick={() => handlePaymentChange('method', method.value)}
                  className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                    payment.method === method.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={method.icon} className="text-xl" />
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Payment Fields */}
          {payment.method === 'momo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider *
                </label>
                <select
                  value={payment.provider}
                  onChange={(e) => handlePaymentChange('provider', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  value={payment.phone}
                  onChange={(e) => handlePaymentChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+233501234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  value={payment.transactionRef}
                  onChange={(e) => handlePaymentChange('transactionRef', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter transaction reference"
                />
              </div>
            </div>
          )}

          {payment.method === 'mono' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Details *
                </label>
                <textarea
                  value={payment.bankDetails}
                  onChange={(e) => handlePaymentChange('bankDetails', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter bank account details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference *
                </label>
                <input
                  type="text"
                  value={payment.transactionRef}
                  onChange={(e) => handlePaymentChange('transactionRef', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter transaction reference"
                />
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₵{tax.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₵{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₵{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            fullWidth
            bgClass="bg-green-600 hover:bg-green-700"
            textColor="text-white"
            disabled={isSubmitting || cartItems.length === 0}
            className="py-4 text-lg font-semibold"
          >
            {isSubmitting ? 'Processing...' : `Place Order - ₵${total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;