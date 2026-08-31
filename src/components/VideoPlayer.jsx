import YouTube from "react-youtube";
import { forwardRef, useEffect, useRef } from "react";
import { extractYouTubeId } from "../utils/youtube";

const VideoPlayer = forwardRef(({ url, onProgress }, ref) => {
  const intervalRef = useRef(null);

  const onReady = (event) => {
    // Expose the internal player via ref
    if (ref) ref.current = event.target;
  };

  const onStateChange = (event) => {
    // 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) {
      // start interval to update current time
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (onProgress) onProgress(event.target.getCurrentTime());
      }, 500);
    } else {
      // paused or ended, clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // also report final time once
      if (onProgress) onProgress(event.target.getCurrentTime());
    }
  };

  // clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Parsed after the hooks so hook order stays stable, and defensively: this
  // component re-renders on every keystroke in the URL box, where the value is
  // a half-typed string most of the time.
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className="border-2 border-dashed w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Waiting for a valid YouTube URL…
      </div>
    );
  }

  const opts = {
    height: "405",
    width: "720",
    playerVars: { rel: 0, modestbranding: 1 },
  };

  return (
    <YouTube
      key={videoId}
      videoId={videoId}
      opts={opts}
      onReady={onReady}
      onStateChange={onStateChange}
    />
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
