import { useState, useRef } from "react";
import axios from "axios";
import VideoPlayer from "./components/VideoPlayer";
import CCList from "./components/CCList";

const BASE_URL = import.meta.env.VITE_BACKEND_URL

export default function App() {
  const [url, setUrl] = useState("");
  const [captions, setCaptions] = useState([]);
  const playerRef = useRef(null);

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/captions/`, {
        params: { video_url: url },
      });
      if (res.data.captions) {
        setCaptions(res.data.captions);
      } else {
        alert("No captions found");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pass this function to the CCList so it can control the video
  const handleSeek = (time) => {
    if (playerRef.current) {
      // react-player uses "seconds" as the unit
      playerRef.current.seekTo(time, "seconds");
    }
  };

  const handleCaptionUpdate = (updatedCaption) => {
    setCaptions((prev) =>
      prev.map((c) =>
        c.start === updatedCaption.start ? updatedCaption : c
      )
    );
  };

  const saveAnnotations = () => {
    const data = {
      video_url: url,
      captions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "annotations.json";
    link.click();
  };

  const loadAnnotations = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.video_url) {
          setUrl(data.video_url); // Load video
        }

        if (Array.isArray(data.captions)) {
          setCaptions(data.captions); // Load captions
          alert(`Loaded ${data.captions.length} annotations for video: ${data.video_url}`);
        } else {
          alert("Invalid file format: captions missing.");
        }
      } catch (err) {
        console.error("Error reading file:", err);
        alert("Failed to load annotations file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen text-gray-800">
      {/* Left Sidebar */}
      <div className="w-1/6 border-r p-4 bg-gray-50">
        <h2 className="font-semibold mb-2">Left Sidebar</h2>
        <p className="text-sm text-gray-500">Leaguepedia search (coming soon)</p>
      </div>

      {/* Middle Column */}
        <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">
            <span className="text-sky-300">Momouchi-v2:</span> LoL VoD Annotation Tool
          </h1>

          {/* Search Bar */}
        <div className="flex gap-2 mb-6 w-full justify-center">
          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border p-2 w-3/5 rounded"
          />
          <button
            onClick={handleFetch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Load
          </button>
        </div>

        {/* Video Player */}
        <div className="w-full flex justify-center">
          
          {url ? (
            <div className="w-full max-w-3xl h-[405px]">
              <VideoPlayer ref={playerRef} url={url} controls width="100%" height="100%" />
            </div>
          ) : (
            <div className="border-2 border-dashed w-[720px] h-[405px] flex items-center justify-center text-gray-400">
              Video will appear here
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/3 border-l p-0 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-2">Annotations</h2>
          <CCList
            key={captions.length + url}
            captions={captions}
            onSeek={handleSeek}
            onUpdate={handleCaptionUpdate}
          />
        </div>

        {/* Fixed Bottom Controls */}
        <div className="border-t p-3 bg-gray-50 flex justify-center gap-2 sticky bottom-0 shadow-inner">
          <button
            onClick={() => saveAnnotations()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save JSON
          </button>

          <label className="bg-gray-200 px-4 py-2 rounded cursor-pointer hover:bg-gray-300">
            Load JSON
            <input
              type="file"
              accept=".json"
              onChange={loadAnnotations}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
