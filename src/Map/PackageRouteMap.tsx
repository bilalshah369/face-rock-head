import React, {useMemo} from 'react';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';

type LatLng = {
  latitude: number;
  longitude: number;
};

interface PackageRouteMapProps {
  scanLocation: LatLng; // Last scanned location
  destinationLocation: LatLng; // Destination centre location
  googleMapsApiKey: string;
}

const containerStyle = {
  width: '100%',
  height: '450px',
};

export default function PackageRouteMap({
  scanLocation,
  destinationLocation,
  googleMapsApiKey,
}: PackageRouteMapProps) {
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey,
  });

  const path = useMemo(
    () => [
      {lat: scanLocation.latitude, lng: scanLocation.longitude},
      {
        lat: destinationLocation.latitude,
        lng: destinationLocation.longitude,
      },
    ],
    [scanLocation, destinationLocation],
  );

  const center = useMemo(
    () => ({
      lat: (scanLocation.latitude + destinationLocation.latitude) / 2,
      lng: (scanLocation.longitude + destinationLocation.longitude) / 2,
    }),
    [scanLocation, destinationLocation],
  );

  if (!isLoaded) {
    return (
      <div className="h-[450px] flex items-center justify-center text-gray-500">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}>
        {/* Scan Location Marker */}
        <Marker
          position={{
            lat: scanLocation.latitude,
            lng: scanLocation.longitude,
          }}
          label="S"
          title="Last Scan Location"
        />

        {/* Destination Center Marker */}
        <Marker
          position={{
            lat: destinationLocation.latitude,
            lng: destinationLocation.longitude,
          }}
          label="D"
          title="Destination Centre"
        />

        {/* Route Line */}
        <Polyline
          path={path}
          options={{
            strokeColor: '#2563eb',
            strokeOpacity: 1,
            strokeWeight: 4,
            geodesic: true,
          }}
        />
      </GoogleMap>
    </div>
  );
}
