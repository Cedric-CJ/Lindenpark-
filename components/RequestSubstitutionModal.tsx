import React, { useState } from 'react';
import type { User } from '../types';

interface RequestSubstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (substituteUserId: string, comment: string) => void;
    teamUsers: User[];
}

const RequestSubstitutionModal: React.FC<RequestSubstitutionModalProps> = ({ isOpen, onClose, onSubmit, teamUsers }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>(teamUsers[0]?.id || '');
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) {
            alert("Bitte wählen Sie eine Vertretung aus.");
            return;
        }
        onSubmit(selectedUserId, comment);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Vertretung vorschlagen</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="substitute" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kollege/Kollegin als Vertretung
                            </label>
                            <select 
                                id="substitute"
                                value={selectedUserId} 
                                onChange={e => setSelectedUserId(e.target.value)} 
                                className="mt-1 w-full p-2 border dark:border-gray-600 rounded bg-transparent dark:text-white dark:[color-scheme:dark]"
                            >
                                {teamUsers.length > 0 ? teamUsers.map(user => (
                                    <option key={user.id} value={user.id} className="text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                        {user.firstName} {user.lastName}
                                    </option>
                                )) : (
                                    <option value="" disabled className="text-gray-800">Keine Kollegen im Team verfügbar</option>
                                )}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kommentar (optional)
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Grund für die Vertretung..."
                                rows={3}
                                className="mt-1 w-full p-2 border dark:border-gray-600 rounded bg-transparent dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded" disabled={!selectedUserId}>Vorschlag senden</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestSubstitutionModal;
