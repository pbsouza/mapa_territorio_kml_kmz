import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { PlacemarkFeature } from '../types/kml';

interface MapLayersProps {
  placemarks: PlacemarkFeature[];
  onSelectPlacemark: (placemark: PlacemarkFeature) => void;
}

export function MapLayers({ placemarks, onSelectPlacemark }: MapLayersProps) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!map) return;

    // Cleanup previous overlays
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    // Filter placemarks with LineString or Polygon
    placemarks.forEach((pm) => {
      if (pm.geometryType === 'LineString' && pm.lineCoordinates && pm.lineCoordinates.length > 0) {
        const polyline = new google.maps.Polyline({
          path: pm.lineCoordinates,
          strokeColor: pm.categoryColor || '#2563eb',
          strokeOpacity: 0.85,
          strokeWeight: 4,
          map,
        });

        polyline.addListener('click', () => {
          onSelectPlacemark(pm);
        });

        polylinesRef.current.push(polyline);
      } else if (
        pm.geometryType === 'Polygon' &&
        pm.polygonCoordinates &&
        pm.polygonCoordinates.length > 0
      ) {
        const polygon = new google.maps.Polygon({
          paths: pm.polygonCoordinates,
          strokeColor: pm.categoryColor || '#2563eb',
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: pm.categoryColor || '#2563eb',
          fillOpacity: 0.25,
          map,
        });

        polygon.addListener('click', () => {
          onSelectPlacemark(pm);
        });

        polygonsRef.current.push(polygon);
      }
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, placemarks, onSelectPlacemark]);

  return null;
}
