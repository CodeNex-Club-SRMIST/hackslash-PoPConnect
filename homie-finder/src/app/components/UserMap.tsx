"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngBoundsExpression } from "leaflet";
import L from 'leaflet';
import { useEffect } from 'react';

useEffect(() => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}, []);

const indiaBounds: LatLngBoundsExpression = [
  [6.5546079, 68.1113787],   // Southwest corner (Kerala)
  [35.6745457, 97.395561]    // Northeast corner (Arunachal Pradesh)
];

export default function UserMap({ profiles }: { profiles: any[] }) {
  // Fix Leaflet icons on component mount
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Filter profiles with valid coordinates
  const validProfiles = profiles.filter((p) => 
    p.latitude && 
    p.longitude && 
    !isNaN(p.latitude) && 
    !isNaN(p.longitude) &&
    p.latitude >= -90 && 
    p.latitude <= 90 &&
    p.longitude >= -180 && 
    p.longitude <= 180
  );

  return (
    <div className="w-full">
      <MapContainer
        center={[22.9734, 78.6569] as [number, number]}
        zoom={5}
        style={{ height: 350, width: "100%" }}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        minZoom={5}
        maxZoom={10}
        className="rounded-lg"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {validProfiles.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude] as [number, number]}>
            <Popup>
              <div className="text-center">
                <strong>{p.name}</strong>
                <br />
                {p.location}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
