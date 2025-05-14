import React, {useMemo, useState} from 'react';
import { useFetchCountries } from '../../hooks/useFetchCountries';
import { useFilterSelectionsStore} from "../../store/filterSelectionStore.ts";
import type { CountryDto } from '../../types/dto/country.dto';

export const CountrySelector: React.FC = () => {
    const { data: countries, isLoading, isError, error } = useFetchCountries();
    const selectedCountryCodes = useFilterSelectionsStore((state) => state.selectedCountryCodes);
    const toggleCountry = useFilterSelectionsStore((state) => state.toggleCountry);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCountryToggle = (countryCode: string) => {
        toggleCountry(countryCode);
    };

    const filteredCountries = useMemo(() => {
        if (!countries) return [];
        if (!searchTerm.trim()) return countries;
        return countries.filter((country) =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [countries, searchTerm]);

    const renderContent = () => {
        if (isLoading) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">Loading countries...</div>;
        if (isError) return <div className="p-3 text-sm text-center text-red-500">Error: {error?.message || 'Unknown error'}</div>;
        if (!countries || countries.length === 0) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">No countries available.</div>;
        if (filteredCountries.length === 0 && searchTerm) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">No countries match search.</div>;

        return filteredCountries.map((country: CountryDto) => {
            const isSelected = selectedCountryCodes.includes(country.code);
            return (
                <div
                    key={country.code}
                    onClick={() => handleCountryToggle(country.code)}
                    title={`${country.name} (${country.code})`}
                    className={`p-2.5 rounded-md cursor-pointer border flex items-center group justify-between text-sm transition-all duration-150 ease-in-out ${
                        isSelected
                            ? 'bg-sky-500 text-white border-sky-600 dark:bg-sky-600 dark:border-sky-700'
                            : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    <label htmlFor={`country-${country.code}`} className="flex items-center cursor-pointer w-full truncate">
                        <input type="checkbox" id={`country-${country.code}`} checked={isSelected} readOnly onClick={(e) => e.stopPropagation()} className="form-checkbox h-5 w-5 text-sky-600 rounded border-gray-300 dark:border-slate-500 mr-3 pointer-events-none"/>
                        <span className="font-medium truncate group-hover:text-clip">{country.name}</span>
                    </label>
                </div>
            );
        });
    };

    return (
        <div className="border rounded-lg shadow-sm flex flex-col bg-white dark:bg-slate-800 overflow-hidden dark:border-slate-700">
            <div className="p-3 shrink-0"> {/* Search bar area */}
                <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
            </div>
            <div className="flex-grow overflow-y-auto max-h-60 space-y-1 px-3 pb-3"> {/* LIST AREA */}
                {renderContent()}
            </div>
            {selectedCountryCodes.length > 0 && (
                <div className="p-2 border-t dark:border-slate-700 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {selectedCountryCodes.length} selected
                </div>
            )}
        </div>
    );
};