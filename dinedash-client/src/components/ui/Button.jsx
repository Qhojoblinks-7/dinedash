import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  leftIcon = null,
  icon = null, // A React component like a FontAwesome icon
  className = '',
  onClick = () => {},
  ariaLabel,
  // These let you customize the button's appearance
  textColor = '', // Custom text color like 'text-[#0015AA]'
  bgClass = '', // Override the background style if needed
  style = {}, // Additional inline styles
}) => {
  // Basic button styling with rounded corners
  const base = 'inline-flex items-center justify-center gap-3 px-6 py-3 rounded-[6px] text-lg font-medium transform';

  const variants = {
    primary: 'bg-gradient-to-b from-green-500 to-green-400 shadow-[0_8px_20px_rgba(34,197,94,0.25)]',
    neutral: 'bg-gray-100 shadow-[0_10px_20px_rgba(0,0,0,0.06)]',
  };

  const defaultText = disabled ? 'text-white/70' : 'text-white';
  const colorClass = textColor || defaultText;

  const interactive = disabled ? '' : 'transition duration-300 ease-in-out hover:scale-105';

  const bg = bgClass || (variants[variant] || variants.primary);

  const classes = `${base} ${bg} ${fullWidth ? 'w-full' : ''} ${interactive} ${className}`;

  return (
  <button aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={classes} style={style}>
      {/* Use the main icon if provided, otherwise use the left icon */}
      {icon ? (
        <span className="inline-flex items-center justify-center w-8 h-8 text-xl text-white">{icon}</span>
      ) : (
        leftIcon && <span className="inline-flex items-center justify-center w-8 h-8">{leftIcon}</span>
      )}
      <span className={colorClass}>{children}</span>
    </button>
  );
};

export default Button;
