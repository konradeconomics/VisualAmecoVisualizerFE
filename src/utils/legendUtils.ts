import type { LegendPayloadItem } from '../components/charts/CustomTopLegend';

/**
 * Sanitizes text content for inclusion in SVG <text> elements.
 */
export function sanitizeSVGText(text: any): string {
    if (typeof text !== 'string') {
        if (text === undefined || text === null) return '';
        text = String(text);
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

interface GenerateLegendItemsSVGStringOptions {
    payload: LegendPayloadItem[];
    customSeriesNames: Record<string, string>;
    theme: 'light' | 'dark';
    itemHeight?: number;
    symbolWidth?: number;
    symbolMarginRight?: number;
    textFontSize?: number;
    itemPaddingHorizontal?: number;
    itemPaddingVertical?: number;
    legendFontFamily?: string;
    availableWidth?: number;
}

interface GeneratedLegendSVG {
    svgString: string;
    actualWidth: number;
    actualHeight: number;
}

export function generateLegendItemsSVGString({
                                                 payload,
                                                 customSeriesNames,
                                                 theme,
                                                 itemHeight = 20,
                                                 symbolWidth = 20,
                                                 symbolMarginRight = 6,
                                                 textFontSize = 12,
                                                 itemPaddingHorizontal = 15,
                                                 itemPaddingVertical = 5,
                                                 legendFontFamily = "Arial, sans-serif",
                                                 availableWidth = Infinity,
                                             }: GenerateLegendItemsSVGStringOptions): GeneratedLegendSVG {
    if (!payload || payload.length === 0) {
        return { svgString: "", actualWidth: 0, actualHeight: 0 };
    }

    const textColor = theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(55, 65, 81)';

    let svgItemsString = "";
    let currentX = 0;
    let currentY = itemHeight / 2;
    let widthOfCurrentLine = 0;
    let overallMaxLineWidth = 0;

    for (let i = 0; i < payload.length; i++) {
        const entry = payload[i];
        const seriesKey = entry.id;
        const displayName = customSeriesNames[seriesKey] || (entry.value !== undefined && entry.value !== null ? String(entry.value) : "N/A");
        const sanitizedDisplayName = sanitizeSVGText(displayName);

        const textWidth = sanitizedDisplayName.length * textFontSize * 0.6;
        const currentItemContentWidth = symbolWidth + symbolMarginRight + textWidth;
        const currentItemOuterWidth = currentItemContentWidth + itemPaddingHorizontal;
        
        if (availableWidth < Infinity && (currentX + currentItemContentWidth) > availableWidth && currentX > 0) {
            overallMaxLineWidth = Math.max(overallMaxLineWidth, widthOfCurrentLine);
            currentX = 0;
            currentY += itemHeight + itemPaddingVertical;
            widthOfCurrentLine = 0;
        }

        const itemGroupId = `legend-item-gen-${i}-${sanitizeSVGText(entry.id).replace(/\s/g, '_')}`;

        svgItemsString += `<g id="${itemGroupId}" transform="translate(${currentX}, ${currentY})" style="cursor: pointer; visibility: visible;">`;

        const strokeColor = sanitizeSVGText(entry.color || "black");
        const strokeDash = entry.payload?.strokeDasharray ? `stroke-dasharray="${sanitizeSVGText(String(entry.payload.strokeDasharray))}"` : "";
        
        svgItemsString += `<line x1="0" y1="0" x2="${symbolWidth}" y2="0" stroke="${strokeColor}" stroke-width="2.5" ${strokeDash} stroke-opacity="1" visibility="visible"></line>`;
        
        svgItemsString += `<text x="${symbolWidth + symbolMarginRight}" y="0" dy="0.35em" fill="${textColor}" font-size="${textFontSize}px" font-family="${legendFontFamily}" text-anchor="start" style="user-select: none; visibility: visible;">`;
        svgItemsString += `${sanitizedDisplayName}`;
        svgItemsString += `</text>`;
        svgItemsString += `</g>`;

        currentX += currentItemOuterWidth;
        widthOfCurrentLine = currentX;
    }
    
    overallMaxLineWidth = Math.max(overallMaxLineWidth, widthOfCurrentLine);
    
    const finalOverallMaxLineWidth = overallMaxLineWidth > 0 ? overallMaxLineWidth - itemPaddingHorizontal : 0;

    const actualHeight = currentY + itemHeight / 2;

    return {
        svgString: svgItemsString,
        actualWidth: Math.max(0, finalOverallMaxLineWidth),
        actualHeight
    };
}