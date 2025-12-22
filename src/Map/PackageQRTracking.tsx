import React, {useEffect, useMemo, useRef, useState} from 'react';
import {API_BASE} from '@env';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';

type ScanPoint = {
  latitude: number;
  longitude: number;
};

type DestinationJourney = {
  destinationId: string;
  destinationLocation: ScanPoint;
  scans: ScanPoint[];
};
const TOKEN_KEY = 'nta_token';

const containerStyle = {
  width: '100%',
  height: '450px',
};

export default function PackageQRTracking(props: {trackingId: string}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const mapRef = useRef<google.maps.Map | null>(null);
  let selectedTrackingId = props.trackingId; // Placeholder for tracking ID
  //selectedTrackingId = localStorage.getItem('tracking_id') || '';
  debugger;
  const [journeys, setJourneys] = useState<DestinationJourney[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY!,
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadJourneyData = async () => {
      // 🔹 Replace with real API call
      //   const res = await fetch(`${API_BASE}/scans/getJourney`);
      //   const data = await res.json();
      if (selectedTrackingId) {
        const res = await fetch(
          `${API_BASE}/scans/getJourney?trackingId=${selectedTrackingId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        const json = await res.json();
        if (json.success) setJourneys(json.data);

        setLoadingData(false);
      } else {
        const res = await fetch(`${API_BASE}/scans/getJourney`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const json = await res.json();
        if (json.success) setJourneys(json.data);

        setLoadingData(false);
      }
    };

    loadJourneyData();
  }, [selectedTrackingId]);

  //   useEffect(() => {
  //     const loadJourneyData = async () => {
  //       // 🔹 Replace with real API call
  //       //   const res = await fetch(`${API_BASE}/scans/getJourney`);
  //       //   const data = await res.json();
  //       //let dashboardRes: any;
  //       if (false) {
  //         // dashboardRes = await fetch(
  //         //   `${API_BASE}/scans/getJourney?trackingId=${'hhh'}`,
  //         //   {
  //         //     headers: {Authorization: `Bearer ${token}`},
  //         //   },
  //         // );
  //         // if (dashboardRes.success) setJourneys(dashboardRes.data);
  //         // setLoadingData(false);
  //       } else {
  //         const dashboardRes: any = await fetch(`${API_BASE}/scans/getJourney`, {
  //           headers: {Authorization: `Bearer ${token}`},
  //         });
  //         if (dashboardRes.success) setJourneys(dashboardRes.data);
  //         setLoadingData(false);
  //       }
  //     };

  //     loadJourneyData();
  //   }, []);

  /* ================= BUILD PATHS (ONCE) ================= */
  const journeyPaths = useMemo(() => {
    return journeys.map(journey => [
      ...journey.scans.map(s => ({
        lat: s.latitude,
        lng: s.longitude,
      })),
      {
        lat: journey.destinationLocation.latitude,
        lng: journey.destinationLocation.longitude,
      },
    ]);
  }, [journeys]);

  if (!isLoaded || loadingData) {
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

          if (journeyPaths.length === 0) return;

          const bounds = new google.maps.LatLngBounds();
          journeyPaths.flat().forEach(p => bounds.extend(p));
          map.fitBounds(bounds);
        }}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}>
        {journeys.map((journey, jIndex) => (
          <React.Fragment key={journey.destinationId}>
            {/* Scan markers */}
            {journey.scans.map((scan, i) => (
              <Marker
                key={`${journey.destinationId}-scan-${i}`}
                position={{lat: scan.latitude, lng: scan.longitude}}
                label={`${i + 1}`}
              />
            ))}

            {/* Destination marker */}
            <Marker
              position={{
                lat: journey.destinationLocation.latitude,
                lng: journey.destinationLocation.longitude,
              }}
              label="D"
            />

            {/* Route polyline */}
            <Polyline
              path={journeyPaths[jIndex]}
              options={{
                strokeColor: ['#2563eb', '#16a34a', '#dc2626'][jIndex % 3],
                strokeOpacity: 1,
                strokeWeight: 4,
                geodesic: true,
              }}
            />
          </React.Fragment>
        ))}
      </GoogleMap>
    </div>
  );
}
