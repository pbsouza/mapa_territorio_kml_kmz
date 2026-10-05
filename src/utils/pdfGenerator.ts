import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { PlacemarkFeature, LatLng, RouteResultDetails } from '../types/kml';

/**
 * Generates formatted text and WhatsApp share URL for a placemark
 */
export function createWhatsAppMessage(pm: PlacemarkFeature): string {
  const coords = pm.point ? `${pm.point.lat.toFixed(5)}, ${pm.point.lng.toFixed(5)}` : '';
  const mapsUrl = pm.point
    ? `https://www.google.com/maps/dir/?api=1&destination=${pm.point.lat},${pm.point.lng}`
    : '';

  let msg = `📍 *Local:* ${pm.name}\n`;
  msg += `🏷️ *Categoria:* ${pm.category}\n`;
  if (coords) {
    msg += `📌 *Coordenadas:* ${coords}\n`;
  }
  if (pm.description && pm.description.trim()) {
    const cleanDesc = pm.description.replace(/<[^>]*>/g, '').trim();
    if (cleanDesc) {
      msg += `📝 *Info:* ${cleanDesc.slice(0, 110)}${cleanDesc.length > 110 ? '...' : ''}\n`;
    }
  }
  if (mapsUrl) {
    msg += `🗺️ *Traçar rota no Google Maps:*\n${mapsUrl}`;
  }
  return msg;
}

