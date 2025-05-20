import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// מפת שמות בעברית לאובייקטים בסצנה
const ELEMENTS_MAP = {
  "ComputerScreen": "מסך מחשב עם שורות קוד",
  "DeskLamp": "מנורת שולחן",
  "Gamepad": "שלט / ג'ויסטיק על השולחן",
  "Keyboard": "מקלדת",
  "TostitosBag": "שקית חטיף טוסטיטוס",
  "Desk": "שולחן",
  "Chair": "כיסא",
  "Poster_OnceUponATime": "פוסטר שמאלי - סרט הוליוודי",
  "Poster_ReadyPlayerOne": "פוסטר ימין - Ready Player One",
  "Window": "חלון",
  "Monitor": "מסך מחשב",
  "Computer": "מחשב",
  "Mouse": "עכבר"
};

function logSceneObjects(scene) {
  console.log("Objects in the scene:");
  scene.traverse((object) => {
    if (object.isMesh) {
      console.log(`Found mesh: ${object.name}`);
    }
  });
}

function Model({ setHovered }) {
  const { scene } = useGLTF('/glb/dor5.glb');
  const interactiveObjects = useRef({});

  useEffect(() => {
    logSceneObjects(scene);
    interactiveObjects.current = {};

    scene.traverse((object) => {
      if (object.isMesh) {
        for (const [key, description] of Object.entries(ELEMENTS_MAP)) {
          if (
            object.name.toLowerCase().includes(key.toLowerCase()) ||
            object.name === key ||
            (object.parent && object.parent.name.toLowerCase().includes(key.toLowerCase()))
          ) {
            object.userData.name = key;
            object.userData.description = description;
            interactiveObjects.current[key] = object;
            object.raycast = new THREE.Mesh().raycast;
            break;
          }
        }
      }
    });
  }, [scene]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    const obj = e.object;
    const name = obj.userData.name;

    if (name) {
      setHovered(name);

      if (!obj.userData.origMaterial) {
        obj.userData.origMaterial = obj.material;
      }

      if (obj.material) {
        const highlightMaterial = obj.material.clone();
        highlightMaterial.emissive = new THREE.Color(0x0000ff);
        highlightMaterial.emissiveIntensity = 0.6;
        obj.material = highlightMaterial;
      }

      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    const obj = e.object;
    const name = obj.userData.name;

    if (name) {
      setHovered(null);
      if (obj.userData.origMaterial) {
        obj.material = obj.userData.origMaterial;
      }
      document.body.style.cursor = 'auto';
    }
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    const obj = e.object;
    const name = obj.userData.name;
    
    if (name) {
      const meshInfo = {
        name: obj.name,
        type: obj.type,
        geometry: obj.geometry ? obj.geometry.type : "אין מידע",
        materialType: obj.material ? obj.material.type : "אין מידע"
      };
      
      alert(`מידע על ${ELEMENTS_MAP[name]}:\nשם האובייקט: ${meshInfo.name}\nסוג: ${meshInfo.type}\nגיאומטריה: ${meshInfo.geometry}\nחומר: ${meshInfo.materialType}`);
    }
  };

  const fixedScale = 5.4;
  const fixedPosition = [-2.5, -0.1, 1.5];
  const fixedRotation = [
    -0.4 * (Math.PI / 180),
    -44.7 * (Math.PI / 180),
    -0.1 * (Math.PI / 180)
  ];

  return (
    <primitive
      object={scene}
      scale={fixedScale}
      position={fixedPosition}
      rotation={fixedRotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}

function LimitedControls() {
  const controlsRef = useRef();
  return (
    <OrbitControls
      ref={controlsRef}
      minDistance={3}
      maxDistance={30}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}
      enableZoom={true}
      enablePan={false}
      enableRotate={true}
      autoRotate={false}
      enableDamping
      dampingFactor={0.07}
    />
  );
}

function HoverInfo({ hovered }) {
  if (!hovered) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      direction: 'rtl'
    }}>
      {ELEMENTS_MAP[hovered]}
    </div>
  );
}

const Model3D = () => {
  const [hovered, setHovered] = useState(null);
  const cameraX = 0;
  const cameraY = 2;
  const cameraZ = 15;
  const cameraFov = 45;

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Canvas
        style={{ background: '#f0f0f0' }}
        camera={{ position: [cameraX, cameraY, cameraZ], fov: cameraFov }}
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          gl.outputEncoding = THREE.sRGBEncoding;
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model setHovered={setHovered} />
          <Environment preset="apartment" />
        </Suspense>
        <LimitedControls />
      </Canvas>
      <HoverInfo hovered={hovered} />

      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          Hovered: {hovered || 'none'}
        </div>
      )}
    </div>
  );
};

export default Model3D;
