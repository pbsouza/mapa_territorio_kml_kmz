import { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Download,
  ExternalLink,
  MapPin,
  Copy,
  Check,
  Navigation,
  FileText,
  Loader2,
  Compass,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  MessageSquare,
} from 'lucide-react';
import { PlacemarkFeature, LatLng, RouteResultDetails } from '../types/kml';
import {
  createMiniMapCanvas,
  generateAndDownloadPdf,
  createWhatsAppUrl,
} from '../utils/pdfGenerator';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  placemarks: PlacemarkFeature[];
  origin: LatLng | null;
  originLabel: string;
  routeDetails: RouteResultDetails | null;
  apiKey: string;
}

export function PrintModal({
  isOpen,
  onClose,
  documentTitle,
  placemarks,
  origin,
  originLabel,
  routeDetails,
  apiKey,
}: PrintModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(placemarks.map((p) => p.id));
  });

  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const [customTitle, setCustomTitle] = useState(
    documentTitle ? `Roteiro & Locais - ${documentTitle}` : 'Mapa de Localidades & Rotas'
  );
  const [showQrCodes, setShowQrCodes] = useState(true);
  const [useOriginInLink, setUseOriginInLink] = useState(false);
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [miniMapImages, setMiniMapImages] = useState<Record<string, string>>({});
  const [copiedAll, setCopiedAll] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [printBlockedNotice, setPrintBlockedNotice] = useState(false);

  // Sync selectedIds when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(placemarks.map((p) => p.id)));
      setCustomTitle(
        documentTitle ? `Roteiro & Locais - ${documentTitle}` : 'Mapa de Localidades & Rotas'
      );
      if (placemarks.length > 0) {
        setActivePreviewId(placemarks[0].id);
      }
    }
  }, [isOpen, placemarks, documentTitle]);

  // Selected placemarks
  const selectedPlacemarks = useMemo(() => {
    return placemarks.filter((p) => selectedIds.has(p.id) && p.point);
  }, [placemarks, selectedIds]);

  const activePlacemark = useMemo(() => {
    if (!activePreviewId) return selectedPlacemarks[0] || null;
    return placemarks.find((p) => p.id === activePreviewId) || selectedPlacemarks[0] || null;
  }, [activePreviewId, placemarks, selectedPlacemarks]);

  // Generate Google Maps navigation link
  const getMapsUrl = (pm: PlacemarkFeature): string => {
    if (!pm.point) return '';
    if (useOriginInLink && origin) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${pm.point.lat},${pm.point.lng}`;
    }
    // Default: destination only -> Google Maps automatically uses user's current GPS location ("Sua localização")
    return `https://www.google.com/maps/dir/?api=1&destination=${pm.point.lat},${pm.point.lng}`;
  };

  // Generate mini-maps and QR codes for all selected locations
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const miniMaps: Record<string, string> = {};
    const qrs: Record<string, string> = {};

    async function generateAssets() {
      for (const pm of selectedPlacemarks) {
        if (!pm.point) continue;

        // 1. Generate stylized mini-map canvas
        const miniMapData = createMiniMapCanvas(
          pm.point,
          pm.name,
          pm.categoryColor || '#2563eb',
          320,
          180
        );
        miniMaps[pm.id] = miniMapData;

        // 2. Generate QR code
        const url = getMapsUrl(pm);
        if (url) {
          try {
            const qrData = await QRCode.toDataURL(url, {
              width: 140,
              margin: 1,
              color: { dark: '#0f172a', light: '#ffffff' },
            });
            qrs[pm.id] = qrData;
          } catch (e) {
            console.warn('QR error:', e);
          }
        }
      }

      if (isMounted) {
        setMiniMapImages(miniMaps);
        setQrCodeMap(qrs);
      }
    }

    generateAssets();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedPlacemarks, useOriginInLink, origin]);

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(placemarks.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Direct client-side PDF export (independent of window.print)
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      setExportSuccess(false);

      await generateAndDownloadPdf({
        title: customTitle,
        placemarks: selectedPlacemarks,
        origin,
        originLabel,
        routeDetails,
      });

      setIsExportingPdf(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      setIsExportingPdf(false);
      console.error('Error generating PDF:', err);
      alert('Não foi possível gerar o PDF diretamente. Tente a opção "Baixar HTML Imprimível".');
    }
  };

  // Try window.print() with fallback notification if blocked in iframe
  const handlePrint = () => {
    try {
      setPrintBlockedNotice(false);
      const res = window.print();
    } catch (e) {
      setPrintBlockedNotice(true);
    }
    // Also set notice in case window.print was silently ignored by iframe sandbox
    setTimeout(() => {
      setPrintBlockedNotice(true);
    }, 1500);
  };

  // Copy all links
  const handleCopyAllLinks = () => {
    const text = selectedPlacemarks
      .map((pm, idx) => {
        const url = getMapsUrl(pm);
        return `${idx + 1}. ${pm.name} (${pm.category})\nCoordenadas: ${pm.point?.lat.toFixed(5)}, ${pm.point?.lng.toFixed(5)}\nLink da Rota: ${url}\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Export self-contained standalone HTML file with clickable links & mini-maps
  const handleDownloadHtml = () => {
    const cardsHtml = selectedPlacemarks
      .map((pm, idx) => {
        const url = getMapsUrl(pm);
        const waUrl = createWhatsAppUrl(pm);
        const mapImg = miniMapImages[pm.id] || '';
        const qrImg = qrCodeMap[pm.id] || '';
        return `
        <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #fff; page-break-inside: avoid; display: flex; gap: 16px;">
          ${mapImg ? `<img src="${mapImg}" style="width: 140px; height: 90px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: cover;" alt="Mini mapa de ${pm.name}"/>` : ''}
          <div style="flex: 1;">
            <div style="font-size: 16px; font-weight: bold; color: #0f172a;">${idx + 1}. ${pm.name}</div>
            <div style="font-size: 12px; color: ${pm.categoryColor || '#2563eb'}; font-weight: bold; margin-top: 4px;">${pm.category}</div>
            <div style="font-size: 12px; font-family: monospace; color: #64748b; margin-top: 4px;">Lat: ${pm.point?.lat.toFixed(5)}, Lng: ${pm.point?.lng.toFixed(5)}</div>
            <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="${url}" target="_blank" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: bold;">
                🧭 Abrir Rota no Google Maps
              </a>
              <a href="${waUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: bold;">
                💬 Enviar no WhatsApp
              </a>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 6px; word-break: break-all;">${url}</div>
          </div>
          ${qrImg ? `<div style="text-align: center;"><img src="${qrImg}" style="width: 70px; height: 70px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 6px;" alt="QR Code"/><div style="font-size: 9px; color: #64748b; margin-top: 2px;">Ler no celular</div></div>` : ''}
        </div>
      `;
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${customTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { margin-top: 0; font-size: 24px; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
    @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>${customTitle}</h1>
    <p style="color: #64748b; font-size: 13px;">Documento com mini-mapas e links de rota direta no Google Maps (partindo da sua localização GPS atual).</p>
    ${cardsHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${customTitle.toLowerCase().replace(/[^a-z0-9_-]/gi, '_')}.html`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-auto flex flex-col border border-slate-200 overflow-hidden max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Exportar Mapa &amp; Localidades em PDF</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                  Download Direto
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gera um arquivo PDF com mini-mapa de cada ponto e link clicável de rota para o Google Maps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Options Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 space-y-2.5 shrink-0">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Título do PDF a Exportar:
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-4 sm:pt-0">
              {/* PRIMARY ACTION: Download PDF file directly */}
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf || selectedPlacemarks.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando PDF...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>PDF Baixado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar Arquivo PDF (.pdf)</span>
                  </>
                )}
              </button>

              {/* SECONDARY ACTION: Standalone HTML */}
              <button
                onClick={handleDownloadHtml}
                disabled={selectedPlacemarks.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Baixar arquivo HTML portátil com mini-mapas e links"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Baixar HTML</span>
              </button>

              {/* BROWSER PRINT TRIGGER */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Tentar abrir caixa de diálogo de impressão do navegador"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Configuration Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-800">
                {selectedPlacemarks.length} de {placemarks.length} locais incluídos
              </span>
              <button onClick={selectAll} className="text-blue-600 hover:underline">
                Marcar todos
              </button>
              <span>•</span>
              <button onClick={deselectAll} className="text-slate-500 hover:underline">
                Desmarcar
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQrCodes}
                  onChange={(e) => setShowQrCodes(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Incluir QR Codes nos cartões</span>
              </label>

              <button
                onClick={handleCopyAllLinks}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300"
              >
                {copiedAll ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAll ? 'Copiados!' : 'Copiar Links'}</span>
              </button>
            </div>
          </div>

          {/* Iframe Notice */}
          {printBlockedNotice && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  O navegador restringiu a janela de impressão dentro deste quadro. Utilize o botão verde <strong>&quot;Baixar Arquivo PDF (.pdf)&quot;</strong> acima para baixar o arquivo completo diretamente!
                </span>
              </div>
              <button
                onClick={() => setPrintBlockedNotice(false)}
                className="text-amber-800 hover:text-amber-950 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Main Body: Split into Interactive Mini-map inspector + List of items */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left / Top: Focused Mini-map Preview of Selected Location */}
          <div className="md:col-span-5 p-4 bg-slate-50 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Mini-Mapa da Localidade</span>
              </div>
              <span className="text-[10px] text-slate-500">Prévia no PDF</span>
            </div>

            {activePlacemark && activePlacemark.point ? (
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-3.5 space-y-3">
                {/* Mini-map canvas rendering */}
                <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100 aspect-video flex items-center justify-center">
                  {miniMapImages[activePlacemark.id] ? (
                    <img
                      src={miniMapImages[activePlacemark.id]}
                      alt={`Mini mapa de ${activePlacemark.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Gerando pequeno mapa...</span>
                    </div>
                  )}

                  {/* Marker overlay badge */}
                  <div className="absolute top-2 left-2 bg-slate-900/85 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                    Ponto {selectedPlacemarks.findIndex((p) => p.id === activePlacemark.id) + 1}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activePlacemark.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.2 rounded-full text-white"
                      style={{ backgroundColor: activePlacemark.categoryColor || '#2563eb' }}
                    >
                      {activePlacemark.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {activePlacemark.point.lat.toFixed(5)}, {activePlacemark.point.lng.toFixed(5)}
                    </span>
                  </div>
                </div>

                {/* Direct route & WhatsApp actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                  <a
                    href={getMapsUrl(activePlacemark)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 rotate-45" />
                    <span>Testar Rota no Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-blue-200" />
                  </a>

                  <a
                    href={createWhatsAppUrl(activePlacemark)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Enviar dados no WhatsApp</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-emerald-200" />
                  </a>

                  <p className="text-[10px] text-slate-400 leading-tight">
                    💡 O WhatsApp abre com resumo formatado, categoria, coordenadas e link direto para rota no GPS.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Selecione uma localidade na lista para inspecionar seu pequeno mapa.
              </div>
            )}

            {/* Quick Tips */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Como funciona no PDF:
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Cada cartão no PDF contém o pequeno mapa ilustrativo da área, as coordenadas, o QR Code e um botão azul clicável que redireciona diretamente ao Google Maps.
              </p>
            </div>
          </div>

          {/* Right: Full List of Items Included in PDF */}
          <div className="md:col-span-7 p-4 overflow-y-auto space-y-2.5 bg-white">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                Locais no Documento ({selectedPlacemarks.length})
              </span>
              <span className="text-[10px] text-slate-400">Clique para ver o pequeno mapa</span>
            </div>

            {selectedPlacemarks.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs italic">
                Nenhum local selecionado para exportação. Marque as caixas para incluir no PDF.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPlacemarks.map((pm, idx) => {
                  const isFocused = activePlacemark?.id === pm.id;
                  const url = getMapsUrl(pm);
                  const qr = qrCodeMap[pm.id];
                  const miniMap = miniMapImages[pm.id];

                  return (
                    <div
                      key={pm.id}
                      onClick={() => setActivePreviewId(pm.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isFocused
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {/* Checkbox + Thumb mini map + Info */}
                      <div className="flex items-center gap-3 truncate">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(pm.id);
                          }}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        </button>

                        {/* Small Map Thumb */}
                        {miniMap ? (
                          <img
                            src={miniMap}
                            alt=""
                            className="w-14 h-10 rounded border border-slate-200 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        )}

                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {pm.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: pm.categoryColor || '#2563eb' }}
                            />
                            <span>{pm.category}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">
                              {pm.point?.lat.toFixed(4)}, {pm.point?.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Link Button & QR */}
                      <div className="flex items-center gap-2 shrink-0">
                        {qr && (
                          <img
                            src={qr}
                            alt="QR"
                            className="w-8 h-8 rounded border border-slate-200 hidden sm:block"
                          />
                        )}

                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Abrir rota no Google Maps"
                        >
                          <Navigation className="w-3 h-3 rotate-45 text-blue-600" />
                          <span className="hidden sm:inline">Rota</span>
                        </a>

                        <a
                          href={createWhatsAppUrl(pm)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Enviar dados desta localidade no WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {selectedPlacemarks.length} localidades prontas para gerar PDF
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || selectedPlacemarks.length === 0}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
