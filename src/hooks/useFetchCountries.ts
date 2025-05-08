import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '../api/countryApi';
import type { CountryDto } from '../types/dto/country.dto';

export const COUNTRIES_QUERY_KEY = ['countries'];

export const useFetchCountries = () => {
    return useQuery<CountryDto[], Error>({
        queryKey: COUNTRIES_QUERY_KEY,
        queryFn: fetchCountries,
    });
};