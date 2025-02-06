interface ResultsProps {
    results: any[];
}

export function Results({ results }: ResultsProps) {
    return (
        results.length > 0 && (
            <section className="mt-8 max-w-5xl mx-auto">
                <h2 className="text-3xl font-semibold mb-4 ml-2">Results</h2>
                <div className="overflow-hidden rounded-xl shadow-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {Object.keys(results[0]).map((key) => (
                                        <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {Object.values(row).map((value, j) => (
                                            <td key={j} className="px-4 py-2 text-sm text-gray-900">
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