export function createWhatsAppUrl(pm: PlacemarkFeature): string {
  const text = createWhatsAppMessage(pm);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Generates an in-memory canvas image representing a stylized mini-map for a coordinate
 */
export function createMiniMapCanvas(
  point: LatLng,
  name: string,
  categoryColor: string,
  width = 320,
  height = 180
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background map terrain styling (soft warm neutral / topographic tone)
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, width, height);

  // Decorative map grid / road grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  const gridSize = 24;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Simulated road vectors
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.45);
  ctx.bezierCurveTo(width * 0.3, height * 0.4, width * 0.6, height * 0.6, width, height * 0.5);
  ctx.stroke();

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.4, 0);
  ctx.bezierCurveTo(width * 0.45, height * 0.3, width * 0.55, height * 0.7, width * 0.6, height);
  ctx.stroke();

  // Secondary avenues
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.45);
  ctx.bezierCurveTo(width * 0.3, height * 0.4, width * 0.6, height * 0.6, width, height * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.4, 0);
  ctx.bezierCurveTo(width * 0.45, height * 0.3, width * 0.55, height * 0.7, width * 0.6, height);
  ctx.stroke();

  // Simulated water body / park area in corner
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.arc(width * 0.15, height * 0.85, 45, 0, Math.PI * 2);
  ctx.fill();

  // Target Location Pin (Center)
  const cx = width / 2;
  const cy = height / 2;

  // Outer glow / radar ring
  ctx.strokeStyle = categoryColor || '#2563eb';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = (categoryColor || '#2563eb') + '22';
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();

  // Pin circle
  ctx.fillStyle = categoryColor || '#2563eb';
  ctx.beginPath();
  ctx.arc(cx, cy - 6, 9, 0, Math.PI * 2);
  ctx.fill();

  // White inner dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy - 6, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Pin pointer
  ctx.fillStyle = categoryColor || '#2563eb';
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 3);
  ctx.lineTo(cx, cy + 5);
  ctx.lineTo(cx + 5, cy - 3);
  ctx.closePath();
  ctx.fill();

  // Compass Rose in top-right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(width - 32, 6, 26, 26);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(width - 32, 6, 26, 26);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', width - 19, 17);
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(width - 19, 19);
  ctx.lineTo(width - 23, 27);
  ctx.lineTo(width - 15, 27);
  ctx.closePath();
  ctx.fill();

  // Coordinates badge bottom-left
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  const coordText = `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
  ctx.font = '10px monospace';
  const textWidth = ctx.measureText(coordText).width;
  ctx.fillRect(6, height - 22, textWidth + 12, 16);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(coordText, 12, height - 10);

  // Scale indicator bottom-right
  ctx.fillStyle = '#475569';
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('500 m', width - 8, height - 12);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width - 45, height - 7);
  ctx.lineTo(width - 8, height - 7);
  ctx.moveTo(width - 45, height - 10);
  ctx.lineTo(width - 45, height - 4);
  ctx.moveTo(width - 8, height - 10);
  ctx.lineTo(width - 8, height - 4);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

/**
 * Generates and downloads a clean, professional PDF with interactive Google Maps links
 */
export async function generateAndDownloadPdf({
  title,
  placemarks,
  origin,
  originLabel,
  routeDetails,
}: {
  title: string;
  placemarks: PlacemarkFeature[];
  origin: LatLng | null;
  originLabel: string;
  routeDetails: RouteResultDetails | null;
}): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let cursorY = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, cursorY, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title.slice(0, 48), margin + 8, cursorY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(
    `Gerado em: ${dateStr} • ${placemarks.length} localidades • Links de rota do Google Maps inclusos`,
    margin + 8,
    cursorY + 18
  );

  cursorY += 28;

  // Route Info (if route is active)
  if (routeDetails && origin) {
    doc.setFillColor(240, 249, 255); // sky-50
    doc.setDrawColor(186, 230, 253); // sky-200
    doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(3, 105, 161); // sky-700
    doc.text('Rota Ativa no Mapa:', margin + 4, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text(
      `Partida: ${originLabel} | Distância: ${routeDetails.distanceText} | Tempo: ${routeDetails.durationText}`,
      margin + 4,
      cursorY + 11
    );

    cursorY += 18;
  }

  // Pre-generate QR codes and mini-maps for each placemark
  const cardHeight = 44;
  const cardsPerPage = Math.floor((pageHeight - cursorY - margin) / (cardHeight + 4));

  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i];
    if (!pm.point) continue;

    // Check if new page is needed
    if (cursorY + cardHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;

      // Small header on continuation pages
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, cursorY, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${title} (continuação)`, margin + 4, cursorY + 5.5);
      cursorY += 12;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pm.point.lat},${pm.point.lng}`;
    const waUrl = createWhatsAppUrl(pm);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 2, 2, 'FD');

    // 1. Mini-map canvas
    const miniMapData = createMiniMapCanvas(
      pm.point,
      pm.name,
      pm.categoryColor || '#2563eb',
      240,
      140
    );
    const mapW = 42;
    const mapH = 24.5;
    try {
      doc.addImage(miniMapData, 'PNG', margin + 3, cursorY + 4, mapW, mapH);
    } catch (e) {
      console.warn('Mini-map embed error', e);
    }

    // 2. Placemark details
    const textStartX = margin + mapW + 6;
    const textAvailableWidth = contentWidth - mapW - 32;

    // Index & Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    const displayName = `${i + 1}. ${pm.name}`;
    doc.text(displayName.slice(0, 42), textStartX, cursorY + 8);

    // Category badge text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(`[${pm.category}]`, textStartX, cursorY + 13.5);

    // Coordinates
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(
      `Lat: ${pm.point.lat.toFixed(5)}, Lng: ${pm.point.lng.toFixed(5)}`,
      textStartX,
      cursorY + 19
    );

    // Interactive clickable Link Buttons: Google Maps (Blue) + WhatsApp (Green)
    const btnMapsX = textStartX;
    const btnMapsY = cursorY + 22.5;
    const btnMapsW = 46;
    const btnMapsH = 7.5;

    doc.setFillColor(37, 99, 235); // blue-600
    doc.roundedRect(btnMapsX, btnMapsY, btnMapsW, btnMapsH, 1.2, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(255, 255, 255);
    doc.text('Rota Google Maps >', btnMapsX + 3.5, btnMapsY + 5);
    doc.link(btnMapsX, btnMapsY, btnMapsW, btnMapsH, { url: mapsUrl });

    // WhatsApp button
    const btnWaX = btnMapsX + btnMapsW + 2.5;
    const btnWaY = cursorY + 22.5;
    const btnWaW = 48;
    const btnWaH = 7.5;

    doc.setFillColor(22, 163, 74); // emerald-600 / whatsapp
    doc.roundedRect(btnWaX, btnWaY, btnWaW, btnWaH, 1.2, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(255, 255, 255);
    doc.text('Enviar no WhatsApp >', btnWaX + 3.5, btnWaY + 5);
    doc.link(btnWaX, btnWaY, btnWaW, btnWaH, { url: waUrl });

    // Direct clickable link labels below buttons
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(22, 163, 74);
    doc.textWithLink('Compartilhar via WhatsApp', textStartX, cursorY + 35, {
      url: waUrl,
    });
    doc.setTextColor(148, 163, 184);
    doc.textWithLink('• Abrir Navegação GPS', textStartX + 35, cursorY + 35, {
      url: mapsUrl,
    });

    // 3. QR Code (Right side of card)
    try {
      const qrDataUrl = await QRCode.toDataURL(mapsUrl, {
        width: 90,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const qrSize = 22;
      const qrX = margin + contentWidth - qrSize - 4;
      const qrY = cursorY + 4;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Ler no celular', qrX + 3, qrY + qrSize + 4);
    } catch (e) {
      console.warn('QR code embed error', e);
    }

    cursorY += cardHeight + 4;
  }

  // Page numbering footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${p} de ${totalPages} • KMZ Viewer • Clique no botão azul de qualquer local para navegar no Google Maps`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Save and download PDF
  const safeFilename =
    title.toLowerCase().replace(/[^a-z0-9_-]/gi, '_').slice(0, 32) || 'mapa_rotas';
  doc.save(`${safeFilename}.pdf`);
}
