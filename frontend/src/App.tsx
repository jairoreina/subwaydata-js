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
            <img
              src="src/assets/subwaydata_logo.svg" 
              alt="MTA Data Explorer" 
              className="h-16"
            />
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
      </main>
    </div>
  );
}

export default App;