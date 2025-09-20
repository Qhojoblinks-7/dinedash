import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../ui/toastContext';

const MealCard = ({
  id,
  name = 'Spicy Garlic Noodles',
  description = 'Wok-tossed egg noodles with fiery chili-garlic sauce, tender shrimp, and fresh vegetables.',
  price = 18.99,
  image,
  available = true,
  readyInMinutes = null,
  onAdd = () => {},
}) => {
  const { addToast } = useToast() || { addToast: () => {} };
  // helper: animate image flying to cart
  const flyToCart = (imgEl) => {
    if (!imgEl) return;
    const cartBtn = document.getElementById('cart-button');
    if (!cartBtn) return;

    const imgRect = imgEl.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    const clone = imgEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.transition = 'transform 650ms cubic-bezier(.2,.8,.2,1), opacity 650ms';
    clone.style.zIndex = 9999;
    clone.style.borderRadius = '8px';
    document.body.appendChild(clone);

    // compute translate
    const destX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
    const destY = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);
    const scale = 0.15;

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${destX}px, ${destY}px) scale(${scale})`;
      clone.style.opacity = '0.9';
    });

    setTimeout(() => {
      clone.remove();
    }, 700);
  };
  return (
    <Card className="max-w-sm">
      <div className="p-5">
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
          {/* Mobile FAB placed inside image wrapper to avoid covering description */}
          <div className="sm:hidden">
            <button
              onClick={(e) => {
                // animate
                const imgEl = e.currentTarget.closest('.p-5')?.querySelector('img');
                flyToCart(imgEl);
                onAdd({ id, name, price });
                // show toast
                addToast({ type: 'success', title: 'Added', message: `${name} added to your order` });
              }}
              disabled={!available}
              aria-label={`Add ${name} to order`}
              className={`absolute bottom-3 right-3 w-14 h-14 rounded-[6px] flex items-center justify-center z-20 ${available ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'} shadow-lg transition-transform duration-300 ease-in-out ${available ? 'hover:scale-105' : ''}`}
            >
              <FontAwesomeIcon icon={faCirclePlus} className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <div className="text-lg font-semibold text-gray-900">${price.toFixed(2)}</div>
          </div>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>

        <div className="mt-6 relative">
          {/* Desktop / larger screens: icon + text */}
          <div className="hidden sm:block">
            <Button
              onClick={(e) => {
                const imgEl = e.currentTarget.closest('.p-5')?.querySelector('img');
                flyToCart(imgEl);
                onAdd({ id, name, price });
                addToast({ type: 'success', title: 'Added', message: `${name} added to your order` });
              }}
              disabled={!available}
              fullWidth
              variant={available ? 'primary' : 'neutral'}
              ariaLabel={`Add ${name} to order`}
              icon={<FontAwesomeIcon icon={faCirclePlus} />}
            >
              {available ? 'Add to Order' : ''}
            </Button>
          </div>

          {/* mobile FAB moved to image wrapper above to avoid duplicates */}

          <div className="mt-4 text-sm text-gray-500">
            {!available && (
              readyInMinutes ? (
                <span className="font-medium text-gray-700">Ready in {readyInMinutes} minutes</span>
              ) : (
                <span className="font-medium text-red-600">Not Available Today</span>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MealCard;
