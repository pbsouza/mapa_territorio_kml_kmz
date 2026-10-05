import { useState } from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { PlacemarkFeature } from '../types/kml';
import { Navigation, Flag, ExternalLink, Copy, Check, Layers, MessageSquare } from 'lucide-react';
import { createWhatsAppUrl } from '../utils/pdfGenerator';

interface PlacemarkInfoWindowProps {
  placemark: PlacemarkFeature | null;
  onClose: () => void;
  onSetAsDestination: (pm: PlacemarkFeature) => void;
  onSetAsOrigin: (pm: PlacemarkFeature) => void;
}

export function PlacemarkInfoWindow({
  placemark,
  onClose,
  onSetAsDestination,
  onSetAsOrigin,
}: PlacemarkInfoWindowProps) {
  const [copied, setCopied] = useState(false);

  if (!placemark || !placemark.point) return null;

  const lat = placemark.point.lat.toFixed(6);
  const lng = placemark.point.lng.toFixed(6);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${placemark.point.lat},${placemark.point.lng}`;

  return (
    <InfoWindow
      position={{ lat: placemark.point.lat, lng: placemark.point.lng }}
      onCloseClick={onClose}
      pixelOffset={[0, -32]}
      headerContent={
        <div className="flex items-center gap-2 pr-6">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: placemark.categoryColor || '#2563eb' }}
          />
          <span className="font-semibold text-sm text-slate-900 truncate max-w-[220px]">
            {placemark.name}
          </span>
        </div>
      }
    >
      <div className="max-w-xs md:max-w-sm text-slate-700 pt-1 pb-1">
        {/* Category & Type badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-white shadow-2xs"
            style={{ backgroundColor: placemark.categoryColor || '#2563eb' }}
          >
            {placemark.category}
          </span>

          {placemark.geometryType !== 'Point' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <Layers className="w-3 h-3" />
              {placemark.geometryType === 'LineString' ? 'Trilha / Linha' : 'Área / Polígono'}
            </span>
          )}

          {placemark.folderName && placemark.folderName !== placemark.category && (
            <span className="text-[10px] text-slate-400">
              📁 {placemark.folderName}
            </span>
          )}
        </div>

        {/* Coordinates bar */}
        <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/80 rounded-md px-2.5 py-1.5 mb-3">
          <span className="font-mono text-slate-600">
            {lat}, {lng}
          </span>
          <button
            onClick={handleCopyCoords}
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 ml-2 text-[10px] font-medium"
            title="Copiar coordenadas"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Description content */}
        {placemark.description ? (
          <div
            className="text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-1 mb-3 prose prose-xs prose-slate border-t border-slate-100 pt-2 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-1.5 [&_a]:text-blue-600 [&_table]:text-xs [&_table]:border-collapse"
            dangerouslySetInnerHTML={{ __html: placemark.description }}
          />
        ) : (
          <p className="text-xs text-slate-400 italic mb-3">Sem descrição disponível no arquivo.</p>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => onSetAsDestination(placemark)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-white" />
            <span>Rota até aqui</span>
          </button>

          <button
            onClick={() => onSetAsOrigin(placemark)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-white" />
            <span>Partir daqui</span>
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-3">
          <a
            href={createWhatsAppUrl(placemark)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <MessageSquare className="w-3 h-3 text-emerald-600" />
            <span>Enviar no WhatsApp</span>
          </a>
          <span className="text-slate-300">•</span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>
    </InfoWindow>
  );
}
