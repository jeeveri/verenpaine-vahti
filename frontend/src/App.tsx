import { useEffect, useState } from "react";
import { api } from "./services/api";

function App() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    api.get("/api/health")
      .then((response) => {
        setStatus(response.data.status);
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  return (
    <>
      <h1>Verenpaine-vahti</h1>
      <p>Backend status: {status}</p>
    </>
  );
}

export default App;