import { useState } from 'react';
import { LatLng, TravelMode, RouteResultDetails, PlacemarkFeature } from '../types/kml';
import {
  Navigation,
  Car,
  Footprints,
  Bike,
  Bus,
  ArrowUpDown,
  LocateFixed,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Milestone,
} from 'lucide-react';

interface RoutePanelProps {
  origin: LatLng | null;
  originLabel: string;
  originType: 'gps' | 'map_click' | 'placemark' | null;
  destination: LatLng | null;
  destinationLabel: string;
  travelMode: TravelMode;
  routeDetails: RouteResultDetails | null;
  routeLoading: boolean;
  routeError: string | null;
  isPickingOnMap: boolean;
  placemarks: PlacemarkFeature[];
  onSetTravelMode: (mode: TravelMode) => void;
  onRequestGpsLocation: () => void;
  onTogglePickOnMap: () => void;
  onSelectPlacemarkAsOrigin: (pm: PlacemarkFeature) => void;
  onSelectPlacemarkAsDestination: (pm: PlacemarkFeature) => void;
  onSwapPoints: () => void;
  onClearRoute: () => void;
}

export function RoutePanel({
  origin,
  originLabel,
  originType,
  destination,
  destinationLabel,
  travelMode,
  routeDetails,
  routeLoading,
  routeError,
  isPickingOnMap,
  placemarks,
  onSetTravelMode,
  onRequestGpsLocation,
  onTogglePickOnMap,
  onSelectPlacemarkAsOrigin,
  onSelectPlacemarkAsDestination,
  onSwapPoints,
  onClearRoute,
}: RoutePanelProps) {
  const [showSteps, setShowSteps] = useState(false);

  const travelModes: Array<{ mode: TravelMode; label: string; icon: any }> = [
    { mode: 'DRIVING', label: 'Carro', icon: Car },
    { mode: 'WALKING', label: 'A pé', icon: Footprints },
    { mode: 'BICYCLING', label: 'Bike', icon: Bike },
    { mode: 'TRANSIT', label: 'Ônibus/Metrô', icon: Bus },
  ];

  const canNavigateExternal = origin && destination;
  const externalMapsUrl = canNavigateExternal
    ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${travelMode.toLowerCase()}`
    : '#';

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Navigation className="w-4 h-4 fill-current rotate-45" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Traçar Rotas & Navegação</h3>
            <p className="text-[11px] text-slate-500">Google Maps Routes API integrada</p>
          </div>
        </div>

        {(origin || destination || routeDetails) && (
          <button
            onClick={onClearRoute}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-rose-50"
            title="Limpar rota atual"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Origin / Departure Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Ponto de Partida (Origem)</span>
          </label>
          {origin && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 font-medium px-1.5 py-0.5 rounded">
              {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
            </span>
          )}
        </div>

        {/* Origin Quick Options */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            onClick={onRequestGpsLocation}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all ${
              originType === 'gps'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Onde estou (GPS)</span>
          </button>

          <button
            onClick={onTogglePickOnMap}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all ${
              isPickingOnMap
                ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300 animate-pulse'
                : originType === 'map_click'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{isPickingOnMap ? 'Clique no Mapa...' : 'Marcar no Mapa'}</span>
          </button>
        </div>

        {/* Selected Origin label or select from placemarks */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 truncate">
            {origin ? (
              <span className="font-medium text-slate-900">
                {originType === 'gps' && '📍 '}
                {originType === 'map_click' && '📌 '}
                {originType === 'placemark' && '🚩 '}
                {originLabel}
              </span>
            ) : (
              <span className="text-slate-400 italic">
                Defina sua localização ou clique no mapa
              </span>
            )}
          </div>

          <select
            value={originType === 'placemark' && origin ? placemarks.find(p => p.point?.lat === origin.lat && p.point?.lng === origin.lng)?.id || '' : ''}
            onChange={(e) => {
              const pm = placemarks.find((p) => p.id === e.target.value);
              if (pm) onSelectPlacemarkAsOrigin(pm);
            }}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[130px]"
            title="Escolher um ponto do arquivo como partida"
          >
            <option value="">Locais KMZ...</option>
            {placemarks.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center -my-1">
        <button
          onClick={onSwapPoints}
          disabled={!origin || !destination}
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-200 shadow-2xs hover:rotate-180 duration-200"
          title="Inverter Origem e Destino"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Destination Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Destino Final</span>
          </label>
          {destination && (
            <span className="text-[10px] text-rose-700 bg-rose-50 font-medium px-1.5 py-0.5 rounded">
              {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 truncate">
            {destination ? (
              <span className="font-medium text-slate-900">🏁 {destinationLabel}</span>
            ) : (
              <span className="text-slate-400 italic">
                Selecione um marcador no mapa ou na lista
              </span>
            )}
          </div>

          <select
            value={destination ? placemarks.find(p => p.point?.lat === destination.lat && p.point?.lng === destination.lng)?.id || '' : ''}
            onChange={(e) => {
              const pm = placemarks.find((p) => p.id === e.target.value);
              if (pm) onSelectPlacemarkAsDestination(pm);
            }}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[130px]"
            title="Escolher destino do arquivo"
          >
            <option value="">Escolher...</option>
            {placemarks.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Travel Modes */}
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-slate-500">Meio de transporte:</span>
        <div className="grid grid-cols-4 gap-1.5">
          {travelModes.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => onSetTravelMode(mode)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                travelMode === mode
                  ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs font-semibold'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Helper instruction if picking point */}
      {isPickingOnMap && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
          <span>
            <strong>Modo Seleção Ativo:</strong> Clique em qualquer lugar no mapa para posicionar o ponto de partida.
          </span>
        </div>
      )}

      {/* Loading state */}
      {routeLoading && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-center gap-2 text-xs text-blue-700">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Calculando melhor trajeto no Google Maps...</span>
        </div>
      )}

      {/* Error state */}
      {routeError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{routeError}</span>
        </div>
      )}

      {/* Route Calculated Summary */}
      {routeDetails && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rota Calculada com Sucesso</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              {travelMode}
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Distância Total</span>
              <span className="text-base font-bold text-slate-900">
                {routeDetails.distanceText}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Tempo Estimado</span>
              <span className="text-base font-bold text-blue-600">
                {routeDetails.durationText}
              </span>
            </div>
          </div>

          {/* Action: Open in Google Maps */}
          {canNavigateExternal && (
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Navegar no Google Maps (GPS Turn-by-Turn)</span>
            </a>
          )}

          {/* Turn-by-turn guidance toggle */}
          {routeDetails.steps && routeDetails.steps.length > 0 && (
            <div>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-900 py-1 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Milestone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Passo a passo ({routeDetails.steps.length} instruções)</span>
                </span>
                {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSteps && (
                <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 border-t border-slate-200 pt-2">
                  {routeDetails.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-700 flex items-start gap-2 bg-white p-2 rounded border border-slate-100"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p
                          className="leading-snug text-slate-800"
                          dangerouslySetInnerHTML={{ __html: step.instruction }}
                        />
                        {(step.distanceText || step.durationText) && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {step.distanceText} • {step.durationText}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
