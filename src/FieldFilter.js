
import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function FieldFilter({ fields, selectedField, onSelect }) {
  return (
    <FormControl fullWidth style={{ marginBottom: "20px" }}>
      <InputLabel id="field-select-label">Wybierz pole</InputLabel>
      <Select
        labelId="field-select-label"
        id="field-select"
        value={selectedField}
        label="Wybierz pole"
        onChange={(e) => onSelect(e.target.value)}
      >
        <MenuItem value="">Wszystkie pola</MenuItem>
        {fields.map((field) => (
          <MenuItem key={field} value={field}>
            {field}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
