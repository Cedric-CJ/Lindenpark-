import React, { useState } from 'react';

interface RequestVacationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (startDate: Date, endDate: Date, comment: string) => void;
}

const RequestVacationModal: React.FC<RequestVacationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            alert('Das Enddatum muss nach dem Startdatum liegen.');
            return;
        }
        onSubmit(start, end, comment);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Urlaub beantragen</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Startdatum</label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                                className="mt-1 w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enddatum</label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                required
                                className="mt-1 w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>
                    <div>
                         <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kommentar (optional)
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Zusätzliche Informationen..."
                            rows={3}
                            className="mt-1 w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded">Antrag senden</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestVacationModal;
