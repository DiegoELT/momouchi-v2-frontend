import { useState, useRef, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./components/VideoPlayer";
import CCList from "./components/CCList";
import MatchInfo from "./components/MatchInfo";
import { parseTimeInput } from "./utils/time";
import EventModal from "./components/EventModal";
import CorpusPicker from "./components/CorpusPicker";
import ErrorBoundary from "./components/ErrorBoundary";
import { extractYouTubeId } from "./utils/youtube";
import {
  GUIDELINE_VERSIONS,
  DEFAULT_GUIDELINE_VERSION,
} from "./constants/annotation";

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
  const [loadError, setLoadError] = useState("");
  // Where the currently loaded captions came from: "corpus" (frozen snapshot)
  // or "live" (an unsaved preview straight from YouTube).
  const [captionSource, setCaptionSource] = useState(null);
  const [ingestEnabled, setIngestEnabled] = useState(false);
  const [ingestStatus, setIngestStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [corpusVersion, setCorpusVersion] = useState(0);
  // Guideline version every annotation made in this session is stamped with.
  const [guidelineVersion, setGuidelineVersion] = useState(
    DEFAULT_GUIDELINE_VERSION
  );

  const QUICK_OBJECTIVES = [
    { label: "T", value: "Tower" }, // UI says Turret, stored value matches modal
    { label: "D", value: "Dragon" },
    { label: "G", value: "Grubs" },
    { label: "H", value: "Herald" },
    { label: "B", value: "Baron" },
  ];


  const getTeamLabel = (value, fallback) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      return value.team_name || value.name || fallback;
    }
    return fallback;
  };

  const getTeamNameBySide = (side) => {
    const m = Array.isArray(matchInfo) ? matchInfo[0] : matchInfo;
    if (!m) return side === "left" ? "Blue Team" : "Red Team";

    if (side === "left") {
      const rawLeft =
        m.blue_team ??
        m.blueTeam ??
        m.team1_name ??
        m.team1;

      return getTeamLabel(rawLeft, "Blue Team");
    }

    const rawRight =
      m.red_team ??
      m.redTeam ??
      m.team2_name ??
      m.team2;

    return getTeamLabel(rawRight, "Red Team");
  };

  const addTimelineEvent = (side, payload) => {
    const newEvent = {
      id: crypto.randomUUID(),
      time: Number(currentTime.toFixed(2)),
      team: getTeamNameBySide(side), // match EventModal
      side: side === "left" ? "blue" : "red",
      description: "", // optional, same shape
      ...payload,
    };

    setEvents((prevEvents) => {
      const updated = [...prevEvents, newEvent];
      updated.sort((a, b) => a.time - b.time);
      return updated;
    });
  };

  const addQuickEvent = (side, objectiveValue) =>
    addTimelineEvent(side, { type: "OBJECTIVE", objective: objectiveValue });

  // Kills are logged at team level (one button per team), the same granularity
  // as neutral objectives — no killer/victim pair.
  const addQuickKill = (side) => addTimelineEvent(side, { type: "KILL" });

  // Recomputed every keystroke; null while the URL box holds a partial string.
  const videoId = extractYouTubeId(url);

  const playerRef = useRef(null);

  // Ingestion only runs on a local backend (YouTube blocks datacenter IPs and a
  // hosted disk is ephemeral), so the button is hidden unless the backend says
  // it is available.
  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${BASE_URL}/health`)
      .then((res) => {
        if (!cancelled) setIngestEnabled(Boolean(res.data.ingest_enabled));
      })
      .catch(() => {
        if (!cancelled) setIngestEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchMatchInfo = async (videoUrl) => {
    try {
      const res = await axios.get(`${BASE_URL}/match_details/`, {
        params: { video_url: videoUrl },
      });
      setMatchInfo(res.data.matches || []);
    } catch (err) {
      // Missing metadata is not fatal — the patch and teams can be filled in
      // by hand — so this never blocks annotation.
      console.error("Failed to fetch match info:", err);
      setMatchInfo([]);
    }
  };

  // The backend returns a descriptive `error` for the cases that actually
  // happen (game not ingested, YouTube blocking the host). Show it rather than
  // a generic failure.
  const describeError = (err) =>
    err.response?.data?.error || err.message || "Unknown error.";

  // Seconds → the "mm:ss" the range inputs expect; "" when unbounded.
  const secondsToInput = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const total = Math.round(Number(value));
    const m = Math.floor(total / 60);
    const sec = total % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  function normalizeCaptions(rawCaptions) {
    return rawCaptions.map((cap) => ({
      ...cap,
      id: cap.id ?? crypto.randomUUID(),
    }));
  }

  const handleFetch = async (targetUrl = url) => {
    if (!targetUrl) return;
    if (!extractYouTubeId(targetUrl)) {
      setLoadError("That does not look like a YouTube URL.");
      return;
    }
    setLoadError("");
    try {
      const res = await axios.get(`${BASE_URL}/captions/`, {
        params: { video_url: targetUrl },
      });
      if (res.data.captions) {
        let loadedCaptions = normalizeCaptions(res.data.captions);
        const source = res.data.source || null;

        if (source === "corpus") {
          // Already trimmed server-side. Adopt the stored bounds so the inputs
          // show what this snapshot actually covers.
          setStartTime(secondsToInput(res.data.trim?.start));
          setEndTime(secondsToInput(res.data.trim?.end));
        } else if (startTime || endTime) {
          // Live preview: apply the range locally so you can find the bounds
          // before committing them to the corpus.
          const start = parseTimeInput(startTime) ?? 0;
          const end = parseTimeInput(endTime) ?? Number.MAX_SAFE_INTEGER;

          loadedCaptions = loadedCaptions.filter(
            (cap) => cap.start + cap.duration > start && cap.start < end
          );
        }

        setCaptions(loadedCaptions);
        setCaptionSource(source);
        setIngestStatus("");
        fetchMatchInfo(targetUrl);
      } else {
        setLoadError("No captions found for this VOD.");
      }
    } catch (err) {
      console.error(err);
      setCaptionSource(null);
      setLoadError(describeError(err));
    }
  };

  // "Add to corpus" — runs the same ingestion the CLI does, through the local
  // backend, using the start/end you just dialled in on the player.
  const addToCorpus = async ({ refresh = false } = {}) => {
    if (!url) return;
    setBusy(true);
    setLoadError("");
    setIngestStatus("Fetching captions from YouTube…");

    const body = {
      video_url: url,
      start: parseTimeInput(startTime),
      end: parseTimeInput(endTime),
      refresh,
    };

    try {
      const res = await axios.post(`${BASE_URL}/corpus/`, body);
      const { trimmed_count: kept, caption_count: total, match_warning: warn } =
        res.data;
      setIngestStatus(
        `Added to corpus — keeping ${kept} of ${total} caption blocks.` +
          (warn ? ` (${warn})` : "")
      );
      setCorpusVersion((v) => v + 1);
      await handleFetch(url); // reload from the snapshot so what you annotate is what was saved
    } catch (err) {
      console.error(err);
      setIngestStatus("");
      setLoadError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  // Change the bounds of a game already in the corpus. Recomputed from the
  // stored full captions — never re-fetches, so the text cannot change.
  const retrimCorpus = async () => {
    setBusy(true);
    setLoadError("");
    setIngestStatus("Re-trimming…");

    try {
      if (!videoId) throw new Error("Could not read a video id from the URL.");

      const res = await axios.post(`${BASE_URL}/corpus/${videoId}/trim`, {
        start: parseTimeInput(startTime),
        end: parseTimeInput(endTime),
      });
      setIngestStatus(
        `Re-trimmed — keeping ${res.data.trimmed_count} of ${res.data.caption_count} blocks.`
      );
      setCorpusVersion((v) => v + 1);
      await handleFetch(url);
    } catch (err) {
      console.error(err);
      setIngestStatus("");
      setLoadError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  // Picking a game from the corpus list loads it straight away.
  const handleSelectGame = (videoUrl) => {
    setUrl(videoUrl);
    handleFetch(videoUrl);
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
      setCaptions((prev) =>
        prev.map((c) => {
          if (String(c.id) !== String(updated.id)) return c;

          const merged = { ...c, ...updated };

          // Stamp the guideline version whenever the annotation itself changes
          // (label or flag) — not on text/comment edits. Segments annotated
          // under an older version keep their original stamp.
          const labelChanged =
            (updated.label ?? "None") !== (c.label ?? "None");
          const flagChanged = (updated.flag ?? null) !== (c.flag ?? null);

          if (labelChanged || flagChanged) {
            const isAnnotated =
              (merged.label ?? "None") !== "None" || Boolean(merged.flag);
            if (isAnnotated) {
              merged.guideline_version = guidelineVersion;
            } else {
              delete merged.guideline_version;
            }
          }

          return merged;
        })
      );
    }
  };

  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const saveAnnotations = () => {
    const data = {
      video_url: url,
      guideline_version: guidelineVersion,
      captions,
      matchInfo,
      events,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const match = Array.isArray(matchInfo) ? matchInfo[0] : matchInfo;
    link.download = match?.gameid ? `${match.gameid}.json` : "annotations.json";
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

        if (
          data.guideline_version &&
          GUIDELINE_VERSIONS.includes(data.guideline_version)
        ) {
          setGuidelineVersion(data.guideline_version);
        }

        if (Array.isArray(data.captions)) {
          setCaptions(
            data.captions.map((c) => ({
              ...c,
              id: c.id ?? crypto.randomUUID(),
            }))
          );
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
      <div className="w-1/6 border-r p-4 bg-gray-50 overflow-y-auto">
        <CorpusPicker
          activeVideoUrl={url}
          onSelect={handleSelectGame}
          refreshKey={corpusVersion}
        />
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
              onClick={() => handleFetch()}
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

          {ingestEnabled && (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {captionSource === "live" && (
                  <span className="text-xs px-2 py-1 rounded bg-amber-100 border border-amber-400 text-amber-900">
                    Preview — not saved yet
                  </span>
                )}
                {captionSource === "corpus" && (
                  <span className="text-xs px-2 py-1 rounded bg-emerald-100 border border-emerald-400 text-emerald-900">
                    In corpus
                  </span>
                )}

                {captionSource === "live" && (
                  <button
                    onClick={() => addToCorpus()}
                    disabled={busy || !videoId}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
                    title="Fetch the full captions and save a snapshot with these start/end bounds"
                  >
                    {busy ? "Working…" : "Add to corpus"}
                  </button>
                )}

                {captionSource === "corpus" && (
                  <button
                    onClick={retrimCorpus}
                    disabled={busy}
                    className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
                    title="Recompute the trim from the stored captions — does not re-fetch from YouTube"
                  >
                    {busy ? "Working…" : "Update trim"}
                  </button>
                )}
              </div>

              {ingestStatus && (
                <p className="text-sm text-emerald-700 text-center break-words">
                  {ingestStatus}
                </p>
              )}
            </div>
          )}

          {loadError && (
            <p className="text-sm text-red-600 text-center w-full break-words">
              {loadError}
            </p>
          )}

          {/* Annotation guideline version — stamped onto every annotation */}
          <div className="flex items-center gap-2 w-full justify-center">
            <label
              htmlFor="guideline-version"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Annotation guidelines
            </label>
            <select
              id="guideline-version"
              value={guidelineVersion}
              onChange={(e) => setGuidelineVersion(e.target.value)}
              title="Version recorded with every annotation made from now on"
              className="border p-2 rounded"
            >
              {GUIDELINE_VERSIONS.map((v) => (
                <option key={v} value={v}>
                  v{v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Video Player */}
        <div className="w-full flex justify-center">
          {videoId ? (
            <div className="w-full max-w-3xl h-[405px]">
              <ErrorBoundary label="The video player failed to load.">
                <VideoPlayer
                  ref={playerRef}
                  url={url}
                  onProgress={setCurrentTime}  // <-- this will update currentTime every 0.5s while playing
                  controls
                  width="100%"
                  height="100%"
                />
              </ErrorBoundary>
            </div>
          ) : (
            <div className="border-2 border-dashed w-[720px] h-[405px] flex items-center justify-center text-gray-400">
              {url ? "Not a YouTube URL yet…" : "Video will appear here"}
            </div>
          )}
        </div>

        {captions.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            {/* Left side (blue team) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => addQuickKill("left")}
                className="w-10 h-10 rounded bg-blue-700 text-white text-[10px] font-semibold hover:bg-blue-800"
                title={`Add a kill for ${getTeamNameBySide("left")}`}
              >
                K
              </button>
              {QUICK_OBJECTIVES.map((obj) => (
                <button
                  key={`left-${obj.label}`}
                  onClick={() => addQuickEvent("left", obj.value)}
                  className="w-10 h-10 rounded bg-blue-500 text-white text-[10px] font-semibold hover:bg-blue-600"
                  title={`Add ${obj.label} for left/blue team`}
                >
                  {obj.label}
                </button>
              ))}
            </div>

            {/* Existing modal button */}
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 whitespace-nowrap"
              onClick={() => setShowEventModal(true)}
            >
              Add Timestamp
            </button>

            {/* Right side (red team) */}
            <div className="flex items-center gap-1">
              {QUICK_OBJECTIVES.map((obj) => (
                <button
                  key={`right-${obj.label}`}
                  onClick={() => addQuickEvent("right", obj.value)}
                  className="w-10 h-10 rounded bg-red-500 text-white text-[10px] font-semibold hover:bg-red-600"
                  title={`Add ${obj.label} for right/red team`}
                >
                  {obj.label}
                </button>
              ))}
              <button
                onClick={() => addQuickKill("right")}
                className="w-10 h-10 rounded bg-red-700 text-white text-[10px] font-semibold hover:bg-red-800"
                title={`Add a kill for ${getTeamNameBySide("right")}`}
              >
                K
              </button>
            </div>
          </div>
        )}


        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          currentTime={currentTime}             // current video timestamp
          matchInfo={matchInfo}
          onSave={(newEvent) => {
            setEvents((prevEvents) => {
              const updated = [...prevEvents, newEvent];
              updated.sort((a, b) => a.time - b.time); // keep sorted by timestamp
              return updated;
            });
          }}
        />

        {/* Match Info */}
        <MatchInfo
          matches={matchInfo}
          onPatchChange={(value) =>
            setMatchInfo((prev) => {
              if (!prev) return prev;
              if (Array.isArray(prev)) {
                if (!prev.length) return prev;
                const [first, ...rest] = prev;
                return [{ ...first, patch: value }, ...rest];
              }
              return { ...prev, patch: value };
            })
          }
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-1/3 border-l p-0 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-2">Annotations</h2>
          <ErrorBoundary label="The annotation list failed to render.">
            <CCList
              captions={captions}
              events={events}
              onSeek={handleSeek}
              onUpdate={handleUpdateItem}
              onDeleteEvent={handleDeleteEvent}
            />
          </ErrorBoundary>

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
