
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ data }) => {
  const validData = data
    .map((row) => {
      if (!row.Lokalizacja) return null;
      const [lat, lng] = row.Lokalizacja.split(",").map(parseFloat);
      if (isNaN(lat) || isNaN(lng)) return null;
      return { ...row, lat, lng };
    })
    .filter(Boolean);

  const center = validData.length > 0
    ? [validData[0].lat, validData[0].lng]
    : [52.2297, 21.0122]; // default center (Warsaw)

  return (
    <div style={{ height: "400px", width: "100%", marginTop: "20px" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {validData.map((row, idx) => (
          <Marker key={idx} position={[row.lat, row.lng]}>
            <Popup>
              <strong>{row.Pole || "Nieznane pole"}</strong><br />
              Zasiew: {row["Rodzaj zasiewu"] || "-"}<br />
              Wydajność: {row["Wydajność (kg/h)"] || "-"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
