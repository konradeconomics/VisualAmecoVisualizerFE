import React, {useMemo, useState} from 'react';
import { useFetchCountries } from '../../hooks/useFetchCountries';
import { useSelectionStore } from '../../store/selectionStore';
import type { CountryDto } from '../../types/dto/country.dto';

export const CountrySelector: React.FC = () => {
    const { data: countries, isLoading, isError, error } = useFetchCountries();

    const selectedCountryCodes = useSelectionStore(
        (state) => state.selectedCountryCodes
    );
    const toggleCountry = useSelectionStore((state) => state.toggleCountry);

    const [searchTerm, setSearchTerm] = useState('');

    const handleCountryToggle = (countryCode: string) => {
        toggleCountry(countryCode);
    };

    const filteredCountries = useMemo(() => {
        if (!countries) return [];
        if (!searchTerm.trim()) return countries; // Show all if search term is empty

        return countries.filter((country) =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [countries, searchTerm]);

    if (isLoading) {
        return <div className="p-4 text-gray-500 dark:text-gray-400">Loading countries...</div>;
    }

    if (isError) {
        return (
            <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-200 dark:border-red-700">
                Error fetching countries: {error?.message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="p-1 border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold mb-3 px-3 pt-3 text-gray-700 dark:text-gray-300">Select Countries</h3>

            {/* Search Input */}
            <div className="px-3 mb-3">
                <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-sky-600 dark:focus:border-sky-600"
                />
            </div>

            {(!filteredCountries || filteredCountries.length === 0) && countries && countries.length > 0 && (
                <div className="p-3 text-gray-500 dark:text-gray-400">No countries match your search.</div>
            )}

            {(filteredCountries && filteredCountries.length === 0 && (!countries || countries.length === 0)) && (
                <div className="p-3 text-gray-500 dark:text-gray-400">No countries available.</div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-1 px-3 pb-3"> {/* Scrollable list */}
                {filteredCountries.map((country: CountryDto) => {
                    const isSelected = selectedCountryCodes.includes(country.code);
                    return (
                        <div
                            key={country.code}
                            onClick={() => handleCountryToggle(country.code)}
                            title={`${country.name} (${country.code})`} // Tooltip for full name/code
                            className={`
                p-2.5 rounded-md cursor-pointer transition-all duration-150 ease-in-out
                border flex items-center justify-between group
                ${
                                isSelected
                                    ? 'bg-sky-500 text-white border-sky-600 shadow-sm dark:bg-sky-600 dark:border-sky-700'
                                    : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                            }
              `}
                        >
                            <label htmlFor={`country-${country.code}`} className="flex items-center cursor-pointer w-full">
                                <input
                                    type="checkbox"
                                    id={`country-${country.code}`}
                                    checked={isSelected}
                                    readOnly // Visually driven by the div click and isSelected prop
                                    onClick={(e) => e.stopPropagation()} // Prevent label click from double-toggling if div also toggles
                                    className="form-checkbox h-5 w-5 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-offset-0 dark:focus:ring-sky-600 mr-3 pointer-events-none" // Pointer events none as div is the main target
                                />
                                <span className="font-medium truncate group-hover:text-clip">{country.name}</span>
                            </label>
                            {/* Optionally show code, could be on hover or if space allows */}
                            {/* <span className={`text-xs ml-2 ${isSelected ? 'text-sky-100' : 'text-gray-400 dark:text-slate-400'}`}>({country.code})</span> */}
                        </div>
                    );
                })}
            </div>

            {selectedCountryCodes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 px-3 pb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedCountryCodes.length} selected: {selectedCountryCodes.join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
};