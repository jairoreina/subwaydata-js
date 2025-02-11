import { useState, useEffect } from 'react';
import { Button } from './Button';

interface SavedQuery {
  id: string;
  title: string;
  sql: string;
}

interface SavedQueriesCardProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuery: (sql: string) => void;
}

export function SavedQueriesCard({ isOpen, onClose, onLoadQuery }: SavedQueriesCardProps) {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<SavedQuery | null>(null);

  useEffect(() => {
    const loadQueries = () => {
      const queries = localStorage.getItem('savedQueries');
      if (queries) {
        setSavedQueries(JSON.parse(queries));
      }
    };

    loadQueries();
    window.addEventListener('savedQueriesUpdated', loadQueries);
    return () => window.removeEventListener('savedQueriesUpdated', loadQueries);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleDelete = (id: string) => {
    const updatedQueries = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updatedQueries);
    localStorage.setItem('savedQueries', JSON.stringify(updatedQueries));
    if (selectedQuery?.id === id) setSelectedQuery(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose} >
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Saved Queries</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {savedQueries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No saved queries yet</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {savedQueries.map(query => (
                <div
                  key={query.id}
                  onClick={() => setSelectedQuery(query)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedQuery?.id === query.id 
                      ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]' 
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{query.title}</h3>
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
                  </div>
                  <pre className="bg-gray-50 p-2 rounded text-sm text-gray-700 overflow-x-auto">
                    {query.sql}
                  </pre>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={onClose}
                variant="secondary"
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedQuery) {
                    onLoadQuery(selectedQuery.sql);
                    onClose();
                  }
                }}
                disabled={!selectedQuery}
                variant="primary"
                className="rounded-xl bg-gray-800"
              >
                Load Selected Query
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}