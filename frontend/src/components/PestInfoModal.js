import React, { useLayoutEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { gsap } from 'gsap'; // <-- We now use GSAP for all animations
import { FaExclamationTriangle, FaShieldAlt, FaTools } from 'react-icons/fa';
import '../styles/PestInfoModal.css';

function PestInfoModal({ show, handleClose, pestName, pestInfo }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // useLayoutEffect is best for animations to prevent flashes
  useLayoutEffect(() => {
    // Animate the modal in when the 'show' prop becomes true
    if (show) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { y: -50, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [show]);

  // A function to animate the modal out before closing
  const closeWithAnimation = () => {
    gsap.to(modalRef.current, { y: 50, opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' });
    gsap.to(backdropRef.current, { 
      opacity: 0, 
      duration: 0.3, 
      delay: 0.1, 
      onComplete: () => {
        document.body.style.overflow = 'auto'; // Restore scrolling
        handleClose(); // Call the parent's close function
      }
    });
  };
  
  // This robust function safely parses the info from your backend
  const parseInfo = (info) => {
    if (!info || typeof info !== 'string') {
      return {
        description: "No detailed information available.",
        organic: "Not specified.",
        chemical: "Not specified.",
      };
    }
    const description = info.match(/^(.*?)\n\n/);
    const organic = info.match(/Organic Remedy: (.*?)\n\n/);
    const chemical = info.match(/Chemical Remedy: (.*)/);
    return {
      description: description ? description[1] : info,
      organic: organic ? organic[1] : 'Not specified.',
      chemical: chemical ? chemical[1] : 'Not specified.',
    };
  };
  const parsedInfo = parseInfo(pestInfo);

  if (!show) return null; // Render nothing if not shown

  return (
    <div className="holographic-backdrop" ref={backdropRef} onClick={closeWithAnimation}>
      <div
        className="holographic-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="holographic-header">
          <h3>{pestName}</h3>
          <button className="close-button" onClick={closeWithAnimation}>&times;</button>
        </div>
        <div className="holographic-body">
            <div className="info-section">
                <h4><FaExclamationTriangle /> Description & Dangers</h4>
                <p>{parsedInfo.description}</p>
            </div>
            <div className="info-section">
                <h4><FaShieldAlt /> Organic Remedy</h4>
                <p>{parsedInfo.organic}</p>
            </div>
            <div className="info-section">
                <h4><FaTools /> Chemical Remedy</h4>
                <p>{parsedInfo.chemical}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default PestInfoModal;

