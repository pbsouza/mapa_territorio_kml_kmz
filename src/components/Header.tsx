import { MapPin, Upload, Navigation, Menu, X, Route, Printer } from 'lucide-react';

interface HeaderProps {
  fileName: string;
  totalPlacemarks: number;
  filteredCount: number;
  hasActiveRoute: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenUploadTab: () => void;
  onRequestGps: () => void;
  onOpenRouteTab: () => void;
  onOpenPrintModal: () => void;
}

export function Header({
  fileName,
  totalPlacemarks,
  filteredCount,
  hasActiveRoute,
  sidebarOpen,
  onToggleSidebar,
  onOpenUploadTab,
  onRequestGps,
  onOpenRouteTab,
  onOpenPrintModal,
}: HeaderProps) {
  return (
    <header className="h-14 bg-slate-900 text-white px-3 md:px-5 flex items-center justify-between border-b border-slate-800 shadow-md shrink-0 z-30 select-none">
      {/* Brand & File Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          aria-label="Abrir menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-sm">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>KMZ Viewer</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded">
                Maps
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-xs">
              Visualizador KMZ com rotas integradas
            </p>
          </div>
        </div>

        {/* Current File indicator */}
        {fileName && (
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs text-slate-300">
            <span className="font-medium text-slate-200 truncate max-w-[200px]" title={fileName}>
              📄 {fileName}
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {filteredCount} de {totalPlacemarks} visíveis
            </span>
          </div>
        )}
      </div>

      {/* Quick Action Tools in Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRequestGps}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
          title="Detectar minha localização atual com GPS"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Onde Estou</span>
        </button>

        <button
          onClick={onOpenRouteTab}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
            hasActiveRoute
              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-sm animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
          }`}
          title="Abrir painel de rotas"
        >
          <Route className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">Traçar Rota</span>
        </button>

        <button
          onClick={onOpenPrintModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer border border-emerald-500"
          title="Imprimir mapa em PDF com links do Google Maps"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>PDF / Imprimir</span>
        </button>

        <button
          onClick={onOpenUploadTab}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          title="Carregar outro arquivo KMZ ou KML"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Abrir KMZ</span>
        </button>
      </div>
    </header>
  );
}
