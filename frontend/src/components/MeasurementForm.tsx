import { useState } from "react";
import { api } from "../services/api";

type MeasurementFormProps = {
  selectedUser: string;
};

function MeasurementForm({
  selectedUser,
}: MeasurementFormProps) {

  const now = new Date();

  const [person, setPerson] = useState(
    selectedUser === "Kaikki"
      ? ""
      : selectedUser
  );

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const [allowTimeEdit, setAllowTimeEdit] =
    useState(false);

  const handleSave = async () => {
    if (!person) {
        setMessage("Valitse mittaaja");
        return;
    }

    try {

        await api.post(
        "/api/measurements",
        {
            person: person,
            measurement_time:
            new Date().toISOString(),

            systolic: Number(systolic),
            diastolic: Number(diastolic),
            pulse: Number(pulse),
            note: note
        }
        );

        setMessage(
        "Mittaus tallennettu onnistuneesti"
        );

        setSystolic("");
        setDiastolic("");
        setPulse("");
        setNote("");

    } catch {

        setMessage(
        "Tallennus epäonnistui"
        );
    }
    };

  return (
    <div>

      <h2>Uusi mittaus</h2>

      <h3>Mittaaja</h3>

      <label>
        <input
          type="radio"
          value="Jesperi"
          checked={person === "Jesperi"}
          onChange={() =>
            setPerson("Jesperi")
          }
        />
        Jesperi
      </label>

      <label style={{ marginLeft: "1rem" }}>
        <input
          type="radio"
          value="Terhi"
          checked={person === "Terhi"}
          onChange={() =>
            setPerson("Terhi")
          }
        />
        Terhi
      </label>

      <h3>Mittausaika</h3>

      <p>
        {now.toLocaleDateString("fi-FI")}
        {" "}
        {now.toLocaleTimeString("fi-FI")}
      </p>

      <button
        onClick={() =>
          setAllowTimeEdit(!allowTimeEdit)
        }
      >
        Muokkaa aikaa
      </button>

      {allowTimeEdit && (
        <p>
          Ajan muokkaus toteutetaan
          seuraavassa vaiheessa.
        </p>
      )}

      <h3>SYS</h3>

      <input
        type="number"
        value={systolic}
        onChange={(e) =>
          setSystolic(e.target.value)
        }
      />

      <h3>DIA</h3>

      <input
        type="number"
        value={diastolic}
        onChange={(e) =>
          setDiastolic(e.target.value)
        }
      />

      <h3>Pulssi</h3>

      <input
        type="number"
        value={pulse}
        onChange={(e) =>
          setPulse(e.target.value)
        }
      />

      <h3>Huomio</h3>

      <textarea
        value={note}
        onChange={(e) =>
          setNote(e.target.value)
        }
      />

      <br />
      <br />

      <button
        onClick={handleSave}
        >
        Tallenna mittaus
      </button>
        
        {message && (
            <p>
                {message}
            </p>
        )}
        
    </div>
  );
}

export default MeasurementForm;