interface DataOverviewProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
} 

export function DataOverview({ isExpanded, setIsExpanded }: DataOverviewProps) {
  return (
    <div className="mt-2">  
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between text-left mb-2"
      >
        <h2 className="ml-1 hover:underline text-md font-normal text-gray-900">
          Available Data Overview
        </h2>
        <svg
          className={`mx-2 w-5 h-5 text-gray-500 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`transition-all duration-400 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="bg-white max-w-4xl rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">Time Range</h3>
              <p className="text-sm text-gray-700">
                • From February 2022 to present (2-week delay)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">Query Parameters</h3>
              <p className="text-sm text-gray-700">
                • Stations, routes, and boroughs
                <br />
                • Ridership data
                <br />
                • Date and time
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">Fare Types</h3>
              <p className="text-sm text-gray-700">
                • MetroCard: Full fare, Fair Fare, Senior/Disability, Student
                <br />
                • OMNY: Full fare, Fair Fare, Senior/Disability
                <br />
                • Unlimited: 7-day, 30-day passes
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">Example Questions</h3>
              <p className="text-sm text-gray-700">
                • "What was the busiest station in Brooklyn during January 2024?"
                <br />
                • "OMNY usage at Union Square from 10am to 11am on Jan 1, 2023"
                <br />
                • "Compare student ridership at stations on the L train"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataOverview;