import { useEffect, useState } from "react";
import { api } from "./services/api";

interface Statistics {
  total_measurements: number;
  persons: string[];
  measurements_by_person: Record<string, number>;
}

function App() {
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    api.get("/api/statistics")
      .then((response) => {
        setStats(response.data);
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
    </div>
  );
}

export default App;