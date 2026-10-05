import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { PlacemarkFeature } from '../types/kml';
import { MapPin, Navigation2, Flag } from 'lucide-react';

interface PlacemarkMarkerProps {
  placemark: PlacemarkFeature;
  isSelected: boolean;
  isOrigin: boolean;
  isDestination: boolean;
  onClick: () => void;
}

export const PlacemarkMarker = React.memo(function PlacemarkMarker({
  placemark,
  isSelected,
  isOrigin,
  isDestination,
  onClick,
}: PlacemarkMarkerProps) {
  if (!placemark.point) return null;

  const color = placemark.categoryColor || '#2563eb';

  return (
    <AdvancedMarker
      position={{ lat: placemark.point.lat, lng: placemark.point.lng }}
      title={placemark.name}
      onClick={onClick}
      zIndex={isSelected ? 50 : isOrigin || isDestination ? 40 : 10}
    >
      <div
        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer group ${
          isSelected
            ? 'scale-125 -translate-y-2'
            : isOrigin || isDestination
            ? 'scale-115 -translate-y-1'
            : 'hover:scale-110 hover:-translate-y-1'
        }`}
      >
        {/* Glow for selected / route endpoints */}
        {(isSelected || isOrigin || isDestination) && (
          <span
            className={`absolute -inset-1.5 rounded-full blur-xs opacity-75 animate-pulse ${
              isOrigin ? 'bg-emerald-500' : isDestination ? 'bg-rose-500' : 'bg-blue-500'
            }`}
          />
        )}

        {/* Custom Marker Icon Pin */}
        <div
          className={`relative flex items-center justify-center rounded-full shadow-lg border-2 text-white transition-all ${
            isOrigin
              ? 'bg-emerald-600 border-white w-9 h-9'
              : isDestination
              ? 'bg-rose-600 border-white w-9 h-9'
              : isSelected
              ? 'bg-blue-600 border-white w-9 h-9 ring-2 ring-blue-400'
              : 'w-7 h-7 border-white'
          }`}
          style={{ backgroundColor: !isOrigin && !isDestination && !isSelected ? color : undefined }}
        >
          {isOrigin ? (
            <Navigation2 className="w-5 h-5 fill-current rotate-45" />
          ) : isDestination ? (
            <Flag className="w-4 h-4 fill-current" />
          ) : placemark.iconUrl ? (
            <img
              src={placemark.iconUrl}
              alt=""
              className="w-4 h-4 object-contain rounded-full"
              onError={(e) => {
                // Fallback to pin icon on image error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>

        {/* Pin stem pointer */}
        <div
          className={`w-0 h-0 border-x-4 border-x-transparent border-t-6 -mt-0.5 mx-auto ${
            isOrigin
              ? 'border-t-emerald-600'
              : isDestination
              ? 'border-t-rose-600'
              : isSelected
              ? 'border-t-blue-600'
              : ''
          }`}
          style={{
            borderTopColor:
              !isOrigin && !isDestination && !isSelected ? color : undefined,
          }}
        />

        {/* Mini Label badge on hover or selected */}
        <div
          className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-medium tracking-tight shadow-md pointer-events-none transition-opacity bg-slate-900/90 text-white backdrop-blur-xs ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {placemark.name}
        </div>
      </div>
    </AdvancedMarker>
  );
});
