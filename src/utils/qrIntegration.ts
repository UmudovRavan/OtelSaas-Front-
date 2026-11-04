import { apiClient, API_BASE_URL } from '../services/api/client';

/**
 * Backend-dən gələn QRCoder SVG faylına viewBox əlavə edir (kəsilmənin qarşısını alır)
 * və mərkəzdəki loqonu ECC Level H (30%) çərçivəsində maksimum böyük və ağ fonlu formada göstərir.
 */
export const normalizeQrSvg = (rawSvg: string): string => {
  if (!rawSvg || !rawSvg.includes('<svg')) return rawSvg;

  let svg = rawSvg.trim();

  // 1. Kök <svg> teqindəki width və height dəyərlərini tapıb viewBox="0 0 W H" əlavə edirik
  const widthMatch = svg.match(/<svg[^>]*?\bwidth="(\d+)"/i);
  const heightMatch = svg.match(/<svg[^>]*?\bheight="(\d+)"/i);
  const w = widthMatch ? parseInt(widthMatch[1], 10) : 900;
  const h = heightMatch ? parseInt(heightMatch[1], 10) : 900;

  // İlk <svg ...> teqini viewBox və 100% ölçü ilə yeniləyirik
  svg = svg.replace(/<svg([^>]*?)>/i, (_fullMatch, attrs) => {
    let updatedAttrs = attrs
      .replace(/\bwidth="\d+"/i, 'width="100%"')
      .replace(/\bheight="\d+"/i, 'height="100%"');
    if (!/viewBox=/i.test(updatedAttrs)) {
      updatedAttrs += ` viewBox="0 0 ${w} ${h}"`;
    }
    return `<svg${updatedAttrs}>`;
  });

  // 2. QRCoder-in yaratdığı daxili <svg width="100%" height="100%" ...> sarğısını çıxarırıq ki, birbaşa kök viewBox koordinatları işləsin
  svg = svg.replace(/<svg[^>]*?\bwidth="100%"[^>]*?>\s*(<image[\s\S]*?\/>)\s*<\/svg>/i, '$1');

  // 3. Mərkəzdəki <image ...> loqosunu ECC Level H (30%) daxilində ən böyük skan oluna bilən ölçüdə (~30% xətti / 272px) və ağ fonla yerləşdiririk
  const logoSize = Math.round(w * 0.302); // 900 üzərindən 272px
  const logoX = Math.round((w - logoSize) / 2);
  const logoY = Math.round((h - logoSize) / 2);
  const pad = Math.round(w * 0.014); // ~13px ağ haşiyə
  const bgSize = logoSize + pad * 2;
  const bgX = logoX - pad;
  const bgY = logoY - pad;
  const bgRx = Math.round(bgSize * 0.18);

  svg = svg.replace(
    /<image\s+x="\d+"\s+y="\d+"\s+width="\d+"\s+height="\d+"\s+xlink:href="([^"]+)"\s*\/>/i,
    `<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" rx="${bgRx}" ry="${bgRx}" fill="#FFFFFF" /><image x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" href="$1" xlink:href="$1" />`
  );

  return svg;
};

/**
 * Ssenari 1: Admin Panelində və ya Qonaq Portalında QR Kodu SVG mətni kimi çəkmək (Preview üçün)
 */
export const fetchHotelQrSvg = async (
  hotelSlug: string,
  tenantId?: string | null
): Promise<string> => {
  const token = localStorage.getItem('otelsaas_token') || localStorage.getItem('token');

  // Əgər token varsa əvvəlcə admin endpoint-indən yoxlayırıq
  if (token) {
    try {
      const response = await apiClient.get<string>('/api/hotel-admin/qr/svg', {
        params: tenantId ? { tenantId } : undefined,
        responseType: 'text',
      });
      if (response.data && typeof response.data === 'string' && response.data.includes('<svg')) {
        return normalizeQrSvg(response.data);
      }
    } catch (err) {
      console.warn('Admin QR SVG endpoint fallback to public endpoint:', err);
    }
  }

  // Public endpoint (/api/public/{slug}/qr/svg)
  const pubResponse = await apiClient.get<string>(`/api/public/${hotelSlug}/qr/svg`, {
    responseType: 'text',
  });
  return normalizeQrSvg(pubResponse.data);
};

