import { useState, useRef } from 'react';

export default function MediaCard({ item, onPlay }) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverStartTimeout = useRef(null);
  const hoverEndTimeout = useRef(null); // New timer to enforce your custom limit

  const handleMouseEnter = () => {
    // 1. Wait half a second before playing (Netflix feel)
    hoverStartTimeout.current = setTimeout(() => {
      setIsHovered(true);

      // 2. Set the custom limit from your database (default to 3s if not set)
      const limitInMilliseconds = (item.teaserLimit || 3) * 1000;
      
      hoverEndTimeout.current = setTimeout(() => {
        setIsHovered(false); // Fades back to the image automatically!
      }, limitInMilliseconds);

    }, 500); 
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverStartTimeout.current);
    clearTimeout(hoverEndTimeout.current);
    setIsHovered(false);
  };

  return (
    <div 
      className="relative min-w-[240px] h-[135px] md:min-w-[300px] md:h-[168px] bg-[#181818] rounded-md transition-all duration-300 ease-in-out hover:scale-125 hover:z-50 cursor-pointer shadow-xl flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onPlay(item.mainVideo)}
    >
      {/* Base Image */}
      <img 
        src={item.thumbnail} 
        alt={item.title} 
        className={`absolute inset-0 w-full h-full object-cover rounded-md transition-opacity duration-300 ${isHovered && item.teaserVideo ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Teaser Video */}
      {isHovered && item.teaserVideo && (
        <video 
          autoPlay 
          muted 
          className="absolute inset-0 w-full h-full object-cover rounded-md"
        >
          <source src={item.teaserVideo} type="video/mp4" />
        </video>
      )}

      {/* Dropdown Title */}
      {isHovered && (
        <div className="absolute -bottom-10 left-0 w-full bg-[#181818] p-3 rounded-b-md shadow-2xl opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
          <h4 className="text-white text-sm font-bold truncate">{item.title}</h4>
        </div>
      )}
    </div>
  );
}