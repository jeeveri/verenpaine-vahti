import { useEffect, useState } from "react";
import { api } from "./services/api";
import MeasurementForm from "./components/MeasurementForm";

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

interface LatestMeasurement {
  measurement_time: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  classification: string;
}

function App() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [summary, setSummary] = useState<Record<string, SummaryItem>>({});
  const [latest, setLatest] = useState<Record<string, LatestMeasurement>>({});
  const [selectedUser, setSelectedUser] =  useState("");

  const handleUserChange = (
    user: string
  ) => {
    setSelectedUser(user);
    localStorage.setItem(
      "selectedUser",
      user
    );
  };

  // 1. LocalStorage: Load the selected user from local storage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    if (savedUser) {
      setSelectedUser(savedUser);
    }
  }, []);

  // 2. API Calls: Fetch statistics, summary, and latest measurements on component mount
  useEffect(() => {
    api.get("/api/statistics")
      .then((response) => {
        setStats(response.data);
      });

    api.get("/api/statistics/summary")
      .then((response) => {
        setSummary(response.data);
      });
    
    api.get("/api/statistics/latest")
    .then((response) => {
      setLatest(response.data);
    });

  }, []);

  if (!stats) {
    return <div>Ladataan...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>

      <h2>Näytä tiedot</h2>
      <label>
        <input
          type="radio"
          checked={selectedUser === "Kaikki"}
          onChange={() =>
            handleUserChange("Kaikki")
          }
        />
        Kaikki
      </label>

      <label>
        <input
          type="radio"
          checked={selectedUser === "Jesperi"}
          onChange={() =>
            handleUserChange("Jesperi")
          }
        />
        Jesperi
      </label>

      <label>
        <input
          type="radio"
          checked={selectedUser === "Terhi"}
          onChange={() =>
            handleUserChange("Terhi")
          }
        />
        Terhi
      </label>

      <h1>Verenpaine-vahti</h1>

      <MeasurementForm selectedUser={selectedUser}/>

      <h2>Yhteenveto</h2>

      <p>
        Mittauksia yhteensä: {stats.total_measurements}
      </p>

      <h3>Henkilöt</h3>

      <ul>
        {stats.persons
         .filter(person =>
           selectedUser === "Kaikki" ||
            selectedUser === person
          )        
        .map(person => (
          <li key={person}>
            {person}: {stats.measurements_by_person[person]} mittausta
          </li>
        ))}
      </ul>
    
      <h2>Keskiarvot</h2>
      {
        Object.entries(summary)
        .filter(([person]) =>
          selectedUser === "Kaikki" ||
          selectedUser === person
        )
        .map(
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

      <h2>Viimeisimmät mittaukset</h2>
        {
          Object.entries(latest)
          .filter(([person]) =>
            selectedUser === "Kaikki" ||
            selectedUser === person
          )
          .map(
            ([person, data]) => (
              <div key={person}>
                <h3>{person}</h3>

                <p>
                  {data.systolic} / {data.diastolic}
                </p>

                <p>
                  Pulssi: {data.pulse}
                </p>

                <p>
                  Luokitus: {data.classification}
                </p>

                <p>
                  {new Date(data.measurement_time)
                    .toLocaleDateString("fi-FI")}
                </p>

              </div>
            )
          )
        }
    </div>
  );
}

export default App;