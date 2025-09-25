const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;