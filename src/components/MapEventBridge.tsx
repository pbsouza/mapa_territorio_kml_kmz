import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { LatLng } from '../types/kml';

interface MapEventBridgeProps {
  isPickingOnMap: boolean;
  onMapClickPoint: (point: LatLng) => void;
}

export function MapEventBridge({ isPickingOnMap, onMapClickPoint }: MapEventBridgeProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (isPickingOnMap && e.latLng) {
        onMapClickPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    });

    // Update cursor when picking on map
    if (isPickingOnMap) {
      map.setOptions({ draggableCursor: 'crosshair' });
    } else {
      map.setOptions({ draggableCursor: null });
    }

    return () => {
      google.maps.event.removeListener(listener);
      map.setOptions({ draggableCursor: null });
    };
  }, [map, isPickingOnMap, onMapClickPoint]);

  return null;
}
