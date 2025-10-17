import React, { useState, useEffect } from 'react';
import '../styles/ScrollToTopButton.css'; // We will create this file next

function ScrollToTopButton() {
  // State to track whether the button should be visible
  const [isVisible, setIsVisible] = useState(false);

  // This function will be called when the user scrolls
  const toggleVisibility = () => {
    // If the user has scrolled more than 300px down, show the button
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // This function will scroll the window smoothly to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // This makes the scrolling animated
    });
  };

  // Set up an event listener when the component mounts
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="scroll-to-top">
      {/* The button is only rendered if isVisible is true */}
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-button">
          &#8593; {/* This is a Unicode arrow-up character */}
        </button>
      )}
    </div>
  );
}

export default ScrollToTopButton;
