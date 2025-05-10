import { useThemeStore } from './store/themeStore';
import {FilterDevelopmentPage} from "./pages/FilterDevelopmentPage.tsx";

function App() {
    const { theme } = useThemeStore(); // Keep accessing theme state
    const themeClass = theme === 'dark' ? 'dark' : '';

    return (
        <div className={themeClass}> {/* Apply theme class for consistent styling */}
            <FilterDevelopmentPage />
        </div>
    );
}

export default App;