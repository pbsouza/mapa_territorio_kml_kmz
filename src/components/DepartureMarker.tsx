import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { LatLng } from '../types/kml';
import { Navigation, Compass } from 'lucide-react';

interface DepartureMarkerProps {
  position: LatLng;
  label?: string;
  isDraggable?: boolean;
  onDragEnd?: (pos: LatLng) => void;
}

export function DepartureMarker({
  position,
  label = 'Ponto de Partida',
  isDraggable = true,
  onDragEnd,
}: DepartureMarkerProps) {
  return (
    <AdvancedMarker
      position={{ lat: position.lat, lng: position.lng }}
      title={label}
      draggable={isDraggable}
      onDragEnd={(e) => {
        if (e.latLng && onDragEnd) {
          onDragEnd({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      }}
      zIndex={60}
    >
      <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
        {/* Pulsing beacon */}
        <span className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping" />

        {/* Pin circle */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shadow-xl border-2 border-white ring-4 ring-emerald-500/30">
          <Navigation className="w-5 h-5 fill-current" />
        </div>

        {/* Pin point */}
        <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-emerald-600 -mt-0.5" />

        {/* Label Tag */}
        <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[11px] font-semibold shadow-md whitespace-nowrap backdrop-blur-xs flex items-center gap-1 border border-white/20">
          <Compass className="w-3 h-3 text-emerald-400" />
          <span>{label}</span>
          {isDraggable && <span className="text-[9px] text-slate-400">(arraste)</span>}
        </div>
      </div>
    </AdvancedMarker>
  );
}
