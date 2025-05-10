import React, { useState } from 'react';
import { useThemeStore } from './store/themeStore';
import { IndicatorDataTable } from './components/display/IndicatorDataTable';
import { IndicatorSimpleChart } from './components/charts/IndicatorSimpleChart';
import { FilterDrawer } from './components/layout/FilterDrawer'; // Import the new FilterDrawer

// import { SlidersHorizontal } from 'lucide-react'; // Optional icon

export const App: React.FC = () => {
    const { theme } = useThemeStore();
    const themeClass = theme === 'dark' ? 'dark' : '';
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const toggleFilterDrawer = () => setIsFilterDrawerOpen(!isFilterDrawerOpen);
    const closeFilterDrawer = () => setIsFilterDrawerOpen(false);


    return (
        <div className={`min-h-screen flex flex-col bg-gray-100 dark:bg-slate-900 ${themeClass}`}>
            <header className="p-4 bg-white dark:bg-slate-800 shadow flex justify-between items-center shrink-0 sticky top-0 z-20">
                <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400">
                    Ameco Visualizer
                </h1>
                <button
                    onClick={toggleFilterDrawer}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    title="Open Filters"
                >
                    {/* <SlidersHorizontal size={24} className="text-gray-700 dark:text-gray-300" /> */}
                    <span className="text-gray-700 dark:text-gray-300">Filters</span>
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden"> {/* Main content + drawer container */}

                {/* Filter Drawer (Off-canvas panel) */}
                <div
                    className={`
            fixed inset-y-0 left-0 z-30 w-full sm:w-96 md:w-[450px] lg:w-[600px] xl:w-[750px]
            bg-white dark:bg-slate-800 shadow-xl
            transform transition-transform duration-300 ease-in-out
            ${isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col  // Added for h-full on FilterDrawer content
          `}
                >
                    {/* Render FilterDrawer only when it's supposed to be open to mount/unmount content or control via CSS */}
                    {isFilterDrawerOpen && <FilterDrawer onCloseDrawer={closeFilterDrawer} />}
                </div>

                {/* Overlay when drawer is open (for mobile/tablet) */}
                {isFilterDrawerOpen && (
                    <div
                        onClick={closeFilterDrawer} // Close drawer on overlay click
                        className="fixed inset-0 z-20 bg-black/50 sm:hidden"
                    ></div>
                )}

                <main className={`flex-1 p-4 md:p-6 overflow-y-auto transition-opacity duration-300 ${isFilterDrawerOpen && 'sm:opacity-50'}`}>
                    {/* Add sm:opacity-50 to dim main content when drawer is open on small screens if overlay is not full screen */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Indicator Data Table</h2>
                            <IndicatorDataTable />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Indicator Chart</h2>
                            <IndicatorSimpleChart />
                        </div>
                        <div className="mt-8 p-4 border border-dashed rounded-lg dark:border-slate-700 min-h-[100px] flex items-center justify-center">
                            <p className="text-gray-400 dark:text-slate-500">[Graph Logic Controls Placeholder - Future]</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;