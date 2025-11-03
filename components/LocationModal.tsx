import React, { useState, useEffect } from 'react';
import type { Location } from '../types';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (location: Omit<Location, 'id'> | Location) => void;
    locationToEdit?: Location;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSave, locationToEdit }) => {
    const getInitialState = () => ({
        name: '',
        address: '',
        room: '',
        capacity: 10,
        ...locationToEdit,
    });

    const [location, setLocation] = useState(getInitialState());

    useEffect(() => {
        setLocation(getInitialState());
    }, [locationToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLocation(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(location);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                    {locationToEdit ? 'Ort bearbeiten' : 'Neuen Ort erstellen'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name des Ortes</label>
                        <input type="text" name="name" value={location.name} onChange={handleChange} required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                        <input type="text" name="address" value={location.address} onChange={handleChange} required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Raum</label>
                            <input type="text" name="room" value={location.room} onChange={handleChange} required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kapazität</label>
                            <input type="number" name="capacity" value={location.capacity} onChange={handleChange} min="1" required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
                        </div>
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

export default LocationModal;
