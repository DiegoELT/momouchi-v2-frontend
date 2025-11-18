import AnnotationCard from "./AnnotationCard";

export default function CCList({ captions, onSeek, onUpdate }) {
  const handleChange = (updatedCaption) => {
    onUpdate(updatedCaption);
  };

  // Helper for “Same as Previous” button
  const handleCopyPrevious = (currentId) => {
    const idx = captions.findIndex((cap) => cap.id === currentId);
    if (idx > 0) {
      const prev = captions[idx - 1];
      return { label: prev.label, customLabel: prev.customLabel };
    }
    return null;
  };

  if (!captions.length) return <p>No captions loaded.</p>;

  return (
    <div key={captions.length} className="space-y-2">
      {captions.map((cap, idx) => (
        <AnnotationCard
          key={cap.id || `${idx}-${cap.start}-${cap.text?.slice(0, 5)}`}
          caption={{ ...cap, id: cap.id || idx }}
          onSeek={onSeek}
          onChange={handleChange}
          onCopyPrevious={handleCopyPrevious}
        />
      ))}
    </div>
  );
}
