import subwaydataLogo from '../assets/subwaydata_logo.png';
import { useEffect } from 'react';

interface AboutCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutCard({ isOpen, onClose }: AboutCardProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white shadow-lg max-w-2xl w-full p-6 my-8 relative max-h-[80vh] sm:max-h-[90vh] overflow-y-auto rounded-xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img src={subwaydataLogo} alt="MTA Logo" className="h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-4">About NYC Subway Data Explorer</h2>
        <div className="prose">
            
            <h3 className="text-lg font-semibold">How to use the Data Explorer</h3>
            <p>Enter any natural language query or question in the Data Explorer search bar. If your query includes a station name, make sure to mention at least one train line that services that station (example: 86th st (1)). This greatly improves the querying as many stations have the same name, so specifying which one you are referencing is important.</p>
            <br />
            <h3 className="text-lg font-semibold">Why the Data Explorer?</h3>
            <p>The MTA publishes great subway usage data, however, there wasn't an easy way to query these data without downloading the large history file yourself or using SQL/SOQL with their API directly. With the Data Explorer, users can easily query and visualize the data. </p>
            <br />
            <h3 className="text-lg font-semibold">What data and time span are available?</h3>
            <p>NYC Subway data are sourced from the MTA and includes hourly ridership data for every station since February 2022 and are published with a two week lag. </p>
            <p>Not only is there general ridership data, but also more granular detail on fare types. <br /> <br /> These fare types are:</p>
            <ul className="list-disc pl-5">
                <li className="ml-4">Metrocard: Fair-fare, student, senior & disability, full fare, unlimited 7-day, unlimited 30-day, and other.</li>
                <li className="ml-4">OMNY: Full fare, fair-fare, senior & disability, and other.</li>
            </ul>
            <br />
            <h3 className="text-lg font-semibold">Is this project or are you in any way associated with the MTA?</h3>
            <p>No. I just like trains a lot and thought this data is really cool to work with. I hope other people can enjoy this or find it useful as well. You can find more information about these data at the <a className="text-blue-700 underline" href="https://data.ny.gov/Transportation/MTA-Subway-Hourly-Ridership-Beginning-February-202/wujg-7c2s/about_data">official NYS open data platform.</a></p>
            <br />
        </div>
      </div>
    </div>
  )
}