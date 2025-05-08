import React from 'react';
import { CountrySelector } from '../components/selectors/CountrySelector'; 
import { ChapterSelector } from '../components/selectors/ChapterSelector';

export const FilterDevelopmentPage: React.FC = () => {
    return (
        <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
            <header className="mb-8 pb-4 border-b dark:border-slate-700">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Filter Components Test Page</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Develop and test filter components here (simulates filter drawer content).
                </p>
            </header>

            {/* Layout mimicking image_c49fbf.png */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Column for Chapter -> Subchapter -> Variable */}
                <div className="flex-grow lg:w-2/3 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Chapters</h2>
                        <ChapterSelector />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Subchapters</h2>
                        <div className="p-4 border border-dashed rounded-lg dark:border-slate-700 h-full">
                            <p className="text-center text-gray-400 dark:text-slate-500">[Subchapter Selector Placeholder]</p>
                        </div>
                        {/* <SubchapterSelector /> */}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Variables</h2>
                        <div className="p-4 border border-dashed rounded-lg dark:border-slate-700 h-40 mb-4">
                            <p className="text-center text-gray-400 dark:text-slate-500">[Variable Discovery List Placeholder]</p>
                        </div>
                        <div className="p-4 border border-dashed rounded-lg dark:border-slate-700 h-40">
                            <p className="text-center text-gray-400 dark:text-slate-500">[Selected Variables Display Placeholder]</p>
                        </div>
                        {/* <VariableSelector /> */}
                    </div>
                </div>

                {/* Column/Area for Countries and Years */}
                <div className="flex-grow lg:w-1/3 flex flex-col gap-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Countries</h2>
                        <CountrySelector />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Years</h2>
                        <div className="p-4 border border-dashed rounded-lg dark:border-slate-700 h-full">
                            <p className="text-center text-gray-400 dark:text-slate-500">[Years Selector Placeholder]</p>
                        </div>
                        {/* <YearSelector /> */}
                    </div>
                </div>

            </div>

            {/* Placeholder for Apply/Reset buttons */}
            <footer className="mt-8 pt-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                <button className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded">Reset All</button>
                <button className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded">Apply Filters</button>
            </footer>
        </div>
    );
};