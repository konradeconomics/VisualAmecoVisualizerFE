import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useFetchSelectedIndicators } from '../../hooks/useFetchIndicator';
import { useThemeStore } from '../../store/themeStore';
import { getReadableUnit, getUnitCategory, type UnitCategory } from '../../utils/unitMapper';

type IndicatorSeriesKey = string;

interface ChartDataPoint {
    year: number;
    [seriesKey: string]: number | undefined;
}

const LINE_COLORS = [
    '#0ea5e9', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
    '#3b82f6', '#a855f7', '#d946ef', '#84cc16', '#64748b', '#78716c', '#06b6d4', '#f59e0b',
];

const AXIS_LINE_STYLES = [
    undefined,       // Solid (for the first unique unit category / Y-axis)
    '5 5',           // Dashed (for the second)
    '1 5',           // Dotted (long dash, short gap - for the third)
    '10 2 2 2',    // Dash-dot-dot (for the fourth)
    '3 7',           // Another dash pattern
];
const DEFAULT_AXIS_LINE_STYLE = undefined; // Solid

export const IndicatorSimpleChart: React.FC = () => {
    const {
        allData: fetchedIndicators,
        isLoading,
        isFetching,
        isError,
        errors,
    } = useFetchSelectedIndicators();
    
    const { theme } = useThemeStore();

    const [plottedIndicatorKeys, setPlottedIndicatorKeys] = useState<Set<IndicatorSeriesKey>>(new Set());
    const [initialDefaultPlotted, setInitialDefaultPlotted] = useState(false);

    useEffect(() => {
        if (fetchedIndicators && fetchedIndicators.length > 0 && !initialDefaultPlotted && plottedIndicatorKeys.size === 0) {
            const firstIndicatorKey = `${fetchedIndicators[0].countryCode}-${fetchedIndicators[0].variableCode}`;
            setPlottedIndicatorKeys(new Set([firstIndicatorKey]));
            setInitialDefaultPlotted(true);
        }
        if ((!fetchedIndicators || fetchedIndicators.length === 0) && plottedIndicatorKeys.size > 0) {
            setPlottedIndicatorKeys(new Set());
            setInitialDefaultPlotted(false);
        }
    }, [fetchedIndicators, initialDefaultPlotted, plottedIndicatorKeys]);

    const handlePlottedIndicatorToggle = (key: IndicatorSeriesKey) => {
        setPlottedIndicatorKeys(prevKeys => {
            const newKeys = new Set(prevKeys);
            if (newKeys.has(key)) {
                newKeys.delete(key);
            } else {
                newKeys.add(key);
            }
            return newKeys;
        });
    };

    const indicatorsToPlot = useMemo(() => {
        if (!fetchedIndicators) return [];
        return fetchedIndicators.filter(ind =>
            plottedIndicatorKeys.has(`${ind.countryCode}-${ind.variableCode}`)
        );
    }, [fetchedIndicators, plottedIndicatorKeys]);

    const unitInfoForPlottedIndicators = useMemo(() => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];
        
        const infoArray = indicatorsToPlot.map(indicator => {
            const readableUnit = getReadableUnit(indicator.unitCode, indicator.unitDescription);
            const category = getUnitCategory(readableUnit);
            
            return {
                key: `${indicator.countryCode}-${indicator.variableCode}`,
                readableUnit: readableUnit,
                category: category,
                indicator: indicator,
            };
        });

        console.log("--- Finished unitInfoForPlottedIndicators ---", infoArray); // Log the final array
        return infoArray;
    }, [indicatorsToPlot]);


    const yAxisConfig = useMemo(() => {
        if (!unitInfoForPlottedIndicators || unitInfoForPlottedIndicators.length === 0) {
            return [{
                yAxisId: 'left0',
                orientation: 'left' as const,
                unitTypeLabel: 'Value',
                axisColor: theme === 'dark' ? '#94a3b8' : '#4b5563', // Neutral color
                lineStrokeDasharray: DEFAULT_AXIS_LINE_STYLE
            }];
        }

        const orderedUniqueCategories: UnitCategory[] = [];
        unitInfoForPlottedIndicators.forEach(info => {
            if (!orderedUniqueCategories.includes(info.category)) {
                orderedUniqueCategories.push(info.category);
            }
        });

        const configs: Array<{
            yAxisId: string;
            orientation: 'left' | 'right';
            unitTypeLabel: UnitCategory;
            axisColor: string;
            lineStrokeDasharray?: string;
        }> = [];

        let leftAxesCount = 0;
        let rightAxesCount = 0;
        const maxAxesPerSide = 2;

        orderedUniqueCategories.forEach((category, index) => {
            if (configs.length >= (maxAxesPerSide * 2)) return;

            let assignedOrientation: 'left' | 'right';
            if (leftAxesCount <= rightAxesCount && leftAxesCount < maxAxesPerSide) {
                assignedOrientation = 'left';
                leftAxesCount++;
            } else if (rightAxesCount < maxAxesPerSide) {
                assignedOrientation = 'right';
                rightAxesCount++;
            } else {
                assignedOrientation = 'left';
            }

            configs.push({
                yAxisId: category,
                orientation: assignedOrientation,
                unitTypeLabel: category,
                axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
                lineStrokeDasharray: AXIS_LINE_STYLES[index % AXIS_LINE_STYLES.length]
            });
        });

        if (configs.length === 0) {
            return [{
                yAxisId: 'left0', orientation: 'left' as const, unitTypeLabel: 'Value',
                axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
                lineStrokeDasharray: DEFAULT_AXIS_LINE_STYLE
            }];
        }
        return configs;
    }, [unitInfoForPlottedIndicators, theme]);


    const pivotedChartData = useMemo((): ChartDataPoint[] => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];
        const yearMap = new Map<number, ChartDataPoint>();
        indicatorsToPlot.forEach(indicator => {
            indicator.values.forEach(val => {
                if (!yearMap.has(val.year)) { yearMap.set(val.year, { year: val.year }); }
            });
        });
        indicatorsToPlot.forEach(indicator => {
            const seriesKey: IndicatorSeriesKey = `${indicator.countryCode}-${indicator.variableCode}`;
            indicator.values.forEach(val => {
                const yearDataPoint = yearMap.get(val.year);
                if (yearDataPoint) { yearDataPoint[seriesKey] = val.amount; }
            });
        });
        return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
    }, [indicatorsToPlot]);

    const tooltipContentStyle = useMemo(() => (theme === 'dark' ? { backgroundColor: 'rgba(50, 50, 50, 0.85)', border: '1px solid #4A5568', borderRadius: '0.375rem', color: '#e2e8f0' } : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e0', borderRadius: '0.375rem', color: '#1a202c' }), [theme]);
    const tooltipTextStyle = useMemo(() => (theme === 'dark' ? { color: '#e2e8f0' } : { color: '#1a202c' }), [theme]);

    if (isLoading && !isFetching && (!fetchedIndicators || fetchedIndicators.length === 0)) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading chart data...</div>;
    }
    if (isError && !isLoading) {
        const firstError = errors?.find(e => e !== null);
        return <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-400 rounded">Error: {firstError?.message || 'Unknown error'}</div>;
    }
    if ((!fetchedIndicators || fetchedIndicators.length === 0) && !isLoading && !isFetching && !isError) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">No indicators fetched to plot.</div>;
    }

    return (
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800 h-[500px] md:h-[600px] w-full flex flex-col">
            {fetchedIndicators && fetchedIndicators.length > 0 && (
                <div className="mb-4 shrink-0 border-b dark:border-slate-700 pb-3">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">Plot on Chart:</h4>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-2">
                        {fetchedIndicators.map(ind => {
                            const key = `${ind.countryCode}-${ind.variableCode}`;
                            const isChecked = plottedIndicatorKeys.has(key);
                            const readableUnitInSelector = getReadableUnit(ind.unitCode, ind.unitDescription);
                            return (
                                <label key={key} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-xs">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handlePlottedIndicatorToggle(key)}
                                        className="form-checkbox h-4 w-4 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-600 focus:ring-sky-500"
                                    />
                                    <span className="dark:text-slate-200">{ind.countryName} - {ind.variableName} ({readableUnitInSelector})</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {isFetching && (<div className="p-1 text-xs text-center text-sky-600 dark:text-sky-400 shrink-0">Updating chart...</div>)}

            <div className="flex-grow min-h-0">
                {indicatorsToPlot.length > 0 && pivotedChartData.length > 0 && yAxisConfig && yAxisConfig.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pivotedChartData} margin={{ top: 5, right: yAxisConfig.some(ax=>ax.orientation === 'right') ? 60 : 20, left: yAxisConfig.some(ax=>ax.orientation === 'left') ? 60 : 5, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#e2e8f0"} />
                            <XAxis dataKey="year" dy={10} /* ... */ />

                            {/* Y-Axes with neutral, theme-based color */}
                            {yAxisConfig.map(axis => (
                                <YAxis
                                    key={axis.yAxisId}
                                    yAxisId={axis.yAxisId}
                                    orientation={axis.orientation}
                                    stroke={axis.axisColor}
                                    strokeDasharray={axis.lineStrokeDasharray}
                                    tickFormatter={(value) =>
                                        typeof value === 'number'
                                            ? value.toLocaleString(undefined, {maximumFractionDigits:1})
                                            : value
                                    }
                                    tick={{
                                        fontSize: 10,
                                        fill: axis.axisColor
                                    }}
                                    label={{
                                        value: axis.unitTypeLabel,
                                        angle: 0,
                                        position: 'top',
                                        offset: 10,
                                        style: {
                                            textAnchor: 'middle',
                                            fontSize: 12,
                                            fill: axis.axisColor
                                        },
                                    }}
                                    width={55}
                                />
                            ))}

                            <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} cursor={{ stroke: theme === 'dark' ? '#4A5568' : '#cbd5e0', strokeWidth: 1 }}/>
                            <Legend verticalAlign="top" wrapperStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1a202c', maxHeight: '60px', overflowY: 'auto' }}/>

                            {/* Lines with unique colors + group-based dash style FROM HIERARCHY */}
                            {unitInfoForPlottedIndicators.map((info, index) => {
                                const seriesKey: IndicatorSeriesKey = info.key;

                                const axisConfigForThisLine = yAxisConfig.find(ax => ax.unitTypeLabel === info.category);
                                const lineYAxisId = axisConfigForThisLine ? axisConfigForThisLine.yAxisId : (yAxisConfig[0]?.yAxisId || 'left0');

                                const lineStyleDashArray = axisConfigForThisLine?.lineStrokeDasharray;

                                return (
                                    <Line
                                        key={seriesKey}
                                        yAxisId={lineYAxisId}
                                        type="monotone"
                                        dataKey={seriesKey}
                                        stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                        strokeDasharray={lineStyleDashArray}
                                        strokeWidth={2}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                                        dot={{ r: 3, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                                        name={`${info.indicator.countryName} - ${info.indicator.variableName} (${info.readableUnit})`}
                                        connectNulls={true}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        {fetchedIndicators && fetchedIndicators.length > 0 ? 'Select indicator(s) from the list above to plot.' : 'No data available to plot.'}
                    </div>
                )}
            </div>
        </div>
    );
};