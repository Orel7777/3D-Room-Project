import React, { useState } from 'react'

const HomePage = () => {
  const [hover, setHover] = useState(false)

  const buttonStyle = {
    width: '410px',
    height: '128px',
    background: hover ? '#F5E8D4' : '#3B2F2F',
    color: hover ? '#3B2F2F' : '#F5E8D4',
    fontFamily: 'Bebas Neue, Arial, sans-serif',
    fontWeight: 400,
    fontSize: '48px',
    lineHeight: '128px',
    textAlign: 'center',
    textTransform: 'uppercase',
    border: hover ? '8px solid #3B2F2F' : 'none',
    borderRadius: 0,
    cursor: 'pointer',
    letterSpacing: '0',
    boxShadow: 'none',
    marginTop: '10px',
    padding: 0,
    display: 'block',
    transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9d8c3',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingLeft: '233px',
      fontFamily: 'Montserrat, Arial, sans-serif',
    }}>
      <h1 style={{
        color: '#3b2f2f',
        fontFamily: 'Bebas Neue, Arial, sans-serif',
        fontSize: '128px',
        fontWeight: 400,
        lineHeight: '137%',
        letterSpacing: '0',
        marginBottom: '24px',
      }}>
        THE HIDDEN ROOM
      </h1>
      <p style={{
        color: '#3b2f2f',
        fontFamily: 'Work Sans, Arial, sans-serif',
        fontWeight: 400,
        fontSize: '36px',
        lineHeight: '137%',
        letterSpacing: '0',
        maxWidth: '1454px',
        marginBottom: '40px',
      }}>
        Discover the world of hidden messages through the concept of Easter eggs: subtle details, symbols, and surprises intentionally placed by creators.<br/>
        From films and posters to brands logos and video games, each section<br/>
        invites you to look closer and uncover what's been hiding in plain sight.
      </p>
      <button
        style={buttonStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        LOOK CLOSER
      </button>
    </div>
  )
}

export default HomePage 