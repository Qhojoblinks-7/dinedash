import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMobileAlt, faCashRegister } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', icon: faCreditCard },
  { id: 'mobile', label: 'Mobile Money', icon: faMobileAlt },
  { id: 'cash', label: 'Cash on delivery', icon: faCashRegister },
];

const PaymentForm = ({ selectedMethod, onSelectMethod, onPay, totalAmount, isSubmitting }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment Method</h3>

      <div className="flex flex-col gap-3">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onSelectMethod(method.id)}
              className="hidden"
            />
            <FontAwesomeIcon icon={method.icon} className="text-xl text-gray-700" />
            <span className="text-sm font-medium">{method.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Total:</span>
          <span className="font-semibold">Ghs {totalAmount.toFixed(2)}</span>
        </div>
        <Button
          onClick={onPay}
          fullWidth
          bgClass="bg-[#0015AA]"
          textColor="text-white"
          disabled={isSubmitting || !selectedMethod}
          ariaLabel="Confirm payment"
        >
          {isSubmitting ? 'Processing…' : 'Confirm Payment'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
