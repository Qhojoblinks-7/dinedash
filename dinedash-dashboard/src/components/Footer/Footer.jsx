import React from 'react';
import TableStatusPill from './TableStatusPill';

const Footer = ({ activeOrders, onSelectOrder }) => {
  return (
    <div className="fixed bottom-0 left-64 right-0 bg-white p-4 flex justify-between items-center shadow-2xl z-10">
      {/* Order Status Pills */}
      <div className="flex gap-4 overflow-x-auto">
        {activeOrders.map((order) => (
          <TableStatusPill
            key={order.id}
            tableNumber={order.tracking_code}
            status={order.status}
            customerName={order.customer_name}
            onClick={() => onSelectOrder(order)}
          />
        ))}
      </div>

      {/* Removed New Order Button as per request */}
    </div>
  );
};

export default Footer;