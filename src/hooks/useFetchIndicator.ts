import { useQueries } from '@tanstack/react-query';
import { fetchSingleIndicatorSeries } from '../api/indicatorApi';
import type { IndicatorDto } from '../types/dto/indicator.dto';

import { useFilterSelectionsStore} from "../store/filterSelectionStore.ts";

export interface UseFetchSelectedIndicatorsResult {
    data: (IndicatorDto | null)[];
    allData: IndicatorDto[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    errors: (Error | null)[];
}

export const useFetchSelectedIndicators = (): UseFetchSelectedIndicatorsResult => {
    const selectedCountryCodes = useFilterSelectionsStore((state) => state.selectedCountryCodes);
    const selectedVariables = useFilterSelectionsStore((state) => state.selectedVariables); // Array of {code, name}
    const selectedYears = useFilterSelectionsStore((state) => state.selectedYears);

    const queryConfigs = [];
    if (selectedCountryCodes.length > 0 && selectedVariables.length > 0) {
        for (const countryCode of selectedCountryCodes) {
            for (const variable of selectedVariables) {
                queryConfigs.push({
                    queryKey: ['indicator', countryCode, variable.code, selectedYears],
                    queryFn: () =>
                        fetchSingleIndicatorSeries({
                            countryCode,
                            variableCode: variable.code,
                            years: selectedYears.length > 0 ? selectedYears : undefined,
                        }),
                    enabled: !!countryCode && !!variable.code,
                    staleTime: 1000 * 60 * 5,
                    keepPreviousData: true,
                });
            }
        }
    }

    const results = useQueries({
        queries: queryConfigs,
    });

    const isLoading = results.some(result => result.isLoading);
    const isFetching = results.some(result => result.isFetching);
    const isError = results.some(result => result.isError);
    const data = results.map(result => result.data === undefined ? null : result.data);
    const allData = data.filter((d): d is IndicatorDto => d !== null);
    const errors = results.map(result => result.error);

    return { data, allData, isLoading, isFetching, isError, errors };
};