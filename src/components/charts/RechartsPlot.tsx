import React, { useMemo } from 'react';
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
import { useSelectionStore } from '../../store/selectionStore';
import { EditableAxisLabel } from './EditableAxisLabel';
import {CustomTopLegend} from "./CustomTopLegend.tsx";

const LINE_COLORS = [
    '#0ea5e9', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
    '#3b82f6', '#a855f7', '#d946ef', '#84cc16', '#64748b', '#78716c', '#06b6d4', '#f59e0b',
];


interface RechartsPlotProps {
    pivotedData: ChartDataPoint[];
    yAxisConfig: YAxisConfigEntry[];
    seriesInfoForLines: LineRenderInfo[];
}

export const RechartsPlot: React.FC<RechartsPlotProps> = ({
                                                              pivotedData,
                                                              yAxisConfig,
                                                              seriesInfoForLines,
                                                          }) => {
    const { theme } = useThemeStore();
    const showDotsOnLines = useSelectionStore((state) => state.showDotsOnLines);

    const customYAxisLabels = useSelectionStore((state) => state.customYAxisLabels);
    const setCustomYAxisLabel = useSelectionStore((state) => state.setCustomYAxisLabel);

    const tooltipContentStyle = useMemo(() => (theme === 'dark' ? { backgroundColor: 'rgba(50, 50, 50, 0.85)', border: '1px solid #4A5568', borderRadius: '0.375rem', color: '#e2e8f0' } : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e0', borderRadius: '0.375rem', color: '#1a202c' }), [theme]);
    const tooltipTextStyle = useMemo(() => (theme === 'dark' ? { color: '#e2e8f0' } : { color: '#1a202c' }), [theme]);

    if (!pivotedData || pivotedData.length === 0 || !yAxisConfig || yAxisConfig.length === 0 || !seriesInfoForLines || seriesInfoForLines.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Select indicator(s) to plot or no data available.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pivotedData} margin={{ top: 40, right: yAxisConfig.some(ax=>ax.orientation === 'right') ? 60 : 20, left: yAxisConfig.some(ax=>ax.orientation === 'left') ? 60 : 5, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#e2e8f0"} />
                <XAxis dataKey="year" dy={10} tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }} stroke={theme === 'dark' ? '#64748b' : '#d1d5db'} label={{ value: "Year", position: "insideBottom", offset: -15, fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#374151' }} />

                {yAxisConfig.map(axis => (
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
                ))}

                <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} cursor={{ stroke: theme === 'dark' ? '#4A5568' : '#cbd5e0', strokeWidth: 1 }}/>
                <Legend
                    verticalAlign="top"
                    content={<CustomTopLegend />}
                    height={60}
                    align="center"
                />

                {seriesInfoForLines.map((info, index) => {
                    const seriesKey = info.key;
                    const axisConfigForThisLine = yAxisConfig.find(ax => ax.yAxisId === info.category);
                    const lineYAxisId = axisConfigForThisLine?.yAxisId || (yAxisConfig[0]?.yAxisId || 'left0'); // Fallback
                    const lineStyleDashArray = axisConfigForThisLine?.lineStrokeDasharray;

                    return (
                        <Line
                            key={seriesKey}
                            yAxisId={lineYAxisId}
                            type="monotone"
                            dataKey={seriesKey}
                            stroke={LINE_COLORS[index % LINE_COLORS.length]}
                            strokeDasharray={lineStyleDashArray}
                            strokeWidth={(info.indicator as PlottableChartSeries).isCalculated ? 2.5 : 2}
                            activeDot={{ r: 6, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                            dot={showDotsOnLines ? { r: 3, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] } : false}
                            name={info.indicator.uiDisplayName}
                            connectNulls={true}
                        />
                    );
                })}
            </LineChart>
        </ResponsiveContainer>
    );
};