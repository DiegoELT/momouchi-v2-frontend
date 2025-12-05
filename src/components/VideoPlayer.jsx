import YouTube from "react-youtube";
import { forwardRef, useEffect, useRef } from "react";

const VideoPlayer = forwardRef(({ url, onProgress }, ref) => {
  const videoId = new URL(url).searchParams.get("v");
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

  const opts = {
    height: "405",
    width: "720",
    playerVars: { rel: 0, modestbranding: 1 },
  };

  return (
    <YouTube
      videoId={videoId}
      opts={opts}
      onReady={onReady}
      onStateChange={onStateChange}
    />
  );
});

export default VideoPlayer;
