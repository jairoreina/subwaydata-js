import { useState, useEffect } from 'react';
import { Search } from './components/Search';
import { Results } from './components/Results';
import { SqlBlock } from './components/SqlBlock';
import { AboutCard } from './components/AboutCard';
import { ErrorMessage } from './components/ErrorMessage';
import { DataOverview } from './components/DataOverview';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SaveQueryModal } from './components/SaveQueryModal';
import { SavedQueriesCard } from './components/SavedQueryCard';


function App() {
  const [query, setQuery] = useState('');
  const [isNlLoading, setIsNlLoading] = useState(false);
  const [isSqlLoading, setIsSqlLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sql, setSql] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [error, setError] = useState<{ message: string; details?: any } | null>(null);
  const [isDataOverviewExpanded, setIsDataOverviewExpanded] = useState(false);
  const [shouldCenter, setShouldCenter] = useState(true);
  const [isSaveQueryModalOpen, setIsSaveQueryModalOpen] = useState(false);
  const [sqlToSave, setSqlToSave] = useState('');
  const [isSavedQueriesOpen, setIsSavedQueriesOpen] = useState(false);
  const [latestDate, setLatestDate] = useState('Loading...');

  useEffect(() => {
    const fetchLatestDate = async () => {
      const date = await getLatestDate();
      setLatestDate(date);
    };
    fetchLatestDate();
  }, []);

  const getLatestDate = async () => {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT TO_CHAR(MAX(transit_timestamp), \'FMMonth DD, YYYY "at" HH12AM\') AS formatted_timestamp FROM ridership',
        is_sql_only: true,
      }),
    });
    const data = await response.json();
    return data.data[0].formatted_timestamp;
  };


  const handleSubmit = async (e: React.FormEvent, isSqlQuery = false, directSql?: string) => {
    e.preventDefault();
    // Use directSql if provided (from saved queries), otherwise use state
    const queryToSend = isSqlQuery ? (directSql || sql) : query;
    if (!queryToSend.trim()) return;

    if (isSqlQuery) {
      setIsSqlLoading(true);
    } else {
      setIsNlLoading(true);
    }
    setError(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_LOCAL_BACKEND_URL;

    try {
      const response = await fetch(backendUrl + '/api/query', {
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
      if (isSqlQuery) {
        setIsSqlLoading(false);
      } else {
        setIsNlLoading(false);
      }
    }
  };

  const handleSaveQuery = (title: string) => {
    // Get existing queries from localStorage
    const existingQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    
    // Add new query with unique ID
    const newQuery = {
      id: crypto.randomUUID(),
      title,
      sql: sqlToSave
    };
    
    const newQueries = [newQuery, ...existingQueries];
    
    // Save back to localStorage
    localStorage.setItem('savedQueries', JSON.stringify(newQueries));
    // Dispatch event to notify sidebar
    window.dispatchEvent(new Event('savedQueriesUpdated'));
  };

  const handleLoadSavedQuery = (sql: string) => {
    setSql(sql);
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(syntheticEvent, true, sql);
  };

  return (
    <div className="flex mx-auto min-h-screen">
      <div className="flex mx-auto flex-col bg-white overflow-auto p-8 pb-2 min-h-screen">
        <div className={`flex-grow transition-all duration-500 ease-in-out max-w-4xl ${shouldCenter && !results.length && !error ? 'sm:mt-[20vh]' : 'mt-0'}`}>
          <Header 
            setIsAboutOpen={setIsAboutOpen} 
            setIsSavedQueriesOpen={setIsSavedQueriesOpen} 
            latestDate={latestDate} 
          />
          <div className={`${shouldCenter && !results.length && !error ? 'sm:my-[1vh]' : 'my-4'}`}>
            <Search query={query} setQuery={setQuery} isLoading={isNlLoading} onSubmit={handleSubmit} />
          </div>

          <DataOverview isExpanded={isDataOverviewExpanded} setIsExpanded={setIsDataOverviewExpanded} />

          {error ? (
            <ErrorMessage message={error.message} details={error.details} />
          ) : (
            <>
              {results.length > 0 && <Results results={results} />}
              {sql && (
                <SqlBlock 
                  sql={sql} 
                  setSql={setSql} 
                  handleSubmit={handleSubmit}
                  onSaveClick={(currentSql) => {
                    setSqlToSave(currentSql);
                    setIsSaveQueryModalOpen(true);
                  }}
                  isLoading={isSqlLoading}
                />
              )}
            </>
          )}
        </div>
        <Footer />
      </div>

      <AboutCard isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <SavedQueriesCard 
        isOpen={isSavedQueriesOpen} 
        onClose={() => setIsSavedQueriesOpen(false)}
        onLoadQuery={handleLoadSavedQuery}
      />
      <SaveQueryModal
        isOpen={isSaveQueryModalOpen}
        onClose={() => setIsSaveQueryModalOpen(false)}
        onSave={handleSaveQuery}
        sql={sqlToSave}
      />
    </div>
  );
}

export default App;
