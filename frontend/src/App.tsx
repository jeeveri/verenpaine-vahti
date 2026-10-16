import { useEffect, useState } from "react";
import { api } from "./services/api";

interface Statistics {
  total_measurements: number;
  persons: string[];
  measurements_by_person: Record<string, number>;
}

interface SummaryItem {
  measurement_count: number;
  avg_systolic: number;
  avg_diastolic: number;
  avg_pulse: number;
}

function App() {
  const [stats, setStats] = useState<Statistics | null>(null);
  //const [summary, setSummary] = useState<Record<string, SummaryItem> | null>(null);
  const [summary, setSummary] = useState<Record<string, SummaryItem>>({});

  useEffect(() => {
  api.get("/api/statistics")
    .then((response) => {
      setStats(response.data);
    });

  api.get("/api/statistics/summary")
    .then((response) => {
      setSummary(response.data);
    });

}, []);

  if (!stats) {
    return <div>Ladataan...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Verenpaine-vahti</h1>

      <h2>Yhteenveto</h2>

      <p>
        Mittauksia yhteensä: {stats.total_measurements}
      </p>

      <h3>Henkilöt</h3>

      <ul>
        {stats.persons.map(person => (
          <li key={person}>
            {person}: {stats.measurements_by_person[person]} mittausta
          </li>
        ))}
      </ul>

      <h2>Keskiarvot</h2>
      {
        Object.entries(summary).map(
          ([person, data]) => (
            <div key={person}>
              <h3>{person}</h3>

              <p>
                Mittauksia: {data.measurement_count}
              </p>

              <p>
                Keski SYS: {data.avg_systolic}
              </p>

              <p>
                Keski DIA: {data.avg_diastolic}
              </p>

              <p>
                Keski Pulssi: {data.avg_pulse}
              </p>
            </div>
          )
        )
      }
    </div>
  );
}

export default App;