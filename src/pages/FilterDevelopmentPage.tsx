import React from 'react';
import { ChapterSelector } from '../components/selectors/ChapterSelector';
import { SubchapterSelector } from '../components/selectors/SubchapterSelector';
import {VariableSelector} from "../components/selectors/VariableSelector.tsx";
import { CountrySelector } from '../components/selectors/CountrySelector';
import { YearSelector } from '../components/selectors/YearSelector';

export const FilterDevelopmentPage: React.FC = () => {
    return (
        // 1. Outermost container: min-h-screen allows it to grow. NO overflow-hidden.
        <div className="min-h-screen flex flex-col p-4 md:p-6 bg-gray-100 dark:bg-slate-900">

            {/* 2. Header: Fixed height (content-based), does not shrink */}
            <header className="mb-4 pb-4 border-b dark:border-slate-700 shrink-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Filter Components</h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Interactive Data Selection Panel
                </p>
            </header>

            {/* (Optional) Current Selections Display: if you re-add it */}
            {/* <div className="mb-4 shrink-0"><CurrentSelectionsDisplay /></div> */}

            {/* 3. Main Filter Columns Area: Takes remaining vertical space.
                   NO overflow-hidden here either. lg:items-start is good.
            */}
            <div className="flex-grow flex flex-col lg:flex-row gap-4 md:gap-6 lg:items-start">

                {/* Column 1: Chapter -> Subchapter -> Variable */}
                <div className="lg:w-3/5 flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Chapters</h2>
                        <ChapterSelector />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Subchapters</h2>
                        <SubchapterSelector />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Variables</h2>
                        <VariableSelector />
                    </div>
                </div>

                {/* Column 2: Countries and Years */}
                <div className="lg:w-2/5 flex flex-col gap-4 md:gap-6">
                    <div className="flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 shrink-0">Countries</h2>
                        <CountrySelector />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 shrink-0">Years</h2>
                        <YearSelector />
                    </div>
                </div>
            </div>

            {/* 4. Footer: Pushed to bottom by flex-grow of main area, does not shrink */}
            <footer className="mt-auto pt-4 border-t dark:border-slate-700 flex justify-end space-x-2 shrink-0">
                <button className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded">Reset All</button>
                <button className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded">Apply Filters</button>
            </footer>
        </div>
    );
};
