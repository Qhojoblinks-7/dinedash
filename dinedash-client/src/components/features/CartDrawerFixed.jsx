// src/components/cart/CartDrawerFixed.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeItem, addItem, decrementItem, clearCart } from "../../store/cartSlice";
import Button from "../ui/Button";

const CartDrawerFixed = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    alert("Order placed successfully!");
    dispatch(clearCart());
    onClose();
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-lg transform transition-transform duration-300 z-50 flex flex-col ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Your Cart</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 border-b pb-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-sm sm:text-base">{item.name}</h3>
                  <span className="font-semibold text-green-600 text-sm sm:text-base">
                    ${(Number(item.price) * item.qty).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatch(decrementItem({ id: item.id }))}
                      className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="font-medium">{item.qty}</span>
                    <button
                      onClick={() =>
                        dispatch(addItem({ ...item, qty: 1 }))
                      }
                      className="w-7 h-7 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeItem({ id: item.id }))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary */}
      {cartItems.length > 0 && (
        <div className="border-t p-4 bg-gray-50 font-mono text-sm">
          <div className="flex justify-between mb-1">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="mt-3">
            <p className="font-semibold text-xs text-gray-600">Payment Method</p>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-2 text-xs bg-yellow-400 rounded hover:bg-yellow-500">
                Flutterwave
              </button>
              <button className="flex-1 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                MOMOpay
              </button>
            </div>
          </div>
          <Button
            onClick={handlePlaceOrder}
            fullWidth
            variant="primary"
            className="mt-4"
          >
            Place Order
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartDrawerFixed;
