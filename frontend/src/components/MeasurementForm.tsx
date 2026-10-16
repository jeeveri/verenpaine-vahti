import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useRef } from "react";

type MeasurementFormProps = {
  selectedUser: string;
  onMeasurementSaved: () => void;
};

function MeasurementForm({
  selectedUser,
  onMeasurementSaved,
}: MeasurementFormProps) {

  const now = new Date();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [allowTimeEdit, setAllowTimeEdit] = useState(false);
  const systolicRef = useRef<HTMLInputElement>(null);

  const [measurementDate, setMeasurementDate] = useState(
    now.toISOString().split("T")[0]
  );
  const [measurementTime, setMeasurementTime] = useState(
    now.toTimeString().slice(0, 5)
  );

  const handleSave = async () => {
    
    // Validate required fields
    if (
      !systolic ||
      !diastolic ||
      !pulse
    ) {
      setMessage(
        "Täytä SYS, DIA ja Pulssi"
      );
      return;
    }

    
    const sys = Number(systolic);
    const dia = Number(diastolic);
    const pul = Number(pulse);

    // Validate ranges
    if (sys < 50 || sys > 300) {
      setMessage(
        "SYS tulee olla välillä 50-300"
      );
      return;
    }
    if (dia < 30 || dia > 200) {
      setMessage(
        "DIA tulee olla välillä 30-200"
      );
      return;
    }
    if (pul < 20 || pul > 250) {
      setMessage(
        "Pulssin tulee olla välillä 20-250"
      );
      return;
    }

    try {

        await api.post(
        "/api/measurements",
        {
            person: selectedUser,
            measurement_time:
            new Date(
              `${measurementDate}T${measurementTime}`
            ).toISOString(),

            systolic: Number(systolic),
            diastolic: Number(diastolic),
            pulse: Number(pulse),
            note: note
        }
        );

        setMessage(
        "Mittaus tallennettu onnistuneesti"
        );

        setTimeout(() => {
          setMessage("");
        }, 3000);

        onMeasurementSaved();

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

  useEffect(() => {
  systolicRef.current?.focus();

}, []);


  return (
    <div>

      <h2>Uusi mittaus</h2>

     <h3>Käyttäjä</h3>
     <strong>
      {selectedUser}
      </strong>

      <h3>Mittausaika</h3>

      <p>
        {
        new Date(
          `${measurementDate}T${measurementTime}`
        ).toLocaleString("fi-FI")
        }
      </p>

      <button
      onClick={() =>
        setAllowTimeEdit(
          !allowTimeEdit
        )
        }
        >
          {
          allowTimeEdit
          ? "Piilota ajan muokkaus"
          : "Muokkaa aikaa"
          }
          </button>

      {allowTimeEdit && (
        <div>
          
          <p>Päivämäärä</p>
          <input
          type="date"
          value={measurementDate}
          onChange={(e) =>
            setMeasurementDate(
              e.target.value
            )
          }
          />

          <p>Kellonaika</p>
          <input
          type="time"
          value={measurementTime}
          onChange={(e) =>
            setMeasurementTime(
              e.target.value
            )
          }
          />
          </div>
        )
        }

      <h3>SYS</h3>

      <input
        type="number"
        min="50"
        max="300"
        value={systolic}
        onChange={(e) =>
          setSystolic(e.target.value)
        }
        ref={systolicRef}
      />

      <h3>DIA</h3>

      <input
        type="number"
        min="30"
        max="200"
        value={diastolic}
        onChange={(e) =>
          setDiastolic(e.target.value)
        }
      />

      <h3>Pulssi</h3>

      <input
        type="number"
        min="20"
        max="250"
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

