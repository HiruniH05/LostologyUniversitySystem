import React, { useState } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "250px",
};

// const defaultCenter = { lat: 7.8731, lng: 80.7718 }; // Sri Lanka center

const defaultCenter = { lat: 7.2539, lng: 80.5918 };
const bounds = {
  north: 7.2667,
  south: 7.2400,
  west: 80.5800,
  east: 80.6000,
};


export default function MapPicker({ onLocationSelect }: { onLocationSelect: (loc: {lat: number, lng: number}) => void }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyD0E_jViDB_d8xsDv6hV1tdVgwiNVbEzP8", // map API key
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  if (!isLoaded) return <div>Loading Map...</div>;

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    onLocationSelect({ lat, lng }); // send back to parent form
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={7}
      center={defaultCenter}
      options={{
        restriction: { latLngBounds: bounds, strictBounds: false },
        }}
      onClick={handleMapClick}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  );
}
