import { useEffect, useState } from "react";
import { api } from "./services/api";
import MeasurementForm from "./components/MeasurementForm";
import TrendChart from "./components/TrendChart";

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

interface Measurement {
  id: number;
  measurement_time: string;
  person: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  note: string;
}

function App() {

  const [stats, setStats] =
    useState<Statistics | null>(null);

  const [summary, setSummary] =
    useState<Record<string, SummaryItem>>({});

  const [latest, setLatest] =
    useState<Record<string, LatestMeasurement>>({});

  const [measurements, setMeasurements] =
    useState<Measurement[]>([]);

  const [selectedUser, setSelectedUser] =
    useState("Jesperi");

  const handleUserChange = (
    user: string
  ) => {

    setSelectedUser(user);

    localStorage.setItem(
      "selectedUser",
      user
    );
  };

  const loadDashboardData = () => {

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

    api.get("/api/measurements")
      .then((response) => {
        setMeasurements(response.data);
      });
  };

  useEffect(() => {

    const savedUser =
      localStorage.getItem("selectedUser");

    if (
      savedUser === "Jesperi" ||
      savedUser === "Terhi"
    ) {
      setSelectedUser(savedUser);
    }

  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (!stats) {
    return <div>Ladataan...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>

      <h1>Verenpaine-vahti</h1>

      <h3>Käyttäjä</h3>

      <select
        value={selectedUser}
        onChange={(e) =>
          handleUserChange(
            e.target.value
          )
        }
      >
        <option value="Jesperi">
          Jesperi
        </option>

        <option value="Terhi">
          Terhi
        </option>
      </select>

      <MeasurementForm
        selectedUser={selectedUser}
        onMeasurementSaved={
          loadDashboardData
        }
      />

      <h2>Yhteenveto</h2>

      <p>
        Mittauksia yhteensä:
        {" "}
        {stats.measurements_by_person[
          selectedUser
        ]}
      </p>

      <h2>Keskiarvot</h2>

      {
        summary[selectedUser] && (
          <div>

            <h3>{selectedUser}</h3>

            <p>
              Mittauksia:
              {" "}
              {
                summary[selectedUser]
                  .measurement_count
              }
            </p>

            <p>
              Keski SYS:
              {" "}
              {
                summary[selectedUser]
                  .avg_systolic
              }
            </p>

            <p>
              Keski DIA:
              {" "}
              {
                summary[selectedUser]
                  .avg_diastolic
              }
            </p>

            <p>
              Keski Pulssi:
              {" "}
              {
                summary[selectedUser]
                  .avg_pulse
              }
            </p>

          </div>
        )
      }

      <h2>Viimeisin mittaus</h2>

      {
        latest[selectedUser] && (
          <div>

            <p>
              {
                latest[selectedUser]
                  .systolic
              }
              {" / "}
              {
                latest[selectedUser]
                  .diastolic
              }
            </p>

            <p>
              Pulssi:
              {" "}
              {
                latest[selectedUser]
                  .pulse
              }
            </p>

            <p>
              Luokitus:
              {" "}
              {
                latest[selectedUser]
                  .classification
              }
            </p>

            <p>
              {
                new Date(
                  latest[selectedUser]
                    .measurement_time
                ).toLocaleDateString(
                  "fi-FI"
                )
              }
            </p>

          </div>
        )
      }

      <h2>Mittaushistoria</h2>

      <table>

        <thead>
          <tr>
            <th>Päivä</th>
            <th>SYS</th>
            <th>DIA</th>
            <th>Pulssi</th>
            <th>Huomio</th>
          </tr>
        </thead>

        <tbody>

          {
            measurements

              .filter(
                measurement =>
                  measurement.person ===
                  selectedUser
              )

              .slice(0, 20)

              .map(
                measurement => (
                  <tr
                    key={measurement.id}
                  >

                    <td>
                      {
                        new Date(
                          measurement.measurement_time
                        ).toLocaleDateString(
                          "fi-FI"
                        )
                      }
                    </td>

                    <td>
                      {
                        measurement.systolic
                      }
                    </td>

                    <td>
                      {
                        measurement.diastolic
                      }
                    </td>

                    <td>
                      {
                        measurement.pulse
                      }
                    </td>

                    <td>
                      {
                        measurement.note
                      }
                    </td>

                  </tr>
                )
              )

          }

        </tbody>

      </table>

      <h2>Trendit</h2>

      <TrendChart
        measurements={
          measurements
            .filter(
              measurement =>
                measurement.person ===
                selectedUser
            )
            .slice(0, 50)
        }
      />

    </div>
  );
}

export default App;