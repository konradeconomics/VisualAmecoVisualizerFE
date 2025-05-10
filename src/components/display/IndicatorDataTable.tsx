import React from 'react';
import { useFetchSelectedIndicators } from '../../hooks/useFetchIndicator';
import type { IndicatorDto} from '../../types/dto/indicator.dto';
import type { YearValueDto } from '../../types/dto/yearValue.dto';

// Sub-component to render a table for a single indicator's time-series data
const SingleIndicatorDisplay: React.FC<{ indicator: IndicatorDto }> = ({ indicator }) => {
    // Sort values by year for consistent display, typically ascending or descending
    const sortedValues = React.useMemo(() => {
        return [...indicator.values].sort((a, b) => a.year - b.year); // Sort ascending by year
    }, [indicator.values]);

    return (
        <div className="mb-8 p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800">
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400">
                    {indicator.variableName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {indicator.countryName} ({indicator.countryCode})
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    Unit: {indicator.unit}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    Chapter: {indicator.chapterName} | Subchapter: {indicator.subchapterName}
                </p>
            </div>

            {sortedValues.length > 0 ? (
                <div className="overflow-x-auto max-h-72 border dark:border-slate-600 rounded"> {/* Max height for table scroll */}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600 text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
                        <tr>
                            <th
                                scope="col"
                                className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                Year
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                Amount
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                        {sortedValues.map((value: YearValueDto) => (
                            <tr key={value.year} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{value.year}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{value.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No time-series data available for this indicator.</p>
            )}
        </div>
    );
};


export const IndicatorDataTable: React.FC = () => {
    const {
        allData: indicators, // Using allData which filters out nulls and contains successfully fetched IndicatorDto[]
        isLoading,
        isFetching, // Useful for showing subtle loading state for background refetches
        isError,
        errors, // Array of errors from useQueries
    } = useFetchSelectedIndicators();

    // This effect is for debugging to see what the hook returns
    React.useEffect(() => {
        console.log('Indicator Data Hook:', { indicators, isLoading, isFetching, isError, errors });
    }, [indicators, isLoading, isFetching, isError, errors]);

    // Handle initial loading state
    if (isLoading && !isFetching && indicators.length === 0) { // More specific initial loading
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading indicator data...</div>;
    }

    // Handle error state
    if (isError && !isLoading) { // Show error only if not also loading initial data
        const firstError = errors?.find(e => e !== null);
        return (
            <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-400 rounded">
                Error fetching indicator data: {firstError?.message || 'An unknown error occurred.'}
                {errors && errors.filter(e => e !== null).length > 1 && ` (and ${errors.filter(e => e !== null).length - 1} other errors for some combinations)`}
            </div>
        );
    }

    // Handle case where fetching is done, no errors, but no data (either no selections or selections yield no results)
    if (!isLoading && !isFetching && !isError && (!indicators || indicators.length === 0)) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No indicator data found for the current selections. Please ensure at least one country and one variable are selected.
            </div>
        );
    }

    // If there are no indicators to display (e.g. initial state before selections are made)
    // and it's not loading or erroring for the current (empty) query.
    if (indicators.length === 0 && !isLoading && !isFetching && !isError) {
        return <div className="p-4 text-center text-gray-400 dark:text-gray-500 italic">Make selections in the filter panel to view data.</div>
    }


    return (
        <div className="space-y-4"> {/* Container for all indicator tables/items */}
            {isFetching && ( // Subtle indicator for background refetches when data is already present
                <div className="p-2 text-xs text-center text-sky-600 dark:text-sky-400 rounded bg-sky-50 dark:bg-sky-900 border border-sky-200 dark:border-sky-700">
                    Updating data...
                </div>
            )}
            {indicators.map((indicator) => (
                <SingleIndicatorDisplay key={`${indicator.countryCode}-${indicator.variableCode}`} indicator={indicator} />
            ))}
        </div>
    );
};