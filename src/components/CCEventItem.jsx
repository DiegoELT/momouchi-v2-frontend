export const COLOR_MAP = {
  Dragon: "bg-orange-300",
  Tower: "bg-blue-300",
  Grubs: "bg-purple-200",
  Herald: "bg-purple-300",
  Baron: "bg-purple-400",
  Fight: "bg-red-300",
};

// fallback if eventType doesn't match
const DEFAULT_COLOR = "bg-gray-800 border-gray-700 text-gray-300";

export default function CCEventItem({ event, onEdit, onDelete }) {
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  const colorClass = COLOR_MAP[event.eventType] || DEFAULT_COLOR;

  return (
    <div className={`border rounded p-2 mb-2 ${colorClass}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className=" text-black">
            {event.eventType} — {formatTime(event.time)} 
          </div>
          {event.description && (
            <div className="text-sm text-gray-700">{event.description}</div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 text-xs bg-gray-600 rounded text-white"
            onClick={() => onEdit(event)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-xs bg-red-600 rounded text-white"
            onClick={() => onDelete(event.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
