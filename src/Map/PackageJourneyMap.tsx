import React, {useEffect, useMemo, useRef} from 'react';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';

const GOOGLE_MAP_LIBRARIES: 'marker'[] = ['marker'];

type ScanPoint = {
  latitude: number;
  longitude: number;
};

interface PackageJourneyMapProps {
  scanLocations: ScanPoint[];
  destinationLocation: ScanPoint;
  googleMapsApiKey: string;
}

const containerStyle = {
  width: '100%',
  height: '450px',
};

export default function PackageJourneyMap({
  scanLocations,
  destinationLocation,
  googleMapsApiKey,
}: PackageJourneyMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey,
    libraries: GOOGLE_MAP_LIBRARIES, // ✅ static
  });

  const path = useMemo(() => {
    return [
      ...scanLocations.map(p => ({
        lat: p.latitude,
        lng: p.longitude,
      })),
      {
        lat: destinationLocation.latitude,
        lng: destinationLocation.longitude,
      },
    ];
  }, [scanLocations, destinationLocation]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Clear old markers
    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    const addMarker = (
      position: google.maps.LatLngLiteral,
      label: string,
      color: string,
    ) => {
      const el = document.createElement('div');
      el.style.background = color;
      el.style.color = '#fff';
      el.style.padding = '6px 10px';
      el.style.borderRadius = '999px';
      el.style.fontSize = '12px';
      el.style.fontWeight = 'bold';
      el.innerText = label;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position,
        content: el,
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    };

    scanLocations.forEach((scan, i) => {
      addMarker(
        {lat: scan.latitude, lng: scan.longitude},
        `${i + 1}`,
        '#2563eb',
      );
    });

    addMarker(
      {
        lat: destinationLocation.latitude,
        lng: destinationLocation.longitude,
      },
      'D',
      '#dc2626',
    );

    mapRef.current.fitBounds(bounds);
  }, [path, scanLocations, destinationLocation]);

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
        onLoad={map => {
          mapRef.current = map;

          if (!window.google || path.length === 0) return;

          const bounds = new google.maps.LatLngBounds();
          path.forEach(p => bounds.extend(p));
          map.fitBounds(bounds);
        }}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}>
        {/* Scan markers */}
        {scanLocations.map((scan, i) => (
          <Marker
            key={i}
            position={{lat: scan.latitude, lng: scan.longitude}}
            label={`${i + 1}`}
          />
        ))}

        {/* Destination marker */}
        <Marker
          position={{
            lat: destinationLocation.latitude,
            lng: destinationLocation.longitude,
          }}
          label="D"
        />

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
