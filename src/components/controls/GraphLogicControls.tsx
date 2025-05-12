import React, { useState, useMemo, useEffect } from 'react';
import type { IndicatorDto} from '../../types/dto/indicator.dto';

import {getReadableUnit, getUnitCategory} from '../../utils/unitMapper';
import type { CalculatedSeriesDto } from '../../types/dto/calculatedSeries.dto';
import {useFetchSelectedIndicators} from "../../hooks/useFetchIndicator.ts";
import {useSelectionStore} from "../../store/selectionStore.ts";
import type {YearValueDto} from "../../types/dto/yearValue.dto.ts";

interface SelectableSeriesInfo {
    key: string;
    displayName: string;
    originalData: IndicatorDto | CalculatedSeriesDto;
    isCalculated: boolean;
}

export const GraphLogicControls: React.FC = () => {
    const { allData: fetchedIndicators } = useFetchSelectedIndicators();
    const allCalculatedSeriesFromStore = useSelectionStore((state) => state.calculatedSeries);
    const plottedIndicatorKeys = useSelectionStore((state) => state.plottedIndicatorKeys);
    const addCalculatedSeries = useSelectionStore((state) => state.addCalculatedSeries);

    const [seriesAKey, setSeriesAKey] = useState<string | null>(null);
    const [seriesBKey, setSeriesBKey] = useState<string | null>(null);
    const [operation, setOperation] = useState<'divide' | 'subtract'>('divide');
    const [newSeriesName, setNewSeriesName] = useState('');
    const [newSeriesUnit, setNewSeriesUnit] = useState('');

    const seriesOptionsForControls = useMemo((): SelectableSeriesInfo[] => {
        const availableFetched: SelectableSeriesInfo[] = (fetchedIndicators || []).map(ind => ({
            key: `${ind.countryCode}-${ind.variableCode}`,
            displayName: `${ind.countryName} - ${ind.variableName} (${getReadableUnit(ind.unitCode, ind.unitDescription)})`,
            originalData: ind,
            isCalculated: false,
        }));

        const availableCalculated: SelectableSeriesInfo[] = (allCalculatedSeriesFromStore || []).map(calc => ({
            key: calc.variableCode,
            displayName: `${calc.variableName} (${getReadableUnit(calc.unitCode, calc.unitDescription)}) [Calc]`,
            originalData: calc,
            isCalculated: true,
        }));

        const allAvailable = [...availableFetched, ...availableCalculated];
        return allAvailable.filter(s => plottedIndicatorKeys.has(s.key));
    }, [fetchedIndicators, allCalculatedSeriesFromStore, plottedIndicatorKeys]);


    useEffect(() => {
        if (seriesAKey && seriesBKey && operation && seriesOptionsForControls.length > 0) {
            const seriesAInfo = seriesOptionsForControls.find(s => s.key === seriesAKey);
            const seriesBInfo = seriesOptionsForControls.find(s => s.key === seriesBKey);
            if (seriesAInfo && seriesBInfo) {
                const nameA = seriesAInfo.originalData.variableName;
                const nameB = seriesBInfo.originalData.variableName;
                const unitA = getReadableUnit(seriesAInfo.originalData.unitCode, seriesAInfo.originalData.unitDescription);
                const unitB = getReadableUnit(seriesBInfo.originalData.unitCode, seriesBInfo.originalData.unitDescription);

                if (operation === 'divide') {
                    setNewSeriesName(`Ratio: (${nameA}) / (${nameB})`);
                    setNewSeriesUnit(`Ratio (${unitA}/${unitB})`);
                } else if (operation === 'subtract') {
                    setNewSeriesName(`Diff: (${nameA}) - (${nameB})`);
                    if (unitA === unitB) {
                        setNewSeriesUnit(unitA);
                    } else {
                        setNewSeriesUnit(`Difference (${unitA} - ${unitB})`);
                    }
                }
            }
        } else {
        }
    }, [seriesAKey, seriesBKey, operation, seriesOptionsForControls]);

    const handleCalculateAndAdd = () => {
        if (!seriesAKey || !seriesBKey || !operation || !newSeriesName.trim() || !newSeriesUnit.trim()) {
            alert("Please select Series A, Series B, an operation, and provide a name and unit for the new series.");
            return;
        }

        const seriesAInfo = seriesOptionsForControls.find(s => s.key === seriesAKey);
        const seriesBInfo = seriesOptionsForControls.find(s => s.key === seriesBKey);

        if (!seriesAInfo || !seriesBInfo) {
            console.error("Selected series for calculation not found in available options.");
            alert("Error: One or both selected series could not be found for calculation.");
            return;
        }

        const seriesAData = seriesAInfo.originalData.values;
        const seriesBData = seriesBInfo.originalData.values;
        const calculatedValues: YearValueDto[] = [];
        const seriesAYears = new Map(seriesAData.map(v => [v.year, v.amount]));

        seriesBData.forEach(valB => {
            if (seriesAYears.has(valB.year)) {
                const amountA = seriesAYears.get(valB.year)!;
                const amountB = valB.amount;
                let resultValue: number | null = null;

                if (operation === 'divide') {
                    resultValue = (amountB !== 0 && amountB !== null && amountA !== null) ? amountA / amountB : null;
                } else if (operation === 'subtract') {
                    resultValue = (amountA !== null && amountB !== null) ? amountA - amountB : null;
                }

                if (resultValue !== null && isFinite(resultValue)) {
                    calculatedValues.push({ year: valB.year, amount: resultValue });
                } else {
                    calculatedValues.push({ year: valB.year, amount: NaN });
                }
            }
        });

        const calcCategory = getUnitCategory(newSeriesUnit);

        const newCalculatedSeries: CalculatedSeriesDto = {
            variableCode: `CALC-${seriesAKey}-${operation}-${seriesBKey}-${Date.now()}`.slice(0,50),
            variableName: newSeriesName,
            unitCode: "CALC", // Synthetic code
            unitDescription: newSeriesUnit,
            countryCode: seriesAInfo.originalData.countryCode === seriesBInfo.originalData.countryCode
                ? seriesAInfo.originalData.countryCode
                : "CALC",
            countryName: seriesAInfo.originalData.countryCode === seriesBInfo.originalData.countryCode
                ? seriesAInfo.originalData.countryName
                : "Calculated",
            values: calculatedValues.sort((a, b) => a.year - b.year),
            category: calcCategory,
            sourceSeriesAKey: seriesAKey,
            sourceSeriesBKey: seriesBKey,
            operation: operation,
            isCalculated: true,
        };

        addCalculatedSeries(newCalculatedSeries); // Add to Zustand store
        setSeriesAKey(null);
        setSeriesBKey(null);
        setNewSeriesName('');
        setNewSeriesUnit('');
    };

    const canEnableControls = seriesOptionsForControls.length >= 2;

    return (
        <div className="p-4 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Create Calculated Series
            </h3>
            {!canEnableControls && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Plot at least two distinct series on the chart to enable calculations.
                </p>
            )}
            {canEnableControls && (
                <div className="space-y-3">
                    <div>
                        <label htmlFor="seriesA" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Series A:</label>
                        <select id="seriesA" value={seriesAKey || ''} onChange={(e) => setSeriesAKey(e.target.value || null)}
                                className="mt-1 form-select block w-full text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 rounded-md shadow-sm">
                            <option value="">-- Select Series A --</option>
                            {seriesOptionsForControls.map(s => <option key={s.key} value={s.key} disabled={s.key === seriesBKey}>{s.displayName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="operation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Operation:</label>
                        <select id="operation" value={operation || ''} onChange={(e) => setOperation(e.target.value as 'divide' | 'subtract')}
                                className="mt-1 form-select block w-full text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 rounded-md shadow-sm">
                            <option value="divide">Divide (A / B)</option>
                            <option value="subtract">Subtract (A - B)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="seriesB" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Series B:</label>
                        <select id="seriesB" value={seriesBKey || ''} onChange={(e) => setSeriesBKey(e.target.value || null)}
                                className="mt-1 form-select block w-full text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 rounded-md shadow-sm">
                            <option value="">-- Select Series B --</option>
                            {seriesOptionsForControls.map(s => <option key={s.key} value={s.key} disabled={s.key === seriesAKey}>{s.displayName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="newSeriesName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Series Name:</label>
                        <input type="text" id="newSeriesName" value={newSeriesName} onChange={(e) => setNewSeriesName(e.target.value)}
                               placeholder="e.g., GDP per Capita"
                               className="mt-1 form-input block w-full text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="newSeriesUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Series Unit:</label>
                        <input type="text" id="newSeriesUnit" value={newSeriesUnit} onChange={(e) => setNewSeriesUnit(e.target.value)}
                               placeholder="e.g., Ratio, EUR/person"
                               className="mt-1 form-input block w-full text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <button
                        onClick={handleCalculateAndAdd}
                        disabled={!seriesAKey || !seriesBKey || !operation || !newSeriesName.trim() || !newSeriesUnit.trim()}
                        className="mt-3 w-full px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                        Add Calculated Series to Chart
                    </button>
                </div>
            )}
        </div>
    );
};