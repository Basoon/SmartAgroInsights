
import React, { useState } from "react";
import Papa from "papaparse";
import dynamic from "next/dynamic";
import {
  Box, Typography, Button, Select, MenuItem,
  InputLabel, FormControl, Paper, Container,
  Divider, Grid, Avatar
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import LandscapeIcon from '@mui/icons-material/Landscape';

const MapView = dynamic(() => import("./MapView"), { ssr: false });

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
        const detectedKeys = Object.keys(parsed[0] || {});

        const required = ["Pole", "Lokalizacja", "Wydajność (kg/h)", "Wilgotność (%)", "pH", "Próchnica (%)", "P", "K", "Mg", "B", "Cu", "Zn", "Mn", "EC", "Struktura gleby", "Rodzaj zasiewu", "Nawożenie", "Typ gleby"];
        const missing = required.filter(col => !detectedKeys.includes(col));

        if (missing.length > 0) {
          setSummary("❌ Brakuje kolumn: " + missing.join(", "));
          return;
        }

        setData(parsed);
        setKeys(detectedKeys);
        setSummary(`✅ Wczytano ${parsed.length} rekordów
📊 Kolumny: ${detectedKeys.join(", ")}`);
      },
    });
  };

  const generateRecommendations = () => {
    if (data.length === 0) return;

    const avg = (key) => data.reduce((acc, row) => acc + parseFloat(row[key] || 0), 0) / data.length;

    const avgPH = avg("pH");
    const avgOrganic = avg("Próchnica (%)");
    const avgEC = avg("EC");
    const avgYield = avg("Wydajność (kg/h)");
    const avgMoisture = avg("Wilgotność (%)");

    let msg = "📊 Ekspercki raport AI na podstawie analizy gleby:

";
    msg += `🔹 Średnie pH: ${avgPH.toFixed(1)} (${avgPH < 5.5 ? "kwaśna" : avgPH < 7.5 ? "obojętna" : "zasadowa"})
`;
    msg += `🔹 Próchnica: ${avgOrganic.toFixed(1)}% (${avgOrganic < 1.5 ? "niska" : avgOrganic < 3.5 ? "średnia" : "wysoka"})
`;
    msg += `🔹 Zasolenie (EC): ${avgEC.toFixed(2)} dS/m ${avgEC > 3 ? "⚠️ wysoka zasolenie" : ""}
`;
    msg += `🔹 Średnia wilgotność gleby: ${avgMoisture.toFixed(1)}%
`;
    msg += `🔹 Średnia wydajność: ${avgYield.toFixed(1)} kg/h

`;

    msg += "✅ Rekomendacje rolnicze:
";

    if (avgPH < 5.5) msg += "- Odczyn kwaśny – zaleca się wapnowanie.
";
    if (avgPH > 7.5) msg += "- Odczyn zasadowy – ostrożnie z nawozami wapniowymi.
";
    if (avgOrganic < 1.5) msg += "- Niska próchnica – stosuj nawozy organiczne i międzyplony.
";
    if (avgEC > 3) msg += "- Zasolenie wysokie – ogranicz nawożenie mineralne i zwiększ nawadnianie.
";
    if (avgYield < 1000) msg += "- Niska wydajność – sprawdź niedobory makroskładników (P, K, Mg).
";

    msg += "
📌 Wskazówki:
";
    msg += "- Monitoruj zmiany sezonowe gleb (np. wilgotność vs plony).
";
    msg += "- Ustal płodozmian zgodnie z typem gleby i poziomem próchnicy.
";
    msg += "- Dostosuj dawki nawozów mikroelementowych do wyników.
";

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
            <Typography color="text.secondary">Ekspercka analiza laboratoryjna gleby (CSV)</Typography>
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
                  {keys.map((k) => (<MenuItem key={k} value={k}>{k}</MenuItem>))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Oś Y</InputLabel>
                <Select value={yKey} onChange={(e) => setYKey(e.target.value)} label="Oś Y">
                  {keys.map((k) => (<MenuItem key={k} value={k}>{k}</MenuItem>))}
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

            <Box mt={5}>
              <Typography variant="h6">5. Mapa pól</Typography>
              <MapView data={data} />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
