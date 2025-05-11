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
import { getReadableUnit, getUnitCategory, type UnitCategory } from '../../utils/unitMapper'; // Adjust path as needed

type IndicatorSeriesKey = string;

interface ChartDataPoint {
    year: number;
    [seriesKey: string]: number | undefined;
}

const LINE_COLORS = [
    '#0ea5e9', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
    '#3b82f6', '#a855f7', '#d946ef', '#84cc16', '#64748b', '#78716c', '#06b6d4', '#f59e0b',
];

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
        return indicatorsToPlot.map(indicator => {
            const readableUnit = getReadableUnit(indicator.unitCode, indicator.unitDescription);
            return {
                key: `${indicator.countryCode}-${indicator.variableCode}`,
                readableUnit: readableUnit,
                category: getUnitCategory(readableUnit),
                indicator: indicator,
            };
        });
    }, [indicatorsToPlot]);


    const yAxisConfig = useMemo(() => {
        if (!unitInfoForPlottedIndicators || unitInfoForPlottedIndicators.length === 0) {
            return [{ yAxisId: 'left' as const, orientation: 'left' as const, unitTypeLabel: 'Value' }];
        }

        const uniqueCategories = Array.from(new Set(unitInfoForPlottedIndicators.map(info => info.category)));
        const configs: { yAxisId: 'left' | 'right'; orientation: 'left' | 'right'; unitTypeLabel: string }[] = [];

        const preferredLeftCategories: UnitCategory[] = ['Currency', 'Count', 'Index', 'PPS', 'Original', 'Other'];
        const preferredRightCategories: UnitCategory[] = ['Percentage', 'Ratio'];

        let hasLeftAxis = false;

        for (const category of uniqueCategories) {
            if (preferredLeftCategories.includes(category)) {
                configs.push({yAxisId: 'left', orientation: 'left', unitTypeLabel: category});
                hasLeftAxis = true;
                break;
            }
        }

        if (hasLeftAxis) {
            for (const category of uniqueCategories) {
                if (preferredRightCategories.includes(category) && !configs.some(c => c.unitTypeLabel === category && c.orientation === 'left')) {
                    configs.push({yAxisId: 'right', orientation: 'right', unitTypeLabel: category});
                    break;
                }
            }
        }

        if (!hasLeftAxis && uniqueCategories.length > 0) {
            let assigned = false;
            for (const category of preferredRightCategories) {
                if (uniqueCategories.includes(category)) {
                    configs.push({ yAxisId: 'left', orientation: 'left', unitTypeLabel: category });
                    hasLeftAxis = true;
                    assigned = true;
                    break;
                }
            }
            if(!assigned && uniqueCategories[0]) {
                configs.push({ yAxisId: 'left', orientation: 'left', unitTypeLabel: uniqueCategories[0] });
                hasLeftAxis = true;
            }
        }

        if (configs.length === 0) {
            return [{ yAxisId: 'left' as const, orientation: 'left' as const, unitTypeLabel: 'Value' }];
        }

        return configs;
    }, [unitInfoForPlottedIndicators]);


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
                        <LineChart data={pivotedChartData} margin={{ top: 5, right: (yAxisConfig.some(ax=>ax.orientation === 'right') ? 40 : 20), left: (yAxisConfig.some(ax=>ax.orientation === 'left') ? 30 : 5), bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#e2e8f0"} />
                            <XAxis
                                dataKey="year" dy={10}
                                tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                                stroke={theme === 'dark' ? '#64748b' : '#d1d5db'}
                                label={{ value: "Year", position: "insideBottom", offset: -15, fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#374151' }}
                            />

                            {/* Dynamically render Y-Axes */}
                            {yAxisConfig.map(axis => (
                                <YAxis
                                    key={axis.yAxisId}
                                    yAxisId={axis.yAxisId}
                                    orientation={axis.orientation}
                                    tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 2}) : value}
                                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                                    stroke={theme === 'dark' ? '#64748b' : '#d1d5db'}
                                    label={{
                                        value: axis.unitTypeLabel,
                                        angle: -90,
                                        position: axis.orientation === 'left' ? 'insideLeft' : 'insideRight',
                                        style: { textAnchor: 'middle', fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#374151' },
                                        dx: axis.orientation === 'left' ? -20 : (axis.orientation === 'right' ? 20 : 0), // Adjusted dx
                                    }}
                                    width={55}
                                />
                            ))}

                            <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} cursor={{ stroke: theme === 'dark' ? '#4A5568' : '#cbd5e0', strokeWidth: 1 }}/>
                            <Legend verticalAlign="top" wrapperStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1a202c', maxHeight: '60px', overflowY: 'auto' }}/>

                            {/* Use unitInfoForPlottedIndicators for line rendering */}
                            {unitInfoForPlottedIndicators.map((info, index) => {
                                const seriesKey: IndicatorSeriesKey = info.key;

                                let lineYAxisId = "left";
                                if (yAxisConfig.length > 0) {
                                    const matchingAxis = yAxisConfig.find(ax => ax.unitTypeLabel === info.category);
                                    if (matchingAxis) {
                                        lineYAxisId = matchingAxis.yAxisId;
                                    } else if (yAxisConfig.length === 1) {
                                        lineYAxisId = yAxisConfig[0].yAxisId;
                                    } else if (yAxisConfig.length > 1 && yAxisConfig.find(ax => ax.yAxisId === "left")) {
                                        lineYAxisId = "left";
                                    } else if (yAxisConfig.length > 0) {
                                        lineYAxisId = yAxisConfig[0].yAxisId;
                                    }
                                }


                                return (
                                    <Line
                                        key={seriesKey}
                                        yAxisId={lineYAxisId}
                                        type="monotone"
                                        dataKey={seriesKey}
                                        stroke={LINE_COLORS[index % LINE_COLORS.length]}
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