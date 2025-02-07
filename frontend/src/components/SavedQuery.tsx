interface SavedQueryProps {
    naturalQuery: string;
    sqlQuery: string;
    onSelect: () => void;
  }
  
  export function SavedQuery({ naturalQuery, sqlQuery, onSelect }: SavedQueryProps) {
    return (
      <div 
        onClick={onSelect}
        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors mb-4"
      >
        <p className="text-sm text-gray-900 font-medium mb-2">{naturalQuery}</p>
        <p className="text-xs text-gray-500 font-mono truncate">{sqlQuery}</p>
      </div>
    );
  }

export default SavedQuery;