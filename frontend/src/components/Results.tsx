import { useState } from 'react';

interface ResultsProps {
    results: any[];
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

export function Results({ results }: ResultsProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const sortedResults = [...results].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        const aValue = a[key];
        const bValue = b[key];

        // Handle different types of values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Convert to strings for comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (direction === 'asc') {
            return aString.localeCompare(bString);
        }
        return bString.localeCompare(aString);
    });

    const handleSort = (key: string) => {
        setSortConfig((currentSort) => {
            if (currentSort?.key === key) {
                if (currentSort.direction === 'asc') {
                    return { key, direction: 'desc' };
                }
                return null;
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortIcon = (key: string) => {
        if (sortConfig?.key !== key) {
            return (
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        
        if (sortConfig.direction === 'asc') {
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            );
        }
        
        return (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    return (
        results.length > 0 && (
            <section className="mt-8 max-w-5xl mx-auto">
                <h2 className="text-3xl font-semibold mb-4 ml-2">Results</h2>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    {Object.keys(results[0]).map((key) => (
                                        <th 
                                            key={key} 
                                            onClick={() => handleSort(key)}
                                            className="group px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                {getSortIcon(key)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedResults.map((row, i) => (
                                    <tr 
                                        key={i} 
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        {Object.values(row).map((value, j) => (
                                            <td key={j} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                {value as React.ReactNode}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        )
    );
}

export default Results;