import { useState } from 'react';
import { CategoryFilter } from './CategoryFilter';
import { PlacemarkList } from './PlacemarkList';
import { RoutePanel } from './RoutePanel';
import { KmzUploader } from './KmzUploader';
import { KmlDocument, PlacemarkFeature, LatLng, TravelMode, RouteResultDetails } from '../types/kml';
import { MapPin, Navigation, Upload, Layers, Printer } from 'lucide-react';

interface SidebarProps {
  kmlDoc: KmlDocument;
  selectedCategories: Set<string>;
  searchQuery: string;
  filteredPlacemarks: PlacemarkFeature[];
  selectedPlacemark: PlacemarkFeature | null;
  activeTab: 'places' | 'routes' | 'upload';
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
  isLoadingFile: boolean;
  isOpen: boolean;
  onTabChange: (tab: 'places' | 'routes' | 'upload') => void;
  onToggleCategory: (catName: string) => void;
  onSelectAllCategories: () => void;
  onDeselectAllCategories: () => void;
  onSearchChange: (q: string) => void;
  onSelectPlacemark: (pm: PlacemarkFeature) => void;
  onSetAsOrigin: (pm: PlacemarkFeature) => void;
  onSetAsDestination: (pm: PlacemarkFeature) => void;
  onSetTravelMode: (mode: TravelMode) => void;
  onRequestGpsLocation: () => void;
  onTogglePickOnMap: () => void;
  onSwapPoints: () => void;
  onClearRoute: () => void;
  onFileUpload: (file: File) => void;
  onLoadSample: (sampleId: string) => void;
  onOpenPrintModal: () => void;
  uploadError?: string | null;
  onClearUploadError?: () => void;
}

export function Sidebar({
  kmlDoc,
  selectedCategories,
  searchQuery,
  filteredPlacemarks,
  selectedPlacemark,
  activeTab,
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
  isLoadingFile,
  isOpen,
  onTabChange,
  onToggleCategory,
  onSelectAllCategories,
  onDeselectAllCategories,
  onSearchChange,
  onSelectPlacemark,
  onSetAsOrigin,
  onSetAsDestination,
  onSetTravelMode,
  onRequestGpsLocation,
  onTogglePickOnMap,
  onSwapPoints,
  onClearRoute,
  onFileUpload,
  onLoadSample,
  onOpenPrintModal,
  uploadError,
  onClearUploadError,
}: SidebarProps) {
  return (
    <aside
      className={`fixed md:static inset-y-14 left-0 w-full sm:w-96 md:w-[410px] bg-slate-100/95 backdrop-blur-md border-r border-slate-200 shadow-xl md:shadow-none z-20 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-3 pt-2.5 gap-1 shrink-0">
        <button
          onClick={() => onTabChange('places')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'places'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Locais & Filtros</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
            {filteredPlacemarks.length}
          </span>
        </button>

        <button
          onClick={() => onTabChange('routes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'routes'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 rotate-45" />
          <span>Rotas</span>
          {routeDetails && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => onTabChange('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Arquivo KMZ</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'places' && (
          <>
            <CategoryFilter
              categories={kmlDoc.categories}
              selectedCategories={selectedCategories}
              searchQuery={searchQuery}
              totalPlacemarks={kmlDoc.placemarks.length}
              filteredCount={filteredPlacemarks.length}
              onToggleCategory={onToggleCategory}
              onSelectAllCategories={onSelectAllCategories}
              onDeselectAllCategories={onDeselectAllCategories}
              onSearchChange={onSearchChange}
            />

            <PlacemarkList
              placemarks={filteredPlacemarks}
              selectedPlacemark={selectedPlacemark}
              onSelectPlacemark={onSelectPlacemark}
              onSetAsOrigin={onSetAsOrigin}
              onSetAsDestination={onSetAsDestination}
            />
          </>
        )}

        {activeTab === 'routes' && (
          <RoutePanel
            origin={origin}
            originLabel={originLabel}
            originType={originType}
            destination={destination}
            destinationLabel={destinationLabel}
            travelMode={travelMode}
            routeDetails={routeDetails}
            routeLoading={routeLoading}
            routeError={routeError}
            isPickingOnMap={isPickingOnMap}
            placemarks={kmlDoc.placemarks}
            onSetTravelMode={onSetTravelMode}
            onRequestGpsLocation={onRequestGpsLocation}
            onTogglePickOnMap={onTogglePickOnMap}
            onSelectPlacemarkAsOrigin={onSetAsOrigin}
            onSelectPlacemarkAsDestination={onSetAsDestination}
            onSwapPoints={onSwapPoints}
            onClearRoute={onClearRoute}
          />
        )}

        {activeTab === 'upload' && (
          <KmzUploader
            currentFileName={kmlDoc.fileName}
            placemarkCount={kmlDoc.placemarks.length}
            isLoading={isLoadingFile}
            uploadError={uploadError}
            onFileUpload={onFileUpload}
            onLoadSample={onLoadSample}
            onClearError={onClearUploadError}
          />
        )}
      </div>

      {/* Footer info banner & print trigger */}
      <div className="px-3 py-2 bg-white/95 border-t border-slate-200 flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 truncate max-w-[220px]">
            <Layers className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="truncate">{kmlDoc.title || kmlDoc.fileName}</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400 shrink-0">
            {filteredPlacemarks.length} exibidos
          </span>
        </div>

        <button
          onClick={onOpenPrintModal}
          className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          title="Imprimir mapa em PDF com links de rota para o Google Maps"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-600" />
          <span>Imprimir Mapa em PDF (com links)</span>
        </button>
      </div>
    </aside>
  );
}
