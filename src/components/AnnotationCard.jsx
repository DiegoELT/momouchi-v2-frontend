import { useEffect, useState, useRef } from "react";
import { LABEL_COLORS, LABELS, FLAGS } from "../constants/annotation";

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
  // Flag is independent of the label: at most one, may be null.
  const [flag, setFlag] = useState(caption.flag ?? null);

  // Sync when caption prop changes
  useEffect(() => {
    setText(caption.text ?? "");
    setLabel(caption.label === "Custom" ? "None" : caption.label || "None"); // normalize old Custom values
    setCustomLabel(caption.customLabel || "");
    setComment(caption.comment || "");
    setFlag(caption.flag ?? null);
  }, [caption]);

  // Auto-save caption edits
  useEffect(() => {
    onChange?.({
      ...caption,
      text,
      label,
      customLabel,
      comment,
      flag,
    });
  }, [text, label, customLabel, comment, flag]); // eslint-disable-line

  const handleSeek = () => {
    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    onSeek?.(caption.start);
  };

  const bgColor = LABEL_COLORS[label] || LABEL_COLORS.None;

  const toggleFlag = (value) => {
    // Clicking the active flag clears it — enforces "at most one flag per segment".
    setFlag((prev) => (prev === value ? null : value));
  };

  const copyPreviousLabel = ({ focusNext = false } = {}) => {
    const prev = onCopyPrevious?.(caption.id);
    if (prev) {
      setLabel(prev.label === "Custom" ? "None" : prev.label);
      setCustomLabel("");
    }

    if (!focusNext) return;

    const cards = Array.from(
      document.querySelectorAll('[data-annotation-card="true"]')
    );
    const currentIndex = cards.findIndex(
      (el) => el.getAttribute("data-caption-id") === String(caption.id)
    );
    const nextCard = cards[currentIndex + 1];

    if (nextCard) {
      nextCard.focus();
      nextCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      data-annotation-card="true"
      data-caption-id={String(caption.id)}
      onKeyDown={(e) => {
        const tag = e.target.tagName;
        const isTypingField =
          tag === "TEXTAREA" ||
          tag === "INPUT" ||
          tag === "SELECT" ||
          e.target.isContentEditable;

        if (isTypingField) return;

        if ((e.key === "p" || e.key === "P") && !e.repeat) {
          e.preventDefault();
          copyPreviousLabel({ focusNext: true });
        }
      }}
      className={`border p-2 mb-2 rounded transition-colors ${bgColor} ${
        flag ? "ring-2 ring-amber-500" : ""
      }`}
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

        <div className="flex items-center gap-2">
          {caption.guideline_version && (
            <span
              className="text-[10px] text-gray-500"
              title="Guideline version this annotation was made under"
            >
              v{caption.guideline_version}
            </span>
          )}
          <button
            onClick={() => copyPreviousLabel()}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Same as Previous
          </button>
        </div>
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
        {LABELS.map((lbl) => (
          <option key={lbl} value={lbl}>
            {lbl}
          </option>
        ))}
      </select>

      {/* Flag selector — independent of the label, at most one */}
      <div className="flex items-center gap-1 my-1 flex-wrap">
        <span className="text-[10px] uppercase tracking-wide text-gray-500 mr-1">
          Flag
        </span>
        {FLAGS.map((f) => {
          const active = flag === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => toggleFlag(f.value)}
              title={`${f.value} — ${f.title}`}
              aria-pressed={active}
              className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors ${
                active
                  ? "bg-amber-500 border-amber-600 text-white"
                  : "bg-white/70 border-gray-300 text-gray-600 hover:bg-amber-100"
              }`}
            >
              {f.short}
            </button>
          );
        })}
        {flag && (
          <button
            type="button"
            onClick={() => setFlag(null)}
            className="text-[10px] px-2 py-1 rounded text-gray-500 hover:text-gray-800 underline"
          >
            clear
          </button>
        )}
      </div>

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
