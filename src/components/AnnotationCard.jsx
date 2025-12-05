import { useEffect, useState, useRef } from "react";
import CCEventItem from "./CCEventItem";
import { COLOR_MAP } from "./CCEventItem";

const LABEL_COLORS = {
  "Play by Play": "bg-blue-100",
  "Storytelling": "bg-pink-100",
  "Analysis": "bg-green-100",
  "Hype": "bg-yellow-100",
  "Jokes / Humor": "bg-teal-100",
  "Personal": "bg-orange-100",
  "Audience Interaction": "bg-indigo-100",
  "Replay": "bg-red-100",
  "Technical / Filler": "bg-gray-100",
  "Custom": "bg-purple-100",
  "None": "bg-gray-50",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AnnotationCard({
  caption,
  isEvent = false,
  onChange,
  onSeek,
  onCopyPrevious,
  onDelete,
}) {
  const cardRef = useRef(null);

  // ---- Caption state ----
  const [text, setText] = useState(caption.text ?? caption.caption ?? "");
  const [label, setLabel] = useState(caption.label || "None");
  const [customLabel, setCustomLabel] = useState(caption.customLabel || "");
  const [comment, setComment] = useState(caption.comment || "");

  // ---- Event state ----
  const [editingEvent, setEditingEvent] = useState(false);
  const [eventType, setEventType] = useState(
    caption.eventType || caption.event || "Fight"
  );
  const [description, setDescription] = useState(
    caption.description || caption.desc || ""
  );

  useEffect(() => {
    setText(caption.text ?? caption.caption ?? "");
    setLabel(caption.label || "None");
    setCustomLabel(caption.customLabel || "");
    setComment(caption.comment || "");

    setEventType(caption.eventType || caption.event || "Fight");
    setDescription(caption.description || caption.desc || "");
  }, [caption]);

  // ---- Caption auto-save to parent ----
  useEffect(() => {
    if (!isEvent) {
      onChange &&
        onChange({
          ...caption,
          text,
          label,
          customLabel,
          comment,
        });
    }
  }, [text, label, customLabel, comment]); // eslint-disable-line

  // ---- Save event edits (manual save only) ----
  const saveEventEdits = () => {
    onChange &&
      onChange({
        ...caption,
        time: caption.time ?? caption.start,
        eventType,
        description,
        id: caption.id,
      });

    setEditingEvent(false);
  };

  const handleSeek = () => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    onSeek?.(caption.start ?? caption.time);
  };

  if (isEvent) {
    return (
      <div ref={cardRef}>
        {!editingEvent ? (
          <CCEventItem
            event={{
              id: caption.id,
              eventType,
              description,
              time: caption.time ?? caption.start,
            }}
            onEdit={() => setEditingEvent(true)}
            onDelete={onDelete}
          />
        ) : (
          <div className={`border rounded mb-2 p-3 ${COLOR_MAP[eventType]} text-black`}>
            <div className="font-semibold">Edit Event</div>

            <div className="mt-2 space-y-2">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-1 rounded text-black border"
              >
                <option>Dragon</option>
                <option>Tower</option>
                <option>Grubs</option>
                <option>Herald</option>
                <option>Baron</option>
                <option>Fight</option>
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-1 rounded text-black border font-mono text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2 mt-3">
              <button
                className="px-2 py-1 text-xs bg-gray-600 rounded text-white"
                onClick={() => {
                  setEditingEvent(false);
                  setEventType(caption.eventType || caption.event || "Fight");
                  setDescription(caption.description || caption.desc || "");
                }}
              >
                Cancel
              </button>

              <button
                className="px-2 py-1 text-xs bg-green-600 rounded text-white"
                onClick={saveEventEdits}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const bgColor = LABEL_COLORS[label] || LABEL_COLORS["None"];

  return (
    <div
      ref={cardRef}
      className={`border p-2 mb-2 rounded transition-colors ${bgColor}`}
    >
      <div className="flex justify-between items-center">
        <p
          onClick={handleSeek}
          className="text-sm text-blue-600 cursor-pointer font-medium hover:underline"
        >
          {Number(caption.start).toFixed(1)}s →{" "}
          {Number(caption.start + caption.duration).toFixed(1)}s
        </p>

        <button
          onClick={() => {
            const prev = onCopyPrevious?.(caption.id);
            if (prev) {
              setLabel(prev.label);
              setCustomLabel(prev.customLabel || "");
            }
          }}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          Same as Previous
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-1 my-1 rounded bg-white font-mono text-xs"
      />

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
