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
  TextField,
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

    const highMoisture = data.filter(row => parseFloat(row["Wilgotność (%)"]) > 75).length;
    const lowEfficiency = data.filter(row => parseFloat(row["Wydajność (kg/h)"]) < 1200).length;
    const claySoil = data.filter(row => row["Typ gleby"] === "gliniasta").length;
    const irrigation = data.filter(row => row["Nawadnianie"]?.toLowerCase() === "tak").length;
    const fertilizationNitrogen = data.filter(row => row["Nawożenie"]?.toLowerCase().includes("azot")).length;
    const cropTypeRzepak = data.filter(row => row["Rodzaj zasiewu"]?.toLowerCase().includes("rzepak")).length;
    const regionNorth = data.filter(row => row["Lokalizacja"]?.toLowerCase().includes("północ")).length;

    let msg = "📊 Raport AI dla rolnika:\n\n";
    msg += `🔹 Wysoka wilgotność (>75%): ${highMoisture} przypadków\n`;
    msg += `🔹 Niska wydajność (<1200 kg/h): ${lowEfficiency} przypadków\n`;
    msg += `🔹 Dominacja gleby gliniastej: ${claySoil} rekordów\n`;
    msg += `🔹 Użycie nawadniania: ${irrigation} razy\n`;
    msg += `🔹 Nawóz azotowy: ${fertilizationNitrogen} zastosowań\n`;
    msg += `🔹 Zasiew rzepaku: ${cropTypeRzepak} razy\n`;
    msg += `🔹 Region północny: ${regionNorth} obserwacji\n\n`;

    msg += "✅ Zalecenia:\n";
    if (highMoisture > 5 && lowEfficiency > 5) {
      msg += "- Ogranicz nawadnianie – występuje korelacja między wilgotnością a spadkiem wydajności.\n";
    }
    if (claySoil > 10) {
      msg += "- Gleba gliniasta – rozważ wapnowanie lub zmianę uprawy.\n";
    }
    if (fertilizationNitrogen > 10 && lowEfficiency > 5) {
      msg += "- Sprawdź skuteczność nawozu azotowego – możliwa nieskuteczność przy obecnych warunkach.\n";
    }
    if (regionNorth > 5 && cropTypeRzepak < 3) {
      msg += "- Rozważ zwiększenie uprawy rzepaku ozimego na północy.\n";
    }
    msg += "\n📌 Wskazówki:\n- Monitoruj zmiany gleby i analizuj lokalne warunki pogodowe.\n- Dostosuj dawki nawożenia do rodzaju gleby i wilgotności.\n";

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
