import { useMemo, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type {
    ChartDataPoint,
    YAxisConfigEntry,
    LineRenderInfo,
    PlottableChartSeries
} from '../../types/PlottableChartSeries';
import { useThemeStore } from '../../store/themeStore';
import { EditableAxisLabel } from './EditableAxisLabel';
import { CustomTopLegend, type LegendPayloadItem } from "./CustomTopLegend";
import { useChartUISettingsStore } from "../../store/chartUISettingsStore";
import { generateLegendItemsSVGString } from '../../utils/legendUtils';

const LINE_COLORS = [
    '#0ea5e9', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
    '#3b82f6', '#a855f7', '#d946ef', '#84cc16', '#64748b', '#78716c', '#06b6d4', '#f59e0b',
];

interface RechartsPlotProps {
    pivotedData: ChartDataPoint[];
    yAxisConfig: YAxisConfigEntry[];
    seriesInfoForLines: LineRenderInfo[];
    customSeriesNames: Record<string, string>;
}

export interface RechartsPlotRef {
    getSVGString: () => string | null;
}

export const RechartsPlot = forwardRef<RechartsPlotRef, RechartsPlotProps>(({
                                                                                pivotedData,
                                                                                yAxisConfig,
                                                                                seriesInfoForLines,
                                                                                customSeriesNames,
                                                                            }, ref) => {
    const { theme } = useThemeStore();
    const showDotsOnLines = useChartUISettingsStore((state) => state.showDotsOnLines);
    const customYAxisLabels = useChartUISettingsStore((state) => state.customYAxisLabels);
    const setCustomYAxisLabel = useChartUISettingsStore((state) => state.setCustomYAxisLabel);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const legendPayloadRef = useRef<LegendPayloadItem[] | undefined>(undefined);

    const handleLegendPayloadUpdate = useCallback((payload: LegendPayloadItem[] | undefined) => {
        legendPayloadRef.current = payload;
    }, []);

    const tooltipContentStyle = useMemo(() => (
        theme === 'dark'
            ? { backgroundColor: 'rgba(50, 50, 50, 0.85)', border: '1px solid #4A5568', borderRadius: '0.375rem', color: '#e2e8f0' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e0', borderRadius: '0.375rem', color: '#1a202c' }
    ), [theme]);

    const tooltipTextStyle = useMemo(() => (
        theme === 'dark'
            ? { color: '#e2e8f0' }
            : { color: '#1a202c' }
    ), [theme]);

    useImperativeHandle(ref, () => ({
        getSVGString: () => {
            if (!chartContainerRef.current) {
                console.error("Chart container ref not found.");
                return null;
            }

            const mainSvgElement = chartContainerRef.current.querySelector('svg.recharts-surface');
            if (!mainSvgElement) {
                console.error("Main SVG element (recharts-surface) not found.");
                return null;
            }

            const mainSvgWidth = mainSvgElement.getAttribute('width');
            const mainSvgHeight = mainSvgElement.getAttribute('height');
            const mainSvgViewBox = mainSvgElement.getAttribute('viewBox');
            let vbX = 0, vbY = 0, vbWidth = parseFloat(mainSvgWidth || "0"), vbHeight = parseFloat(mainSvgHeight || "0");

            if (mainSvgViewBox) {
                const vbParts = mainSvgViewBox.split(/\s+|,/);
                if (vbParts.length === 4) {
                    vbX = parseFloat(vbParts[0]);
                    vbY = parseFloat(vbParts[1]);
                    vbWidth = parseFloat(vbParts[2]);
                    vbHeight = parseFloat(vbParts[3]);
                }
            }

            const clonedMainSvgElement = mainSvgElement.cloneNode(true) as SVGSVGElement;

            const existingLiveLegend = clonedMainSvgElement.querySelector('g#custom-legend-root-live');
            if (existingLiveLegend) {
                existingLiveLegend.remove();
            }

            clonedMainSvgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            clonedMainSvgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            clonedMainSvgElement.setAttribute("version", "1.1");
            if (mainSvgWidth) clonedMainSvgElement.setAttribute('width', mainSvgWidth);
            if (mainSvgHeight) clonedMainSvgElement.setAttribute('height', mainSvgHeight);
            if (mainSvgViewBox) clonedMainSvgElement.setAttribute('viewBox', mainSvgViewBox);

            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', String(vbX));
            bgRect.setAttribute('y', String(vbY));
            bgRect.setAttribute('width', String(vbWidth));
            bgRect.setAttribute('height', String(vbHeight));
            bgRect.setAttribute('fill', theme === 'dark' ? 'rgb(30, 41, 59)' : 'rgb(255, 255, 255)');
            clonedMainSvgElement.insertBefore(bgRect, clonedMainSvgElement.firstChild);

            const currentLegendPayload = legendPayloadRef.current;
            if (currentLegendPayload && currentLegendPayload.length > 0) {
                const { svgString: legendItemsSvgString, actualWidth: actualLegendContentWidth } = generateLegendItemsSVGString({
                    payload: currentLegendPayload,
                    customSeriesNames,
                    theme: theme === 'dark' ? 'dark' : 'light',
                    availableWidth: vbWidth * 0.9,
                });

                if (legendItemsSvgString) {
                    const svgNS = "http://www.w3.org/2000/svg";
                    const legendGroupForExport = document.createElementNS(svgNS, "g");
                    legendGroupForExport.setAttribute("id", "exported-legend");

                    const legendGroupX = vbX + (vbWidth - actualLegendContentWidth) / 2;
                    const legendGroupY = vbY + 15;

                    legendGroupForExport.setAttribute("transform", `translate(${legendGroupX}, ${legendGroupY})`);
                    legendGroupForExport.innerHTML = legendItemsSvgString;

                    clonedMainSvgElement.appendChild(legendGroupForExport);
                }
            }

            const doctype = '<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
            const finalSvgString = doctype + new XMLSerializer().serializeToString(clonedMainSvgElement);
            
            return finalSvgString;
        }
    }));

    if (!pivotedData || pivotedData.length === 0 || !yAxisConfig || yAxisConfig.length === 0 || !seriesInfoForLines || seriesInfoForLines.length === 0) {
        return ( <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"> Select indicator(s) to plot or no data available. </div> );
    }

    return (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    className="recharts-surface"
                    data={pivotedData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#e2e8f0"} />
                    <XAxis dataKey="year" dy={10} tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }} stroke={theme === 'dark' ? '#64748b' : '#d1d5db'} label={{ value: "Year", position: "insideBottom", offset: -15, fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#374151' }} />
                    {yAxisConfig.map(axis =>
                        <YAxis
                            key={axis.yAxisId}
                            yAxisId={axis.yAxisId}
                            orientation={axis.orientation}
                            stroke={axis.axisColor}
                            strokeDasharray={axis.lineStrokeDasharray}
                            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
                            tick={{ fontSize: 10, fill: axis.axisColor }}
                            width={55}
                            label={
                                <EditableAxisLabel
                                    yAxisId={axis.yAxisId}
                                    defaultLabel={axis.unitTypeLabel}
                                    customLabel={customYAxisLabels[axis.yAxisId]}
                                    onSave={setCustomYAxisLabel}
                                    axisColor={axis.axisColor}
                                    angle={0}
                                    dy={-10}
                                    textAnchor="middle"
                                    fontSize={12}
                                />
                            }
                        />
                    )}
                    <Tooltip
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipTextStyle}
                        itemStyle={tooltipTextStyle}
                        cursor={{ stroke: theme === 'dark' ? '#4A5568' : '#cbd5e0', strokeWidth: 1 }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="center"
                        content={<CustomTopLegend onPayloadUpdate={handleLegendPayloadUpdate} />}
                        wrapperStyle={{}}
                        height={60}
                    />
                    {seriesInfoForLines.map((info, index) => {
                        const seriesKey = info.key;
                        const axisConfigForThisLine = yAxisConfig.find(ax => ax.yAxisId === info.category);
                        const lineYAxisId = axisConfigForThisLine?.yAxisId || (yAxisConfig[0]?.yAxisId || 'left0');
                        const lineStyleDashArray = axisConfigForThisLine?.lineStrokeDasharray;
                        return ( <Line key={seriesKey} yAxisId={lineYAxisId} type="monotone" dataKey={seriesKey} stroke={LINE_COLORS[index % LINE_COLORS.length]} strokeDasharray={lineStyleDashArray} strokeWidth={(info.indicator as PlottableChartSeries).isCalculated ? 2.5 : 2} activeDot={{ r: 6, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }} dot={showDotsOnLines ? { r: 3, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] } : false} name={info.indicator.uiDisplayName} connectNulls={true} /> );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});
RechartsPlot.displayName = 'RechartsPlot';