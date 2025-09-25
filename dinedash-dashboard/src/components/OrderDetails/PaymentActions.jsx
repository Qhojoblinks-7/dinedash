import React, { useState } from 'react';
import { CreditCardIcon, QrCodeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const PaymentActions = ({ onSendToKitchen, onFinalizePayment, orderIsSent }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const paymentButtons = [
    { name: 'Cash', icon: <CurrencyDollarIcon className="w-5 h-5" />, value: 'cash' },
    { name: 'Card', icon: <CreditCardIcon className="w-5 h-5" />, value: 'card' },
    { name: 'QR Code', icon: <QrCodeIcon className="w-5 h-5" />, value: 'qr' },
  ];

  return (
    <div className="p-4 mt-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Payment Method</h3>
      <div className="grid grid-cols-3 gap-2">
        {paymentButtons.map((button) => (
          <button 
            key={button.value}
            onClick={() => setSelectedPayment(button.value)}
            className={`flex flex-col items-center p-3 text-sm rounded-lg border transition-colors duration-200 
              ${selectedPayment === button.value ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}
            `}
            disabled={!orderIsSent}
          >
            {button.icon}
            <span>{button.name}</span>
          </button>
        ))}
      </div>

      {!orderIsSent ? (
        <button onClick={onSendToKitchen} className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors">
          Send to Kitchen
        </button>
      ) : (
        <button onClick={onFinalizePayment} disabled={!selectedPayment} className={`w-full mt-4 py-3 rounded-lg font-bold transition-colors ${!selectedPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
          Finalize Payment
        </button>
      )}
    </div>
  );
};

export default PaymentActions;