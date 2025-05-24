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

/**
 * Logs all mesh objects in the scene to the console for debugging.
 * @param {THREE.Scene} scene - The Three.js scene object.
 */
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

/**
 * Loading Screen Component displayed while the model is loading.
 */
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
        <div>Loading...</div>
      </div>
    </div>
  );
}



/**
 * Enhances the interaction area of an object by adding an invisible bounding box helper.
 * This makes it easier to hover over thin or small objects.
 * @param {THREE.Mesh} object - The Three.js mesh object to enhance.
 */
function enhanceInteractionArea(object) {
  if (!object.geometry) return;

  // Calculate the bounding box of the object
  const boundingBox = new THREE.Box3().setFromObject(object);

  // Expand the bounding box by a percentage in all directions
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  // Create an enlarged box geometry to serve as the detection wrapper
  const boxGeometry = new THREE.BoxGeometry(
    size.x * 1.1,  // Width enlarged by 10%
    size.y * 1.1,  // Height enlarged by 10%
    size.z * 1.1   // Depth enlarged by 10%
  );

  // Create a transparent material for the helper (invisible but detectable)
  const helperMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.0,
    depthWrite: false,  // Do not write to depth buffer
    depthTest: false,   // Do not test against other objects' depth
    visible: false      // Not visually rendered
  });

  // Create the helper mesh
  const interactionHelper = new THREE.Mesh(boxGeometry, helperMaterial);

  // Position the helper at the center of the original object
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  interactionHelper.position.copy(center.sub(object.position)); // Relative to the object

  // Copy the rotation of the original object
  interactionHelper.rotation.copy(object.rotation);

  // Store a reference to the enlarged helper in the original object's userData
  object.userData.interactionHelper = interactionHelper;
  object.userData.isInteractionHelper = true; // Mark this object as an interaction helper

  // Add the helper as a child of the object itself
  object.add(interactionHelper);

  // Special handling for posters and TV - more significant enlargement
  if (object.name === "Plane012" || object.name.includes("Poster") ||
      object.name === "TV" || object.name.includes("TV") ||
      object.name === "Plane002_1") {
    // Enlarge the helper by an additional 15% for posters and TV
    interactionHelper.scale.multiplyScalar(1.15);

    // Additional specific enlargement for the left poster (Plane012)
    if (object.name === "Plane012") {
      // Significantly increase the interaction area for Plane012 (the poster)
      interactionHelper.scale.multiplyScalar(1.5); // Increased from 1.2 to 1.5
    }
  }
}

/**
 * Creates an improved raycast function for an object to utilize the interaction helper.
 * @param {THREE.Mesh} object - The Three.js mesh object.
 * @returns {Function} The improved raycast function.
 */
function createImprovedRaycast(object) {
  // Store the original raycast function
  const originalRaycast = object.raycast || new THREE.Mesh().raycast;

  // Define an improved raycast function with expanded detection area
  return function(raycaster, intersects) {
    // Call the original raycast function first
    originalRaycast.call(this, raycaster, intersects);

    // If no intersections found with the original object, and it's interactive,
    // check the expanded interaction helper.
    if (this.userData.isInteractive && this.userData.interactionHelper) {
      // Perform raycast on the expanded helper
      const helperIntersects = [];
      this.userData.interactionHelper.raycast(raycaster, helperIntersects);

      // If an intersection is found with the helper, add the original object to intersects
      if (helperIntersects.length > 0) {
        // Find the closest intersection with the helper
        const closestHelperIntersection = helperIntersects[0];
        // Create an intersection object for the original object
        const originalIntersection = {
          distance: closestHelperIntersection.distance,
          point: closestHelperIntersection.point,
          object: this, // The original object
        };
        // Add it to the main intersects array
        intersects.push(originalIntersection);
      }
    }
  };
}

/**
 * Helper function to find the actual interactive object by traversing up the parent chain.
 * @param {THREE.Object3D} object - The object hit by the raycaster.
 * @returns {THREE.Object3D|null} The interactive object or null if not found.
 */
function findInteractiveObject(object) {
  let currentObj = object;
  while (currentObj) {
    if (currentObj.userData && currentObj.userData.isInteractive) {
      return currentObj;
    }
    currentObj = currentObj.parent;
  }
  return null;
}

