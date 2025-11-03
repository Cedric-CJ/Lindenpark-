import React, { useState } from 'react';
import type { Location, User } from '../types';
import { RoleType } from '../constants';
import LocationModal from '../components/LocationModal';

interface LocationsProps {
    locations: Location[];
    currentUser: User;
    onAddLocation: (location: Omit<Location, 'id'>) => void;
    onUpdateLocation: (location: Location) => void;
    onDeleteLocation: (locationId: string) => void;
}

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);


const Locations: React.FC<LocationsProps> = ({ locations, currentUser, onAddLocation, onUpdateLocation, onDeleteLocation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<Location | undefined>(undefined);

    const isAdmin = currentUser.role === RoleType.ADMIN;

    const openCreateModal = () => {
        setLocationToEdit(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (location: Location) => {
        setLocationToEdit(location);
        setIsModalOpen(true);
    };
    
    const handleSave = (locationData: Omit<Location, 'id'> | Location) => {
        if ('id' in locationData) {
            onUpdateLocation(locationData);
        } else {
            onAddLocation(locationData);
        }
        setIsModalOpen(false);
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Orte & Veranstaltungen</h2>
                    {isAdmin && (
                        <button 
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                        >
                            <PlusIcon />
                            Neuen Ort anlegen
                        </button>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Verwaltete Orte</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raum</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adresse</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kapazität</th>
                                    {isAdmin && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktionen</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {locations.map(location => (
                                    <tr key={location.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{location.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{location.room}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{location.address}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{location.capacity}</td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(location)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Bearbeiten</button>
                                                <button onClick={() => onDeleteLocation(location.id)} className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Löschen</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <LocationModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    locationToEdit={locationToEdit}
                />
            )}
        </>
    );
};

export default Locations;