/**
 * Ssenari 2: PNG və SVG Formatında Endirmə (Download)
 */
export const downloadHotelQr = async (
  format: 'png' | 'svg',
  hotelSlug: string,
  tenantId?: string | null
): Promise<void> => {
  // Hər iki format üçün normallaşdırılmış və mərkəzində böyük loqo olan SVG-dən istifadə edirik
  const svgText = await fetchHotelQrSvg(hotelSlug, tenantId);

  if (format === 'svg') {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${hotelSlug}-qr-code.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return;
  }

  // PNG üçün yüksək keyfiyyətli (1200x1200px) Canvas renderi
  return new Promise<void>((resolve, reject) => {
    const svgWithFixedSize = svgText
      .replace('width="100%"', 'width="1200"')
      .replace('height="100%"', 'height="1200"');
    const svgBlob = new Blob([svgWithFixedSize], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = window.URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 1200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const dlUrl = window.URL.createObjectURL(pngBlob);
            const link = document.createElement('a');
            link.href = dlUrl;
            link.download = `${hotelSlug}-qr-code.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(dlUrl);
          }
          window.URL.revokeObjectURL(blobUrl);
          resolve();
        }, 'image/png');
      } else {
        window.URL.revokeObjectURL(blobUrl);
        reject(new Error('Canvas context error'));
      }
    };
    img.onerror = (e) => {
      window.URL.revokeObjectURL(blobUrl);
      reject(e);
    };
    img.src = blobUrl;
  });
};

/**
 * Ssenari 3: Çap Şablonu (Print Stand / Table Tent - A5 Portrait)
 */
export const printQrTableStand = async (
  hotelName: string,
  svgMarkupOrSlug: string,
  hotelSlug = 'hotel-resort',
  tenantId?: string | null
): Promise<void> => {
  let finalSvgMarkup = svgMarkupOrSlug ? normalizeQrSvg(svgMarkupOrSlug) : '';
  if (!finalSvgMarkup || !finalSvgMarkup.includes('<svg')) {
    try {
      finalSvgMarkup = await fetchHotelQrSvg(hotelSlug, tenantId);
    } catch {
      finalSvgMarkup = `<img src="${API_BASE_URL}/api/public/${hotelSlug}/qr/svg" style="width:100%;height:100%;object-fit:contain;" />`;
    }
  }

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Masaüstü QR Stend - ${hotelName}</title>
        <style>
          @page {
            size: A5 portrait;
            margin: 0;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #fff;
            color: #1a1a1a;
            text-align: center;
            padding: 40px;
            box-sizing: border-box;
          }
          .card {
            border: 2px dashed #e2e8f0;
            padding: 40px 30px;
            border-radius: 24px;
            max-width: 420px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          }
          .title {
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 8px;
            color: #0f172a;
          }
          .subtitle {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 30px;
          }
          .qr-container {
            width: 260px;
            height: 260px;
            margin: 0 auto;
          }
          .qr-container svg {
            width: 100%;
            height: 100%;
            display: block;
          }
          .instruction {
            margin-top: 30px;
            font-size: 14px;
            font-weight: 600;
            background: #f1f5f9;
            padding: 10px 20px;
            border-radius: 999px;
            display: inline-block;
            color: #334155;
          }
          .powered-by {
            margin-top: 25px;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="title">${hotelName}</div>
          <div class="subtitle">Rəqəmsal Konsyerj & Otaq Xidmətləri</div>
          
          <div class="qr-container">
            ${finalSvgMarkup}
          </div>

          <div class="instruction">
            📷 Kameranızla skan edin
          </div>

          <div class="powered-by">
            Powered by Altensor QR Concierge
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};
