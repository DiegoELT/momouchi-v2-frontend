import AnnotationCard from "./AnnotationCard";

export default function CCList({ captions, onSeek, onUpdate }) {
  const handleChange = (updatedCaption) => {
    onUpdate(updatedCaption);
  };

  if (!captions.length) return <p>No captions loaded.</p>;

  return (
    <div key={captions.length} className="space-y-2">
      {captions.map((cap, idx) => (
        <AnnotationCard
          key={`${idx}-${cap.start}-${cap.text?.slice(0, 5)}`}
          caption={cap}
          onSeek={onSeek}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
