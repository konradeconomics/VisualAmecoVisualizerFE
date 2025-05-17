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
    payload?: LegendPayloadItem[];
    onPayloadUpdate?: (payload: LegendPayloadItem[] | undefined) => void;
}

export const CustomTopLegend: React.FC<CustomLegendProps> = (props) => {
    const {
        x = 0,
        y = 0,
        width = 0,
        height = 0,
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

    const { svgString: legendItemsSvgString, actualWidth: legendActualContentWidth } = useMemo(() => {
        if (!payload || !customSeriesNames || !theme || width <= 0 || height <= 0) {
            return { svgString: "", actualWidth: 0, actualHeight: 0 };
        }
        return generateLegendItemsSVGString({
            payload,
            customSeriesNames,
            theme,
            availableWidth: width > 20 ? width - 20 : width,
            itemHeight: 20,
            symbolWidth: 20,
        });
    }, [payload, customSeriesNames, theme, width, height]);

    if (width <= 0 || height <= 0) {
        return null;
    }

    const legendContentXOffset = (legendActualContentWidth > 0 && width > legendActualContentWidth)
        ? (width - legendActualContentWidth) / 2
        : 10;

    return (
        <svg
            id="custom-legend-svg-host"
            x={x}
            y={y}
            width={width}
            height={height}
        >
            <g
                id="actual-legend-content-group"
                transform={`translate(${legendContentXOffset}, 0)`}
                dangerouslySetInnerHTML={{ __html: legendItemsSvgString }}
            />
        </svg>
    );
};