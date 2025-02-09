import searchIcon from '../assets/search_icon.svg';

interface SearchProps {
    query: string;
    setQuery: (query: string) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent, isSqlQuery?: boolean) => Promise<void>;
  }
  
  export function Search({ query, setQuery, isLoading, onSubmit }: SearchProps) {
    return (
      <section className="max-w-4xl mt-10">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: 'What was the busiest station in Queens during January 2024?'"
              className="w-full p-4 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src={searchIcon} alt="Search" className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="ml-1 text-sm text-gray-600">
            For better results, if your query mentions a station, follow the station name with at least one train line that services that station.
          </p>
          <i className="ml-1 text-sm text-gray-600">
            Example: 'What day in 2023 did Bedford Ave (L) have the most ridership?'
          </i>
        </form>
      </section>
    );
  }
  
  export default Search;