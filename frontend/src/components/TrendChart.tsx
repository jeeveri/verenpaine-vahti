import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface Measurement {
  id: number;
  measurement_time: string;
  person: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  note: string;
}

type TrendChartProps = {
  measurements: Measurement[];
};

function TrendChart({
  measurements
}: TrendChartProps) {

  const chartData = measurements
    .slice()
    .reverse()
    .map((measurement) => ({
      date: new Date(
        measurement.measurement_time
      ).toLocaleDateString("fi-FI"),
      systolic: measurement.systolic,
      diastolic: measurement.diastolic,
      pulse: measurement.pulse,
    }));

  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="date" />

        <YAxis />

        <Tooltip />

        <Legend />

        <Line
          type="monotone"
          dataKey="systolic"
          stroke="#ff0000"
          name="SYS"
        />

        <Line
          type="monotone"
          dataKey="diastolic"
          stroke="#0000ff"
          name="DIA"
        />

        <Line
          type="monotone"
          dataKey="pulse"
          stroke="#00aa00"
          name="Pulssi"
        />

      </LineChart>
    </ResponsiveContainer>
  );
}

export default TrendChart;