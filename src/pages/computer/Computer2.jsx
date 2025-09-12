import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Computer2 = () => {
  const [isHoveringCloseButton, setIsHoveringCloseButton] = useState(false);
  const [isHoveringNotebookButton, setIsHoveringNotebookButton] = useState(false);
  const [isHoveringBackButton, setIsHoveringBackButton] = useState(false);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [disappearingImage, setDisappearingImage] = useState(null);
  
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleNotebookClick = () => {
    setShowNotebookModal(true);
  };

  const handleBackClick = () => {
    navigate('/computer');
  };

  const handleImageClick = (index, route) => {
    setDisappearingImage(index);
    setTimeout(() => {
        navigate(route);
    }, 300);
  };

  const imageConfigs = [
    { path: '/computer/pictures/page2/main/1.jpg', alt: 'Game 5', route: '/game5' },
    { path: '/computer/pictures/page2/main/2.jpg', alt: 'Game 6', route: '/game6' },
    { path: '/computer/pictures/page2/main/3.webp', alt: 'Game 7', route: '/game7' },
    { path: '/computer/pictures/page2/main/4.jpg', alt: 'Game 8', route: '/game8' },
  ];

  const [imagesLoaded, setImagesLoaded] = useState({});

  const handleImageLoad = (path) => {
    setImagesLoaded(prev => ({ ...prev, [path]: true }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#1D1C1A' }}>
      {/* Notebook Modal */}
      {showNotebookModal && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-start"
          style={{ backgroundColor: 'rgba(29, 28, 26, 0.95)' }}
          onClick={() => setShowNotebookModal(false)}
        >
          <div 
            className="w-full h-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="fixed top-6 right-6 transition-all duration-200 ease-in-out z-50 border-0 outline-none focus:outline-none cursor-pointer"
              style={{ 
                width: '34px', 
                height: '34px',
                transform: isHoveringCloseButton ? 'scale(0.90)' : 'scale(1)',
                backgroundColor: 'transparent'
              }}
              aria-label="Close"
              onClick={() => setShowNotebookModal(false)}
              onMouseEnter={() => setIsHoveringCloseButton(true)}
              onMouseLeave={() => setIsHoveringCloseButton(false)}
            >
              <svg 
                width="34" 
                height="34" 
                viewBox="0 0 34 34" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <path 
                  d="M26.7411 1.79167L32.2083 7.28371L22.6641 17.0169L32.2083 26.7151L26.7151 32.2083L17.0169 22.6641L7.28371 32.2083L1.79167 26.7151L11.4199 17.0169L1.79167 7.28371L7.41111 1.79167C7.41111 1.79167 13.9592 8.16621 17.0297 11.2325L26.7411 1.79167Z" 
                  fill={isHoveringCloseButton ? "white" : "none"}
                  stroke="white" 
                  strokeWidth="2" 
                  strokeMiterlimit="10"
                />
              </svg>
            </button>

            {/* Content Container */}
            <div className="absolute text-white font-['Work_Sans']" style={{ left: '122px' }}>
              {/* Title */}
              <h1 
                className="w-[658px] h-[50px]"
                style={{
                  top: '122px',
                  position: 'absolute',
                  opacity: 1,
                  fontFamily: 'Work Sans',
                  fontWeight: 900,
                  fontStyle: 'Black',
                  fontSize: '39px',
                  lineHeight: '128%',
                  letterSpacing: '0%',
                  color: '#FFFFFF',
                }}
              >
                HIDDEN DETAILS IN VIDEO GAMES
              </h1>
              
              {/* Description */}
              <p 
                className="w-[827px] h-[221px]"
                style={{
                  top: '172px',
                  position: 'absolute',
                  fontFamily: 'Work Sans',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '32px',
                  lineHeight: '103%',
                  letterSpacing: '0%',
                  color: '#FFFFFF',
                  whiteSpace: 'pre-line',
                }}
              >
                {`Each game scene contains a hidden detail.\nmove your cursor to uncover it.\ncan you spot them all?`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div 
        className="relative overflow-hidden w-full h-screen" 
        style={{ 
          backgroundColor: '#1D1C1A' 
        }}
      >
        
        {/* כפתור סגירה X */}
        <button
          className="fixed top-6 right-6 transition-all duration-200 ease-in-out z-50 cursor-pointer border-0 outline-none focus:outline-none"
          style={{ 
            width: '34px', 
            height: '34px',
            opacity: showNotebookModal ? '0' : '1',
            pointerEvents: showNotebookModal ? 'none' : 'auto',
            transform: isHoveringCloseButton ? 'scale(0.90)' : 'scale(1)',
            backgroundColor: 'transparent'
          }}
          aria-label="Close"
          onClick={handleClose}
          onMouseEnter={() => setIsHoveringCloseButton(true)}
          onMouseLeave={() => setIsHoveringCloseButton(false)}
        >
          <svg 
            width="34" 
            height="34" 
            viewBox="0 0 34 34" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <path 
              d="M26.7411 1.79167L32.2083 7.28371L22.6641 17.0169L32.2083 26.7151L26.7151 32.2083L17.0169 22.6641L7.28371 32.2083L1.79167 26.7151L11.4199 17.0169L1.79167 7.28371L7.41111 1.79167C7.41111 1.79167 13.9592 8.16621 17.0297 11.2325L26.7411 1.79167Z" 
              fill={isHoveringCloseButton ? "white" : "none"}
              stroke="white" 
              strokeWidth="2" 
              strokeMiterlimit="10"
            />
          </svg>
        </button>

        {/* כפתור היומן */}
        <button
          className="fixed bottom-6 left-6 transition-opacity z-50 cursor-pointer"
          style={{ 
            width: '47px', 
            height: '36px',
            zIndex: showNotebookModal ? 40 : 50,
            pointerEvents: showNotebookModal ? 'none' : 'auto'
          }}
          aria-label="Notebook"
          onClick={handleNotebookClick}
          onMouseEnter={() => setIsHoveringNotebookButton(true)}
          onMouseLeave={() => setIsHoveringNotebookButton(false)}
        >
          {isHoveringNotebookButton ? (
            <svg width="47" height="36" viewBox="0 0 47 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.15 6.6H0.96V35.04H46.08V6.6H39.46" fill="white"/>
              <path d="M7.15 6.6H0.96V35.04H46.08V6.6H39.46" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M7.69 0.95H40.22V28.68H7.69V0.95Z" fill="white" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M23.95 1.12V28.55" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 6.82H20.93" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 12.18H20.93" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 17.55H20.93" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 22.92H20.93" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 6.82H37.18" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 12.18H37.18" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 17.55H37.18" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 22.92H37.18" stroke="#1D1C1A" strokeWidth="2" strokeMiterlimit="10"/>
            </svg>
          ) : (
            <svg width="47" height="36" viewBox="0 0 47 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.95 1.12V28.55" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M7.69 0.95H40.22V28.68H7.69V0.95Z" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 6.82H20.93" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 12.18H20.93" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 17.55H20.93" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M10.73 22.92H20.93" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 6.82H37.18" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 12.18H37.18" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 17.55H37.18" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M26.98 22.92H37.18" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
              <path d="M7.15 6.6H0.96V35.04H46.08V6.6H39.46" stroke="white" strokeWidth="2" strokeMiterlimit="10"/>
            </svg>
          )}
        </button>

        {/* כפתור חזרה בצד שמאל */}
        <button
          className="fixed left-6 top-1/2 transition-all duration-200 ease-in-out z-50 cursor-pointer border-0 outline-none focus:outline-none"
          style={{ 
            width: '29px', 
            height: '45px',
            zIndex: showNotebookModal ? 40 : 50,
            pointerEvents: showNotebookModal ? 'none' : 'auto',
            transform: `translateY(-50%) ${isHoveringBackButton ? 'scale(0.90)' : 'scale(1)'}`,
            backgroundColor: 'transparent'
          }}
          aria-label="Back"
          onClick={handleBackClick}
          onMouseEnter={() => setIsHoveringBackButton(true)}
          onMouseLeave={() => setIsHoveringBackButton(false)}
        >
          <svg 
            width="29" 
            height="45" 
            viewBox="0 0 29 45" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <path 
              d="M21.81 1.5L1.5 22.5L21.81 43.5L27.5 37.94L12.97 22.55L27.5 7.06L21.81 1.5Z" 
              fill={isHoveringBackButton ? "white" : "none"}
              stroke="white" 
              strokeWidth="2" 
              strokeMiterlimit="10"
            />
          </svg>
        </button>

        {/* Game Images Grid */}
        <div 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}
        >
          {/* Container for 2x2 grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            maxWidth: '1612px', // 806px * 2 for two columns
            maxHeight: '906px', // 453px * 2 for two rows
            width: '100%',
            height: 'auto',
            aspectRatio: '2/1'
          }}>
            {/* Row 1 */}
          <div style={{
            display: 'flex',
            gap: '0',
            margin: '0',
            padding: '0',
            lineHeight: '0',
              fontSize: '0',
              width: '100%',
              height: '50%'
          }}>
            {/* Image 1 - Top Left */}
            <div 
              style={{
                  width: '50%',
                  height: '100%',
                cursor: 'pointer',
                margin: '0',
                padding: '0',
                lineHeight: '0',
                fontSize: '0',
                flexShrink: 0,
                position: 'relative',
                zIndex: hoveredImage === imageConfigs[0].path ? 10 : 1,
                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-out',
                transform: hoveredImage === imageConfigs[0].path ? 'scale(1.05)' : 'scale(1)',
                opacity: disappearingImage === 0 ? 0 : 1,
              }}
                onMouseEnter={() => setHoveredImage(imageConfigs[0].path)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => handleImageClick(0, imageConfigs[0].route)}
            >
              <img 
                  src={imageConfigs[0].path}
                  alt={imageConfigs[0].alt}
                  onLoad={() => handleImageLoad(imageConfigs[0].path)}
                style={{
                  width: '100%',
                  height: '100%',
                    objectFit: 'cover',
                    filter: imagesLoaded[imageConfigs[0].path] ? 'none' : 'blur(20px)',
                    transition: 'filter 0.5s ease-out',
                    display: 'block'
                }}
              />
            </div>

            {/* Image 2 - Top Right */}
            <div 
              style={{
                  width: '50%',
                  height: '100%',
                cursor: 'pointer',
                margin: '0',
                padding: '0',
                lineHeight: '0',
                fontSize: '0',
                flexShrink: 0,
                position: 'relative',
                zIndex: hoveredImage === imageConfigs[1].path ? 10 : 1,
                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-out',
                transform: hoveredImage === imageConfigs[1].path ? 'scale(1.05)' : 'scale(1)',
                opacity: disappearingImage === 1 ? 0 : 1,
              }}
              onMouseEnter={() => setHoveredImage(imageConfigs[1].path)}
              onMouseLeave={() => setHoveredImage(null)}
              onClick={() => handleImageClick(1, imageConfigs[1].route)}
            >
              <img 
                  src={imageConfigs[1].path}
                  alt={imageConfigs[1].alt}
                  onLoad={() => handleImageLoad(imageConfigs[1].path)}
                style={{
                  width: '100%',
                  height: '100%',
                    objectFit: 'cover',
                    filter: imagesLoaded[imageConfigs[1].path] ? 'none' : 'blur(20px)',
                    transition: 'filter 0.5s ease-out',
                    display: 'block'
                }}
              />
            </div>
          </div>
          
          {/* Row 2 */}
          <div style={{
            display: 'flex',
            gap: '0',
            margin: '0',
            padding: '0',
            lineHeight: '0',
              fontSize: '0',
              width: '100%',
              height: '50%'
          }}>
            {/* Image 3 - Bottom Left */}
            <div 
              style={{
                  width: '50%',
                  height: '100%',
                cursor: 'pointer',
                margin: '0',
                padding: '0',
                lineHeight: '0',
                fontSize: '0',
                flexShrink: 0,
                position: 'relative',
                zIndex: hoveredImage === imageConfigs[2].path ? 10 : 1,
                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-out',
                transform: hoveredImage === imageConfigs[2].path ? 'scale(1.05)' : 'scale(1)',
                opacity: disappearingImage === 2 ? 0 : 1,
              }}
              onMouseEnter={() => setHoveredImage(imageConfigs[2].path)}
              onMouseLeave={() => setHoveredImage(null)}
              onClick={() => handleImageClick(2, imageConfigs[2].route)}
            >
              <img 
                  src={imageConfigs[2].path}
                  alt={imageConfigs[2].alt}
                  onLoad={() => handleImageLoad(imageConfigs[2].path)}
                style={{
                  width: '100%',
                  height: '100%',
                    objectFit: 'cover',
                    filter: imagesLoaded[imageConfigs[2].path] ? 'none' : 'blur(20px)',
                    transition: 'filter 0.5s ease-out',
                    display: 'block'
                }}
              />
            </div>

            {/* Image 4 - Bottom Right */}
            <div 
              style={{
                  width: '50%',
                  height: '100%',
                cursor: 'pointer',
                margin: '0',
                padding: '0',
                lineHeight: '0',
                fontSize: '0',
                flexShrink: 0,
                position: 'relative',
                zIndex: hoveredImage === imageConfigs[3].path ? 10 : 1,
                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-out',
                transform: hoveredImage === imageConfigs[3].path ? 'scale(1.05)' : 'scale(1)',
                opacity: disappearingImage === 3 ? 0 : 1,
              }}
              onMouseEnter={() => setHoveredImage(imageConfigs[3].path)}
              onMouseLeave={() => setHoveredImage(null)}
              onClick={() => handleImageClick(3, imageConfigs[3].route)}
            >
              <img 
                  src={imageConfigs[3].path}
                  alt={imageConfigs[3].alt}
                  onLoad={() => handleImageLoad(imageConfigs[3].path)}
                style={{
                  width: '100%',
                  height: '100%',
                    objectFit: 'cover',
                    filter: imagesLoaded[imageConfigs[3].path] ? 'none' : 'blur(20px)',
                    transition: 'filter 0.5s ease-out',
                    display: 'block'
                }}
              />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Computer2; 