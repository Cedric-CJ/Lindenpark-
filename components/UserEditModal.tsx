import React, { useState } from 'react';
import type { User } from '../types';
import { RoleType } from '../constants';

interface UserEditModalProps {
    user: User;
    currentUser: User;
    onClose: () => void;
    onSave: (user: User) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, currentUser, onClose, onSave }) => {
    const [editedUser, setEditedUser] = useState<User>(user);

    const canEdit = 
        currentUser.role === RoleType.ADMIN || 
        currentUser.id === user.id ||
        (currentUser.role === RoleType.TEAM_LEAD && currentUser.teamId === user.teamId);
        
    const canEditAllFields = currentUser.role === RoleType.ADMIN;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedUser({
            ...editedUser,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedUser);
    };
    
    if (!canEdit) {
        // A non-privileged user clicked on another user they can't edit. Show read-only view.
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                     <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Profil von {user.firstName} {user.lastName}</h2>
                     <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Telefon:</strong> {user.phone}</p>
                        <p><strong>Adresse:</strong> {user.address}</p>
                        <p><strong>Geburtstag:</strong> {new Date(user.birthdate).toLocaleDateString('de-DE')}</p>
                     </div>
                     <div className="mt-6 flex justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded">Schließen</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Profil bearbeiten</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vorname</label>
                            <input type="text" name="firstName" value={editedUser.firstName} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" disabled={!canEditAllFields} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nachname</label>
                            <input type="text" name="lastName" value={editedUser.lastName} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" disabled={!canEditAllFields} />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" name="email" value={editedUser.email} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                        <input type="tel" name="phone" value={editedUser.phone} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                        <input type="text" name="address" value={editedUser.address} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Geburtstag</label>
                        <input type="date" name="birthdate" value={editedUser.birthdate} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]" disabled={!canEditAllFields} />
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;
