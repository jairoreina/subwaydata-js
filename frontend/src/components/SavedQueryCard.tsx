interface SavedQueryProps {
  title: string;
  sql: string;
  onSelect: () => void;
  onDelete: () => void;
}

export function SavedQueryCard({ title, sql, onSelect, onDelete }: SavedQueryProps) {
  return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
              <div className="flex gap-2">
                  <button
                      onClick={onSelect}
                      className="text-blue-600 hover:text-blue-800"
                      title="Load Query"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                  </button>
                  <button
                      onClick={onDelete}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Query"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                  </button>
              </div>
          </div>
          <pre className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 overflow-x-auto">
              {sql}
          </pre>
      </div>
  );
}

export default SavedQueryCard;