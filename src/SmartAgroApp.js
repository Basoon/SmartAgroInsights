import React, { useState } from "react";
import Papa from "papaparse";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function SmartAgroApp() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [keys, setKeys] = useState([]);
  const [report, setReport] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data;
        setData(parsed);
        const detectedKeys = Object.keys(parsed[0] || {});
        setKeys(detectedKeys);
        setSummary(`Wczytano ${parsed.length} rekordów. Dostępne kolumny: ${detectedKeys.join(", ")}`);
      },
    });
  };

  const generateRecommendations = () => {
    if (data.length === 0) return;

    const avgHumidity = data.reduce((acc, row) => acc + parseFloat(row["Wilgotność (%)"] || 0), 0) / data.length;
    const avgYield = data.reduce((acc, row) => acc + parseFloat(row["Wydajność (kg/h)"] || 0), 0) / data.length;
    const fields = [...new Set(data.map(row => row["Pole"]))];
    const crops = [...new Set(data.map(row => row["Rodzaj zasiewu"]))];
    const fertilizers = [...new Set(data.map(row => row["Nawożenie"]))];
    const soils = [...new Set(data.map(row => row["Typ gleby"]))];
    const failuresTotal = data.reduce((acc, row) => acc + parseInt(row["Liczba awarii"] || 0), 0);
    const downtimesTotal = data.reduce((acc, row) => acc + parseInt(row["Czas przestoju (min)"] || 0), 0);

    let msg = "📊 Szczegółowy raport AI:

";

    msg += `🔹 Średnia wilgotność gleby: ${avgHumidity.toFixed(1)}%
`;
    msg += `🔹 Średnia wydajność: ${avgYield.toFixed(1)} kg/h
`;
    msg += `🔹 Liczba pól w gospodarstwie: ${fields.length} (${fields.join(", ")})
`;
    msg += `🔹 Rodzaje zasiewów: ${crops.join(", ")}
`;
    msg += `🔹 Typy gleby: ${soils.join(", ")}
`;
    msg += `🔹 Typy nawożenia: ${fertilizers.join(", ")}
`;
    msg += `🔹 Łączny czas przestojów: ${downtimesTotal} min
`;
    msg += `🔹 Suma awarii: ${failuresTotal} zdarzeń

`;

    msg += "✅ Rekomendacje zagospodarowania gleby:
";
    if (avgHumidity > 75) {
      msg += "- Gleba zbyt wilgotna – ogranicz nawadnianie i monitoruj drenaż.
";
    } else if (avgHumidity < 65) {
      msg += "- Niska wilgotność – rozważ dodatkowe nawadnianie lub ściółkowanie.
";
    }

    if (avgYield < 1200) {
      msg += "- Niska wydajność – sprawdź skuteczność nawożenia i jakość gleby.
";
    }

    if (failuresTotal > 5 || downtimesTotal > 100) {
      msg += "- Duża liczba awarii i przestojów – zalecany przegląd maszyn i szkolenie personelu.
";
    }

    msg += "\n📈 Analiza rynkowa:
";
    msg += "- W sezonie 2025 zwiększa się zapotrzebowanie na rzepak i pszenicę – korzystne zmiany zasiewu.
";
    msg += "- Ceny nawozów azotowych wzrosły – rozważ zmianę na kompost lub fosforowe.
";

    msg += "\n📌 Wskazówki dla przyszłych działań:
";
    msg += "- Planuj płodozmian między polami.
";
    msg += "- Wykonuj analizę gleby co 3 miesiące.
";
    msg += "- Ustal harmonogram nawożenia względem prognoz pogodowych.
";

    setReport(msg);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">SmartAgro Insights – Demo</Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Inteligentna analiza danych rolniczych na podstawie pliku CSV
        </Typography>
        <Typography variant="h6">1. Wgraj plik CSV</Typography>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <Typography mt={2}>{summary}</Typography>
      </Box>

      {data.length > 0 && (
        <>
          <Box mb={4}>
            <Typography variant="h6">2. Wybierz dane do wykresu</Typography>
            <FormControl sx={{ mr: 2, minWidth: 160 }}>
              <InputLabel>Oś X</InputLabel>
              <Select value={xKey} onChange={(e) => setXKey(e.target.value)} label="Oś X">
                {keys.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Oś Y</InputLabel>
              <Select value={yKey} onChange={(e) => setYKey(e.target.value)} label="Oś Y">
                {keys.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {xKey && yKey && (
            <Box mb={5}>
              <Typography variant="h6">3. Wykres danych</Typography>
              <LineChart width={800} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yKey} stroke="#2e7d32" />
              </LineChart>
            </Box>
          )}

          <Box mb={5}>
            <Typography variant="h6">4. Rekomendacje AI</Typography>
            <Button variant="contained" onClick={generateRecommendations} sx={{ mt: 1 }}>
              Generuj raport
            </Button>
            {report && (
              <Paper elevation={3} sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {report}
                </Typography>
              </Paper>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
