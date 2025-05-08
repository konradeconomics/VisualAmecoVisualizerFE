import { CountryList } from './components/ui/CountryList'; // Import the CountryList

function App() {
    // const { message, setMessage } = useTestStore(); // Zustand example

    return (
        <div className="min-h-screen bg-sky-100 flex flex-col items-center pt-10 p-4 text-center">
            <header className="mb-10">
                <h1 className="text-5xl font-extrabold text-sky-700">
                    VisualAmeco
                </h1>
            </header>

            <main className="w-full max-w-2xl">
                <CountryList /> {/* Add the CountryList component here */}
            </main>

            {/* Example of keeping the Zustand store (optional)
      <div className="mt-10 p-6 bg-white rounded-lg shadow-xl">
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
      */}
        </div>
    );
}

export default App;