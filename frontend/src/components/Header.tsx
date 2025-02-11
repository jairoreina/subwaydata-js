import { Link } from 'react-router-dom';
import logo from '../assets/subwaydata_logo.png';
import { Button } from './Button';

export function Header({ 
  setIsAboutOpen, 
  setIsSavedQueriesOpen,
  latestDate
}: { 
  setIsAboutOpen?: (isOpen: boolean) => void;
  setIsSavedQueriesOpen?: (isOpen: boolean) => void;
  latestDate: string;
}) {
  return (
    <header className="flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
        <Link to="/" className="text-black hover:text-gray-500 transition-colors text-lg mb-4 sm:mb-0">
          <img src={logo} alt="Subway Data Logo" className="h-16 sm:h-20" />
        </Link>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="bg-white border-2 border-gray-200 rounded-xl" 
            onClick={() => setIsSavedQueriesOpen?.(true)}
          >
            Saved Queries
          </Button>
          <Button 
            variant="secondary" 
            className="bg-white border-2 border-gray-200 rounded-xl" 
            onClick={() => setIsAboutOpen?.(true)}
          >
            About
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-4xl font-semibold text-left mb-1">Ask any question about NYC Subway Data.</p>
        <p className="text-xl font-normal text-left mb-1">Ridership data for every station, down to the hour.</p>
        <p className="text-sm font- text-left text-gray-500">Latest available data: {latestDate}</p>
        <p className="text-sm font- text-left text-gray-500">Coming soon: data starting from 2020 and graph generation!</p>
      </div>
    </header>
  );
}

export default Header;