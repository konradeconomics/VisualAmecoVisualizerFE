import { CountryList } from './components/CountryList';
import { useThemeStore } from './store/themeStore'; // Import our new theme store

function App() {
    const { theme, toggleTheme } = useThemeStore(); // Get theme state and action
    
    const themeClass = theme === 'dark' ? 'dark' : '';

    return (
        <div className={`min-h-screen flex flex-col items-center pt-10 p-4 text-center transition-colors duration-300 ${themeClass} bg-sky-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200`}>
            <header className="mb-10">
                <h1 className="text-5xl font-extrabold text-sky-700 dark:text-sky-400">
                    VisualAmeco
                </h1>

                <button
                    onClick={toggleTheme}
                    className="mt-4 px-4 py-2 bg-indigo-500 dark:bg-indigo-700 text-white font-semibold rounded-md hover:bg-indigo-600 dark:hover:bg-indigo-800 transition-colors"
                >
                    Toggle Theme (Current: {theme})
                </button>
            </header>

            <main className="w-full max-w-2xl">
                <CountryList />
            </main>
        </div>
    );
}

export default App;