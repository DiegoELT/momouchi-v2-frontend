import { useEffect, useState, useRef } from "react";

const LABEL_COLORS = {
  "Play by Play": "bg-blue-100",
  "Storytelling": "bg-pink-100",
  "Game Analysis": "bg-green-100",
  "Meta Analysis": "bg-lime-100",
  "Hype": "bg-yellow-100",
  "Jokes / Humor": "bg-teal-100",
  "Personal": "bg-orange-100",
  "Audience Interaction": "bg-indigo-100",
  "Replay": "bg-red-100",
  "Technical / Filler": "bg-gray-100",
  "Custom": "bg-purple-100",
  "None": "bg-gray-50",
};

export default function AnnotationCard({ caption, onChange, onSeek, onCopyPrevious }) {
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

  const handleCopyPrevious = () => {
    if (onCopyPrevious) {
      const prev = onCopyPrevious(caption.id);
      if (prev) {
        setLabel(prev.label);
        setCustomLabel(prev.customLabel || "");
      }
    }
  };

  const bgColor = LABEL_COLORS[label] || LABEL_COLORS["None"];

  return (
    <div ref={cardRef} className={`border p-2 mb-2 rounded transition-colors ${bgColor}`}>
      <div className="flex justify-between items-center">
        <p
          onClick={handleTimeClick}
          className="text-sm text-blue-600 cursor-pointer font-medium hover:underline"
        >
          {Number(caption.start).toFixed(1)}s →{" "}
          {Number(caption.start + caption.duration).toFixed(1)}s
        </p>
        <button
          onClick={handleCopyPrevious}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          Same as Previous
        </button>
      </div>

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
        <option value="Game Analysis">Game Analysis</option>
        <option value="Meta Analysis">Meta Analysis</option>
        <option value="Hype">Hype</option>
        <option value="Jokes / Humor">Jokes / Humor</option>
        <option value="Personal">Personal</option>
        <option value="Audience Interaction">Audience Interaction</option>
        <option value="Replay">Replay</option>
        <option value="Technical / Filler">Technical / Filler</option>
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
