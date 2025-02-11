import { useState, useEffect } from 'react';
import { Button } from './Button';

interface SaveQueryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string) => void;
    sql: string;
}

export function SaveQueryModal({ isOpen, onClose, onSave, sql }: SaveQueryModalProps) {
    const [title, setTitle] = useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave(title);
        setTitle('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-semibold mb-4">Save Query</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="queryTitle" className="block text-sm font-medium text-gray-700 mb-2">
                            Query Title
                        </label>
                        <input
                            type="text"
                            id="queryTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter a title for your query"
                            required
                            autoComplete="off"
                            spellCheck="false"
                            aria-autocomplete="none"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Query
                        </label>
                        <pre className="bg-gray-100 p-4 rounded-xl overflow-x-auto">
                            <code>{sql}</code>
                        </pre>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="rounded-xl bg-gray-800"
                        >
                            Save Query
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SaveQueryModal;