// src/components/MatchInfo.jsx

const ROLE_ORDER = ["Top", "Jungle", "Mid", "Bot", "Support"];

function sortByRole(players) {
  return [...players].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
  );
}

export default function MatchInfo({ matches }) {
  const list = matches == null ? [] : Array.isArray(matches) ? matches : [matches];
  if (list.length === 0) return null;

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50 w-full max-w-3xl">
      <h2 className="text-xl font-bold mb-4">Match Information</h2>

      {list.map((m, idx) => {
        const t1 = sortByRole(m.team1?.players || []);
        const t2 = sortByRole(m.team2?.players || []);

        return (
          <div key={idx} className="mb-6 pb-4 border-b last:border-0">
            {/* Header */}
            <p className="text-lg">
              <span className="font-semibold">{m.team1?.team_name || "Team 1"}</span>{" "}
              <span className="text-base">[{m.team1score || 0}]</span>
              {" - "}
              <span className="text-base">[{m.team2score || 0}]</span>{" "}
              <span className="font-semibold">{m.team2?.team_name || "Team 2"}</span>
            </p>

            <p className="text-sm text-gray-600 mb-2">
              Tournament: <strong>{m.tournament || "Unknown"}</strong>{" "}
              {m.tournament_start && m.tournament_end && (
                <span className="text-xs text-gray-500">
                  ({m.tournament_start} — {m.tournament_end})
                </span>
              )}
            </p>

            <p className="text-xs text-blue-600 mb-4">
              Overview page: {m.overviewpage || "-"}
            </p>

            <p className="font-semibold text-lg mb-2">
              Scoreboard
            </p>

            {/* MIRRORED SCOREBOARD */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-center">
                <thead>
                  <tr className="bg-gray-200">
                    {/* Team 1 */}
                    <th className="border px-2 py-1">{m.team1?.team_name || "Team 1"}</th>
                    <th className="border px-2 py-1">Champion</th>
                    <th className="border px-2 py-1">K</th>
                    <th className="border px-2 py-1">D</th>
                    <th className="border px-2 py-1">A</th>

                    {/* Role */}
                    <th className="border px-2 py-1 bg-gray-300 font-semibold">Role</th>

                    {/* Team 2 */}
                    <th className="border px-2 py-1">K</th>
                    <th className="border px-2 py-1">D</th>
                    <th className="border px-2 py-1">A</th>
                    <th className="border px-2 py-1">Champion</th>
                    <th className="border px-2 py-1">{m.team2?.team_name || "Team 2"}</th>
                  </tr>
                </thead>

                <tbody>
                  {ROLE_ORDER.map((role) => {
                    const p1 = t1.find((p) => p.role === role);
                    const p2 = t2.find((p) => p.role === role);

                    return (
                      <tr key={role} className="bg-white">
                        {/* Team 1 side */}
                        <td className="border px-2 py-1">{p1?.name || "-"}</td>
                        <td className="border px-2 py-1">{p1?.champion || "-"}</td>
                        <td className="border px-2 py-1">{p1?.kills ?? "-"}</td>
                        <td className="border px-2 py-1">{p1?.deaths ?? "-"}</td>
                        <td className="border px-2 py-1">{p1?.assists ?? "-"}</td>

                        {/* Role in the middle */}
                        <td className="border px-2 py-1 font-semibold bg-gray-100">
                          {role}
                        </td>

                        {/* Team 2 side */}
                        <td className="border px-2 py-1">{p2?.kills ?? "-"}</td>
                        <td className="border px-2 py-1">{p2?.deaths ?? "-"}</td>
                        <td className="border px-2 py-1">{p2?.assists ?? "-"}</td>
                        <td className="border px-2 py-1">{p2?.champion || "-"}</td>
                        <td className="border px-2 py-1">{p2?.name || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
