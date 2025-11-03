import { useEffect, useState, useRef } from "react";

const LABEL_COLORS = {
  "Play by Play": "bg-blue-100",
  "Storytelling": "bg-pink-100",
  "Analysis": "bg-green-100",
  "Hype / Reaction": "bg-yellow-100",
  Custom: "bg-purple-100",
  None: "bg-gray-50",
};

export default function AnnotationCard({ caption, onChange, onSeek }) {
  const cardRef = useRef(null);
  const [text, setText] = useState(caption.text);
  const [label, setLabel] = useState(caption.label || "None");
  const [customLabel, setCustomLabel] = useState(caption.customLabel || "");
  const [comment, setComment] = useState(caption.comment || "");

  // 🧠 Sync local state when new captions are loaded
  useEffect(() => {
    setText(caption.text);
    setLabel(caption.label || "None");
    setCustomLabel(caption.customLabel || "");
    setComment(caption.comment || "");
  }, [caption]);

  // 🔄 Notify parent when user edits anything
  useEffect(() => {
    onChange({
      ...caption,
      text,
      label,
      customLabel,
      comment,
    });
  }, [text, label, customLabel, comment]);

  const handleTimeClick = () => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (onSeek) onSeek(caption.start);
  };

  const handleLabelChange = (e) => {
    const selected = e.target.value;
    setLabel(selected);
    if (selected !== "Custom") setCustomLabel("");
  };

  const bgColor = LABEL_COLORS[label] || LABEL_COLORS["None"];

  return (
    <div ref={cardRef} className={`border p-2 mb-2 rounded transition-colors ${bgColor}`}>
      <p
        onClick={handleTimeClick}
        className="text-sm text-blue-600 cursor-pointer font-medium hover:underline"
      >
        {Number(caption.start).toFixed(1)}s →{" "}
        {Number(caption.start + caption.duration).toFixed(1)}s
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-1 my-1 rounded bg-white"
      />

      <select
        value={label}
        onChange={handleLabelChange}
        className="w-full border p-1 my-1 rounded"
      >
        <option value="None">No Label</option>
        <option value="Play by Play">Play by Play</option>
        <option value="Storytelling">Storytelling</option>
        <option value="Analysis">Analysis</option>
        <option value="Hype / Reaction">Hype / Reaction</option>
        <option value="Custom">Custom...</option>
      </select>

      {label === "Custom" && (
        <input
          type="text"
          placeholder="Enter custom label"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          className="w-full border p-1 my-1 rounded"
        />
      )}

      <textarea
        placeholder="Comments..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border p-1 my-1 rounded bg-white"
      />
    </div>
  );
}
