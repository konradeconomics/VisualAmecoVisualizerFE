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
    itemPaddingHorizontal?: number; // Padding on the right of each item
    itemPaddingVertical?: number;   // Vertical padding between lines of items
    legendFontFamily?: string;
    availableWidth?: number;        // Max width available for a line of legend items
}

interface GeneratedLegendSVG {
    svgString: string;      // The <g> string containing all legend items
    actualWidth: number;    // The maximum width occupied by any line of legend items
    actualHeight: number;   // The total height occupied by all legend items
}

export function generateLegendItemsSVGString({
                                                 payload,
                                                 customSeriesNames,
                                                 theme,
                                                 itemHeight = 20,
                                                 symbolWidth = 20,
                                                 symbolMarginRight = 6,
                                                 textFontSize = 12,
                                                 itemPaddingHorizontal = 15, // Padding to the right of each item
                                                 itemPaddingVertical = 5,
                                                 legendFontFamily = "Arial, sans-serif",
                                                 availableWidth = Infinity,
                                             }: GenerateLegendItemsSVGStringOptions): GeneratedLegendSVG {
    if (!payload || payload.length === 0) {
        return { svgString: "", actualWidth: 0, actualHeight: 0 };
    }

    const textColor = theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(55, 65, 81)';

    let svgItemsString = "";
    let currentX = 0; // Starting X position for the first item on a line
    // currentY positions the center of the legend items vertically
    let currentY = itemHeight / 2;
    let widthOfCurrentLine = 0;
    let overallMaxLineWidth = 0;

    for (let i = 0; i < payload.length; i++) {
        const entry = payload[i];
        const seriesKey = entry.id;
        // Ensure entry.value is treated as a fallback if custom name doesn't exist
        const displayName = customSeriesNames[seriesKey] || (entry.value !== undefined && entry.value !== null ? String(entry.value) : "N/A");
        const sanitizedDisplayName = sanitizeSVGText(displayName);

        // Estimate text width (this is a rough estimate, actual width can vary by font)
        const textWidth = sanitizedDisplayName.length * textFontSize * 0.6; // Adjust multiplier as needed
        const currentItemContentWidth = symbolWidth + symbolMarginRight + textWidth;
        const currentItemOuterWidth = currentItemContentWidth + itemPaddingHorizontal; // Includes padding for this item

        // Check if the current item fits on the current line
        // (currentX > 0) ensures that at least one item is placed on a line before wrapping,
        // even if it overflows. Consider if this is the desired behavior for single very long items.
        if (availableWidth < Infinity && (currentX + currentItemContentWidth) > availableWidth && currentX > 0) {
            // Item doesn't fit, wrap to a new line
            overallMaxLineWidth = Math.max(overallMaxLineWidth, widthOfCurrentLine);
            currentX = 0;
            currentY += itemHeight + itemPaddingVertical;
            widthOfCurrentLine = 0;
        }

        const itemGroupId = `legend-item-gen-${i}-${sanitizeSVGText(entry.id).replace(/\s/g, '_')}`;

        // The transform places the top-left of this item's group
        svgItemsString += `<g id="${itemGroupId}" transform="translate(${currentX}, ${currentY})" style="cursor: pointer; visibility: visible;">`;

        const strokeColor = sanitizeSVGText(entry.color || "black");
        const strokeDash = entry.payload?.strokeDasharray ? `stroke-dasharray="${sanitizeSVGText(String(entry.payload.strokeDasharray))}"` : "";

        // Line is drawn from (0,0) to (symbolWidth,0) within this item's group.
        // Its center will be at currentY due to the group's transform.
        svgItemsString += `<line x1="0" y1="0" x2="${symbolWidth}" y2="0" stroke="${strokeColor}" stroke-width="2.5" ${strokeDash} stroke-opacity="1" visibility="visible"></line>`;

        // Text is positioned to the right of the symbol.
        // dy="0.35em" helps vertically center the text around its y=0 coordinate.
        svgItemsString += `<text x="${symbolWidth + symbolMarginRight}" y="0" dy="0.35em" fill="${textColor}" font-size="${textFontSize}px" font-family="${legendFontFamily}" text-anchor="start" style="user-select: none; visibility: visible;">`;
        svgItemsString += `${sanitizedDisplayName}`;
        svgItemsString += `</text>`;
        svgItemsString += `</g>`; // Close item group

        currentX += currentItemOuterWidth;
        // widthOfCurrentLine is the width *including* the last item's content and its padding,
        // but if we want the width of content only, we'd subtract the last padding.
        // For overallMaxLineWidth, we want the extent of drawing.
        widthOfCurrentLine = currentX;
    }

    // Update overallMaxLineWidth with the width of the last line
    overallMaxLineWidth = Math.max(overallMaxLineWidth, widthOfCurrentLine);

    // If overallMaxLineWidth includes the trailing padding of the last item on the widest line,
    // and you want the "actual content" width without that, you might subtract itemPaddingHorizontal.
    // However, for centering logic, the full extent including padding is often what's needed for the block.
    // Let's refine: if widthOfCurrentLine > 0, it means there's at least one item, so subtract its trailing padding.
    const finalOverallMaxLineWidth = overallMaxLineWidth > 0 ? overallMaxLineWidth - itemPaddingHorizontal : 0;

    const actualHeight = currentY + itemHeight / 2; // Total height from top of first line to bottom of last

    // console.log(`[legendUtils] Generated SVG string (first 300): ${svgItemsString.substring(0,300)}`);
    // console.log(`[legendUtils] Calculated actualWidth: ${finalOverallMaxLineWidth}, actualHeight: ${actualHeight}`);

    return {
        svgString: svgItemsString,
        actualWidth: Math.max(0, finalOverallMaxLineWidth), // Ensure non-negative
        actualHeight
    };
}