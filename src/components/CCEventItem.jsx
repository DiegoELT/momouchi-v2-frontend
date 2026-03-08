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
const TEAM_COLORS = {
  Blue: "bg-blue-100 border-blue-400 text-blue-900",
  Red: "bg-red-100 border-red-400 text-red-900",
};

const NEUTRAL = "bg-gray-100 border-gray-400 text-gray-900";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CCEventItem({ event, onEdit, onDelete }) {
  const colorClass = TEAM_COLORS[event.team] || NEUTRAL;

  function renderTitle() {
    if (event.type === "KILL") {
      if (event.killer && event.victim) {
        return (
          <>
            <span className="font-semibold">{event.killer}</span>
            {" "}slays{" "}
            <span className="font-semibold">{event.victim}</span>
          </>
        );
      }

      // fallback if players unknown
      return (
        <span className="font-semibold">
          {event.team} Team Kill
        </span>
      );
    }

    if (event.type === "OBJECTIVE") {
      return (
        <>
          <span className="font-semibold">{event.team}</span>
          {" "}secures{" "}
          <span className="font-semibold">{event.objective}</span>
        </>
      );
    }

    return "Event";
  }

  return (
    <div className={`border rounded p-2 mb-2 ${colorClass}`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="text-sm font-medium">
            {renderTitle()}
            <span className="ml-2 text-xs opacity-70">
              — {formatTime(event.time)}
            </span>
          </div>

          {event.description && (
            <div className="text-xs mt-1 opacity-80">
              {event.description}
            </div>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            className="px-2 py-1 text-xs bg-white/60 rounded"
            onClick={() => onEdit(event)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-xs bg-red-600 text-white rounded"
            onClick={() => onDelete(event.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
