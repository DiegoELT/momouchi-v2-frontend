import { useEffect, useState, useRef } from "react";

const LABEL_COLORS = {
  "Play-by-Play": "bg-blue-100",
  "Strategic Analysis": "bg-green-100",
  "Storytelling": "bg-pink-100",
  "Hype": "bg-yellow-100",
  "Recap": "bg-purple-100",
  // "Custom": "bg-purple-100", Enable for future research.
  "None": "bg-gray-50",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AnnotationCard({
  caption,
  onChange,
  onSeek,
  onCopyPrevious,
}) {
  const cardRef = useRef(null);

  // ---- Caption state ----
  const [text, setText] = useState(caption.text ?? "");
  const [label, setLabel] = useState(caption.label || "None");
  const [customLabel, setCustomLabel] = useState(caption.customLabel || "");
  const [comment, setComment] = useState(caption.comment || "");

  // Sync when caption prop changes
  useEffect(() => {
    setText(caption.text ?? "");
    setLabel(caption.label === "Custom" ? "None" : (caption.label || "None")); // normalize old Custom values
    setCustomLabel(caption.customLabel || "");
    setComment(caption.comment || "");
  }, [caption]);

  // Auto-save caption edits
  useEffect(() => {
    onChange?.({
      ...caption,
      text,
      label,
      customLabel,
      comment,
    });
  }, [text, label, customLabel, comment]); // eslint-disable-line

  const handleSeek = () => {
    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    onSeek?.(caption.start);
  };

  const bgColor = LABEL_COLORS[label] || LABEL_COLORS["None"];

  return (
    <div
      ref={cardRef}
      className={`border p-2 mb-2 rounded transition-colors ${bgColor}`}
    >
      {/* Time + actions */}
      <div className="flex justify-between items-center">
        <p
          onClick={handleSeek}
          className="text-sm text-blue-600 cursor-pointer font-medium hover:underline"
        >
          {formatTime(caption.start)} →{" "}
          {formatTime(caption.start + caption.duration)}
        </p>

        <button
          onClick={() => {
            const prev = onCopyPrevious?.(caption.id);
            if (prev) {
              setLabel(prev.label === "Custom" ? "None" : prev.label); // avoid restoring Custom
              setCustomLabel(""); // keep cleared while Custom is disabled
            }
          }}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          Same as Previous
        </button>
      </div>

      {/* Caption text */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-1 my-1 rounded bg-white font-mono text-xs"
      />

      {/* Label selector */}
      <select
        value={label}
        onChange={(e) => {
          setLabel(e.target.value);
          if (e.target.value !== "Custom") setCustomLabel("");
        }}
        className="w-full border p-1 my-1 rounded"
      >
        {Object.keys(LABEL_COLORS).map((lbl) => (
          <option key={lbl} value={lbl}>
            {lbl}
          </option>
        ))}
      </select>

      {/* Custom label */}
      {/* {label === "Custom" && (
        <input
          type="text"
          placeholder="Enter custom label"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          className="w-full border p-1 my-1 rounded"
        />
      )}*/}

      {/* Comment */}
      <textarea
        placeholder="Comments..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border p-1 my-1 rounded bg-white"
      />
    </div>
  );
}
