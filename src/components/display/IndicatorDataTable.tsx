import React, {useMemo} from 'react';
import { useFetchSelectedIndicators } from '../../hooks/useFetchIndicator';

interface PivotedVariableData {
    variableCode: string;
    variableName: string;
    unit: string;
    yearData: Record<number, number | undefined>;
}

interface GroupedIndicatorData {
    countryCode: string;
    countryName: string;
    variables: PivotedVariableData[];
}

export const IndicatorDataTable: React.FC = () => {
    const {
        allData: rawIndicators,
        isLoading,
        isFetching,
        isError,
        //errors,
    } = useFetchSelectedIndicators();

    // 1. Determine all unique years - this uses rawIndicators
    const allYears = useMemo(() => {
        if (!rawIndicators || rawIndicators.length === 0) return [];
        const yearSet = new Set<number>();
        rawIndicators.forEach(ind => {
            ind.values.forEach(val => yearSet.add(val.year));
        });
        return Array.from(yearSet).sort((a, b) => a - b);
    }, [rawIndicators]);

    // 2. Transform/Group data for the consolidated table - this uses rawIndicators
    const groupedAndPivotedData = useMemo((): GroupedIndicatorData[] => {
        if (!rawIndicators || rawIndicators.length === 0) return [];

        const groupedByCountry = new Map<string, GroupedIndicatorData>();

        rawIndicators.forEach(indicator => { // Process each raw IndicatorDto
            if (!groupedByCountry.has(indicator.countryCode)) {
                groupedByCountry.set(indicator.countryCode, {
                    countryCode: indicator.countryCode,
                    countryName: indicator.countryName,
                    variables: [],
                });
            }
            const countryGroup = groupedByCountry.get(indicator.countryCode)!;
            const yearDataForVariable: Record<number, number | undefined> = {};
            indicator.values.forEach(val => {
                yearDataForVariable[val.year] = val.amount;
            });
            countryGroup.variables.push({
                variableCode: indicator.variableCode,
                variableName: indicator.variableName,
                unit: indicator.unit,
                yearData: yearDataForVariable,
            });
        });
        return Array.from(groupedByCountry.values());
    }, [rawIndicators]);

    // --- Loading, Error, Empty States (can use rawIndicators for some checks) ---
    if (isLoading && !isFetching && (!rawIndicators || rawIndicators.length === 0) ) { // Check rawIndicators length
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading indicator data...</div>;
    }
    // ... (rest of your loading, error, empty state handling based on isLoading, isError, and rawIndicators.length) ...
    // Example for empty state after successful fetch:
    if (!isLoading && !isError && (!rawIndicators || rawIndicators.length === 0)) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No indicator data found for current selections, or selections are incomplete.
            </div>
        );
    }
    if (groupedAndPivotedData.length === 0 && !isLoading && !isFetching && !isError) {
        return <div className="p-4 text-center text-gray-400 dark:text-gray-500 italic">Make selections to view data or no data matches the transformed view.</div>
    }


    return (
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800 overflow-x-auto">
            {isFetching && ( "Updating" )}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600 text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Variable</th>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
                    {allYears.map(year => (
                        <th key={year} /* ... */ >{year}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                {groupedAndPivotedData.map((countryGroup) => (
                    <React.Fragment key={countryGroup.countryCode}>
                        {countryGroup.variables.map((variable, varIndex) => (
                            <tr key={`${countryGroup.countryCode}-${variable.variableCode}`} /* ... */>
                                {varIndex === 0 ? (
                                    <td className="px-4 py-2 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100" rowSpan={countryGroup.variables.length}>
                                        {countryGroup.countryName}
                                    </td>
                                ) : null}
                                <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{variable.variableName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-600 dark:text-gray-400">{variable.unit}</td>
                                {allYears.map(year => (
                                    <td key={`${countryGroup.countryCode}-${variable.variableCode}-${year}`} className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {variable.yearData[year]?.toLocaleString() ?? '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};