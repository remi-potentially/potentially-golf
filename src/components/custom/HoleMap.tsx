
"use client";

import { GoogleMap, Marker, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useMemo } from 'react';
import type { HoleGpsData } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface HoleMapProps {
  holeData: HoleGpsData | null;
}

const mapContainerStyle = {
  height: '16rem', // h-64
  width: '100%',
  borderRadius: '0.5rem', // rounded-lg
};

export default function HoleMap({ holeData }: HoleMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapCenter = useMemo(() => {
    if (!isLoaded || !window.google || !holeData) return { lat: 56.340, lng: -2.805 }; // Default to St Andrews

    if (holeData.green && holeData.green.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      holeData.green.forEach(p => bounds.extend({ lat: p[0], lng: p[1] }));
      if (holeData.tee) {
        bounds.extend({ lat: holeData.tee[0], lng: holeData.tee[1] });
      }
      const center = bounds.getCenter();
      return { lat: center.lat(), lng: center.lng() };
    }
    return holeData.tee ? { lat: holeData.tee[0], lng: holeData.tee[1] } : { lat: 56.340, lng: -2.805 };
  }, [holeData, isLoaded]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    if (!window.google || !holeData) return;

    const bounds = new window.google.maps.LatLngBounds();
    if (holeData.tee) {
      bounds.extend({ lat: holeData.tee[0], lng: holeData.tee[1] });
    }
    if (holeData.green && holeData.green.length > 0) {
      holeData.green.forEach(p => bounds.extend({ lat: p[0], lng: p[1] }));
    }
    
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 20);
    } else if (holeData.tee) {
      map.setCenter({ lat: holeData.tee[0], lng: holeData.tee[1] });
      map.setZoom(17);
    }

  }, [holeData]);

  if (loadError) {
    return <div className="h-64 flex items-center justify-center bg-destructive/10 text-destructive text-sm p-4 rounded-lg">Error loading maps. Please check your API key and network connection.</div>;
  }

  if (!isLoaded) {
    return (
      <div className="h-64 bg-secondary rounded-lg flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
        <p className="ml-2">Loading Map...</p>
      </div>
    );
  }

  const greenPath = holeData?.green?.map(p => ({ lat: p[0], lng: p[1] })) || [];
  const teePosition = holeData?.tee ? { lat: holeData.tee[0], lng: holeData.tee[1] } : null;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={17}
      onLoad={onMapLoad}
      options={{
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {teePosition && <Marker position={teePosition} />}
      {greenPath.length > 0 && <Polygon
        paths={greenPath}
        options={{
          fillColor: 'green',
          fillOpacity: 0.4,
          strokeColor: 'darkgreen',
          strokeOpacity: 0.8,
          strokeWeight: 2,
        }}
      />}
    </GoogleMap>
  );
}
