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
  Paper,
  Container,
  Divider,
  Grid,
  Avatar
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import LandscapeIcon from '@mui/icons-material/Landscape';
import MapView from "./MapView";

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

    const requiredColumns = ["Pole", "Lokalizacja", "Wydajność (kg/h)", "Wilgotność (%)", "pH", "Mg", "Zn", "Fe", "Cu", "Mn"];
    const missingColumns = requiredColumns.filter(col => !detectedKeys.includes(col));
    if (missingColumns.length > 0) {
      setSummary("❌ Brakuje kolumn: " + missingColumns.join(", "));
      return;
    }

        setKeys(detectedKeys);
        setSummary(`✅ Wczytano ${parsed.length} rekordów\n📊 Kolumny: ${detectedKeys.join(", ")}`);
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

    let msg = `📊 Szczegółowy raport AI:\n\n`;
    msg += `🔹 Średnia wilgotność gleby: ${avgHumidity.toFixed(1)}%\n`;
    msg += `🔹 Średnia wydajność: ${avgYield.toFixed(1)} kg/h\n`;
    msg += `🔹 Liczba pól w gospodarstwie: ${fields.length} (${fields.join(", ")})\n`;
    msg += `🔹 Rodzaje zasiewów: ${crops.join(", ")}\n`;
    msg += `🔹 Typy gleby: ${soils.join(", ")}\n`;
    msg += `🔹 Typy nawożenia: ${fertilizers.join(", ")}\n`;
    msg += `🔹 Łączny czas przestojów: ${downtimesTotal} min\n`;
    msg += `🔹 Suma awarii: ${failuresTotal} zdarzeń\n\n`;

    msg += `✅ Rekomendacje zagospodarowania gleby:\n`;
    if (avgHumidity > 75) msg += `- Gleba zbyt wilgotna – ogranicz nawadnianie i monitoruj drenaż.\n`;
    if (avgHumidity < 65) msg += `- Niska wilgotność – rozważ dodatkowe nawadnianie lub ściółkowanie.\n`;
    if (avgYield < 1200) msg += `- Niska wydajność – sprawdź skuteczność nawożenia i jakość gleby.\n`;
    if (failuresTotal > 5 || downtimesTotal > 100) msg += `- Duża liczba awarii i przestojów – zalecany przegląd maszyn i szkolenie personelu.\n`;

    msg += `\n📈 Analiza rynkowa:\n`;
    msg += `- W sezonie 2025 zwiększa się zapotrzebowanie na rzepak i pszenicę – korzystne zmiany zasiewu.\n`;
    msg += `- Ceny nawozów azotowych wzrosły – rozważ zmianę na kompost lub fosforowe.\n`;

    msg += `\n📌 Wskazówki dla przyszłych działań:\n`;
    msg += `- Planuj płodozmian między polami.\n`;
    msg += `- Wykonuj analizę gleby co 3 miesiące.\n`;
    msg += `- Ustal harmonogram nawożenia względem prognoz pogodowych.\n`;

    setReport(msg);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, backgroundColor: '#fdfdfd' }}>
        <Grid container spacing={2} alignItems="center" mb={3}>
          <Grid item>
            <Avatar sx={{ bgcolor: "#4caf50" }}>
              <LandscapeIcon />
            </Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h4" fontWeight="bold">SmartAgro Insights</Typography>
            <Typography color="text.secondary">Inteligentna analiza danych rolniczych (CSV)</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6">1. Wgraj plik CSV</Typography>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <Typography mt={2}>{summary}</Typography>

        {data.length > 0 && (
          <>
            <Box mt={4}>
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
              <Box mt={4}>
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

            <Box mt={5}>
              <Typography variant="h6">4. Rekomendacje AI</Typography>
              <Button variant="contained" onClick={generateRecommendations} sx={{ mt: 2 }}>
                Generuj raport
              </Button>
              {report && (
                <Paper elevation={2} sx={{ mt: 3, p: 3, backgroundColor: '#f0f8f5' }}>
                  <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {report}
                  </Typography>
                </Paper>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
