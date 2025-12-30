import React, {useEffect, useMemo, useRef, useState} from 'react';
import {API_BASE} from '@env';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
  InfoWindow,
} from '@react-google-maps/api';

type ScanPoint = {
  latitude: number;
  longitude: number;
  scan_status: string;
  scan_datetime: string;
  centre_name: string;
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
  const [activeMarker, setActiveMarker] = useState<{
    journeyId: string;
    type: 'SCAN' | 'DESTINATION';
    index?: number;
  } | null>(null);
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
    <div className="relative rounded-lg overflow-hidden border">
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: '#ffffff',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          minWidth: 140,
        }}>
        <div style={{fontWeight: 600, marginBottom: 6}}>Legend</div>

        <div style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
          <img
            src="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            alt="Scan"
            style={{width: 18, height: 18, marginRight: 6}}
          />
          <span>Scan Point (ON_ROUTE)</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
          <img
            src="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            alt="Scan"
            style={{width: 18, height: 18, marginRight: 6}}
          />
          <span>Scan Point (OFF_ROUTE)</span>
        </div>

        <div style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
          <img
            src="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
            alt="Destination"
            style={{width: 18, height: 18, marginRight: 6}}
          />
          <span>Destination Centre</span>
        </div>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <div
            style={{
              width: 18,
              height: 4,
              background: '#2563eb',
              marginRight: 6,
              borderRadius: 2,
            }}
          />
          <span>Route Path</span>
        </div>
      </div>
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
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true, // ✅ enable full screen
          zoomControl: true,
        }}>
        {journeys.map((journey, jIndex) => (
          <React.Fragment key={journey.destinationId}>
            {/* Scan markers */}
            {journey.scans.map((scan, i) => {
              const isActive =
                activeMarker?.journeyId === journey.destinationId &&
                activeMarker?.type === 'SCAN' &&
                activeMarker?.index === i;

              return (
                <React.Fragment key={`${journey.destinationId}-scan-${i}`}>
                  <Marker
                    position={{lat: scan.latitude, lng: scan.longitude}}
                    icon={{
                      url:
                        scan.scan_status === 'ON_ROUTE'
                          ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                          : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    }}
                    onClick={() =>
                      setActiveMarker({
                        journeyId: journey.destinationId,
                        type: 'SCAN',
                        index: i,
                      })
                    }
                  />

                  {isActive && (
                    <InfoWindow
                      position={{lat: scan.latitude, lng: scan.longitude}}
                      onCloseClick={() => setActiveMarker(null)}>
                      <div
                        style={{
                          minWidth: 200,
                          fontFamily:
                            'system-ui, -apple-system, BlinkMacSystemFont',
                        }}>
                        {/* Header */}
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 6,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <span>Scan #{i + 1}</span>
                          <span
                            style={{
                              padding: '2px 6px',
                              fontSize: 11,
                              borderRadius: 6,
                              background:
                                scan.scan_status === 'ON_ROUTE'
                                  ? '#dcfce7'
                                  : '#fee2e2',
                              color:
                                scan.scan_status === 'ON_ROUTE'
                                  ? '#166534'
                                  : '#991b1b',
                            }}>
                            {scan.scan_status}
                          </span>
                        </div>

                        {/* Body */}
                        <div style={{fontSize: 12, color: '#374151'}}>
                          <div style={{marginBottom: 4}}>
                            📍 <strong>Latitude:</strong> {scan.latitude}
                          </div>
                          <div style={{marginBottom: 4}}>
                            📍 <strong>Longitude:</strong> {scan.longitude}
                          </div>
                          <div style={{marginBottom: 4}}>
                            🕒 <strong>Date:</strong>{' '}
                            {new Date(scan.scan_datetime).toLocaleString()}
                          </div>
                        </div>
                        {/* Divider */}
                        <div
                          style={{
                            margin: '8px 0',
                            borderTop: '1px solid #e5e7eb',
                          }}
                        />

                        {/* Bottom Close Button */}
                        <button
                          onClick={() => setActiveMarker(null)}
                          style={{
                            width: '100%',
                            padding: '6px 0',
                            fontSize: 12,
                            borderRadius: 6,
                            border: 'none',
                            background: '#2563eb',
                            color: '#fff',
                            cursor: 'pointer',
                          }}>
                          Close
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              );
            })}

            {/* Destination marker */}
            {(() => {
              const isActive =
                activeMarker?.journeyId === journey.destinationId &&
                activeMarker?.type === 'DESTINATION';

              return (
                <>
                  <Marker
                    position={{
                      lat: journey.destinationLocation.latitude,
                      lng: journey.destinationLocation.longitude,
                    }}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    }}
                    onClick={() =>
                      setActiveMarker({
                        journeyId: journey.destinationId,
                        type: 'DESTINATION',
                      })
                    }
                  />

                  {isActive && (
                    <InfoWindow
                      position={{
                        lat: journey.destinationLocation.latitude,
                        lng: journey.destinationLocation.longitude,
                      }}>
                      <div
                        style={{
                          minWidth: 220,
                          fontFamily:
                            'system-ui, -apple-system, BlinkMacSystemFont',
                        }}>
                        {/* Title */}
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 6,
                          }}>
                          📍 Destination
                        </div>

                        {/* Center Name */}
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#1f2937',
                            marginBottom: 6,
                          }}>
                          {journey.destinationLocation.centre_name ?? 'Center'}
                        </div>

                        {/* Coordinates */}
                        <div
                          style={{
                            fontSize: 12,
                            color: '#374151',
                            lineHeight: 1.4,
                          }}>
                          <div>
                            Latitude: {journey.destinationLocation.latitude}
                          </div>
                          <div>
                            Longitude: {journey.destinationLocation.longitude}
                          </div>
                        </div>

                        {/* Divider */}
                        <div
                          style={{
                            margin: '8px 0',
                            borderTop: '1px solid #e5e7eb',
                          }}
                        />

                        {/* Bottom Close Button */}
                        <button
                          onClick={() => setActiveMarker(null)}
                          style={{
                            width: '100%',
                            padding: '6px 0',
                            fontSize: 12,
                            borderRadius: 6,
                            border: 'none',
                            background: '#16a34a',
                            color: '#fff',
                            cursor: 'pointer',
                          }}>
                          Close
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </>
              );
            })()}

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