// רשימת האובייקטים שיהיו לחיצים בלבד
const INTERACTIVE_OBJECTS = [
  "Poster", // הפוסטר
  "TV", "TV_1", "TV_2", // הטלוויזיה
  "Plane002_1", // הטלוויזיה השנייה
  "Plane012", // הפוסטר השמאלי
  "Cube008", // החטיף
  "base" // הג'ויסטיק
];

/**
 * Main 3D Model component that loads the GLTF model and handles interactions.
 * @param {Function} setHovered - Callback to set the currently hovered object.
 */
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

  // Initial rotation values for resetting the model
  const initialRotation = [
    -0.4 * (Math.PI / 180),
    -44.7 * (Math.PI / 180),
    -0.1 * (Math.PI / 180)
  ];

  // Effect for handling keyboard input for model rotation and reset
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
        case ' ': // Spacebar to reset rotation
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

  // useFrame hook for continuous model rotation based on arrow key state
  useFrame(() => {
    if (!modelRef.current) return;

    const rotationSpeed = 0.02; // Slower rotation speed

    // Define rotation limits similar to OrbitControls
    const minAzimuthAngle = -Math.PI / 12; // ~15 degrees left
    const maxAzimuthAngle = Math.PI / 12;  // ~15 degrees right
    const minPolarAngle = Math.PI / 30; // ~6 degrees - allows looking almost at the floor
    const maxPolarAngle = Math.PI / 4; // 45 degrees

    const fixedYRotationBase = -44.7 * (Math.PI / 180); // Base Y rotation from fixedRotation
    const fixedXRotationBase = -0.4 * (Math.PI / 180); // Base X rotation from fixedRotation

    // Left arrow - rotates right around Y-axis (clockwise)
    if (rotationState.current.arrowLeft) {
      const nextRotation = modelRef.current.rotation.y + rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedYRotationBase;

      if (nextRelativeRotation <= maxAzimuthAngle) {
        modelRef.current.rotation.y += rotationSpeed;
      } else {
        modelRef.current.rotation.y = fixedYRotationBase + maxAzimuthAngle;
      }
    }

    // Right arrow - rotates left around Y-axis (counter-clockwise)
    if (rotationState.current.arrowRight) {
      const nextRotation = modelRef.current.rotation.y - rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedYRotationBase;

      if (nextRelativeRotation >= minAzimuthAngle) {
        modelRef.current.rotation.y -= rotationSpeed;
      } else {
        modelRef.current.rotation.y = fixedYRotationBase + minAzimuthAngle;
      }
    }

    // Up arrow - rotates up around X-axis
    if (rotationState.current.arrowUp) {
      const nextRotation = modelRef.current.rotation.x + rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedXRotationBase;

      if (nextRelativeRotation <= maxPolarAngle) {
        modelRef.current.rotation.x += rotationSpeed;
      } else {
        modelRef.current.rotation.x = fixedXRotationBase + maxPolarAngle;
      }
    }

    // Down arrow - rotates down around X-axis
    if (rotationState.current.arrowDown) {
      const nextRotation = modelRef.current.rotation.x - rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedXRotationBase;

      if (nextRelativeRotation >= minPolarAngle) {
        modelRef.current.rotation.x -= rotationSpeed;
      } else {
        modelRef.current.rotation.x = fixedXRotationBase + minPolarAngle;
      }
    }
  });

  // Effect to process the loaded scene, identify interactive objects, and apply enhancements
  useEffect(() => {
    logSceneObjects(scene); // Log all objects in the scene
    interactiveObjects.current = {};

    // Optimize and identify objects
    scene.traverse((object) => {
      if (object.isMesh) {
        // Performance optimizations
        object.castShadow = false; // Disable unnecessary shadows
        object.receiveShadow = false;
        object.frustumCulled = true; // Cull objects outside view frustum

        // Improve material appearance to be more luminous
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(mat => {
          if (mat && (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial)) {
            mat.roughness = 0.3; // Less roughness = more shine
            mat.metalness = 0.1; // Slight metallic feel
            mat.envMapIntensity = 1.5; // Stronger environmental reflection

            // Enhance specific poster materials to be brighter and emissive
            if (object.name.includes("Poster") || object.name.includes("poster") || object.name.includes("Frame")) {
              mat.roughness = 0.08; // Further reduce roughness for more sheen
              mat.metalness = 0.02; // Reduce metalness for a more natural glow
              mat.envMapIntensity = 3.5; // Increase reflection

              if (mat.color) {
                mat.color.multiplyScalar(3.2); // Significantly increase brightness
              }

              // Add emission for the left poster
              if (object.name.includes("Once") || object.name.includes("Hollywood")) {
                mat.emissive = new THREE.Color("#ff5500"); // Brighter orange-red emission
                mat.emissiveIntensity = 1.2; // Increase emission intensity
              }
            }
          }
        });

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
          if (object.name === "Poster" || object.name.includes("Poster") || object.name === "Plane012") {
            key = "Poster";
            description = "פוסטר";
          } else if (object.name === "TV" || object.name === "TV_1" || object.name === "TV_2" || 
                     object.name.includes("TV") || object.name === "Plane002_1") {
            key = "TV";
            description = "טלויזיה";
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

          // Apply improved raycasting for better interaction detection
          object.raycast = createImprovedRaycast(object);

          // Enhance the interaction area with an invisible helper bounding box
          enhanceInteractionArea(object);

          console.log(`נמצא אובייקט אינטראקטיבי: ${key} (${object.name})`);
        } else {
          // Non-interactive object - clear user data
          object.userData.isInteractive = false;
        }
      }
    });
  }, [scene]); // Re-run effect if the scene object changes

  /**
   * Handles pointer over (hover) event on interactive objects.
   * Creates a yellow outline effect and updates the hovered state.
   * @param {Object} e - The event object from react-three-fiber.
   */
  const handlePointerOver = (e) => {
    e.stopPropagation();
    const obj = e.object;
    
    if (obj && (obj.userData.isInteractive || (obj.parent && obj.parent.userData && obj.parent.userData.isInteractive))) {
      // זיהוי האובייקט האינטראקטיבי (האובייקט עצמו או האבא שלו)
      const interactiveObj = obj.userData.isInteractive ? obj : obj.parent;
      console.log(`עומד מעל: ${interactiveObj.name}, userData.name: ${interactiveObj.userData.name}`);
      
      // עדכון המצב ל-hovered
      setHovered(interactiveObj.userData.name);
      
      // בדיקה אם זה אובייקט של הטלוויזיה
      const isTVObject = interactiveObj.userData.name === "TV" || 
                        interactiveObj.name.includes("TV") || 
                        interactiveObj.name === "TV_2" || 
                        interactiveObj.name === "TV_1" ||
                        interactiveObj.name === "Plane002_1";
      
      // אם זה טלוויזיה, מפעיל אפקט על כל אובייקטי הטלוויזיה
      if (isTVObject) {
        // עובר על כל האובייקטים האינטראקטיביים ומפעיל אפקט על כל הטלוויזיות
        Object.keys(interactiveObjects.current).forEach(key => {
          const tvObj = interactiveObjects.current[key];
          if (tvObj.userData.name === "TV") {
            applyHighlightEffect(tvObj);
          }
        });
      } else {
        // אפקט רגיל לאובייקטים שאינם טלוויזיה
        applyHighlightEffect(interactiveObj);
      }
      
      document.body.style.cursor = 'pointer';
    }
  };

  /**
   * Handles pointer out (unhover) event on interactive objects.
   * Hides the yellow outline and resets the hovered state.
   * @param {Object} e - The event object from react-three-fiber.
   */
  const handlePointerOut = (e) => {
    e.stopPropagation();
    const obj = e.object;
    
    if (obj && (obj.userData.isInteractive || (obj.parent && obj.parent.userData && obj.parent.userData.isInteractive))) {
      // זיהוי האובייקט האינטראקטיבי (האובייקט עצמו או האבא שלו)
      const interactiveObj = obj.userData.isInteractive ? obj : obj.parent;
      
      setHovered(null);
      
      // בדיקה אם זה אובייקט של הטלוויזיה
      const isTVObject = interactiveObj.userData.name === "TV" || 
                        interactiveObj.name.includes("TV") || 
                        interactiveObj.name === "TV_2" || 
                        interactiveObj.name === "TV_1" ||
                        interactiveObj.name === "Plane002_1";
      
      // אם זה טלוויזיה, מסיר אפקט מכל אובייקטי הטלוויזיה
      if (isTVObject) {
        // עובר על כל האובייקטים האינטראקטיביים ומסיר אפקט מכל הטלוויזיות
        Object.keys(interactiveObjects.current).forEach(key => {
          const tvObj = interactiveObjects.current[key];
          if (tvObj.userData.name === "TV") {
            removeHighlightEffect(tvObj);
          }
        });
      } else {
        // הסרת אפקט רגילה לאובייקטים שאינם טלוויזיה
        removeHighlightEffect(interactiveObj);
      }
      
      document.body.style.cursor = 'auto';
    }
  };

  /**
   * Handles click event on interactive objects.
   * Displays an alert with information about the clicked object.
   * @param {Object} e - The event object from react-three-fiber.
   */
  const handleClick = (e) => {
    e.stopPropagation();
    const targetObj = findInteractiveObject(e.object); // Find the actual interactive object
    
    if (targetObj) { // Only proceed if an interactive object was found
      const name = targetObj.userData.name;
      const description = targetObj.userData.description || name;

      // מעבר לעמוד הפוסטרים כשלוחצים על פוסטר
      if (name === "Poster" || targetObj.name === "Plane012") {
        // משתמשים ב-window.location כי אנחנו מחוץ למרחב של React Router
        window.location.href = '/poster';
        return;
      }

      const meshInfo = {
        name: targetObj.name,
        type: targetObj.type,
        geometry: targetObj.geometry ? targetObj.geometry.type : "אין מידע",
        materialType: targetObj.material ? (Array.isArray(targetObj.material) ? targetObj.material.map(m => m.type).join(', ') : targetObj.material.type) : "אין מידע"
      };

      // Use a custom modal or console.log instead of alert() for better UX
      // For demonstration, we'll use alert() as requested by the user.
      alert(`מידע על ${description}:\nשם האובייקט: ${meshInfo.name}\nסוג: ${meshInfo.type}\nגיאומטריה: ${meshInfo.geometry}\nחומר: ${meshInfo.materialType}`);
    }
  };

  // Fixed scale, position, and rotation for the GLTF model
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

