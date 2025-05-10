import React from 'react';
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
import type { IndicatorDto } from '../../types/dto/indicator.dto';
import { useThemeStore } from '../../store/themeStore';

export const IndicatorSimpleChart: React.FC = () => {
    const {
        allData: indicators,
        isLoading,
        isFetching,
        isError,
        errors,
    } = useFetchSelectedIndicators();

    const { theme } = useThemeStore(); // Get current theme

    const indicatorToChart: IndicatorDto | undefined = indicators && indicators.length > 0 ? indicators[0] : undefined;

    const chartData = React.useMemo(() => {
        if (!indicatorToChart) return [];
        return [...indicatorToChart.values].sort((a, b) => a.year - b.year);
    }, [indicatorToChart]);

    // Tooltip styles based on theme
    const tooltipContentStyle = React.useMemo(() => (theme === 'dark'
            ? { backgroundColor: 'rgba(50, 50, 50, 0.85)', border: '1px solid #4A5568', borderRadius: '0.375rem' } // Dark theme
            : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e0', borderRadius: '0.375rem' }  // Light theme
    ), [theme]);

    const tooltipTextStyle = React.useMemo(() => (theme === 'dark'
            ? { color: '#e2e8f0' } // Light text for dark tooltip
            : { color: '#1a202c' }   // Dark text for light tooltip
    ), [theme]);


    if (isLoading && !isFetching && !indicatorToChart) {
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

    if (!indicatorToChart) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">
                No indicator selected or data available to display chart.
            </div>
        );
    }

    return (
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800 h-[400px] md:h-[500px] w-full">
            <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-1">
                {indicatorToChart.variableName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {indicatorToChart.countryName} ({indicatorToChart.countryCode})
            </p>
            {isFetching && (
                <div className="p-1 text-xs text-center text-sky-600 dark:text-sky-400">Updating chart...</div>
            )}
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30, // Increased right margin for Y-axis label if it's on the right
                            left: 20,  // Increased left margin for Y-axis label if on the left
                            bottom: 25,
                        }}
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
                                dx: -15 // Adjusted dx for better spacing
                            }}
                        />
                        <Tooltip
                            contentStyle={tooltipContentStyle}
                            labelStyle={tooltipTextStyle} // For the label (e.g., year) in the tooltip
                            itemStyle={tooltipTextStyle}  // For the item name/value in the tooltip
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
                            stroke="#0ea5e9" // sky-500 from Tailwind
                            strokeWidth={2}
                            activeDot={{ r: 6, strokeWidth: 0, fill: theme === 'dark' ? '#38bdf8' : '#0284c7' }} // Lighter/darker sky
                            dot={{ r: 3, strokeWidth: 0, fill: '#0ea5e9' }}
                            name={`${indicatorToChart.variableName} (${indicatorToChart.unit})`}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No time-series data points available to plot for this indicator.
                </div>
            )}
        </div>
    );
};