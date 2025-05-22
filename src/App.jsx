import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import HomePage from './components/HomePage'
import Model3D from './components/Model3D'
import Loader from './components/Loader'
import Poster from './pages/poster/Poster'

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

  return (
    <Router>
      <Routes>
        <Route path="/poster" element={<Poster />} />
        <Route path="/" element={
          show3D ? <Model3D /> : <HomePage onLookCloser={handleLookCloser} />
        } />
      </Routes>
    </Router>
  )
}

export default App