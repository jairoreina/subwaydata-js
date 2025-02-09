import { Link } from 'react-router-dom';
import logo from '../assets/subwaydata_logo.svg';
import { Button } from './Button';

export function Header({ setIsAboutOpen }: { setIsAboutOpen?: (isAboutOpen: boolean) => void }) {
  return (
    <header className="flex flex-col">
        <div className="flex items-center justify-between mb-10">
            <Link to="/" className="text-black hover:text-gray-500 transition-colors text-lg">
                <img src={logo} alt="Subway Data Logo" className="h-16" />
            </Link>
            <Button variant="secondary" className="bg-white border-2 border-gray-200 rounded-xl" onClick={() => setIsAboutOpen?.(true)}>
                About
            </Button>
        </div>
        <div className="flex flex-col">
            <p className="text-4xl font-semibold text-left mb-1">Ask any question about MTA Subway Data.</p>
            <p className="text-xl font-normal text-left">Ridership data for every station, down to the hour.</p>
        </div>
    </header>
  );
}

export default Header;