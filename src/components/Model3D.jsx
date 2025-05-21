import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
  "Mouse": "עכבר",
  "TV": "טלויזיה",
  "Poster_TV": "טלויזיה עם סרט",
  "Screen_TV": "מסך טלויזיה",
  "Television": "טלויזיה",
  "Ready_poster": "פוסטר",
  "Poster": "פוסטר",
  "Frame": "מסגרת תמונה"
};

function logSceneObjects(scene) {
  console.log("========== רשימת כל האובייקטים בסצנה: ==========");
  scene.traverse((object) => {
    if (object.isMesh) {
      console.log(`מש: ${object.name}, סוג: ${object.type}`);
      if (object.parent) {
        console.log(`  אבא: ${object.parent.name}`);
      }
    }
  });
  console.log("================================================");
}

function Model({ setHovered }) {
  const { scene } = useGLTF('/glb/3-test.glb');
  const interactiveObjects = useRef({});
  const modelRef = useRef();
  const rotationState = useRef({ 
    arrowLeft: false,
    arrowRight: false,
    arrowUp: false,
    arrowDown: false 
  });

  // רשימת האובייקטים שיהיו לחיצים בלבד
  const INTERACTIVE_OBJECTS = [
    "Poster", // הפוסטר
    "TV", "TV_2", // הטלוויזיה
    "Plane002_1", // הטלוויזיה השנייה
    "Cube008", // החטיף
    "base" // הג'ויסטיק
  ];

  // ערכי הסיבוב ההתחלתיים - לשימוש באיפוס
  const initialRotation = [
    -0.4 * (Math.PI / 180),
    -44.7 * (Math.PI / 180),
    -0.1 * (Math.PI / 180)
  ];

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch(event.key) {
        case 'ArrowLeft':
          rotationState.current.arrowLeft = true;
          event.preventDefault();
          break;
        case 'ArrowRight':
          rotationState.current.arrowRight = true;
          event.preventDefault();
          break;
        case 'ArrowUp':
          rotationState.current.arrowUp = true;
          event.preventDefault();
          break;
        case 'ArrowDown':
          rotationState.current.arrowDown = true;
          event.preventDefault();
          break;
        // הוספת איפוס עם מקש Space
        case ' ':
          if (modelRef.current) {
            modelRef.current.rotation.set(
              initialRotation[0],
              initialRotation[1],
              initialRotation[2]
            );
          }
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch(event.key) {
        case 'ArrowLeft':
          rotationState.current.arrowLeft = false;
          break;
        case 'ArrowRight':
          rotationState.current.arrowRight = false;
          break;
        case 'ArrowUp':
          rotationState.current.arrowUp = false;
          break;
        case 'ArrowDown':
          rotationState.current.arrowDown = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // כדי לסובב את המודל באופן רציף כאשר המקש לחוץ, עם מגבלות חדשות
  useFrame(() => {
    if (!modelRef.current) return;

    const rotationSpeed = 0.02; // מהירות איטית יותר
    
    // הגדרת מגבלות סיבוב זהות למגבלות של ה-OrbitControls
    const minAzimuthAngle = -Math.PI / 12; // כ-15 מעלות שמאלה
    const maxAzimuthAngle = Math.PI / 12;  // כ-15 מעלות ימינה
    const minPolarAngle = Math.PI / 30; // כ-6 מעלות - מאפשר הסתכלות כמעט עד הרצפה
    const maxPolarAngle = Math.PI / 2.2; // קצת פחות מ-90 מעלות
    
    const fixedYRotationBase = -44.7 * (Math.PI / 180); // הסיבוב הבסיסי שהוגדר ב-fixedRotation
    const fixedXRotationBase = -0.4 * (Math.PI / 180); // הסיבוב הבסיסי שהוגדר ב-fixedRotation

    // בדיקה האם הגענו לגבול הסיבוב שמאלה/ימינה
    const currentYRotationRelative = modelRef.current.rotation.y - fixedYRotationBase;
    
    // חץ שמאלה - מסובב ימינה סביב ציר Y (בכיוון השעון)
    if (rotationState.current.arrowLeft) {
      const nextRotation = modelRef.current.rotation.y + rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedYRotationBase;
      
      if (nextRelativeRotation <= maxAzimuthAngle) {
        modelRef.current.rotation.y += rotationSpeed;
      } else {
        // הגענו לגבול הימני - מקבע את הסיבוב בדיוק בגבול
        modelRef.current.rotation.y = fixedYRotationBase + maxAzimuthAngle;
      }
    }
    
    // חץ ימינה - מסובב שמאלה סביב ציר Y (נגד כיוון השעון)
    if (rotationState.current.arrowRight) {
      const nextRotation = modelRef.current.rotation.y - rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedYRotationBase;
      
      if (nextRelativeRotation >= minAzimuthAngle) {
        modelRef.current.rotation.y -= rotationSpeed;
      } else {
        // הגענו לגבול השמאלי - מקבע את הסיבוב בדיוק בגבול
        modelRef.current.rotation.y = fixedYRotationBase + minAzimuthAngle;
      }
    }
    
    // חץ למעלה - מסובב למעלה סביב ציר X - במגבלות צרות יותר
    if (rotationState.current.arrowUp) {
      const nextRotation = modelRef.current.rotation.x + rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedXRotationBase;
      
      if (nextRelativeRotation <= maxPolarAngle) {
        modelRef.current.rotation.x += rotationSpeed;
      } else {
        // הגענו לגבול העליון - מקבע את הסיבוב בדיוק בגבול
        modelRef.current.rotation.x = fixedXRotationBase + maxPolarAngle;
      }
    }
    
    // חץ למטה - מסובב למטה סביב ציר X
    if (rotationState.current.arrowDown) {
      const nextRotation = modelRef.current.rotation.x - rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedXRotationBase;
      
      if (nextRelativeRotation >= minPolarAngle) {
        modelRef.current.rotation.x -= rotationSpeed;
      } else {
        // הגענו לגבול התחתון - מקבע את הסיבוב בדיוק בגבול
        modelRef.current.rotation.x = fixedXRotationBase + minPolarAngle;
      }
    }
  });

  useEffect(() => {
    logSceneObjects(scene);
    interactiveObjects.current = {};

    scene.traverse((object) => {
      if (object.isMesh) {
        // בדיקה האם האובייקט נמצא ברשימת האובייקטים הלחיצים
        const isInteractive = INTERACTIVE_OBJECTS.some(name => 
          object.name === name || 
          object.name.includes(name) ||
          (object.parent && object.parent.name.includes(name))
        );
        
        if (isInteractive) {
          // מצאנו אובייקט שצריך להיות לחיץ
          let key = "";
          let description = "";

          // קביעת התיאור והמפתח בהתאם לשם האובייקט
          if (object.name === "Poster" || object.name.includes("Poster")) {
            key = "Poster";
            description = "פוסטר";
          } else if (object.name === "TV" || object.name.includes("TV")) {
            key = "TV";
            description = "טלוויזיה";
          } else if (object.name === "Plane002_1" || object.name.includes("Plane002_1")) {
            key = "TV";
            description = "טלוויזיה";
          } else if (object.name === "Cube008" || object.name.includes("Cube008")) {
            key = "Cube008";
            description = "חטיף";
          } else if (object.name === "base" || object.name.includes("base")) {
            key = "Gamepad";
            description = "ג'ויסטיק";
          }

          object.userData.name = key;
          object.userData.description = description;
          object.userData.isInteractive = true;
          interactiveObjects.current[key] = object;
          object.raycast = new THREE.Mesh().raycast;
          console.log(`נמצא אובייקט אינטראקטיבי: ${key} (${object.name})`);
        } else {
          // אובייקט שאינו לחיץ - ניקוי המידע
          object.userData.isInteractive = false;
          
          // שימו לב: איננו משנים את ה-raycast של אובייקטים לא אינטראקטיביים
          // כדי שהם יעבירו את אירועי המצביע לאובייקטים מאחוריהם
        }
      }
    });
  }, [scene]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    const obj = e.object;
    
    // רק אובייקטים אינטראקטיביים יגיבו
    if (obj && obj.userData.isInteractive) {
      const name = obj.userData.name;
      console.log(`עומד מעל: ${name} (${obj.name})`);
      setHovered(name);

      if (!obj.userData.origMaterial) {
        obj.userData.origMaterial = obj.material;
      }

      if (obj.material) {
        const highlightMaterial = obj.material.clone();
        highlightMaterial.emissive = new THREE.Color(0x0000ff);
        highlightMaterial.emissiveIntensity = 1.0;
        obj.material = highlightMaterial;
      }

      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    const obj = e.object;
    
    // רק אובייקטים אינטראקטיביים יגיבו
    if (obj && obj.userData.isInteractive) {
      const name = obj.userData.name;
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
    
    // רק אובייקטים אינטראקטיביים יגיבו
    if (obj && obj.userData.isInteractive) {
      const name = obj.userData.name;
      const description = obj.userData.description || name;
      
      const meshInfo = {
        name: obj.name,
        type: obj.type,
        geometry: obj.geometry ? obj.geometry.type : "אין מידע",
        materialType: obj.material ? obj.material.type : "אין מידע"
      };
      
      alert(`מידע על ${description}:\nשם האובייקט: ${meshInfo.name}\nסוג: ${meshInfo.type}\nגיאומטריה: ${meshInfo.geometry}\nחומר: ${meshInfo.materialType}`);
    }
  };

  const fixedScale = 5.4;
  const fixedPosition = [-1.8, -0.1, 1.3];
  const fixedRotation = [
    -0.4 * (Math.PI / 180),
    -44.7 * (Math.PI / 180),
    -0.1 * (Math.PI / 180)
  ];

  return (
    <primitive
      ref={modelRef}
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
  
  // פונקציה לאיפוס המצלמה למצב ההתחלתי
  useEffect(() => {
    const handleReset = (e) => {
      if (e.key === ' ' && controlsRef.current) {
        controlsRef.current.reset();
      }
    };
    
    window.addEventListener('keydown', handleReset);
    return () => window.removeEventListener('keydown', handleReset);
  }, []);
  
  return (
    <OrbitControls
      ref={controlsRef}
      minDistance={8} // מרחק מינימלי גדול יותר מהמודל
      maxDistance={18} // מרחק מקסימלי מוגבל - הגדלתי כדי לאפשר זום אאוט נוסף
      minPolarAngle={Math.PI / 30} // כ-6 מעלות - מאפשר הסתכלות כמעט עד הרצפה
      maxPolarAngle={Math.PI / 2.2} // קצת פחות מ-90 מעלות - למנוע הסתכלות למטה מדי
      minAzimuthAngle={-Math.PI / 12} // כ-15 מעלות שמאלה
      maxAzimuthAngle={Math.PI / 12} // כ-15 מעלות ימינה
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
  
  const cameraX = 1;  // מיקום מעט מוזז לשמאל
  const cameraY = 2.2; // גובה שמאפשר ראייה טובה של כל החדר
  const cameraZ = 14;  // מרחק שמאפשר לראות את כל החדר
  const cameraFov = 45; // שדה ראייה רחב יותר לתחושה טבעית

  // הוסף פקד מקלדת גלובלי למניעת גלילה בעת לחיצה על חצים
  useEffect(() => {
    const preventDefaultArrows = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', preventDefaultArrows);
    return () => window.removeEventListener('keydown', preventDefaultArrows);
  }, []);

  return (
    <div id="model-container" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
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

      {/* הוספת הודעה קטנה לגבי מקש הרווח */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        zIndex: 1000,
        direction: 'rtl'
      }}>
        לחץ על מקש רווח (Space) לחזרה למבט המקורי
      </div>

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
