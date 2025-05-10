import apiClient from './apiClient';
import type {CountryDto} from '../types/dto/country.dto';

/**
 * Fetches a list of all available countries.
 * Corresponds to: GET /api/countries
 */
export const fetchCountries = async (): Promise<CountryDto[]> => {
    return apiClient<CountryDto[]>('/countries');
};