/**
 * Component for limited OrbitControls to restrict camera movement.
 */
function LimitedControls() {
  const controlsRef = useRef();

  // Function to reset the camera to its initial state
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
      minDistance={8} // Minimum zoom distance from the model
      maxDistance={18} // Maximum zoom distance
      minPolarAngle={Math.PI / 2.5} // Limit upward camera rotation
      maxPolarAngle={Math.PI / 2.2} // Limit downward camera rotation
      minAzimuthAngle={-Math.PI / 12} // Limit left horizontal rotation
      maxAzimuthAngle={Math.PI / 12} // Limit right horizontal rotation
      enableZoom={true}
      enablePan={false} // Disable panning
      enableRotate={true}
      autoRotate={false}
      enableDamping // Enable smooth camera movement
      dampingFactor={0.07}
    />
  );
}

/**
 * Component to display information about the currently hovered object.
 * @param {Object} props - Component properties.
 * @param {string|null} props.hovered - The name of the currently hovered object.
 */
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
      direction: 'rtl', // Right-to-left for Hebrew text
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      {ELEMENTS_MAP[hovered]}
    </div>
  );
}

/**
 * פונקציה פשוטה להוספת אפקט הדגשה (emissive)
 * @param {THREE.Mesh} obj - The Three.js mesh object to apply the highlight effect to.
 */
