import React, { useState } from 'react'
import HomePage from './components/HomePage'
import Model3D from './components/Model3D'
import Loader from './components/Loader'

const App = () => {
  const [show3D, setShow3D] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLookCloser = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShow3D(true)
    }, 1500)
  }

  if (loading) {
    return <Loader />
  }
  if (show3D) {
    return <Model3D />
  }
  return <HomePage onLookCloser={handleLookCloser} />
}

export default App