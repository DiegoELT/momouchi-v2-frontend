import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Lists the games that have been ingested into the corpus snapshot, so an
 * annotator can pick one without having to know or paste VOD URLs.
 */
export default function CorpusPicker({ activeVideoUrl, onSelect, refreshKey }) {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus((s) => (s === "ready" ? s : "loading"));

    axios
      .get(`${BASE_URL}/corpus/`)
      .then((res) => {
        if (cancelled) return;
        setGames(res.data.games || []);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err.response?.data?.error ||
            err.message ||
            "Could not reach the backend."
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-semibold mb-1">Corpus</h2>

      {status === "loading" && (
        <p className="text-sm text-gray-500">Loading games…</p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600 break-words">{error}</p>
      )}

      {status === "ready" && games.length === 0 && (
        <p className="text-sm text-gray-500">
          No games ingested yet. Run{" "}
          <code className="text-xs bg-gray-200 px-1 rounded">
            python ingest.py &lt;vod-url&gt;
          </code>{" "}
          locally.
        </p>
      )}

      {status === "ready" && games.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mb-2">
            {games.length} game{games.length === 1 ? "" : "s"} available
          </p>
          <ul className="space-y-1 overflow-y-auto">
            {games.map((g) => {
              const active = activeVideoUrl && activeVideoUrl === g.video_url;
              return (
                <li key={g.video_id}>
                  <button
                    onClick={() => onSelect?.(g.video_url)}
                    title={g.gameid || g.video_id}
                    className={`w-full text-left p-2 rounded border text-xs transition-colors ${
                      active
                        ? "bg-sky-100 border-sky-400"
                        : "bg-white border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-semibold truncate">
                      {g.team1 || "?"} vs {g.team2 || "?"}
                    </div>
                    <div className="text-gray-500 truncate">
                      {g.tournament || "Unknown tournament"}
                    </div>
                    <div className="text-gray-400">
                      patch {g.patch || "?"} · {g.trimmed_count ?? g.caption_count} segments
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
