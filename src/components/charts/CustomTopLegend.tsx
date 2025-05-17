import React, { useMemo, useEffect } from 'react';
import { useThemeStore } from "../../store/themeStore";
import { useChartUISettingsStore } from "../../store/chartUISettingsStore"; 
import { generateLegendItemsSVGString } from '../../utils/legendUtils';

export interface LegendPayloadItem {
    value: string;
    type: string;
    id: string;
    color: string;
    payload?: {
        strokeDasharray?: string | number;
    }
}

interface CustomLegendProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    chartWidth?: number;
    payload?: LegendPayloadItem[];
    onPayloadUpdate?: (payload: LegendPayloadItem[] | undefined) => void;
}

const MAIN_CHART_MARGIN_LEFT = 40;
const MAIN_CHART_MARGIN_RIGHT = 30;

export const CustomTopLegend: React.FC<CustomLegendProps> = (props) => {
    const {
        x: legendSlotGlobalX = 0,
        y: legendSlotGlobalY = 0,
        width: legendSlotWidth = 0,
        height: legendSlotHeight = 0,
        chartWidth: totalChartWidth = 0,
        payload,
        onPayloadUpdate,
    } = props;

    const { theme } = useThemeStore();
    const customSeriesNames = useChartUISettingsStore((state) => state.customSeriesNames);

    useEffect(() => {
        if (onPayloadUpdate) {
            onPayloadUpdate(payload);
        }
    }, [payload, onPayloadUpdate]);

    const plotAreaGlobalX = MAIN_CHART_MARGIN_LEFT;
    const plotAreaGlobalWidth = totalChartWidth - MAIN_CHART_MARGIN_LEFT - MAIN_CHART_MARGIN_RIGHT;

    const availableWidthForLegendGeneration = plotAreaGlobalWidth;

    const {
        svgString: legendItemsSvgString,
        actualWidth: legendActualContentWidth,
        actualHeight: legendActualContentHeight
    } = useMemo(() => {
        if (!payload || payload.length === 0 || !customSeriesNames || !theme || availableWidthForLegendGeneration <= 0 || legendSlotHeight <= 0) {
            return { svgString: "", actualWidth: 0, actualHeight: 0 };
        }
        const result = generateLegendItemsSVGString({
            payload, customSeriesNames, theme,
            availableWidth: availableWidthForLegendGeneration,
            itemHeight: 20, symbolWidth: 20, symbolMarginRight: 6,
            textFontSize: 12, itemPaddingHorizontal: 15, itemPaddingVertical: 5,
        });
        return result;
    }, [payload, customSeriesNames, theme, availableWidthForLegendGeneration, legendSlotHeight]);

    if (legendSlotWidth <= 0 || legendSlotHeight <= 0 || !legendItemsSvgString || totalChartWidth === 0) {
        return null;
    }

    const plotAreaStartX_in_LegendSVG = plotAreaGlobalX - legendSlotGlobalX;

    let centeringOffsetWithinPlotArea = 0;
    if (legendActualContentWidth > 0 && legendActualContentWidth < plotAreaGlobalWidth) {
        centeringOffsetWithinPlotArea = (plotAreaGlobalWidth - legendActualContentWidth) / 2;
    }

    const finalContentGroupTranslateX = plotAreaStartX_in_LegendSVG + centeringOffsetWithinPlotArea;

    const contentVerticalPadding = 5;
    let finalContentGroupTranslateY = contentVerticalPadding;
    if (legendActualContentHeight < (legendSlotHeight - (2 * contentVerticalPadding))) {
        finalContentGroupTranslateY = (legendSlotHeight - legendActualContentHeight) / 2;
    }
    finalContentGroupTranslateY = Math.max(contentVerticalPadding, finalContentGroupTranslateY);

    return (
        <svg
            id="custom-legend-svg-host"
            x={legendSlotGlobalX}
            y={legendSlotGlobalY}
            width={legendSlotWidth}
            height={legendSlotHeight}
            viewBox={`0 0 ${legendSlotWidth} ${legendSlotHeight}`}
        >
            <g
                id="actual-legend-content-group"
                transform={`translate(${finalContentGroupTranslateX}, ${finalContentGroupTranslateY})`}
            >
                <g dangerouslySetInnerHTML={{ __html: legendItemsSvgString }} />
            </g>
        </svg>
    );
};