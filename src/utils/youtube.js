/**
 * Extract a YouTube video id from whatever is in the URL box.
 *
 * Returns null instead of throwing. That matters: this runs on every keystroke,
 * and `new URL("h")` throws, which during render unmounts the whole app and
 * leaves a blank page.
 *
 * Mirrors the backend's extract_youtube_id so both ends agree on what counts as
 * a valid VOD reference.
 */
const ID_PATTERN = /^[\w-]{11}$/;

export function extractYouTubeId(value) {
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw) return null;

  // YouTube ids are exactly 11 characters. Requiring the full length means a
  // half-typed id yields null rather than a truncated id, so the player is not
  // mounted with a broken value on every keystroke.
  const asId = (candidate) => (ID_PATTERN.test(candidate || "") ? candidate : null);

  if (ID_PATTERN.test(raw)) return raw;

  let parsed;
  try {
    // Tolerate a pasted URL with no scheme ("youtube.com/watch?v=...").
    parsed = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    return asId(parsed.pathname.split("/").filter(Boolean)[0]);
  }

  if (host !== "youtube.com" && !host.endsWith(".youtube.com")) return null;

  const v = asId(parsed.searchParams.get("v"));
  if (v) return v;

  // /embed/ID, /v/ID, /shorts/ID, /live/ID
  const match = parsed.pathname.match(/^\/(?:embed|v|shorts|live)\/([\w-]+)/);
  return match ? asId(match[1]) : null;
}

export default extractYouTubeId;
