import { useState } from 'react';
import { Search } from './components/Search';
import { Results } from './components/Results';
import { SqlBlock } from './components/SqlBlock';
import { Button } from './components/Button';
import { AboutCard } from './components/AboutCard';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sql, setSql] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isSqlQuery = false) => {
    e.preventDefault();
    const queryToSend = isSqlQuery ? sql : query;
    if (!queryToSend.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: queryToSend, 
          is_sql_only: isSqlQuery 
        })
      });
      
      const data = await response.json();
      setResults(data.data);
      if (!isSqlQuery) {
        setSql(data.query);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-12">
            <a href="/">
            <img
              src="src/assets/subwaydata_logo.svg" 
              alt="MTA Data Explorer" 
              className="h-16"
            />
            </a>
            <Button
            className="ml-auto border border-gray-200 p-1 rounded-xl"
            variant="secondary" 
            size="md" 
            onClick={() => setIsAboutOpen(true)}
          >
            About
          </Button>
          </div>
          <p className="text-4xl font-semibold mb-2">
            Ask any question about MTA Subway data.
          </p>
          <p className="text-xl mb-8">
            Ridership data for every station, down to the hour.
          </p>
          
          <Search 
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />

          <Results results={results} />

          <SqlBlock
            sql={sql}
            setSql={setSql}
            handleSubmit={handleSubmit}
          />

        </div>

        <AboutCard 
          isOpen={isAboutOpen} 
          onClose={() => setIsAboutOpen(false)} 
        />


        <div className="relative mt-16 bg-gray-50 py-4">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
              <p className="text-sm text-gray-500 text-center mb-2">
                Made by <a href="https://jairoreina.com" className="underline">Jairo Reina</a>
              </p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-sm text-gray-500">
                Find me on:
              </p>
              <p className="text-sm text-gray-500 mx-2">
                <a href="https://github.com/jairoreina" className="underline">GitHub</a>
              </p>
              <p className="text-sm text-gray-500 mx-2">
                <a href="https://www.x.com/jreina9" className="underline">X/Twitter</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;