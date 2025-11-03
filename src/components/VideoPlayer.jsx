import YouTube from "react-youtube";
import { forwardRef } from "react";

const VideoPlayer = forwardRef(({ url, onProgress }, ref) => {
  const videoId = new URL(url).searchParams.get("v");

  const onReady = (event) => {
    if (ref) ref.current = event.target;
  };

  const onStateChange = (event) => {
    if (event.data === 1) {
      // playing
      const interval = setInterval(() => {
        if (onProgress) onProgress(event.target.getCurrentTime());
      }, 500);
      event.target._interval = interval;
    } else {
      if (event.target._interval) clearInterval(event.target._interval);
    }
  };

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


