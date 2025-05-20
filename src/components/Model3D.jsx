import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
// import { useControls, Leva } from 'leva'

// הקומפוננטה שטוענת את המודל התלת מימדי עם ערכים קבועים מהתמונה
function Model() {
  const { scene } = useGLTF('/glb/dor5.glb')
  
  // ערכים קבועים לפי התמונה
  const fixedScale = 5.4
  const fixedPosition = [-2.5, -0.1, 1.5]
  const fixedRotation = [-0.4, -44.7, -0.1]
  
  return (
    <primitive 
      object={scene} 
      scale={fixedScale}
      position={fixedPosition}
      rotation={[fixedRotation[0] * (Math.PI/180), fixedRotation[1] * (Math.PI/180), fixedRotation[2] * (Math.PI/180)]}
    />
  )
}

// הקומפוננטה שמגבילה את התנועה של הבקרות
function LimitedControls() {
  const controlsRef = useRef()
  
  // הגדרות בסיסיות לבקרות
  const fixedControls = {
    minDistance: 3,
    maxDistance: 30,
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Math.PI / 2,
    maxAzimuthAngle: Math.PI / 2,
    enableZoom: true,
    enablePan: false,
    enableRotate: true,
    autoRotate: false,
    dampingFactor: 0.07
  }

  return (
    <OrbitControls 
      ref={controlsRef}
      {...fixedControls}
      enableDamping
    />
  )
}

const Model3D = () => {
  // הוספת שליטה במצלמה דרך leva
  /* 
  const { cameraX, cameraY, cameraZ, cameraFov } = useControls('מצלמה', {
    cameraX: { value: 0, min: -15, max: 15, step: 0.1 },
    cameraY: { value: 2, min: -10, max: 10, step: 0.1 },
    cameraZ: { value: 15, min: 5, max: 30, step: 0.1, label: 'מרחק (הרחקה)' },
    cameraFov: { value: 45, min: 30, max: 90, step: 1, label: 'שדה ראייה' }
  })
  */
  
  // ערכים קבועים למצלמה במקום השימוש ב-leva
  const cameraX = 0;
  const cameraY = 2;
  const cameraZ = 15;
  const cameraFov = 45;

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Canvas 
        style={{ background: '#f0f0f0' }}
        camera={{ position: [cameraX, cameraY, cameraZ], fov: cameraFov }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
          <Environment preset="apartment" />
        </Suspense>
        <LimitedControls />
      </Canvas>
      {/* 
      <Leva 
        oneLineLabels={true} 
        flat={true} 
        collapsed={false}
        theme={{
          sizes: { rootWidth: '300px' },
          colors: { accent1: '#4263eb' }
        }}
      />
      */}
    </div>
  )
}

export default Model3D
