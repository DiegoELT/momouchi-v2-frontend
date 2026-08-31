import { useState } from "react";

const OBJECTIVES = ["Tower", "Dragon", "Baron", "Herald", "Grubs", "Atakhan"];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  currentTime,
  matchInfo, // ← optional, pass null if unavailable
}) {
  const [eventCategory, setEventCategory] = useState("KILL");
  const [team, setTeam] = useState("");
  const [objective, setObjective] = useState("Dragon");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const match = Array.isArray(matchInfo) ? matchInfo[0] : matchInfo;

  const team1Name = match?.team1?.team_name || "Blue";
  const team2Name = match?.team2?.team_name || "Red";
  const allTeams = [team1Name, team2Name];

  const selectedTeam = team || allTeams[0];
  const side = selectedTeam === allTeams[1] ? "red" : "blue";

  function handleSubmit() {
    const base = {
      id: crypto.randomUUID(),
      time: Number(Number(currentTime).toFixed(2)),
      type: eventCategory,
      team: selectedTeam,
      side,
      description,
    };

    // Kills are recorded at team level (one credited team), the same granularity
    // as neutral objectives. Player-on-player detail is deliberately not logged.
    if (eventCategory === "KILL") {
      onSave(base);
    }

    if (eventCategory === "OBJECTIVE") {
      onSave({ ...base, objective });
    }

    setDescription("");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-xl w-96">
        <h2 className="text-lg font-bold mb-4">Add Event</h2>

        {/* Event Category */}
        <label className="block mb-3">
          <span className="text-sm">Event Type</span>
          <select
            className="border p-2 w-full rounded mt-1"
            value={eventCategory}
            onChange={(e) => setEventCategory(e.target.value)}
          >
            <option value="KILL">Kill</option>
            <option value="OBJECTIVE">Objective</option>
          </select>
        </label>

        {/* Objective picker (objectives only) */}
        {eventCategory === "OBJECTIVE" && (
          <label className="block mb-2">
            <span className="text-sm">Objective</span>
            <select
              className="border p-2 w-full rounded mt-1"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            >
              {OBJECTIVES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        )}

        {/* Team — used by both kills and objectives */}
        <label className="block mb-2">
          <span className="text-sm">
            {eventCategory === "KILL" ? "Team that got the kill" : "Team"}
          </span>
          <select
            className="border p-2 w-full rounded mt-1"
            value={selectedTeam}
            onChange={(e) => setTeam(e.target.value)}
          >
            {allTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {/* Description */}
        <label className="block mb-3">
          <span className="text-sm">Description (optional)</span>
          <textarea
            className="border p-2 w-full rounded mt-1"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={handleSubmit}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
