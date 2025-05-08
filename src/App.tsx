import { useTestStore } from './store/testStore'; // Import the store

function App() {
    const { message, setMessage } = useTestStore();

    return (
        <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-5xl font-extrabold text-sky-700 mb-6">
                VisualAmeco
            </h1>
            <p className="text-xl text-gray-800 mb-4">
                Tailwind CSS (v3) is now configured!
            </p>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-xl">
                <p className="text-2xl font-semibold text-indigo-600 mb-3">
                    Zustand Store Message:
                </p>
                <p className="text-lg text-gray-700 mb-4 p-2 border border-indigo-200 rounded">
                    "{message}"
                </p>
                <button
                    onClick={() => setMessage('Zustand is updated! ' + new Date().toLocaleTimeString())}
                    className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Update Zustand Message
                </button>
            </div>
        </div>
    );
}

export default App;