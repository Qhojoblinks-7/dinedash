// src/components/meals/MealCardFixed.jsx
import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCircleMinus, faDrumstickBite, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../ui/toastContext';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, decrementItem } from '../../../store/cartSlice';
import AddToCartAnimation from '../AddToCartAnimation';

const MealCard = ({
  id,
  name,
  description,
  price,
  image,
  is_veg: isVeg = false,
  available = true,
  readyInMinutes = null,
}) => {
  console.log(`MealCard for ${name}: isVeg =`, isVeg);
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const [showAnimation, setShowAnimation] = useState(false);

  const mealInCart = useSelector(state =>
    state.cart.items.find(item => item.id === id)
  );
  const quantity = mealInCart ? mealInCart.qty : 0;

  const handleAddToCart = () => {
    dispatch(addItem({ id, name, price }));
    setShowAnimation(true);
    addToast({ type: 'success', title: 'Added', message: `${name} added to your order` });
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleDecrement = () => {
    dispatch(decrementItem({ id }));
  };

  return (
    <>
      <Card className="max-w-sm" data-meal-id={id}>
        <div className="p-5">
        {/* Image */}
        <div className="rounded-lg overflow-hidden bg-gray-100 relative">
          {image ? (
            <img
              src={image}
              alt={name}
              className={`w-full h-56 object-cover block rounded-lg ${!available ? 'grayscale contrast-75' : ''}`}
            />
          ) : (
            <div className="w-full h-56 flex items-center justify-center text-gray-400">Image</div>
          )}
          {!available && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/3 w-[85%] bg-black/75 rounded-md py-3 px-4 flex items-center justify-center">
              <span className="text-white text-2xl md:text-3xl font-extrabold tracking-wide">Not Available Today</span>
            </div>
          )}
        </div>

        {/* Name and Price */}
        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-snug">{name}</h3>
          <div className="text-lg font-semibold text-gray-900">
  ₵{price ? Number(price).toFixed(2) : '0.00'}
</div>

        </div>

        {/* Description */}
        <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>

        {/* Prep Time */}
        {available && readyInMinutes && (
          <div className="mt-2 text-sm text-gray-500">
            Prep time: {readyInMinutes} mins
          </div>
        )}

        {/* Non Veg (just above buttons) */}
        {!isVeg && (
          <div className="mt-3 flex items-center justify-end text-red-500 font-medium text-sm sm:text-base">
            <FontAwesomeIcon icon={faDrumstickBite} />
            <span>Non Veg</span>
          </div>
        )}

        {/* Veg (just above buttons) */}
        {isVeg && (
          <div className="mt-3 flex items-center justify-end text-green-500 font-medium text-sm sm:text-base">
            <FontAwesomeIcon icon={faLeaf} />
            <span>Veg</span>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 relative">
          {available ? (
            quantity > 0 ? (
              // Quantity controls
              <div className="flex items-center justify-between mt-2">
                <Button
                  onClick={handleDecrement}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  ariaLabel={`Decrease quantity of ${name}`}
                >
                  <FontAwesomeIcon icon={faCircleMinus} className="text-white text-2xl" />
                </Button>
                <span className="text-xl font-bold text-gray-900 mx-4">{quantity}</span>
                <Button
                  onClick={(e) => {
                    const imgEl = e.currentTarget.closest('.p-5')?.querySelector('img');
                    handleAddToCart(imgEl);
                  }}
                  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                  ariaLabel={`Increase quantity of ${name}`}
                >
                  <FontAwesomeIcon icon={faCirclePlus} className="text-white text-2xl" />
                </Button>
              </div>
            ) : (
              // Add to Order button
              <Button
                onClick={(e) => {
                  const imgEl = e.currentTarget.closest('.p-5')?.querySelector('img');
                  handleAddToCart(imgEl);
                }}
                fullWidth
                variant="primary"
                ariaLabel={`Add ${name} to order`}
                className="mt-2"
              >
                Add to Order
              </Button>
            )
          ) : (
            <>
              <Button fullWidth variant="neutral" disabled>
                Not Available Today
              </Button>
              <div className="mt-4 text-center text-sm text-gray-500">
                {readyInMinutes ? (
                  <span className="font-medium text-gray-700">Ready in {readyInMinutes} minutes</span>
                ) : (
                  <span className="font-medium text-red-600">Not Available Today</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
    {showAnimation && (
      <AddToCartAnimation
        meal={{ id, name, image }}
        onComplete={handleAnimationComplete}
      />
    )}
    </>
  );
};

export default MealCard;
