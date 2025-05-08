import React from 'react';
import { useFetchCountries } from '../../hooks/useFetchCountries';

export const CountryList: React.FC = () => {
    const { data: countries, isLoading, isError, error } = useFetchCountries();

    if (isLoading) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>Loading countries...</p>
                {/* You could add a spinner component here later */}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
                <p>Error fetching countries: {error?.message || 'An unknown error occurred'}</p>
            </div>
        );
    }

    if (!countries || countries.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>No countries found.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-center text-sky-700">Available Countries</h2>
            <ul className="divide-y divide-gray-200">
                {countries.map((country) => (
                    <li key={country.code} className="py-3 px-1 hover:bg-sky-50 transition-colors">
                        <p className="text-lg font-medium text-gray-900">{country.name}</p>
                        <p className="text-sm text-gray-500">Code: {country.code}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};