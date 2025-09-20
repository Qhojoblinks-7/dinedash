import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFire, faClock, faTruck, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const steps = [
  { key: 'received', label: 'Received', icon: faCheckCircle },
  { key: 'cooking', label: 'Cooking', icon: faFire },
  { key: 'ready', label: 'Ready', icon: faClock },
  { key: 'out', label: 'Out for delivery', icon: faTruck },
];

export default function OrderTrackingEnhanced({ initial = 'received', onReset = () => {}, order = null }) {
  const [state, setState] = React.useState(initial);

  const index = steps.findIndex((s) => s.key === state);

  function advance() {
    const next = Math.min(index + 1, steps.length - 1);
    setState(steps[next].key);
  }

  function back() {
    const prev = Math.max(index - 1, 0);
    setState(steps[prev].key);
  }

  // Show order details if order is provided
  const orderDetails = order ? (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-sm mb-2">Order Details</h4>
      <div className="text-xs text-gray-600 space-y-1">
        <div>Order ID: <span className="font-mono">{order.id}</span></div>
        <div>Items: {order.items.length}</div>
        <div>Total: Ghs {order.total.toFixed(2)}</div>
        <div>Payment: {order.paymentMethod}</div>
        {order.notes && <div>Notes: {order.notes}</div>}
      </div>
    </div>
  ) : null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h3 className="text-lg font-semibold">Order progress</h3>
      <p className="text-sm text-gray-600 mt-1">Track your order as it moves from kitchen to delivery.</p>

      {orderDetails}

      <div className="mt-4 space-y-6">
        {steps.map((s, i) => {
          const done = i <= index;
          return (
            <div key={s.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <FontAwesomeIcon icon={s.icon} />
                </div>
                {i < steps.length - 1 && <div className={`w-px h-12 ${done ? 'bg-brand-500' : 'bg-gray-200'} mt-2`} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.label}</div>
                  <div className="text-sm text-gray-500">{done ? 'Done' : i === index ? 'In progress' : 'Pending'}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{done ? `Completed step ${i + 1}` : i === index ? `Estimated: ${10 + i * 5} mins` : '—'}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={back} className="px-3 py-2 rounded-md border text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faChevronRight} className="rotate-180" /> Back
        </button>
        <button onClick={advance} className="px-3 py-2 rounded-md bg-brand-600 text-white text-sm">Advance</button>
        <button
          onClick={() => {
            setState(steps[0].key);
            onReset();
          }}
          className="ml-auto px-3 py-2 rounded-md text-sm border"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
