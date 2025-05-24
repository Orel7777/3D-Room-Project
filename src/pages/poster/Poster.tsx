import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// תמונות הפוסטרים - נתיבים יחסיים
const silenceOfTheLambs = new URL('./pictures/314c350e8fb31395c80f2eb8a02282f2a1917c99.jpg', import.meta.url).href;
const onceUponATime = new URL('./pictures/a942207bd0cf67020201468b209a9609310942aa.jpg', import.meta.url).href;
const underSilverLake = new URL('./pictures/5efed8f45cc178ba4295b33bba318ad61df74d2a.jpg', import.meta.url).href;
const usMovie = new URL('./pictures/65d01e3707fbe1e2b1e9643420baac552249715b.jpg', import.meta.url).href;
const tenCloverfieldLane = new URL('./pictures/95547d10da91bae6ba9d682abfc93c1f10e4ae62.jpg', import.meta.url).href;
const darkKnight = new URL('./pictures/90d61705f673a6a298b52422b9416379fdb4b481.jpg', import.meta.url).href;
const captainMarvel = new URL('./pictures/5a6ae5b47c3399df7b03d6934d2e784a1392a2a6.jpg', import.meta.url).href;
const passengers = new URL('./pictures/1201bdd5bb93d8c30ba98da049ea7653f584c9df.jpg', import.meta.url).href;

// טיפוס לפוסטר
interface PosterItem {
  src: string;
  alt: string;
}

// רשימה של תמונות שורה ראשונה
const firstRowPosters: PosterItem[] = [
  { src: silenceOfTheLambs, alt: "Silence of the Lambs" },
  { src: onceUponATime, alt: "Once Upon a Time in Hollywood" },
  { src: underSilverLake, alt: "Under the Silver Lake" },
  { src: usMovie, alt: "Us" }
];

// רשימה של תמונות שורה שנייה
const secondRowPosters: PosterItem[] = [
  { src: tenCloverfieldLane, alt: "10 Cloverfield Lane" },
  { src: darkKnight, alt: "The Dark Knight" },
  { src: captainMarvel, alt: "Captain Marvel" },
  { src: passengers, alt: "Passengers" }
];

const Poster = () => {
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);
  const [showIntroDialog, setShowIntroDialog] = useState<boolean>(true);
  
  // פונקציה לסגירת הדיאלוג הפותח
  const closeIntroDialog = () => {
    setShowIntroDialog(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#e9d8c3] flex justify-center items-center p-12">
      {/* כפתור X בפינה הימנית העליונה */}
      <button
        className="fixed top-4 right-4 w-12 h-12 border-2 border-[#3B2F2F] text-[#3B2F2F] flex items-center justify-center bg-[#E9D8C3] hover:bg-[#3B2F2F] hover:text-[#E9D8C3] transition-all duration-300 ease-out z-50 text-2xl font-bold"
        aria-label="Close"
      >
        X
      </button>
      
      {/* כפתור חץ בצד ימין באמצע */}
      <button
        className="fixed top-1/2 -translate-y-1/2 right-4 w-12 h-16 border-2 border-[#3B2F2F] text-[#3B2F2F] flex items-center justify-center bg-[#E9D8C3] hover:bg-[#3B2F2F] hover:text-[#E9D8C3] transition-all duration-300 ease-out z-50 text-3xl font-bold"
        aria-label="Next"
      >
        &gt;
      </button>
      
      {/* מיכל ראשי לפוסטרים */}
      <div className="w-full max-w-5xl mx-auto px-12">
        {/* שורה ראשונה - 4 פוסטרים */}
        <div className="grid grid-cols-4 gap-8 mb-8">
          {firstRowPosters.map((poster, index) => (
            <div 
              key={`row1-${index}`} 
              className="aspect-[2/3] transform transition-all duration-300 hover:scale-105 shadow-xl border-4 border-black overflow-hidden cursor-pointer bg-white max-w-xs mx-auto"
              onClick={() => setSelectedPoster(poster)}
            >
              <img 
                src={poster.src} 
                alt={poster.alt} 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
        
        {/* שורה שנייה - 4 פוסטרים */}
        <div className="grid grid-cols-4 gap-8">
          {secondRowPosters.map((poster, index) => (
            <div 
              key={`row2-${index}`} 
              className={`aspect-[2/3] transform transition-all duration-300 hover:scale-105 shadow-xl ${
                poster.src === darkKnight ? 'border-4 border-blue-600' : 'border-4 border-black'
              } overflow-hidden cursor-pointer bg-white max-w-xs mx-auto`}
              onClick={() => setSelectedPoster(poster)}
            >
              <img 
                src={poster.src} 
                alt={poster.alt} 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* כפתור חזרה לחדר */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 px-4 py-2 bg-neutral-800 text-white rounded font-bold hover:bg-neutral-700 transition-colors text-sm"
      >
        חזרה לחדר
      </Link>

      {/* תצוגה מוגדלת של פוסטר נבחר */}
      {selectedPoster && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedPoster(null)}>
          <div className="relative max-w-2xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <img src={selectedPoster.src} alt={selectedPoster.alt} className="max-w-full max-h-[80vh] object-contain" />
            <button 
              className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-lg"
              onClick={() => setSelectedPoster(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* דיאלוג פתיחה - מוצג רק אם showIntroDialog הוא true */}
      {showIntroDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-[#E9D8C3] border-5 border-[#3B2F2F] p-8 flex flex-col items-center justify-center max-w-lg mx-4"
          >
            <h1 
              className="text-[#3B2F2F] text-center uppercase font-bold mb-6"
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                fontSize: '48px',
                lineHeight: '127%',
                letterSpacing: '0%',
                fontWeight: 400
              }}
            >
              EASTER EGGS INSIDE MOVIE POSTERS
            </h1>
            
            <p 
              className="text-[#3B2F2F] text-center mb-8"
              style={{ 
                fontFamily: "'Work Sans', sans-serif", 
                fontSize: '18px',
                lineHeight: '133%',
                letterSpacing: '0%',
                fontWeight: 400
              }}
            >
              Movie posters hold more than meets the eye.<br />
              Each one contains a blurred hidden message.<br />
              Can you find them all?
            </p>
            
            <button 
              className="bg-[#E9D8C3] border-[#3B2F2F] border-4 text-[#3B2F2F] uppercase font-bold hover:bg-[#3B2F2F] hover:text-[#E9D8C3] transition-all ease-out duration-300 flex items-center justify-center px-8 py-4"
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '32px',
                lineHeight: '137%',
                fontWeight: 400,
                letterSpacing: '0%'
              }}
              onClick={closeIntroDialog}
            >
              EXPLORE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Poster; 