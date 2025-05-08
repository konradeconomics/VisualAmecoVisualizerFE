import { useThemeStore } from './store/themeStore';
import {CountrySelector} from "./components/selectors/CountrySelector.tsx";

function App() {
    const { theme } = useThemeStore();

    const themeClass = theme === 'dark' ? 'dark' : '';

    return (
        <div className={`... ${themeClass} ...`}>
            <header className="mb-10">
                {/* ... title, theme toggle button ... */}
            </header>

            <div className="w-full md:w-1/3 p-4"> {/* Simulating a drawer section */}
                <CountrySelector />
            </div>

            <main className="w-full max-w-2xl mt-5">
            </main>
        </div>
    );
}

export default App;