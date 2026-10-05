import { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { LatLng, TravelMode, RouteResultDetails } from '../types/kml';

interface RouteLayerProps {
  origin: LatLng | null;
  destination: LatLng | null;
  travelMode: TravelMode;
  onRouteCalculated: (details: RouteResultDetails | null) => void;
  onError: (error: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

function formatDuration(millis: number): string {
  const totalMinutes = Math.round(millis / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function RouteLayer({
  origin,
  destination,
  travelMode,
  onRouteCalculated,
  onError,
  onLoadingChange,
}: RouteLayerProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    // If we do not have both points, clear existing route
    if (!origin || !destination) {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      onRouteCalculated(null);
      onError(null);
      onLoadingChange(false);
      return;
    }

    if (!map || !routesLib) return;

    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    onError(null);
    onLoadingChange(true);

    const request = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    };

    (routesLib.Route as any)
      .computeRoutes(request)
      .then(({ routes }: { routes: any[] }) => {
        onLoadingChange(false);
        if (!routes || routes.length === 0) {
          onError('Nenhuma rota encontrada para este trajeto com o modo selecionado.');
          onRouteCalculated(null);
          return;
        }

        const primaryRoute = routes[0];

        // Render polylines using native createPolylines()
        if (typeof primaryRoute.createPolylines === 'function') {
          const newPolylines = primaryRoute.createPolylines();
          newPolylines.forEach((polyline: google.maps.Polyline) => {
            polyline.setOptions({
              strokeColor: '#0284c7', // Cyan/Blue
              strokeWeight: 6,
              strokeOpacity: 0.88,
              zIndex: 100,
            });
            polyline.setMap(map);
          });
          polylinesRef.current = newPolylines;
        }

        // Adjust map viewport to frame route
        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, 60);
        }

        // Extract steps for turn-by-turn list
        const steps: Array<{ instruction: string; distanceText?: string; durationText?: string }> = [];
        if (primaryRoute.legs && primaryRoute.legs.length > 0) {
          const leg = primaryRoute.legs[0];
          if (leg.steps && Array.isArray(leg.steps)) {
            leg.steps.forEach((st: any) => {
              if (st.navigationInstruction?.instructions) {
                steps.push({
                  instruction: st.navigationInstruction.instructions,
                  distanceText: st.distanceMeters ? formatDistance(st.distanceMeters) : undefined,
                  durationText: st.durationMillis ? formatDuration(st.durationMillis) : undefined,
                });
              }
            });
          }
        }

        const distanceMeters = primaryRoute.distanceMeters || 0;
        const durationMillis = primaryRoute.durationMillis || 0;

        onRouteCalculated({
          distanceMeters,
          durationMillis,
          distanceText: formatDistance(distanceMeters),
          durationText: formatDuration(durationMillis),
          steps,
        });
      })
      .catch((err: any) => {
        onLoadingChange(false);
        console.error('Error calculating route:', err);
        const message =
          err?.message ||
          'Não foi possível calcular a rota. Verifique se o trajeto é acessível no modo de transporte escolhido.';
        onError(message);
        onRouteCalculated(null);
      });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, origin?.lat, origin?.lng, destination?.lat, destination?.lng, travelMode]);

  return null;
}
