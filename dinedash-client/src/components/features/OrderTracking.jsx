import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFire, faClock, faTruck, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function OrderTracking({ initial = 'received', onReset = () => {}, order = null }) {
  const [state, setState] = React.useState(initial);
  const [showDetails, setShowDetails] = React.useState(!!order);

  // Dynamic steps with optional ETA from backend
  const steps = [
    { key: 'received', label: 'Received', icon: faCheckCircle, eta: order?.eta?.received || 5 },
    { key: 'cooking', label: 'Cooking', icon: faFire, eta: order?.eta?.cooking || 15 },
    { key: 'ready', label: 'Ready', icon: faClock, eta: order?.eta?.ready || 5 },
    { key: 'out', label: 'Out for delivery', icon: faTruck, eta: order?.eta?.out || 20 },
  ];

  const index = steps.findIndex((s) => s.key === state);

  // Auto-update based on backend order status
  React.useEffect(() => {
    if (order?.status) {
      const statusMap = {
        'pending': 'received',
        'in progress': 'cooking',
        'completed': 'ready',
        'cancelled': 'received'
      };
      setState(statusMap[order.status] || 'received');
    }
  }, [order?.status]);

  function advance() {
    const next = Math.min(index + 1, steps.length - 1);
    setState(steps[next].key);
  }

  function back() {
    const prev = Math.max(index - 1, 0);
    setState(steps[prev].key);
  }

  // Order details panel
  const orderDetails = order ? (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg transition-all duration-300">
      <h4 className="font-medium text-sm mb-2">Order Details</h4>
      <div className="text-xs text-gray-600 space-y-1">
        <div>Tracking Code: <span className="font-mono">{order.tracking_code}</span></div>
        <div>Customer: {order.customer_name || 'N/A'}</div>
        <div>Table: {order.table_number || 'N/A'}</div>
        <div>Items: {order.items?.length || 0}</div>
        <div>Total: ${order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}</div>
        {order.payment_method && <div>Payment: {order.payment_method}</div>}
        {order.notes && <div>Notes: {order.notes}</div>}
      </div>
    </div>
  ) : null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h3 className="text-lg font-semibold">Order progress</h3>
      <p className="text-sm text-gray-600 mt-1">Track your order as it moves from kitchen to delivery.</p>

      {order && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 underline mt-2 mb-2"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          {showDetails && orderDetails}
        </>
      )}

      <div className="mt-4 space-y-4 sm:space-y-6">
        {steps.map((s, i) => {
          const done = i < index;
          const active = i === index;

          return (
            <div key={s.key} className="flex items-start gap-4 transition-all duration-500">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500
                    ${done || active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}
                  `}
                >
                  <FontAwesomeIcon
                    icon={s.icon}
                    className={`transition-transform duration-500 ${active ? 'animate-bounce' : ''}`}
                  />
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-px h-12 mt-2 transition-all duration-500 ${done ? 'bg-brand-500' : 'bg-gray-200'}`} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.label}</div>
                  <div className="text-sm text-gray-500">
                    {done ? 'Done' : active ? 'In progress' : 'Pending'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {done ? `Completed step ${i + 1}` : active ? `Estimated: ${s.eta} mins` : '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2 flex-wrap">
        <button
          onClick={back}
          className="px-3 py-2 rounded-md border text-sm flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faChevronRight} className="rotate-180" /> Back
        </button>
        <button
          onClick={advance}
          className="px-3 py-2 rounded-md bg-brand-600 text-white text-sm"
        >
          Advance
        </button>
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
