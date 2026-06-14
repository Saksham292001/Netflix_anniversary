import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Info, Search, Bell, ChevronDown, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';
import MediaCard from '../components/MediaCard';

export default function Dashboard({ profiles }) {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  
  const [rowsData, setRowsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Grab the exact profile data based on URL
  const currentProfile = profiles.find(p => p.id === profileId) || profiles[0];

useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .eq('profileId', profileId) // ONLY loads memories for this specific profile
          .order('id', { ascending: true });
          
        if (error) throw error;

        const groupedRows = (data || []).reduce((acc, curr) => {
          if (!acc[curr.rowTitle]) acc[curr.rowTitle] = [];
          acc[curr.rowTitle].push(curr);
          return acc;
        }, {});

        setRowsData(groupedRows);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemories();
  }, [profileId]);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .order('id', { ascending: true });
          
        if (error) throw error;

        const groupedRows = (data || []).reduce((acc, curr) => {
          if (!acc[curr.rowTitle]) acc[curr.rowTitle] = [];
          acc[curr.rowTitle].push(curr);
          return acc;
        }, {});

        setRowsData(groupedRows);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemories();
  }, []);

  // Configure Hero to use the profile's specific video
  const heroData = {
    title: currentProfile.name, 
    desc: "A collection of every laugh, every trip, and every small moment that made this phase unforgettable.",
    bgVideo: currentProfile.video, // Plays silently in the background
    mainVideo: currentProfile.video  // Plays full screen with sound when "Play" is clicked
  };

  return (
    <div className="relative pb-20 bg-[#141414] min-h-screen font-sans selection:bg-netflix selection:text-white">
      
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-500 flex items-center justify-between px-4 md:px-12 py-3 ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex items-center gap-4 md:gap-10">
          <button onClick={() => navigate('/')} className="text-white hover:text-gray-400 transition-colors mr-2">
            <ArrowLeft size={24} />
          </button>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
            alt="Netflix" 
            className="h-5 md:h-7 cursor-pointer" 
            onClick={() => navigate('/')}
          />
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-white">
          <Search className="w-5 h-5 cursor-pointer hover:text-gray-300" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300" />
          <div className="flex items-center gap-2 cursor-default">
            <img src={currentProfile.img} alt="User Avatar" className="h-8 w-8 rounded object-cover border border-gray-800 shadow" />
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </nav>

      {/* CINEMATIC HERO BACKGROUND WITH AUTO-PLAY VIDEO */}
      <div className="relative h-[85vh] md:h-[95vh] w-full text-white">
        <div className="absolute top-0 left-0 w-full h-full">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src={heroData.bgVideo} type="video/mp4" />
          </video>
          {/* Slightly darker gradients to ensure text stands out against the video */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[30vw] bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent" />
        </div>

        <div className="absolute bottom-[25%] left-4 md:left-12 w-full md:w-[50%] z-10 animate-slide-up pl-2">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] tracking-wide">
            {heroData.title}
          </h1>
          <p className="text-sm md:text-[1.2vw] font-medium drop-shadow-xl text-white/90 mb-6 leading-relaxed max-w-lg">
            {heroData.desc}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setPlayingVideo(heroData.mainVideo)} 
              className="flex items-center gap-3 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded font-bold text-lg hover:bg-white/80 transition-all active:scale-95"
            >
              <Play fill="black" size={24} /> Play
            </button>
            <button className="flex items-center gap-3 bg-[gray]/50 text-white px-6 md:px-8 py-2 md:py-3 rounded font-bold text-lg hover:bg-[gray]/30 transition-all backdrop-blur-md active:scale-95">
              <Info size={24} /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT ROWS */}
      <div className="relative z-20 -mt-24 md:-mt-32">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
             <div className="w-10 h-10 border-4 border-netflix border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : Object.keys(rowsData).length === 0 ? (
           <div className="text-center text-gray-500 mt-40 animate-fade-in">
             <p className="text-xl font-light tracking-widest italic">"This collection is currently empty."</p>
           </div>
        ) : (
          Object.entries(rowsData).map(([rowTitle, items], idx) => (
            <div key={idx} className="mb-8 md:mb-12">
              <h2 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 px-4 md:px-12 text-[#e5e5e5] transition-colors w-max">
                {rowTitle}
              </h2>
              <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-10 pt-2 scroll-smooth">
                {items.map((item) => (
                  <MediaCard 
                    key={item.id} 
                    item={{
                      title: item.title,
                      thumbnail: item.thumbnailUrl,
                      teaserVideo: item.teaserUrl,
                      mainVideo: item.mainVideoUrl,
                      teaserLimit: item.teaserLimit
                    }} 
                    onPlay={setPlayingVideo} 
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FULLSCREEN VIDEO PLAYER */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center animate-fade-in">
          <button 
            onClick={() => setPlayingVideo(null)} 
            className="absolute top-8 left-8 z-[110] p-3 bg-black/60 hover:bg-white/20 rounded-full transition text-white border border-white/10"
          >
            <ArrowLeft size={32} /> 
          </button>
          <video autoPlay controls className="w-full h-full max-h-screen outline-none">
            <source src={playingVideo} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}