import { useEffect, useState } from 'react';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  setSql: (sql: string) => void;
  handleSubmit: (e: React.FormEvent, isSqlQuery?: boolean, sql?: string) => Promise<void>;
}

interface SavedQuery {
  id: string;
  title: string;
  sql: string;
}

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, setSql, handleSubmit }: SidebarProps) {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

  useEffect(() => {
    // Load initial queries
    const loadQueries = () => {
      const queries = localStorage.getItem('savedQueries');
      if (queries) {
        setSavedQueries(JSON.parse(queries));
      }
    };

    loadQueries();

    // Listen for changes
    window.addEventListener('savedQueriesUpdated', loadQueries);

    // Cleanup listener
    return () => {
      window.removeEventListener('savedQueriesUpdated', loadQueries);
    };
  }, []);

  const handleSelect = (query: SavedQuery) => {
    // First update the SQL in the UI
    setSql(query.sql);
    
    // Create synthetic event and pass the SQL directly through handleSubmit
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    // Pass the SQL directly from the saved query
    handleSubmit(syntheticEvent, true, query.sql);
  };

  const handleDelete = (id: string) => {
    const updatedQueries = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updatedQueries);
    localStorage.setItem('savedQueries', JSON.stringify(updatedQueries));
  };

  return (
    <div
      className={`bg-gray-50 min-h-screen border-r border-gray-300 transition-all duration-500
        shadow-[inset_-1px_0_5px_rgba(0,0,0,0.1)] ${isSidebarOpen ? 'w-96' : 'w-20'} 
        flex flex-col items-start relative`}
    >
      {/* Toggle button */}
      <div className="absolute top-3.5 bottom-4 transition-all duration-500" style={{ right: isSidebarOpen ? '1rem' : '1.3rem' }}>
        <Tooltip text={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"} position="right">
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-9 h-9 flex items-center justify-center transition-all duration-500
              bg-gray-400 hover:bg-gray-500 border border-gray-300 rounded-xl"
          >
            <span className="transition-transform duration-500">
              {isSidebarOpen ? '←' : '→'}
            </span>
          </Button>
        </Tooltip>
      </div>

      {/* {!isSidebarOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-gray-500 text-lg">
          {savedQueries.length} Saved {savedQueries.length === 1 ? 'Query' : 'Queries'}
        </div>
      )} */}

      {isSidebarOpen && (
        <div className="w-full p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Saved Queries</h2>
          {savedQueries.length === 0 ? (
            <p className="text-gray-500 text-center">No saved queries yet</p>
          ) : (
            savedQueries.map(query => (
              <div
                key={query.id}
                className="bg-white rounded-xl border border-gray-300 p-3 hover:border-gray-400 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{query.title}</h3>
                  <div className="flex gap-2">
                    <Tooltip text="Load Query" position="top">
                      <button
                        onClick={() => handleSelect(query)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </button>
                    </Tooltip>
                    <Tooltip text="Delete Query" position="top">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(query.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <pre className="bg-gray-50 p-2 rounded text-sm text-gray-700 overflow-x-auto">
                  {query.sql}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
