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
import { useFetchSelectedIndicators } from  '../../hooks/useFetchIndicator';
import { useThemeStore } from '../../store/themeStore';

type IndicatorSeriesKey = string; // e.g., "DEU-GDP_CPI_EUR"

interface ChartDataPoint {
    year: number;
    [seriesKey: string]: number | undefined; // e.g., DEU_GDP_CPI_EUR: 123.45
}

const LINE_COLORS = [
    '#0ea5e9', // sky-500
    '#ef4444', // red-500
    '#22c55e', // green-500
    '#eab308', // yellow-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#3b82f6', // blue-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#84cc16', // lime-500
    '#64748b', // slate-500
    '#78716c', // stone-500
    '#06b6d4', // cyan-500
    '#f59e0b', // amber-500
];

export const IndicatorSimpleChart: React.FC = () => {
    const {
        allData: fetchedIndicators, // IndicatorDto[]
        isLoading,
        isFetching,
        isError,
        errors,
    } = useFetchSelectedIndicators();

    const { theme } = useThemeStore();

    const [
        plottedIndicatorKeys,
        setPlottedIndicatorKeys,
    ] = useState<Set<IndicatorSeriesKey>>(new Set());
    
    useEffect(() => {
        if (fetchedIndicators && fetchedIndicators.length > 0) {
            let currentPlottedAreStillValid = false;
            if (plottedIndicatorKeys.size > 0) {
                for (const plottedKey of plottedIndicatorKeys) {
                    if (fetchedIndicators.some(ind => `${ind.countryCode}-${ind.variableCode}` === plottedKey)) {
                        currentPlottedAreStillValid = true;
                        break;
                    }
                }
            }

            
            if (!currentPlottedAreStillValid) {
                const firstIndicatorKey = `${fetchedIndicators[0].countryCode}-${fetchedIndicators[0].variableCode}`;
                if (!plottedIndicatorKeys.has(firstIndicatorKey) || plottedIndicatorKeys.size !== 1) {
                    console.log('useEffect: Setting default plotted indicator to:', firstIndicatorKey);
                    setPlottedIndicatorKeys(new Set([firstIndicatorKey]));
                }
            }

        } else {
            if (plottedIndicatorKeys.size > 0) {
                console.log('useEffect: Clearing plotted indicators as fetchedIndicators is empty.');
                setPlottedIndicatorKeys(new Set());
            }
        }
    }, [fetchedIndicators, plottedIndicatorKeys]);


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


    const pivotedChartData = useMemo((): ChartDataPoint[] => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];

        const yearMap = new Map<number, ChartDataPoint>();

        indicatorsToPlot.forEach(indicator => {
            indicator.values.forEach(val => {
                if (!yearMap.has(val.year)) {
                    yearMap.set(val.year, { year: val.year });
                }
            });
        });

        indicatorsToPlot.forEach(indicator => {
            const seriesKey: IndicatorSeriesKey = `${indicator.countryCode}-${indicator.variableCode}`;
            indicator.values.forEach(val => {
                const yearDataPoint = yearMap.get(val.year);
                if (yearDataPoint) {
                    yearDataPoint[seriesKey] = val.amount;
                }
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
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800 h-[500px] md:h-[600px] w-full flex flex-col"> {/* Increased height slightly */}

            {/* UI for selecting which fetched indicators to plot */}
            {fetchedIndicators && fetchedIndicators.length > 0 && (
                <div className="mb-4 shrink-0 border-b dark:border-slate-700 pb-3">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">Plot on Chart:</h4>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-2"> {/* Scrollable list for indicator selection */}
                        {fetchedIndicators.map(ind => {
                            const key = `${ind.countryCode}-${ind.variableCode}`;
                            const isChecked = plottedIndicatorKeys.has(key);
                            return (
                                <label key={key} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-xs">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handlePlottedIndicatorToggle(key)}
                                        className="form-checkbox h-4 w-4 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-600 focus:ring-sky-500"
                                    />
                                    <span className="dark:text-slate-200">{ind.countryName} - {ind.variableName} ({ind.unit})</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {isFetching && (<div className="p-1 text-xs text-center text-sky-600 dark:text-sky-400 shrink-0">Updating chart...</div>)}

            <div className="flex-grow min-h-0"> {/* Chart Rendering Area */}
                {indicatorsToPlot.length > 0 && pivotedChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={pivotedChartData}
                            margin={{ top: 5, right: 30, left: 30, bottom: 25 }} // Adjusted left margin
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#e2e8f0"} />
                            <XAxis
                                dataKey="year" dy={10}
                                tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                                stroke={theme === 'dark' ? '#64748b' : '#d1d5db'}
                                label={{ value: "Year", position: "insideBottom", offset: -15, fontSize: 14, fill: theme === 'dark' ? '#94a3b8' : '#374151' }}
                            />
                            <YAxis
                                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                                tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                                stroke={theme === 'dark' ? '#64748b' : '#d1d5db'}
                            />
                            <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} cursor={{ stroke: theme === 'dark' ? '#4A5568' : '#cbd5e0', strokeWidth: 1 }}/>
                            <Legend verticalAlign="top" wrapperStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1a202c', maxHeight: '60px', overflowY: 'auto' }}/>
                            {indicatorsToPlot.map((indicator, index) => {
                                const seriesKey: IndicatorSeriesKey = `${indicator.countryCode}-${indicator.variableCode}`;
                                return (
                                    <Line
                                        key={seriesKey}
                                        type="monotone"
                                        dataKey={seriesKey} // This key must exist in pivotedChartData objects
                                        stroke={LINE_COLORS[index % LINE_COLORS.length]} // Cycle through predefined colors
                                        strokeWidth={2}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                                        dot={{ r: 3, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                                        name={`${indicator.countryName} - ${indicator.variableName} (${indicator.unit})`}
                                        connectNulls={true} // Optional: connect lines even if there are null/undefined data points
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        {fetchedIndicators && fetchedIndicators.length > 0 ? 'Select indicator(s) above to plot.' : 'No data to plot.'}
                    </div>
                )}
            </div>
        </div>
    );
};