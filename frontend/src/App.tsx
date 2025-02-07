import { useState } from 'react';
import { Search } from './components/Search';
import { Results } from './components/Results';
import { SqlBlock } from './components/SqlBlock';
import { AboutCard } from './components/AboutCard';
import { ErrorMessage } from './components/ErrorMessage';
import { DataOverview } from './components/DataOverview';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sql, setSql] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [error, setError] = useState<{ message: string; details?: any } | null>(null);
  const [isDataOverviewExpanded, setIsDataOverviewExpanded] = useState(false);
  const [shouldCenter, setShouldCenter] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const handleSubmit = async (e: React.FormEvent, isSqlQuery = false) => {
    e.preventDefault();
    const queryToSend = isSqlQuery ? sql : query;
    if (!queryToSend.trim()) return;

    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToSend,
          is_sql_only: isSqlQuery,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'An unexpected error occurred');
      }
      setShouldCenter(false);
      setResults(data.data);
      if (!isSqlQuery) {
        setSql(data.query);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError({
        message: error.message || 'An unexpected error occurred',
        details: error.details
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex mx-auto min-h-screen">

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="flex mx-auto flex-col bg-white overflow-auto w-1/2 p-8 pb-2 min-h-screen">
        <div className={`flex-grow transition-all duration-500 ease-in-out ${shouldCenter && !results.length && !error ? 'mt-[20vh]' : 'mt-0'}`}>
          <Header setIsAboutOpen={setIsAboutOpen} />
          <AboutCard isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
          
          {/* Search component with its own margin to position it at the middle */}
          <div className={`${shouldCenter && !results.length && !error ? 'my-[1vh]' : 'my-4'}`}>
            <Search query={query} setQuery={setQuery} isLoading={isLoading} onSubmit={handleSubmit} />
          </div>

          <DataOverview isExpanded={isDataOverviewExpanded} setIsExpanded={setIsDataOverviewExpanded} />

          {error ? (
            <ErrorMessage message={error.message} details={error.details} />
          ) : (
            <>
              {results.length > 0 && <Results results={results} />}
              {sql && <SqlBlock sql={sql} setSql={setSql} handleSubmit={handleSubmit} />}
            </>
          )}
        </div>
        <Footer />
      </div>

      {/* <div className="flex-1 min-h-screen bg-white border-l border-gray-200 shadow-sm">
        <div className="m-4 bg-white rounded-lg shadow-sm">
        </div>
      </div> */}
      
    </div>
  );
}

export default App;
