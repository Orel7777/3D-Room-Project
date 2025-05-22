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

// Loading Component
function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#1a1611',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 9999
    }}>
      <div>
        <div>טוען מודל 3D...</div>
        <div style={{ marginTop: '20px', fontSize: '16px' }}>אנא המתן</div>
      </div>
    </div>
  );
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
    const maxPolarAngle = Math.PI / 4; // 45 מעלות

    
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

    // אופטימיזציה וזיהוי אובייקטים
    scene.traverse((object) => {
      if (object.isMesh) {
        // אופטימיזציה לביצועים
        object.castShadow = false; // הסרת צללים מיותרים
        object.receiveShadow = false;
        object.frustumCulled = true; // הסרת אובייקטים שמחוץ לטווח הראייה
        
        // שיפור החומרים להיות יותר זוהרים
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => {
              if (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial) {
                mat.roughness = 0.3; // פחות חספוס = יותר זוהר
                mat.metalness = 0.1; // מעט מתכתיות
                mat.envMapIntensity = 1.5; // השתקפות חזקה יותר מהסביבה
              }
            });
          } else {
            if (object.material.isMeshStandardMaterial || object.material.isMeshPhongMaterial) {
              object.material.roughness = 0.3;
              object.material.metalness = 0.1;
              object.material.envMapIntensity = 1.5;
            }
          }
        }

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
        highlightMaterial.emissive = new THREE.Color(0x0066ff);
        highlightMaterial.emissiveIntensity = 0.3;
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
      minPolarAngle={Math.PI / 2.5} // בערך 72 מעלות - מגביל את התנועה כלפי מעלה משמעותית
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
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      zIndex: 1000,
      direction: 'rtl',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      {ELEMENTS_MAP[hovered]}
    </div>
  );
}

