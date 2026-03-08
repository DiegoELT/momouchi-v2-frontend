import { useState } from "react";

const OBJECTIVES = ["Tower", "Dragon", "Baron", "Herald", "Grubs", "Atakhan"];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  currentTime,
  matchInfo // ← optional, pass null if unavailable
}) {
  if (!isOpen) return null;

  const hasPlayers =
    matchInfo &&
    matchInfo.team1?.players?.length &&
    matchInfo.team2?.players?.length;

  const allPlayers = hasPlayers
    ? [
        ...matchInfo.team1.players.map(p => ({
          name: p.name,
          team: "Blue"
        })),
        ...matchInfo.team2.players.map(p => ({
          name: p.name,
          team: "Red"
        }))
      ]
    : [];

  const allTeams = hasPlayers
    ? [matchInfo.team1?.team_name, matchInfo.team2?.team_name]
    : ["Blue", "Red"];

  const [eventCategory, setEventCategory] = useState("KILL");

  // Kill fields
  const [killer, setKiller] = useState("");
  const [victim, setVictim] = useState("");
  const [team, setTeam] = useState("Blue");

  // Objective fields
  const [objective, setObjective] = useState("Dragon");
  const [description, setDescription] = useState("");

  function handleSubmit() { 
    const base = {
      id: crypto.randomUUID(),
      time: currentTime,
      type: eventCategory,
      description
    };

    if (eventCategory === "KILL") {
      onSave({
        ...base,
        killer: hasPlayers ? killer : team,
        victim: hasPlayers ? victim : undefined,
        team: hasPlayers
          ? allPlayers.find(p => p.name === killer)?.team
          : team
      });
    }

    if (eventCategory === "OBJECTIVE") {
      onSave({
        ...base,
        objective,
        team
      });
    }

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

        {/* Kill Event */}
        {eventCategory === "KILL" && (
          <>
            {hasPlayers ? (
              <>
                <label className="block mb-2">
                  <span className="text-sm">Killer</span>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={killer}
                    onChange={(e) => setKiller(e.target.value)}
                  >
                    <option value="">Select player</option>
                    {allPlayers.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.team})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block mb-2">
                  <span className="text-sm">Victim</span>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={victim}
                    onChange={(e) => setVictim(e.target.value)}
                  >
                    <option value="">Select player</option>
                    {allPlayers.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.team})
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <label className="block mb-2">
                <span className="text-sm">Team</span>
                <select
                  className="border p-2 w-full rounded mt-1"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                >
                  <option>{allTeams[0]}</option>
                  <option>{allTeams[1]}</option>
                </select>
              </label>
            )}
          </>
        )}

        {/* Objective Event */}
        {eventCategory === "OBJECTIVE" && (
          <>
            <label className="block mb-2">
              <span className="text-sm">Objective</span>
              <select
                className="border p-2 w-full rounded mt-1"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              >
                {OBJECTIVES.map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>

            <label className="block mb-2">
              <span className="text-sm">Team</span>
              <select
                className="border p-2 w-full rounded mt-1"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              >
                <option>{allTeams[0]}</option>
                <option>{allTeams[1]}</option>
              </select>
            </label>
          </>
        )}

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
