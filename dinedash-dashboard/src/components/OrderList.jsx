import React from 'react';
import Card  from './ui/Card';

const OrderList = ({ orders, loading, error }) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="text-lg text-gray-500">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">Error loading orders: {error}</div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-4">
        <div className="text-gray-500">No orders found.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{order.tracking_code}</h3>
                <p className="text-sm text-gray-600">
                  {order.customer_name || 'Guest'} • {order.order_type}
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold">${order.total_amount}</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleString()}
            </div>
            {order.items && order.items.length > 0 && (
              <div className="mt-2 text-sm">
                Items: {order.items.map(item => `${item.quantity}x ${item.item_name}`).join(', ')}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
