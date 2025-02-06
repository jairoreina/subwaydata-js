import { Link } from 'react-router-dom';
import logo from '../assets/subwaydata_logo.svg';

export function Header() {
  return (
    <header className="bg-white py-6">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Subway Data Logo" 
              className="h-14 mr-6"
            />
          </Link>
        </div>
      </div>
    </header>
  );
} 