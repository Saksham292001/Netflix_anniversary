import { useState } from 'react';
// Changed from BrowserRouter to HashRouter for GitHub Pages compatibility
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Profiles from './pages/Profiles';
import Dashboard from './pages/Dashboard';
import EditMode from './pages/EditMode';

function App() {
  // Tracks if the global Netflix "Ta-dum" has played during this visit
  const [hasSeenMainIntro, setHasSeenMainIntro] = useState(false);

  const profiles = [
    { id: "1", name: "1. Boo before Bee", img: "/prof-1.JPG", video: "/intro-1.mp4" },
    { id: "2", name: "2. Boo with Bee", img: "/prof-2.jpg", video: "/intro-2.mp4" },
    { id: "3", name: "3. Living the Dream", img: "/prof-3.jpg", video: "/intro-3.mp4" },
  ];

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Profiles 
              profiles={profiles} 
              hasSeenMainIntro={hasSeenMainIntro} 
              setHasSeenMainIntro={setHasSeenMainIntro} 
            />
          } 
        />
        <Route path="/browse/:profileId" element={<Dashboard profiles={profiles} />} />
        <Route path="/manage" element={<EditMode />} />
      </Routes>
    </Router>
  );
}

export default App;
