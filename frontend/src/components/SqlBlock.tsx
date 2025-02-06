import { Button } from './Button';

interface SqlBlockProps {
    sql: string;
    setSql: (sql: string) => void;
    handleSubmit: (e: React.FormEvent, isSqlQuery: boolean) => Promise<void>;
}

export const SqlBlock = ({ sql, setSql, handleSubmit }: SqlBlockProps) => {
    return (
        <div>
            {sql && (
                <section className="mt-8 max-w-5xl mx-auto">
                    <div className="bg-gray-800 rounded-xl shadow p-4">
                        <p className="text-xl font-medium mb-4 text-white">Generated SQL</p>
                        <pre
                            contentEditable
                            suppressContentEditableWarning
                            className="overflow-x-auto text-sm text-gray-200 whitespace-pre-wrap break-words outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1 cursor-text hover:bg-gray-700/50 transition-colors"
                            onBlur={(e) => setSql(e.currentTarget.textContent || '')}
                        >
                            {sql}
                        </pre>
                        <div className="mt-4 flex gap-2">
                            <Button variant="secondary" size="sm" className="rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium" onClick={() => navigator.clipboard.writeText(sql)}>
                                {/* <img src="src/assets/copy_icon.svg" alt="Copy SQL" className="w-4 h-4" /> */}
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="white" stroke="white" strokeWidth="1" fill-rule="evenodd" clip-rule="evenodd">
                                    </path>
                                </svg>
                            </Button>
                            <Button variant="secondary" size="sm" className="rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium" onClick={(e) => handleSubmit(e, true)}>
                                Run SQL
                            </Button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default SqlBlock;