import AnnotationCard from "./AnnotationCard";
import CCEventItem from "./CCEventItem";

export default function CCList({
  captions = [],
  events = [],
  onSeek,
  onUpdate,
  onDeleteEvent,
  onEditEvent,
}) {
  const sortedCaptions = [...captions].sort(
    (a, b) => (a.start ?? 0) - (b.start ?? 0)
  );

  // Merge & sort timeline
  const timelineItems = [...sortedCaptions, ...events].sort((a, b) => {
    const tA = a.start ?? a.time ?? 0;
    const tB = b.start ?? b.time ?? 0;
    return tA - tB;
  });

  if (!timelineItems.length) {
    return <p>No annotations loaded.</p>;
  }

  return (
    <div className="space-y-2">
      {timelineItems.map((item) => {
        const isEvent = "time" in item;

        if (isEvent) {
          return (
            <CCEventItem
              key={item.id}
              event={item}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
            />
          );
        }

        return (
          <AnnotationCard
            key={item.id}
            caption={item}
            onSeek={onSeek}
            onChange={onUpdate}
            onCopyPrevious={(id) => {
              const idx = sortedCaptions.findIndex(
                (c) => String(c.id) === String(id)
              );
              if (idx > 0) {
                const prev = sortedCaptions[idx - 1];
                return {
                  label: prev.label,
                  customLabel: prev.customLabel,
                };
              }
              return null;
            }}
          />
        );
      })}
    </div>
  );
}