import apiClient from './apiClient';
import type { IndicatorDto } from '../types/dto/indicator.dto';
import { stringify } from 'qs';

export interface SingleIndicatorSeriesFilters {
    countryCode: string;
    variableCode: string;
    years?: number[];
}

/**
 * Fetches an IndicatorDto for a specific country, variable, and set of years.
 * Corresponds to: GET /api/indicators?countryCode=X&variableCode=Y&years=A&years=B
 */
export const fetchSingleIndicatorSeries = async (
    filters: SingleIndicatorSeriesFilters
): Promise<IndicatorDto | null> => {
    if (!filters.countryCode || !filters.variableCode) {
        return Promise.resolve(null);
    }

    const params: Record<string, any> = {
        countryCode: filters.countryCode,
        variableCode: filters.variableCode,
    };

    if (filters.years && filters.years.length > 0) {
        params.years = filters.years;
    }

    const queryString = stringify(params, {
        arrayFormat: 'repeat', // For the years array
        skipNulls: true,
    });
    
    const results = await apiClient<IndicatorDto[]>(`/indicators?${queryString}`);
    if (results && results.length > 0) {
        return results[0];
    }
    return null;
};