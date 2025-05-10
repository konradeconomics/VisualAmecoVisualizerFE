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

// Define a type for the unique key of an indicator series
type IndicatorSeriesKey = string; // e.g., "DEU-GDP_CPI_EUR"

// Define the shape of data points for the Recharts LineChart
interface ChartDataPoint {
    year: number;
    [seriesKey: string]: number | undefined; // e.g., DEU_GDP_CPI_EUR: 123.45
}

// Predefined distinct colors for lines
const LINE_COLORS = [
    '#0ea5e9', // sky-500
    '#ec4899', // pink-500
    '#22c55e', // green-500
    '#f97316', // orange-500
    '#8b5cf6', // violet-500
    '#eab308', // yellow-500
    '#ef4444', // red-500
    '#14b8a6', // teal-500
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

    // State to hold the keys of indicators selected FOR PLOTTING
    const [
        plottedIndicatorKeys,
        setPlottedIndicatorKeys,
    ] = useState<Set<IndicatorSeriesKey>>(new Set());

    // Effect to update plottedIndicatorKeys when fetchedIndicators change
    // For now, let's default to plotting the first one if available, or all up to a limit
    useEffect(() => {
        if (fetchedIndicators && fetchedIndicators.length > 0) {
            // Check if any of the currently plotted keys are still valid within the new fetchedIndicators
            let currentPlottedAreStillValid = false;
            if (plottedIndicatorKeys.size > 0) {
                for (const plottedKey of plottedIndicatorKeys) {
                    if (fetchedIndicators.some(ind => `${ind.countryCode}-${ind.variableCode}` === plottedKey)) {
                        currentPlottedAreStillValid = true;
                        break; // At least one is still valid, no need to reset to default
                    }
                }
            }

            // If no currently plotted indicators are valid (e.g., they all disappeared from fetchedIndicators)
            // OR if nothing was plotted yet, set a new default (the first available indicator).
            if (!currentPlottedAreStillValid) {
                const firstIndicatorKey = `${fetchedIndicators[0].countryCode}-${fetchedIndicators[0].variableCode}`;
                // Only update if the state is actually different
                if (!plottedIndicatorKeys.has(firstIndicatorKey) || plottedIndicatorKeys.size !== 1) {
                    console.log('useEffect: Setting default plotted indicator to:', firstIndicatorKey);
                    setPlottedIndicatorKeys(new Set([firstIndicatorKey]));
                }
            }
            // If current plotted keys are still valid, we don't touch them, respecting user's potential manual deselections.
            // If the user manually deselected all, currentPlottedAreStillValid would be false, and it would re-select the first.
            // This might still be too aggressive if the user wants to *deselect all*.

        } else { // No fetched indicators
            if (plottedIndicatorKeys.size > 0) { // Only update if needed
                console.log('useEffect: Clearing plotted indicators as fetchedIndicators is empty.');
                setPlottedIndicatorKeys(new Set());
            }
        }
        // Adding plottedIndicatorKeys to the dependency array is important because we read it.
        // However, this makes it more prone to loops if setPlottedIndicatorKeys is called unconditionally.
        // The conditional logic inside should prevent the loop.
    }, [fetchedIndicators, plottedIndicatorKeys]);


    const handlePlottedIndicatorToggle = (key: IndicatorSeriesKey) => {
        console.log('Toggling plot for key:', key); // DEBUG
        setPlottedIndicatorKeys(prevKeys => {
            const newKeys = new Set(prevKeys);
            if (newKeys.has(key)) {
                newKeys.delete(key);
                console.log('Key removed, new keys:', newKeys); // DEBUG
            } else {
                newKeys.add(key);
                console.log('Key added, new keys:', newKeys); // DEBUG
            }
            return newKeys;
        });
    };

    // Get the actual IndicatorDto objects selected for plotting
    const indicatorsToPlot = useMemo(() => {
        if (!fetchedIndicators) return [];
        return fetchedIndicators.filter(ind =>
            plottedIndicatorKeys.has(`${ind.countryCode}-${ind.variableCode}`)
        );
    }, [fetchedIndicators, plottedIndicatorKeys]);


    // --- Data Transformation for Recharts ---
    const pivotedChartData = useMemo((): ChartDataPoint[] => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];

        const yearMap = new Map<number, ChartDataPoint>();

        // Collect all years and initialize data points
        indicatorsToPlot.forEach(indicator => {
            indicator.values.forEach(val => {
                if (!yearMap.has(val.year)) {
                    yearMap.set(val.year, { year: val.year });
                }
            });
        });

        // Populate amounts for each series
        indicatorsToPlot.forEach(indicator => {
            const seriesKey: IndicatorSeriesKey = `${indicator.countryCode}-${indicator.variableCode}`;
            indicator.values.forEach(val => {
                const yearDataPoint = yearMap.get(val.year);
                if (yearDataPoint) {
                    yearDataPoint[seriesKey] = val.amount;
                }
            });
        });

        // Sort by year and convert map to array
        return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
    }, [indicatorsToPlot]);


    // Tooltip styles (same as before)
    const tooltipContentStyle = useMemo(() => (theme === 'dark' ? { backgroundColor: 'rgba(50, 50, 50, 0.85)', border: '1px solid #4A5568', borderRadius: '0.375rem', color: '#e2e8f0' } : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e0', borderRadius: '0.375rem', color: '#1a202c' }), [theme]);
    const tooltipTextStyle = useMemo(() => (theme === 'dark' ? { color: '#e2e8f0' } : { color: '#1a202c' }), [theme]);


    // ----- Loading, Error, and No Data States -----
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
                                // Y-axis label is tricky with multiple series of potentially different units.
                                // For now, we omit a single unit label here. Units are in legend/tooltip.
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