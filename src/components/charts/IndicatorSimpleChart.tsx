import React, {useEffect, useMemo, useState} from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    //Label
} from 'recharts';
import { useFetchSelectedIndicators } from '../../hooks/useFetchIndicator';
import { useThemeStore } from '../../store/themeStore';

export const IndicatorSimpleChart: React.FC = () => {
    const {
        allData: fetchedIndicators,
        isLoading,
        isFetching,
        isError,
        errors,
    } = useFetchSelectedIndicators();

    const { theme } = useThemeStore();

    // Local state to store the identifier (e.g., countryCode-variableCode) of the indicator selected for charting
    const [
        currentlyPlottedIndicatorKey,
        setCurrentlyPlottedIndicatorKey,
    ] = useState<string | null>(null);

    // Effect to automatically select the first indicator if available and none is selected,
    // or if the currently selected one is no longer in the fetched list.
    useEffect(() => {
        if (fetchedIndicators && fetchedIndicators.length > 0) {
            const firstIndicatorKey = `${fetchedIndicators[0].countryCode}-${fetchedIndicators[0].variableCode}`;
            if (!currentlyPlottedIndicatorKey || !fetchedIndicators.find(ind => `${ind.countryCode}-${ind.variableCode}` === currentlyPlottedIndicatorKey)) {
                setCurrentlyPlottedIndicatorKey(firstIndicatorKey);
            }
        } else {
            setCurrentlyPlottedIndicatorKey(null); // Clear selection if no indicators fetched
        }
    }, [fetchedIndicators, currentlyPlottedIndicatorKey]);

    // Memoize the actual indicator object to plot based on the key
    const indicatorToChart = useMemo(() => {
        if (!currentlyPlottedIndicatorKey || !fetchedIndicators) return undefined;
        return fetchedIndicators.find(
            (ind) => `${ind.countryCode}-${ind.variableCode}` === currentlyPlottedIndicatorKey
        );
    }, [currentlyPlottedIndicatorKey, fetchedIndicators]);

    const chartData = useMemo(() => {
        if (!indicatorToChart) return [];
        return [...indicatorToChart.values].sort((a, b) => a.year - b.year);
    }, [indicatorToChart]);

    // Tooltip styles (same as before)
    const tooltipContentStyle = useMemo(() => (theme === 'dark'
            ? { backgroundColor: 'rgba(50, 50, 50, 0.85)', border: '1px solid #4A5568', borderRadius: '0.375rem', color: '#e2e8f0' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e0', borderRadius: '0.375rem', color: '#1a202c' }
    ), [theme]);
    const tooltipTextStyle = useMemo(() => (theme === 'dark' ? { color: '#e2e8f0' } : { color: '#1a202c' }), [theme]);


    // ----- Loading, Error, and No Data States -----
    if (isLoading && !isFetching && (!fetchedIndicators || fetchedIndicators.length === 0)) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading chart data...</div>;
    }
    if (isError && !isLoading) {
        const firstError = errors?.find(e => e !== null);
        return (
            <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-400 rounded">
                Error loading data for chart: {firstError?.message || 'Unknown error'}
            </div>
        );
    }
    // If no indicators were fetched overall (e.g. primary selections missing)
    if ((!fetchedIndicators || fetchedIndicators.length === 0) && !isLoading && !isFetching && !isError) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">
                No indicators fetched. Please make valid selections in the filter panel.
            </div>
        );
    }
    // If indicators were fetched, but the one selected for plotting is somehow not found (shouldn't happen with useEffect logic)
    // OR if no indicator is selected yet for plotting (e.g., initial state before useEffect runs or if fetchedIndicators is empty)
    if (!indicatorToChart && fetchedIndicators && fetchedIndicators.length > 0) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">
                Select an indicator from the list above the chart to display.
            </div>
        )
    }
    if (!indicatorToChart && (!fetchedIndicators || fetchedIndicators.length === 0)) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">
                No data available to display chart based on current selections.
            </div>
        );
    }


    return (
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800 h-[400px] md:h-[500px] w-full flex flex-col">
            {/* Selector for which indicator to plot if multiple are fetched */}
            {fetchedIndicators && fetchedIndicators.length > 1 && (
                <div className="mb-4 shrink-0">
                    <label htmlFor="indicatorSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Indicator to Plot:
                    </label>
                    <select
                        id="indicatorSelect"
                        value={currentlyPlottedIndicatorKey || ''}
                        onChange={(e) => setCurrentlyPlottedIndicatorKey(e.target.value)}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        {fetchedIndicators.map(ind => {
                            const key = `${ind.countryCode}-${ind.variableCode}`;
                            return (
                                <option key={key} value={key}>
                                    {ind.countryName} - {ind.variableName}
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {/* Chart Title Area (based on the selected indicatorToChart) */}
            {indicatorToChart && (
                <div className="shrink-0">
                    <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-0.5">
                        {indicatorToChart.variableName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {indicatorToChart.countryName} ({indicatorToChart.countryCode})
                    </p>
                </div>
            )}

            {isFetching && (
                <div className="p-1 text-xs text-center text-sky-600 dark:text-sky-400 shrink-0">Updating chart...</div>
            )}

            {/* Chart Rendering Area */}
            <div className="flex-grow min-h-0"> {/* Added min-h-0 for flex child */}
                {chartData.length > 0 && indicatorToChart ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#e2e8f0"} />
                            <XAxis
                                dataKey="year"
                                dy={10}
                                tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                                stroke={theme === 'dark' ? '#64748b' : '#d1d5db'}
                                label={{ value: "Year", position: "insideBottom", offset: -15, fontSize: 14, fill: theme === 'dark' ? '#94a3b8' : '#374151' }}
                            />
                            <YAxis
                                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                                tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                                stroke={theme === 'dark' ? '#64748b' : '#d1d5db'}
                                label={{
                                    value: indicatorToChart.unit || 'Amount',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle', fontSize: 14, fill: theme === 'dark' ? '#94a3b8' : '#374151' },
                                    dx: -15
                                }}
                            />
                            <Tooltip
                                contentStyle={tooltipContentStyle}
                                labelStyle={tooltipTextStyle}
                                itemStyle={tooltipTextStyle}
                                cursor={{ stroke: theme === 'dark' ? '#4A5568' : '#cbd5e0', strokeWidth: 1 }}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                wrapperStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1a202c' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#0ea5e9" // sky-500
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 0, fill: theme === 'dark' ? '#38bdf8' : '#0284c7' }}
                                dot={{ r: 3, strokeWidth: 0, fill: '#0ea5e9' }}
                                name={`${indicatorToChart.variableName} (${indicatorToChart.unit})`}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        {indicatorToChart ? 'No time-series data points to plot.' : ''} {/* Show only if an indicator was expected */}
                    </div>
                )}
            </div>
        </div>
    );
};