const applyHighlightEffect = (obj) => {
  try {
    // מדפיס את שם האובייקט לבדיקה
    console.log(`מפעיל אפקט על אובייקט: ${obj.name}, סוג: ${obj.type}`);
    
    // שמירת החומר המקורי אם עוד לא נשמר
    if (!obj.userData.origMaterial) {
      // שמירת העתק עמוק של החומר המקורי
      if (Array.isArray(obj.material)) {
        obj.userData.origMaterial = obj.material.map(mat => mat.clone());
      } else if (obj.material) {
        obj.userData.origMaterial = obj.material.clone();
      } else {
        console.warn(`אין חומר לאובייקט ${obj.name}`);
        return;
      }
    }
    
    // הפונקציה הפנימית שמוסיפה אפקט למקרה של חומר בודד
    const addGlowToMaterial = (material) => {
      if (!material) return;
      
      // מגדיר את צבע ה-emissive לאפור בהיר (#f1eded)
      material.emissive = new THREE.Color(0xf1eded);
      material.emissiveIntensity = 1.0;
      
      // טיפול מיוחד בפוסטר שמאלי (Plane012)
      if (obj.name === "Plane012") {
        material.emissiveIntensity = 1.5;
        material.emissive = new THREE.Color(0xf1eded);
      }
      
      // טיפול מיוחד באובייקטי טלוויזיה
      if (obj.userData.name === "TV" || obj.name.includes("TV")) {
        material.emissive = new THREE.Color(0xf1eded);
        material.emissiveIntensity = 1.5;
      }
      
      // טיפול מיוחד לחטיף Cube008
      if (obj.name === "Cube008" || obj.name.includes("Cube008")) {
        material.emissive = new THREE.Color(0xf1eded);
        material.emissiveIntensity = 1.8;
      }
      
      // טיפול מיוחד לבסיס (ג'ויסטיק)
      if (obj.name === "base" || obj.name.includes("base")) {
        material.emissive = new THREE.Color(0xf1eded);
        material.emissiveIntensity = 2.0;
      }
    };
    
    // טיפול במקרה של מערך חומרים או חומר בודד
    if (Array.isArray(obj.material)) {
      obj.material.forEach(addGlowToMaterial);
    } else if (obj.material) {
      addGlowToMaterial(obj.material);
    }
    
    // הוספת אנימציית פעימה לאפקט
    if (!obj.userData.pulseAnimation) {
      let pulseUp = true;
      const minIntensity = 0.6;
      const maxIntensity = 1.5;
      const pulseStep = 0.05;
      
      obj.userData.pulseAnimation = setInterval(() => {
        if (!obj.material) {
          clearInterval(obj.userData.pulseAnimation);
          obj.userData.pulseAnimation = null;
          return;
        }
        
        const updateMaterialIntensity = (mat) => {
          if (!mat || !mat.emissive) return;
          
          // עדכון עוצמת ה-emissive לפי כיוון הפעימה
          if (pulseUp) {
            mat.emissiveIntensity += pulseStep;
            if (mat.emissiveIntensity >= maxIntensity) {
              pulseUp = false;
            }
          } else {
            mat.emissiveIntensity -= pulseStep;
            if (mat.emissiveIntensity <= minIntensity) {
              pulseUp = true;
            }
          }
        };
        
        // עדכון החומר/ים
        if (Array.isArray(obj.material)) {
          obj.material.forEach(updateMaterialIntensity);
        } else if (obj.material) {
          updateMaterialIntensity(obj.material);
        }
      }, 50); // קצב עדכון מהיר יותר - 50ms
    }
  } catch (error) {
    console.error(`שגיאה בהפעלת אפקט על אובייקט ${obj.name}:`, error);
  }
};

