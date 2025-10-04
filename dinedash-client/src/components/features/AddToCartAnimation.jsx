import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const AddToCartAnimation = ({ meal, onComplete }) => {
  const [stage, setStage] = useState('fold'); 
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cartPosition, setCartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Get meal card position
    const mealCard = document.querySelector(`[data-meal-id="&#8373{meal.id}"]`);
    if (mealCard) {
      const rect = mealCard.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
    }

    // Get cart position
    const cartBtn = document.getElementById('cart-button');
    if (cartBtn) {
      const rect = cartBtn.getBoundingClientRect();
      setCartPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }

    // Start animation sequence
    const timer1 = setTimeout(() => setStage('fly'), 400);
    const timer2 = setTimeout(() => setStage('unfold'), 1000);
    const timer3 = setTimeout(() => onComplete(), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [meal.id, onComplete]);

  const variants = {
    fold: {
      scale: 1,
      rotateX: 0,
      opacity: 1,
      x: 0,
      y: 0,
    },
    fly: {
      scale: 0.8,
      rotateX: -90,
      opacity: 0.8,
      x: cartPosition.x - position.x - 100, // Adjust for card width
      y: cartPosition.y - position.y - 100, // Adjust for card height
    },
    unfold: {
      scale: 0.3,
      rotateX: 0,
      opacity: 0,
      x: cartPosition.x - position.x - 100,
      y: cartPosition.y - position.y - 100,
    },
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed z-50 pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          width: '200px',
          height: '200px',
        }}
        variants={variants}
        animate={stage}
        transition={{
          duration: stage === 'fold' ? 0.4 : stage === 'fly' ? 0.6 : 0.4,
          ease: stage === 'fold' ? 'easeInOut' : stage === 'fly' ? 'easeOut' : 'easeIn',
        }}
      >
        <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default AddToCartAnimation;