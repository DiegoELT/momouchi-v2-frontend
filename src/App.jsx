import { useState, useRef } from "react";
import axios from "axios";
import VideoPlayer from "./components/VideoPlayer";
import CCList from "./components/CCList";
import MatchInfo from "./components/MatchInfo";
import { parseTimeInput, formatTime } from "./utils/time";
import EventModal from "./components/EventModal";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  const [url, setUrl] = useState("");
  const [captions, setCaptions] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [matchInfo, setMatchInfo] = useState(null); 
  const [currentTime, setCurrentTime] = useState(0);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);

  const playerRef = useRef(null);

  const fetchMatchInfo = async (videoUrl) => {
    try {
      const res = await axios.get(`${BASE_URL}/match_details/`, {
        params: { video_url: videoUrl },
      });
      setMatchInfo(res.data.matches || []);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch match info:", err);
      setMatchInfo([]);
    }
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/captions/`, {
        params: { video_url: url },
      });
      if (res.data.captions) {
        let loadedCaptions = res.data.captions;

        // ⏱️ If start/end range is specified, filter captions
        if (startTime || endTime) {
          const start = parseTimeInput(startTime) ?? 0;
          const end = parseTimeInput(endTime) ?? Number.MAX_SAFE_INTEGER;

          loadedCaptions = loadedCaptions.filter(
            (cap) => cap.start + cap.duration > start && cap.start < end
          );
        }

        setCaptions(loadedCaptions);
        fetchMatchInfo(url);
      } else {
        alert("No captions found");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching captions.");
    }
  };

  const handleSeek = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, "seconds");
    }
  };

  const handleUpdateItem = (updated) => {
    // event items will have `time`; captions have `start`
    if (updated.time !== undefined) {
      // update event
      setEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
      );
    } else if (updated.start !== undefined) {
      setCaptions((prev) => prev.map((c) => (c.start === updated.start ? { ...c, ...updated } : c)));
    }
  };

  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const saveAnnotations = () => {
    const data = { video_url: url, captions, matchInfo, events };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
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
          setUrl(data.video_url);
        }

        if (Array.isArray(data.captions)) {
          setCaptions(data.captions);
          alert(`Loaded ${data.captions.length} annotations.`);
        } else {
          alert("Invalid file format: captions missing.");
        }
        if (Array.isArray(data.events)) {
          setEvents(data.events);
        }
        if (data.matchInfo) {
          setMatchInfo(data.matchInfo);
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

        {/* Search & Range Inputs */}
        <div className="flex flex-col items-center gap-3 mb-6 w-full max-w-3xl">
          <div className="flex gap-2 w-full justify-center">
            <input
              type="text"
              placeholder="Paste YouTube URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border p-2 flex-1 rounded"
            />
            <button
              onClick={handleFetch}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Load
            </button>
          </div>

          <div className="flex gap-2 w-full justify-center">
            <input
              type="text"
              placeholder="Start time (mm:ss)"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border p-2 w-1/3 rounded"
            />
            <input
              type="text"
              placeholder="End time (mm:ss)"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border p-2 w-1/3 rounded"
            />
          </div>
        </div>

        {/* Video Player */}
        <div className="w-full flex justify-center">
          {url ? (
            <div className="w-full max-w-3xl h-[405px]">
              <VideoPlayer
                ref={playerRef}
                url={url}
                onProgress={setCurrentTime}  // <-- this will update currentTime every 0.5s while playing
                controls
                width="100%"
                height="100%"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed w-[720px] h-[405px] flex items-center justify-center text-gray-400">
              Video will appear here
            </div>
          )}
        </div>

        {captions.length > 0 && (
          <div className="mt-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => setShowEventModal(true)}
            >
              Add Timestamp
            </button>
          </div>
        )}


        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          currentTime={currentTime}             // current video timestamp
          onSave={(newEvent) => {
            setEvents((prevEvents) => {
              const updated = [...prevEvents, newEvent];
              updated.sort((a, b) => a.time - b.time); // keep sorted by timestamp
              return updated;
            });
          }}
        />

        {/* Match Info */}
        <MatchInfo matches={matchInfo} />
      </div>

      {/* Right Sidebar */}
      <div className="w-1/3 border-l p-0 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-2">Annotations</h2>
          <CCList
            captions={captions}
            events={events}
            onSeek={handleSeek}
            onUpdate={handleUpdateItem}
            onDeleteEvent={handleDeleteEvent}
          />

        </div>

        {/* Fixed Bottom Controls */}
        <div className="border-t p-3 bg-gray-50 flex justify-center gap-2 sticky bottom-0 shadow-inner">
          <button
            onClick={saveAnnotations}
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