const Model3D = () => {
  const [hovered, setHovered] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // הצגת מסך טעינה למשך 2 שניות

    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="model-container" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {isLoading && <LoadingScreen />}
      
      <Canvas
        style={{ background: '#1a1611' }}
        camera={{ position: [cameraX, cameraY, cameraZ], fov: cameraFov }}
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          gl.outputEncoding = THREE.sRGBEncoding;
          gl.shadowMap.enabled = false; // השבתת צללים לביצועים טובים יותר
          gl.toneMapping = THREE.ReinhardToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // הגבלת רזולוציה לביצועים
        }}
        performance={{ min: 0.5 }} // אופטימיזציה לביצועים
      >
        {/* תאורה סביבתית בסיסית */}
        <ambientLight intensity={0.3} color="#8b7a5c" />
        
        {/* תאורה ממנורת השולחן - עיקרית וחזקה */}
        <spotLight
          position={[-1.2, 4.5, 2.2]}
          angle={Math.PI / 3.5}
          penumbra={0.3}
          intensity={6.5}
          color="#f7dc6f"
          target-position={[-0.5, 1.5, 2]}
          distance={8}
          decay={1.0}
        />
        
        {/* תאורה נוספת לכל השולחן - מוגברת */}
        <pointLight 
          position={[0, 3.8, 2.5]} 
          intensity={4.2} 
          color="#f4d03f"
          distance={10}
          decay={1.4}
        />
        
        {/* תאורה ממסך המחשב - מוגברת משמעותית */}
        <pointLight 
          position={[0, 3, 3.2]} 
          intensity={6.8} 
          color="#e74c3c"
          distance={9}
          decay={1.3}
        />
        
        {/* תאורה נוספת למחשב - מהצד */}
        <spotLight
          position={[0.8, 3.5, 3.0]}
          angle={Math.PI / 4}
          penumbra={0.2}
          intensity={5.8}
          color="#ff6b6b"
          target-position={[0, 2.8, 3.2]}
          distance={7}
          decay={1.2}
        />
        
        {/* תאורה חזקה נוספת לאזור השולחן מלמעלה */}
        <spotLight
          position={[0, 5.5, 2.8]}
          angle={Math.PI / 3}
          penumbra={0.2}
          intensity={5.5}
          color="#ffeb3b"
          target-position={[0, 2.5, 2.5]}
          distance={8}
          decay={1.1}
        />
        
        {/* תאורה נוספת לשולחן מהשמאל */}
        <pointLight 
          position={[-1.5, 4, 2.8]} 
          intensity={4.8} 
          color="#fff176"
          distance={8}
          decay={1.3}
        />
        
        {/* תאורה נוספת לשולחן מהימין */}
        <pointLight 
          position={[1.5, 4, 2.8]} 
          intensity={4.5} 
          color="#ffcc02"
          distance={8}
          decay={1.4}
        />
        
        {/* תאורה לאזור המנורה והמקלדת */}
        <spotLight
          position={[-1, 4.2, 3.5]}
          angle={Math.PI / 5}
          penumbra={0.1}
          intensity={5.2}
          color="#fff59d"
          target-position={[-0.8, 2.8, 2.8]}
          distance={6}
          decay={1.2}
        />
        
        {/* תאורה מהטלוויזיה - חזקה */}
        <pointLight 
          position={[-2, 4.8, 0]} 
          intensity={2.8} 
          color="#3498db"
          distance={12}
          decay={2}
        />
        
 {/* תאורה לפוסטר השמאלי - מוגברת מאוד */}
 <spotLight
          position={[-3, 5, 1]}
          angle={Math.PI / 4.5}
          penumbra={0.2}
          intensity={8.5}
          color="#ff9500"
          target-position={[-2.5, 3, 0]}
          distance={12}
          decay={1.2}
        />
        
        {/* תאורה נוספת לפוסטר השמאלי - מנורת השולחן */}
        <spotLight
          position={[-1.2, 4.5, 2.2]}
          angle={Math.PI / 2.8}
          penumbra={0.3}
          intensity={7.5}
          color="#ffa726"
          target-position={[-2.8, 3.5, 0]}
          distance={10}
          decay={1.1}
        />
        
        {/* תאורה נוספת לפוסטר - מהצד השני */}
        <pointLight 
          position={[-3.5, 4, 0.5]} 
          intensity={6.8} 
          color="#ff8c00"
          distance={8}
          decay={1.5}
        />
        
        {/* תאורה נוספת לפוסטר השמאלי מלמטה */}
        <pointLight 
          position={[-2.5, 2, 1.5]} 
          intensity={4.5} 
          color="#ffcc5c"
          distance={8}
          decay={1.3}
        />
        
        {/* תאורה רכה לפוסטר השמאלי מהחלון */}
        <spotLight
          position={[2, 4, 1]}
          angle={Math.PI / 3}
          penumbra={0.5}
          intensity={3.8}
          color="#fff2cc"
          target-position={[-2.5, 3.5, 0]}
          distance={12}
          decay={1.5}
        />
        
        {/* תאורה מרוכזת נוספת על הפוסטר השמאלי */}
        <spotLight
          position={[-2.5, 4.8, 1.5]}
          angle={Math.PI / 6}
          penumbra={0.1}
          intensity={9.2}
          color="#ffb74d"
          target-position={[-2.8, 3.2, 0]}
          distance={8}
          decay={1.0}
        />
        
        {/* תאורה לפוסטר הימני - Ready Player One */}
        <spotLight
          position={[-1.2, 4.5, 2.2]}
          angle={Math.PI / 4}
          penumbra={0.3}
          intensity={4.5}
          color="#42a5f5"
          target-position={[-2, 4.5, 0]}
          distance={9}
          decay={1.6}
        />
        
        {/* תאורה לחטיף - מוגברת */}
        <pointLight 
          position={[1.8, 3, 2.2]} 
          intensity={3.2} 
          color="#f39c12"
          distance={6}
          decay={1.8}
        />
        
        {/* תאורה נוספת למחשב מלמעלה */}
        <pointLight 
          position={[0, 4.5, 3.5]} 
          intensity={4.8} 
          color="#ff4757"
          distance={8}
          decay={1.3}
        />
        
        {/* תאורה למקלדת והמחשב - מוגברת */}
        <spotLight
          position={[-0.5, 3.8, 3.8]}
          angle={Math.PI / 5}
          penumbra={0.15}
          intensity={4.8}
          color="#ffa502"
          target-position={[0, 2.5, 3.2]}
          distance={7}
          decay={1.3}
        />
        
        {/* תאורה נוספת לג'ויסטיק */}
        <pointLight 
          position={[0.5, 3.2, 2.8]} 
          intensity={3.5} 
          color="#ffb347"
          distance={5}
          decay={1.6}
        />
        
        {/* תאורה לכיסא */}
        <pointLight 
          position={[2, 2.5, 3]} 
          intensity={2.0} 
          color="#e6c770"
          distance={6}
          decay={2}
        />
        
        {/* תאורה כללית לחדר */}
        <directionalLight 
          position={[3, 6, 4]} 
          intensity={1.8} 
          color="#d4ac5c"
        />
        
        {/* תאורה לחלון */}
        <pointLight 
          position={[3, 3, 2]} 
          intensity={1.2} 
          color="#95a5a6"
          distance={8}
          decay={2}
        />

        <Suspense fallback={null}>
          <Model setHovered={setHovered} />
          <Environment 
            preset="night" 
            background={false}
            intensity={0.15}
          />
        </Suspense>
        <LimitedControls />
      </Canvas>
      <HoverInfo hovered={hovered} />

      {/* הוספת הודעה קטנה לגבי מקש הרווח */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        zIndex: 1000,
        direction: 'rtl',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        לחץ על מקש רווח (Space) לחזרה למבט המקורי
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
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