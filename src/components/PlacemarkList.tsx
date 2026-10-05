import { PlacemarkFeature } from '../types/kml';
import { MapPin, Navigation, Flag, Layers } from 'lucide-react';

interface PlacemarkListProps {
  placemarks: PlacemarkFeature[];
  selectedPlacemark: PlacemarkFeature | null;
  onSelectPlacemark: (pm: PlacemarkFeature) => void;
  onSetAsOrigin: (pm: PlacemarkFeature) => void;
  onSetAsDestination: (pm: PlacemarkFeature) => void;
}

export function PlacemarkList({
  placemarks,
  selectedPlacemark,
  onSelectPlacemark,
  onSetAsOrigin,
  onSetAsDestination,
}: PlacemarkListProps) {
  if (placemarks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-6 text-center text-slate-500 text-xs">
        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="font-semibold text-slate-700">Nenhum marcador encontrado</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Tente ajustar sua busca por texto ou reativar categorias no filtro.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100 font-medium px-1">
        <span>Lista de Locais ({placemarks.length})</span>
        <span className="text-[10px] text-slate-400">Clique para focar no mapa</span>
      </div>

      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {placemarks.map((pm) => {
          const isSelected = selectedPlacemark?.id === pm.id;
          return (
            <div
              key={pm.id}
              onClick={() => onSelectPlacemark(pm)}
              className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                  : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: pm.categoryColor || '#2563eb' }}
                  />
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 truncate block">
                      {pm.name}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {pm.category}
                      {pm.geometryType !== 'Point' && (
                        <span className="inline-flex items-center gap-0.5 text-slate-400">
                          • <Layers className="w-2.5 h-2.5" /> {pm.geometryType}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {pm.point && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {pm.point.lat.toFixed(3)}, {pm.point.lng.toFixed(3)}
                  </span>
                )}
              </div>

              {/* Action buttons inside card */}
              <div
                className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/40"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onSetAsOrigin(pm)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors flex items-center gap-1"
                  title="Definir como ponto de partida"
                >
                  <Navigation className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Partir daqui</span>
                </button>

                <button
                  onClick={() => onSetAsDestination(pm)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-1"
                  title="Traçar rota até este local"
                >
                  <Flag className="w-2.5 h-2.5 text-blue-600" />
                  <span>Rota até aqui</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
