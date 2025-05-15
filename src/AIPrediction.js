import React, { useState } from 'react';
import {
  Typography, Box, Button, TextField, MenuItem, Paper
} from '@mui/material';
import MLR from 'ml-regression-multivariate-linear';

const AIPrediction = ({ data }) => {
  const [form, setForm] = useState({
    zasiew: '',
    gleba: '',
    wilgotnosc: '',
    pH: '',
    Mg: '',
    Zn: '',
    Fe: '',
    Cu: '',
    Mn: ''
  });
  const [prediction, setPrediction] = useState(null);

  const zasiewy = [...new Set(data.map(d => d["Rodzaj zasiewu"]))];
  const gleby = [...new Set(data.map(d => d["Typ gleby"]))];

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const encodeValue = (value, options) => options.indexOf(value);

  const predictYield = () => {
    const filtered = data.filter(d =>
      d["Rodzaj zasiewu"] && d["Typ gleby"] && d["Wydajność (kg/h)"]
    );

    const zasiewOptions = [...new Set(filtered.map(d => d["Rodzaj zasiewu"]))];
    const glebaOptions = [...new Set(filtered.map(d => d["Typ gleby"]))];

    const X = filtered.map(d => [
      encodeValue(d["Rodzaj zasiewu"], zasiewOptions),
      encodeValue(d["Typ gleby"], glebaOptions),
      parseFloat(d["Wilgotność (%)"]),
      parseFloat(d["pH"]),
      parseFloat(d["Mg"]),
      parseFloat(d["Zn"]),
      parseFloat(d["Fe"]),
      parseFloat(d["Cu"]),
      parseFloat(d["Mn"]),
    ]);

    const y = filtered.map(d => [parseFloat(d["Wydajność (kg/h)"])]);

    const mlr = new MLR(X, y);

    const input = [[
      encodeValue(form.zasiew, zasiewOptions),
      encodeValue(form.gleba, glebaOptions),
      parseFloat(form.wilgotnosc),
      parseFloat(form.pH),
      parseFloat(form.Mg),
      parseFloat(form.Zn),
      parseFloat(form.Fe),
      parseFloat(form.Cu),
      parseFloat(form.Mn),
    ]];

    const result = mlr.predict(input);
    setPrediction(result[0][0].toFixed(1));
  };

  return (
    <Box mt={6}>
      <Typography variant="h6">6. AI Predykcja wydajności (kg/h)</Typography>
      <Paper elevation={2} sx={{ mt: 2, p: 3, backgroundColor: '#f9fbe7' }}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <TextField
            select label="Rodzaj zasiewu" value={form.zasiew}
            onChange={(e) => handleChange("zasiew", e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {zasiewy.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            select label="Typ gleby" value={form.gleba}
            onChange={(e) => handleChange("gleba", e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {gleby.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          {["wilgotnosc", "pH", "Mg", "Zn", "Fe", "Cu", "Mn"].map((param) => (
            <TextField
              key={param}
              label={param.toUpperCase()}
              type="number"
              value={form[param]}
              onChange={(e) => handleChange(param, e.target.value)}
              sx={{ width: 120 }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={predictYield}
          sx={{ mt: 3 }}
        >
          Przewiduj wydajność
        </Button>

        {prediction && (
          <Typography variant="h6" mt={3}>
            🔮 Szacowana wydajność: {prediction} kg/h
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AIPrediction;
