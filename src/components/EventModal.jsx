import { useState } from "react";

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  currentTime
}) {
  if (!isOpen) return null;

  const EVENT_TYPES = [
    "Dragon",
    "Tower",
    "Grubs",
    "Herald",
    "Baron",
    "Fight"
  ];

  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [description, setDescription] = useState("");

  function handleSubmit() {
    onSave({
      id: crypto.randomUUID(),
      time: currentTime,
      eventType,
      description
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-xl w-80">
        <h2 className="text-lg font-bold mb-2">Add Event</h2>

        <label className="block mb-2">
          <span className="text-sm">Event Type:</span>
          <select
            className="border p-2 w-full rounded mt-1"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {EVENT_TYPES.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </label>

        <label className="block mb-2">
          <span className="text-sm">Description (optional):</span>
          <textarea
            className="border p-2 w-full rounded mt-1 font-mono"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="flex justify-end mt-4 gap-2">
          <button className="px-3 py-1" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleSubmit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