// פונקציה פשוטה להסרת אפקט הדגשה
const removeHighlightEffect = (obj) => {
  try {
    // החזרת החומר המקורי
    if (obj.userData.origMaterial) {
      if (Array.isArray(obj.material) && Array.isArray(obj.userData.origMaterial)) {
        // החזרת מערך חומרים
        obj.material.forEach((mat, index) => {
          if (obj.userData.origMaterial[index]) {
            mat.copy(obj.userData.origMaterial[index]);
          }
        });
      } else if (!Array.isArray(obj.material) && !Array.isArray(obj.userData.origMaterial)) {
        // החזרת חומר בודד
        obj.material.copy(obj.userData.origMaterial);
      }
      
      // ניקוי
      obj.userData.origMaterial = null;
    }
    
    // עצירת אנימציית הפעימה
    if (obj.userData.pulseAnimation) {
      clearInterval(obj.userData.pulseAnimation);
      obj.userData.pulseAnimation = null;
    }
  } catch (error) {
    console.error(`שגיאה בהסרת אפקט מאובייקט ${obj.name}:`, error);
  }
};

/**
 * Main application component for the 3D room model.
 */
const Model3D = () => { // Renamed from App to Model3D as requested
  const [hovered, setHovered] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Camera initial settings
  const cameraX = 1;
  const cameraY = 2.2;
  const cameraZ = 14;
  const cameraFov = 45;

  // Global keyboard listener to prevent page scrolling when arrow keys are pressed
  useEffect(() => {
    const preventDefaultArrows = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefaultArrows);
    return () => window.removeEventListener('keydown', preventDefaultArrows);
  }, []);

  // Handle loading state with a minimum display time for the loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loading screen for at least 2 seconds

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
          // Updated outputEncoding to outputColorSpace as outputEncoding is deprecated
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = false; // Disable shadows for better performance
          gl.toneMapping = THREE.ReinhardToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        }}
        performance={{ min: 0.5 }} // Performance optimization
      >
        {/* Basic ambient light */}
        <ambientLight intensity={0.3} color="#8b7a5c" />

        {/* Spot light from desk lamp - primary and strong */}
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

        {/* Additional point light for the entire desk - increased */}
        <pointLight
          position={[0, 3.8, 2.5]}
          intensity={4.2}
          color="#f4d03f"
          distance={10}
          decay={1.4}
        />

        {/* Point light from computer screen - significantly increased */}
        <pointLight
          position={[0, 3, 3.2]}
          intensity={6.8}
          color="#e74c3c"
          distance={9}
          decay={1.3}
        />

        {/* Additional spot light for the computer - from the side */}
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

        {/* Strong additional light for the desk area from above */}
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

        {/* Additional light for the desk from the left */}
        <pointLight
          position={[-1.5, 4, 2.8]}
          intensity={4.8}
          color="#fff176"
          distance={8}
          decay={1.3}
        />

        {/* Additional light for the desk from the right */}
        <pointLight
          position={[1.5, 4, 2.8]}
          intensity={4.5}
          color="#ffcc02"
          distance={8}
          decay={1.4}
        />

        {/* Light for the lamp and keyboard area */}
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

        {/* Light from the TV - strong */}
        <pointLight
          position={[-2, 4.8, 0]}
          intensity={2.8}
          color="#3498db"
          distance={12}
          decay={2}
        />

        {/* Light for the left poster - significantly increased */}
        <spotLight
          position={[-3, 5, 1]}
          angle={Math.PI / 4.2}
          penumbra={0.15}
          intensity={14.5}
          color="#ff8000"
          target-position={[-2.5, 3, 0]}
          distance={12}
          decay={1.0}
        />

        {/* Focused and very strong light for the left poster */}
        <spotLight
          position={[-2.8, 4.2, 1.2]}
          angle={Math.PI / 5.5}
          penumbra={0.1}
          intensity={18.0}
          color="#ff6000"
          target-position={[-2.8, 3.0, 0]}
          distance={8}
          decay={0.8}
        />

        {/* Special light for the top part of the left poster */}
        <spotLight
          position={[-3.2, 5.5, 1.0]}
          angle={Math.PI / 7}
          penumbra={0.05}
          intensity={12.5}
          color="#ffb74d"
          target-position={[-2.9, 4.5, 0]}
          distance={6}
          decay={0.9}
        />

        {/* Additional strong light from the lamp to the left poster */}
        <spotLight
          position={[-1.2, 4.5, 2.2]}
          angle={Math.PI / 2.6}
          penumbra={0.2}
          intensity={15.0}
          color="#ffa726"
          target-position={[-2.8, 3.5, 0]}
          distance={10}
          decay={0.9}
        />

        {/* Additional light for the poster - focused on the bottom part */}
        <spotLight
          position={[-3.2, 3.0, 1.2]}
          angle={Math.PI / 6}
          penumbra={0.1}
          intensity={10.0}
          color="#ff9100"
          target-position={[-2.9, 2.0, 0]}
          distance={7}
          decay={1.0}
        />

        {/* Light for the right poster - Ready Player One */}
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

        {/* Light for the snack bag - increased */}
        <pointLight
          position={[1.8, 3, 2.2]}
          intensity={3.2}
          color="#f39c12"
          distance={6}
          decay={1.8}
        />

        {/* Additional light for the computer from above */}
        <pointLight
          position={[0, 4.5, 3.5]}
          intensity={4.8}
          color="#ff4757"
          distance={8}
          decay={1.3}
        />

        {/* Light for the keyboard and computer - increased */}
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

        {/* Additional light for the joystick */}
        <pointLight
          position={[0.5, 3.2, 2.8]}
          intensity={3.5}
          color="#ffb347"
          distance={5}
          decay={1.6}
        />

        {/* Light for the chair */}
        <pointLight
          position={[0.5, 1.5, 1.5]}
          intensity={2.0}
          color="#9b59b6"
          distance={7}
          decay={1.5}
        />

        {/* Environment map for realistic reflections */}
        <Environment preset="night" />

        {/* Suspense for loading the GLTF model */}
        <Suspense fallback={null}>
          <Model setHovered={setHovered} />
        </Suspense>

        {/* Camera controls */}
        <LimitedControls />
      </Canvas>

      {/* Hover information display */}
      <HoverInfo hovered={hovered} />
    </div>
  );
};

export default Model3D; // Exporting Model3D as the default component
