import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function Profiles({ profiles, hasSeenMainIntro, setHasSeenMainIntro }) {
  const navigate = useNavigate();
  // Start at loading if they haven't seen the intro, otherwise jump to profiles
  const [status, setStatus] = useState(hasSeenMainIntro ? 'profiles' : 'loading');
  const videoRef = useRef(null);

  const startMainIntro = () => {
    if (status !== 'loading') return;
    
    setStatus('intro');
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        });
      }
    }, 50);

    // Matches the length of your main intro.mp4 (approx 4.2s)
    setTimeout(() => {
      setStatus('profiles');
      setHasSeenMainIntro(true); // Locks it so it doesn't replay when hitting back
    }, 4200);
  };

  return (
    <div 
      className="relative w-full h-screen bg-[#141414] overflow-hidden flex items-center justify-center"
      onClick={status === 'loading' ? startMainIntro : undefined}
    >
      
      {/* 1. INVISIBLE CLICK TRIGGER (Fake Loading) */}
      {status === 'loading' && (
        <div className="flex flex-col items-center animate-fade-in cursor-pointer z-50">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="w-32 md:w-48 mb-10 opacity-80" alt="Netflix" />
          <div className="w-12 h-12 border-4 border-netflix border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-6 text-xs uppercase tracking-[3px]">Click to Start</p>
        </div>
      )}

      {/* 2. THE GLOBAL NETFLIX INTRO (Ta-dum) */}
      {status === 'intro' && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-[100] animate-fade-in">
          <video 
            ref={videoRef} 
            playsInline 
            className="w-full h-full object-contain scale-125"
          >
            {/* Points to the global intro file */}
            <source src="/intro.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* 3. PROFILES GRID */}
      {status === 'profiles' && (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in px-4 w-full">
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/manage');
            }}
            className="absolute top-6 right-6 text-gray-800 hover:text-gray-400 transition-colors p-2 z-10"
          >
            <Settings size={22} />
          </button>

          <div className="absolute top-6 left-6 md:top-10 md:left-12 w-28 md:w-40">
             <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" />
          </div>

          <h1 className="text-white text-3xl md:text-[3.5vw] font-medium mb-10 tracking-wide select-none">
            Who's watching?
          </h1>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-[3vw] max-w-[85%]">
            {profiles.map((p) => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/browse/${p.id}`)}
                className="group flex flex-col items-center cursor-pointer w-32 md:w-[12vw] min-w-[120px]"
              >
                <div className="w-full aspect-square rounded-md overflow-hidden transition-all duration-300 ring-[3px] ring-transparent group-hover:ring-white group-hover:scale-105 shadow-2xl">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-gray-400 group-hover:text-white text-sm md:text-[1.1vw] font-light mt-4 transition-colors duration-300 text-center">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}