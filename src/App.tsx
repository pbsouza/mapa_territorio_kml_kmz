import { useState, useMemo, useCallback } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { AlertCircle, X } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PlacemarkMarker } from './components/PlacemarkMarker';
import { PlacemarkInfoWindow } from './components/PlacemarkInfoWindow';
import { DepartureMarker } from './components/DepartureMarker';
import { MapLayers } from './components/MapLayers';
import { RouteLayer } from './components/RouteLayer';
import { MapControls } from './components/MapControls';
import { MapEventBridge } from './components/MapEventBridge';
import { PrintModal } from './components/PrintModal';
import { getSampleDataset } from './data/sampleKmz';
import { parseKmzOrKml } from './utils/kmzParser';
import {
  KmlDocument,
  PlacemarkFeature,
  LatLng,
  TravelMode,
  RouteResultDetails,
} from './types/kml';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA1L2a5Fc6F9LlFTFAwNtLkVuZgu2HzG_U';

// Inner Map view wrapper to access `useMap()`
function MapContent({
  filteredPlacemarks,
  selectedPlacemark,
  origin,
  originLabel,
  destination,
  travelMode,
  isPickingOnMap,
  kmlDoc,
  onSelectPlacemark,
  onSetAsOrigin,
  onSetAsDestination,
  onCloseInfoWindow,
  onRouteCalculated,
  onRouteError,
  onRouteLoadingChange,
  onMapClickPoint,
  onDragDeparture,
  onOpenPrintModal,
}: {
  filteredPlacemarks: PlacemarkFeature[];
  selectedPlacemark: PlacemarkFeature | null;
  origin: LatLng | null;
  originLabel: string;
  destination: LatLng | null;
  travelMode: TravelMode;
  isPickingOnMap: boolean;
  kmlDoc: KmlDocument;
  onSelectPlacemark: (pm: PlacemarkFeature) => void;
  onSetAsOrigin: (pm: PlacemarkFeature) => void;
  onSetAsDestination: (pm: PlacemarkFeature) => void;
  onCloseInfoWindow: () => void;
  onRouteCalculated: (d: RouteResultDetails | null) => void;
  onRouteError: (err: string | null) => void;
  onRouteLoadingChange: (loading: boolean) => void;
  onMapClickPoint: (pt: LatLng) => void;
  onDragDeparture: (pt: LatLng) => void;
  onOpenPrintModal: () => void;
}) {
  const map = useMap();

  // Enquadra todos os pontos do KMZ
  const handleFitBounds = useCallback(() => {
    if (!map) return;

    if (kmlDoc.bounds) {
      map.fitBounds(kmlDoc.bounds, 60);
    } else if (filteredPlacemarks.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredPlacemarks.forEach((pm) => {
        if (pm.point) bounds.extend(pm.point);
      });
      map.fitBounds(bounds, 60);
    }
  }, [map, kmlDoc.bounds, filteredPlacemarks]);

  // Request GPS and pan
  const handleGpsCenter = useCallback(() => {
    if (!map) return;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.panTo(pt);
          map.setZoom(15);
        },
        (err) => {
          console.warn('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [map]);

  return (
    <>
      {/* KML Lines and Polygons */}
      <MapLayers
        placemarks={filteredPlacemarks}
        onSelectPlacemark={onSelectPlacemark}
      />

      {/* Placemark Markers */}
      {filteredPlacemarks.map((pm) => {
        const isOrigin =
          origin?.lat === pm.point?.lat && origin?.lng === pm.point?.lng;
        const isDestination =
          destination?.lat === pm.point?.lat &&
          destination?.lng === pm.point?.lng;

        return (
          <PlacemarkMarker
            key={pm.id}
            placemark={pm}
            isSelected={selectedPlacemark?.id === pm.id}
            isOrigin={Boolean(isOrigin)}
            isDestination={Boolean(isDestination)}
            onClick={() => onSelectPlacemark(pm)}
          />
        );
      })}

      {/* Departure Marker (when custom point or GPS, distinct from placemark) */}
      {origin && (
        <DepartureMarker
          position={origin}
          label={originLabel}
          onDragEnd={onDragDeparture}
        />
      )}

      {/* InfoWindow popup */}
      <PlacemarkInfoWindow
        placemark={selectedPlacemark}
        onClose={onCloseInfoWindow}
        onSetAsOrigin={onSetAsOrigin}
        onSetAsDestination={onSetAsDestination}
      />

      {/* Modern Routes calculation and polyline rendering */}
      <RouteLayer
        origin={origin}
        destination={destination}
        travelMode={travelMode}
        onRouteCalculated={onRouteCalculated}
        onError={onRouteError}
        onLoadingChange={onRouteLoadingChange}
      />

      {/* Floating Map Controls */}
      <MapControls
        onFitBounds={handleFitBounds}
        onRequestGps={handleGpsCenter}
        onOpenPrintModal={onOpenPrintModal}
      />

      {/* Bridge to register clicks on map */}
      <MapEventBridge
        isPickingOnMap={isPickingOnMap}
        onMapClickPoint={onMapClickPoint}
      />
    </>
  );
}

export default function App() {
  // Initial sample dataset: Rio de Janeiro
  const [kmlDoc, setKmlDoc] = useState<KmlDocument>(() =>
    getSampleDataset('rio-de-janeiro')
  );

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    return new Set(kmlDoc.categories.map((c) => c.name));
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Selection & UI state
  const [selectedPlacemark, setSelectedPlacemark] = useState<PlacemarkFeature | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'places' | 'routes' | 'upload'>('places');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Routing state
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState('Ponto de Partida');
  const [originType, setOriginType] = useState<'gps' | 'map_click' | 'placemark' | null>(null);

  const [destination, setDestination] = useState<LatLng | null>(null);
  const [destinationLabel, setDestinationLabel] = useState('Destino');

  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING');
  const [routeDetails, setRouteDetails] = useState<RouteResultDetails | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);

  // Filtered placemarks calculation
  const filteredPlacemarks = useMemo(() => {
    return kmlDoc.placemarks.filter((pm) => {
      // Category check
      if (!selectedCategories.has(pm.category)) {
        return false;
      }
      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inName = pm.name.toLowerCase().includes(query);
        const inDesc = pm.description.toLowerCase().includes(query);
        const inCat = pm.category.toLowerCase().includes(query);
        return inName || inDesc || inCat;
      }
      return true;
    });
  }, [kmlDoc.placemarks, selectedCategories, searchQuery]);

  // Handle category toggle
  const handleToggleCategory = (catName: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(new Set(kmlDoc.categories.map((c) => c.name)));
  };

  const handleDeselectAllCategories = () => {
    setSelectedCategories(new Set());
  };

  // Placemark Selection
  const handleSelectPlacemark = (pm: PlacemarkFeature) => {
    setSelectedPlacemark(pm);
  };

  const handleCloseInfoWindow = () => {
    setSelectedPlacemark(null);
  };

  // Set Placemark as Destination
  const handleSetAsDestination = (pm: PlacemarkFeature) => {
    if (!pm.point) return;
    setDestination(pm.point);
    setDestinationLabel(pm.name);
    setActiveTab('routes');
    setSidebarOpen(true);
  };

  // Set Placemark as Origin
  const handleSetAsOrigin = (pm: PlacemarkFeature) => {
    if (!pm.point) return;
    setOrigin(pm.point);
    setOriginLabel(pm.name);
    setOriginType('placemark');
    setIsPickingOnMap(false);
    setActiveTab('routes');
    setSidebarOpen(true);
  };

  // Geolocation request
  const handleRequestGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      setRouteError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(pt);
        setOriginLabel('Minha Localização (GPS)');
        setOriginType('gps');
        setIsPickingOnMap(false);
        setRouteLoading(false);
        setActiveTab('routes');
      },
      (err) => {
        setRouteLoading(false);
        console.warn('Geolocation error:', err);
        setRouteError(
          'Não foi possível obter sua localização GPS. Verifique a permissão do navegador.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map click picking
  const handleTogglePickOnMap = () => {
    setIsPickingOnMap((prev) => !prev);
  };

  const handleMapClickPoint = (pt: LatLng) => {
    setOrigin(pt);
    setOriginLabel(`Ponto marcado (${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)})`);
    setOriginType('map_click');
    setIsPickingOnMap(false);
    setActiveTab('routes');
  };

  const handleDragDeparture = (pt: LatLng) => {
    setOrigin(pt);
    setOriginLabel(`Ponto de partida (${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)})`);
  };

  // Swap Points
  const handleSwapPoints = () => {
    const prevOrigin = origin;
    const prevOriginLabel = originLabel;
    const prevDest = destination;
    const prevDestLabel = destinationLabel;

    setOrigin(prevDest);
    setOriginLabel(prevDestLabel);
    setOriginType(prevDest ? 'placemark' : null);

    setDestination(prevOrigin);
    setDestinationLabel(prevOriginLabel);
  };

  // Clear Route
  const handleClearRoute = () => {
    setOrigin(null);
    setOriginLabel('Ponto de Partida');
    setOriginType(null);
    setDestination(null);
    setDestinationLabel('Destino');
    setRouteDetails(null);
    setRouteError(null);
    setIsPickingOnMap(false);
  };

  // Load sample dataset
  const handleLoadSample = (sampleId: string) => {
    const doc = getSampleDataset(sampleId);
    setKmlDoc(doc);
    setSelectedCategories(new Set(doc.categories.map((c) => c.name)));
    setSelectedPlacemark(null);
    handleClearRoute();
    setActiveTab('places');
  };

  // Upload custom file (.kmz or .kml)
  const handleFileUpload = async (file: File) => {
    try {
      setIsLoadingFile(true);
      setFileUploadError(null);
      const parsedDoc = await parseKmzOrKml(file);
      setKmlDoc(parsedDoc);
      setSelectedCategories(new Set(parsedDoc.categories.map((c) => c.name)));
      setSelectedPlacemark(null);
      handleClearRoute();
      setActiveTab('places');
      setIsLoadingFile(false);
    } catch (err: any) {
      setIsLoadingFile(false);
      const msg =
        err?.message ||
        'Não foi possível interpretar o arquivo. Verifique se é um arquivo KMZ ou KML válido.';
      setFileUploadError(msg);
      setActiveTab('upload');
      setSidebarOpen(true);
    }
  };

  // Initial center coordinates
  const initialCenter = useMemo(() => {
    if (kmlDoc.placemarks.length > 0 && kmlDoc.placemarks[0].point) {
      return kmlDoc.placemarks[0].point;
    }
    return { lat: -22.951916, lng: -43.210487 };
  }, [kmlDoc]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Header */}
      <Header
        fileName={kmlDoc.title || kmlDoc.fileName}
        totalPlacemarks={kmlDoc.placemarks.length}
        filteredCount={filteredPlacemarks.length}
        hasActiveRoute={Boolean(routeDetails)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenUploadTab={() => {
          setActiveTab('upload');
          setSidebarOpen(true);
        }}
        onRequestGps={handleRequestGpsLocation}
        onOpenRouteTab={() => {
          setActiveTab('routes');
          setSidebarOpen(true);
        }}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
      />

      {/* Main Workspace: Sidebar + Map */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar Panel */}
        <Sidebar
          kmlDoc={kmlDoc}
          selectedCategories={selectedCategories}
          searchQuery={searchQuery}
          filteredPlacemarks={filteredPlacemarks}
          selectedPlacemark={selectedPlacemark}
          activeTab={activeTab}
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
          isLoadingFile={isLoadingFile}
          isOpen={sidebarOpen}
          onTabChange={setActiveTab}
          onToggleCategory={handleToggleCategory}
          onSelectAllCategories={handleSelectAllCategories}
          onDeselectAllCategories={handleDeselectAllCategories}
          onSearchChange={setSearchQuery}
          onSelectPlacemark={handleSelectPlacemark}
          onSetAsOrigin={handleSetAsOrigin}
          onSetAsDestination={handleSetAsDestination}
          onSetTravelMode={setTravelMode}
          onRequestGpsLocation={handleRequestGpsLocation}
          onTogglePickOnMap={handleTogglePickOnMap}
          onSwapPoints={handleSwapPoints}
          onClearRoute={handleClearRoute}
          onFileUpload={handleFileUpload}
          onLoadSample={handleLoadSample}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          uploadError={fileUploadError}
          onClearUploadError={() => setFileUploadError(null)}
        />

        {/* Map Container */}
        <main className="flex-1 relative h-full w-full bg-slate-900">
          {fileUploadError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-md w-[92%] bg-rose-900/95 text-white p-3 rounded-xl shadow-xl border border-rose-700/80 backdrop-blur-md flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold block text-rose-100">Não foi possível carregar o arquivo:</span>
                <span className="text-rose-200">{fileUploadError}</span>
              </div>
              <button
                onClick={() => setFileUploadError(null)}
                className="text-rose-300 hover:text-white p-1 cursor-pointer"
                title="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <APIProvider apiKey={API_KEY} language="pt-BR" region="BR">
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={initialCenter}
              defaultZoom={12}
              gestureHandling="greedy"
              disableDefaultUI={false}
              fullscreenControl={false}
              streetViewControl={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapContent
                filteredPlacemarks={filteredPlacemarks}
                selectedPlacemark={selectedPlacemark}
                origin={origin}
                originLabel={originLabel}
                destination={destination}
                travelMode={travelMode}
                isPickingOnMap={isPickingOnMap}
                kmlDoc={kmlDoc}
                onSelectPlacemark={handleSelectPlacemark}
                onSetAsOrigin={handleSetAsOrigin}
                onSetAsDestination={handleSetAsDestination}
                onCloseInfoWindow={handleCloseInfoWindow}
                onRouteCalculated={setRouteDetails}
                onRouteError={setRouteError}
                onRouteLoadingChange={setRouteLoading}
                onMapClickPoint={handleMapClickPoint}
                onDragDeparture={handleDragDeparture}
                onOpenPrintModal={() => setIsPrintModalOpen(true)}
              />
            </Map>
          </APIProvider>
        </main>
      </div>

      {/* Print PDF Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        documentTitle={kmlDoc.title || kmlDoc.fileName}
        placemarks={filteredPlacemarks}
        origin={origin}
        originLabel={originLabel}
        routeDetails={routeDetails}
        apiKey={API_KEY}
      />
    </div>
  );
}
