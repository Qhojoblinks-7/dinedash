import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import OrderHeader from './OrderHeader';
import OrderedItem from './OrderedItem';
import PriceSummary from './PriceSummary';
import PaymentActions from './PaymentActions';

const OrderDetailsPanel = ({ isOpen, tableDetails, orderDetails, order, meals, verifyingPayment, paymentVerified, onRemoveItem, onSendToKitchen, onFinalizePayment, onVerifyPayment, onClose }) => {
  const { items, subtotal, tax, totalAmount, paymentMethod } = orderDetails;

  return (
    <div className={`fixed top-0 right-0 h-screen w-96 bg-gray-50 p-6 flex flex-col justify-between shadow-lg transition-transform duration-300 ease-in-out z-20 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Order Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <OrderHeader tableNumber={tableDetails.tableNumber} orderType={tableDetails.orderType} paymentMethod={paymentMethod} />
        {items.map((item) => (
          <OrderedItem key={item.meal} item={item} meals={meals} onRemove={onRemoveItem} />
        ))}
      </div>

      {/* Footer Section */}
      <div className="flex-shrink-0 mt-4 space-y-4">
        <PriceSummary subTotal={subtotal} tax={tax} totalAmount={totalAmount} />
        <PaymentActions
          order={order}
          verifyingPayment={verifyingPayment}
          paymentVerified={paymentVerified}
          onSendToKitchen={onSendToKitchen}
          onFinalizePayment={onFinalizePayment}
          onVerifyPayment={onVerifyPayment}
          orderIsSent={tableDetails.status === 'sentToKitchen'}
        />
      </div>
    </div>
  );
};

export default OrderDetailsPanel;