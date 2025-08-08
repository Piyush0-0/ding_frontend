import React, { useEffect, useState } from 'react';
import './AnimatedLogo.css';

const AnimatedLogo = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Animation will play once when component mounts
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 10000); // Animation duration increased to 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animated-logo-container">
      <img 
        src="/assets/dingwhite.svg" 
        alt="DING!" 
        className={`ding-logo ${isAnimating ? 'bell-tilt' : ''}`}
      />
    </div>
  );
};

export default AnimatedLogo; 