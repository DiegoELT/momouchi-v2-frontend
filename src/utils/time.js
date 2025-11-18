// Convert "mm:ss" → seconds
function parseTimeInput(value) {
  if (!value) return null;
  const parts = value.split(":").map(Number);
  if (parts.length === 1) return parts[0]; // if just seconds
  const [min, sec] = parts;
  return min * 60 + sec;
}

// Convert seconds → "mm:ss" (optional helper if you ever want to display it)
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
export { parseTimeInput, formatTime };