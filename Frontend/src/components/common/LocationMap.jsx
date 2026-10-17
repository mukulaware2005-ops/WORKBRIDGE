
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

export default function LocationMap({
  latitude,
  longitude,
  height = '400px',
  address = '',
}) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-navy-100 dark:bg-navy-800 text-sm text-navy-500"
        style={{ height }}
      >
        Location not available
      </div>
    );
  }

  const position = [
    Number(latitude),
    Number(longitude),
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border border-navy-200 dark:border-navy-700"
      style={{ height }}
    >
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>
            <div className="text-sm">
              <strong>Your Location</strong>

              {address && (
                <p className="mt-1">
                  {address}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

