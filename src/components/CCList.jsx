// src/components/CCList.jsx
import AnnotationCard from "./AnnotationCard";

export default function CCList({
  captions = [],
  events = [],
  onSeek,
  onUpdate,
  onDeleteEvent,
}) {
  const handleChange = (updatedItem) => {
    // bubble up: parent will decide whether it's a caption or an event based on fields
    onUpdate && onUpdate(updatedItem);
  };

  const handleDelete = (id) => {
    onDeleteEvent && onDeleteEvent(id);
  };

  // Merge and sort by time (captions use `start`, events use `time`)
  const timelineItems = [...captions, ...events].sort((a, b) => {
    const tA = a.start ?? a.time ?? 0;
    const tB = b.start ?? b.time ?? 0;
    return tA - tB;
  });

  if (!timelineItems.length) return <p>No captions or events loaded.</p>;

  return (
    <div className="space-y-2">
      {timelineItems.map((item, idx) => {
        const isEvent = item.time !== undefined && item.time !== null;

        // Normalize props: for a caption we pass it as-is, for an event we also keep `time`
        return (
          <AnnotationCard
            key={item.id ?? `${isEvent ? "evt" : "cap"}-${idx}-${item.start ?? item.time}`}
            caption={{ ...item, id: item.id ?? idx }}
            isEvent={isEvent}
            onSeek={onSeek}
            onChange={handleChange}
            onCopyPrevious={
              // copy previous label is only useful for captions
              (id) => {
                if (!id) return null;
                const idxInCaptions = captions.findIndex((c) => c.id === id);
                if (idxInCaptions > 0) {
                  const prev = captions[idxInCaptions - 1];
                  return { label: prev.label, customLabel: prev.customLabel };
                }
                return null;
              }
            }
            onDelete={isEvent ? handleDelete : undefined}
          />
        );
      })}
    </div>
  );
}
