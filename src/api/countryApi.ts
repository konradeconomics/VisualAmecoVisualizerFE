import apiClient from './apiClient';
import { CountryDto } from '../types/api.types'; // Adjust path if needed

/**
 * Fetches a list of all available countries.
 * Corresponds to: GET /api/countries
 */
export const fetchCountries = async (): Promise<CountryDto[]> => {
    return apiClient<CountryDto[]>('/countries');
};