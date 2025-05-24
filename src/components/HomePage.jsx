import React, { useState } from 'react'

const HomePage = ({ onLookCloser }) => {
  const [hover, setHover] = useState(false)

  const buttonStyle = {
    width: '410px',
    height: '128px',
    background: hover ? '#FFFFFF' : '#3B2F2F',
    color: hover ? '#3B2F2F' : '#FFFFFF',
    fontFamily: 'Bebas Neue, Arial, sans-serif',
    fontWeight: 400,
    fontSize: '70px',
    lineHeight: '128px',
    textAlign: 'center',
    textTransform: 'uppercase',
    border: hover ? '5px solid #3B2F2F' : 'none',
    borderRadius: 0,
    cursor: 'pointer',
    letterSpacing: '0',
    boxShadow: 'none',
    marginTop: '7px',
    padding: 0,
    display: 'block',
    transition: 'all 0.3s ease-out',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9d8c3',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingLeft: '156px',
      fontFamily: 'Montserrat, Arial, sans-serif',
    }}>
      <h1 style={{
        color: '#3b2f2f',
        fontFamily: 'Bebas Neue, Arial, sans-serif',
        fontSize: '86px',
        fontWeight: 400,
        lineHeight: '137%',
        letterSpacing: '0',
        marginBottom: '16px',
      }}>
        THE HIDDEN ROOM
      </h1>
      <p style={{
        color: '#3b2f2f',
        fontFamily: 'Work Sans, Arial, sans-serif',
        fontWeight: 400,
        fontSize: '24px',
        lineHeight: '137%',
        letterSpacing: '0',
        maxWidth: '974px',
        marginBottom: '27px',
      }}>
        Discover the world of hidden messages through the concept of Easter eggs: subtle details, symbols, and surprises intentionally placed by creators.<br/>
        From films and posters to brands logos and video games, each section<br/>
        invites you to look closer and uncover what's been hiding in plain sight.
      </p>
      <button
        style={buttonStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onLookCloser}
      >
        LOOK CLOSER
      </button>
      <div style={{
        position: 'absolute',
        right: 50,
        top: 0,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}>
        <img 
          src="./glb/Group 97 (1).png" 
          alt="Design element" 
          style={{
            height: '100vh',
            width: 'auto',
            maxHeight: '100%',
          }} 
        />
      </div>
    </div>
  )
}

export default HomePage 