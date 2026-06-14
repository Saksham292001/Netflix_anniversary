import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Loader, Trash2, Film } from 'lucide-react';
import { supabase } from '../supabase';

export default function EditMode() {
  const navigate = useNavigate();
  
  // Form State
  const [profileId, setProfileId] = useState('1'); 
  const [rowTitle, setRowTitle] = useState('');
  const [memoryTitle, setMemoryTitle] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  
  // UI State
  const [isUploading, setIsUploading] = useState(false);
  const [existingMemories, setExistingMemories] = useState([]);

  // Fetch Existing Data
  const fetchMemories = async () => {
    const { data, error } = await supabase.from('memories').select('*').order('id', { ascending: false });
    if (!error && data) setExistingMemories(data);
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // Handle New Uploads
  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!thumbnailFile || !videoFile) {
      alert("Please select both a thumbnail image and a video file!");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Image
      const thumbExt = thumbnailFile.name.split('.').pop();
      const thumbPath = `thumb-${Date.now()}.${thumbExt}`;
      const { error: thumbError } = await supabase.storage.from('thumbnails').upload(thumbPath, thumbnailFile);
      if (thumbError) throw thumbError;
      
      const { data: { publicUrl: thumbUrl } } = supabase.storage.from('thumbnails').getPublicUrl(thumbPath);

      // 2. Upload Video
      const vidExt = videoFile.name.split('.').pop();
      const vidPath = `vid-${Date.now()}.${vidExt}`;
      const { error: vidError } = await supabase.storage.from('videos').upload(vidPath, videoFile);
      if (vidError) throw vidError;

      const { data: { publicUrl: vidUrl } } = supabase.storage.from('videos').getPublicUrl(vidPath);

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('memories')
        .insert([{
          "profileId": profileId, 
          "rowTitle": rowTitle,
          title: memoryTitle,
          "thumbnailUrl": thumbUrl,
          "mainVideoUrl": vidUrl
        }]);

      if (dbError) throw dbError;

      // 4. Reset Form
      setRowTitle('');
      setMemoryTitle('');
      setThumbnailFile(null);
      setVideoFile(null);
      fetchMemories();
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed! Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // FULL CLEANUP DELETE FUNCTION
  const handleDelete = async (memory) => {
    if(window.confirm("Are you sure you want to delete this memory and completely erase its files?")) {
      try {
        // 1. Extract the exact file names from the end of the public URLs
        const thumbFileName = memory.thumbnailUrl.split('/').pop();
        const videoFileName = memory.mainVideoUrl.split('/').pop();

        // 2. Delete the actual files from the Supabase Storage Buckets
        if (thumbFileName) {
          const { error: thumbError } = await supabase.storage.from('thumbnails').remove([thumbFileName]);
          if (thumbError) console.error("Error deleting thumbnail file:", thumbError);
        }
        
        if (videoFileName) {
          const { error: videoError } = await supabase.storage.from('videos').remove([videoFileName]);
          if (videoError) console.error("Error deleting video file:", videoError);
        }

        // 3. Delete the text record from the Database table
        const { error: dbError } = await supabase.from('memories').delete().eq('id', memory.id);
        if (dbError) throw dbError;
        
        // 4. Refresh the UI
        fetchMemories();
        
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete memory completely. Error: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6 md:p-12 overflow-y-auto">
      <div className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="hover:text-gray-400 mr-4 transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold tracking-wide">Manage Memories</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* LEFT: UPLOAD FORM */}
        <div className="bg-[#1f1f1f] p-8 rounded-lg shadow-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Add New Card</h2>
          
          <form onSubmit={handleAddMemory} className="flex flex-col gap-5">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Assign to Profile</label>
              <select 
                value={profileId} 
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full bg-[#333] border-none rounded px-4 py-3 focus:ring-2 focus:ring-netflix outline-none text-white cursor-pointer"
              >
                <option value="1">1. Boo before Bee</option>
                <option value="2">2. Boo with Bee</option>
                <option value="3">3. Living the Dream</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Row Category (e.g., Trips, Dates)</label>
              <input 
                type="text" required value={rowTitle} onChange={(e) => setRowTitle(e.target.value)}
                className="w-full bg-[#333] border-none rounded px-4 py-2 focus:ring-2 focus:ring-netflix outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Memory Title</label>
              <input 
                type="text" required value={memoryTitle} onChange={(e) => setMemoryTitle(e.target.value)}
                className="w-full bg-[#333] border-none rounded px-4 py-2 focus:ring-2 focus:ring-netflix outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Thumbnail Image</label>
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 hover:border-white transition-colors cursor-pointer rounded bg-[#2a2a2a]">
                  <div className="flex flex-col items-center text-center px-2">
                    <Upload size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-300 truncate w-full">
                      {thumbnailFile ? thumbnailFile.name : "Select Image"}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnailFile(e.target.files[0])} />
                </label>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Main Video (MP4)</label>
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 hover:border-white transition-colors cursor-pointer rounded bg-[#2a2a2a]">
                  <div className="flex flex-col items-center text-center px-2">
                    <Film size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-300 truncate w-full">
                      {videoFile ? videoFile.name : "Select Video"}
                    </span>
                  </div>
                  <input type="file" accept="video/mp4" className="hidden" onChange={(e) => setVideoFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            <button 
              type="submit" disabled={isUploading}
              className="mt-4 bg-netflix hover:bg-red-700 text-white font-bold py-3 rounded transition-colors flex justify-center items-center gap-2"
            >
              {isUploading ? <><Loader className="animate-spin" size={20} /> Uploading Media...</> : 'Publish Card'}
            </button>
          </form>
        </div>

        {/* RIGHT: DELETION INTERFACE */}
        <div>
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Uploaded Cards</h2>
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {existingMemories.length === 0 ? (
              <p className="text-gray-500 italic">No memories added yet.</p>
            ) : (
              existingMemories.map(memory => (
                <div key={memory.id} className="flex items-center justify-between bg-[#1f1f1f] p-4 rounded border border-gray-800">
                  <div className="flex items-center gap-4">
                    <img src={memory.thumbnailUrl} alt="thumb" className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-medium text-white">{memory.title}</h3>
                      <p className="text-xs text-netflix">Profile: {memory.profileId}</p>
                      <p className="text-xs text-gray-500">{memory.rowTitle}</p>
                    </div>
                  </div>
                  {/* UPDATED DELETE BUTTON PASSES FULL OBJECT */}
                  <button onClick={() => handleDelete(memory)} className="text-gray-500 hover:text-netflix transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}