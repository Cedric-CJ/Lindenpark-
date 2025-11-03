import React, { useState } from 'react';
import type { Shift, Team, Location, Qualification, ShiftRequirement } from '../types';
import { ShiftStatus } from '../constants';

interface NewShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddShift: (shift: Omit<Shift, 'id'>) => void;
    teams: Team[];
    locations: Location[];
    qualifications: Qualification[];
}

const NewShiftModal: React.FC<NewShiftModalProps> = ({ isOpen, onClose, onAddShift, teams, locations, qualifications }) => {
    const [type, setType] = useState('');
    const [teamId, setTeamId] = useState(teams[0]?.id || '');
    const [locationId, setLocationId] = useState(locations[0]?.id || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('12:00');
    const [requirements, setRequirements] = useState<ShiftRequirement[]>([]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const startsAt = new Date(`${date}T${startTime}`);
        const endsAt = new Date(`${date}T${endTime}`);
        
        if (startsAt >= endsAt) {
            alert("Die Endzeit muss nach der Startzeit liegen.");
            return;
        }

        const newShift: Omit<Shift, 'id'> = {
            type,
            teamId,
            locationId,
            startsAt,
            endsAt,
            required: requirements,
            assignments: [],
            status: ShiftStatus.PLANNED,
            notes: ''
        };
        onAddShift(newShift);
        onClose();
        // Reset form
        setType('');
        setRequirements([]);
    };
    
    const handleReqChange = (index: number, field: keyof ShiftRequirement, value: string) => {
      const newReqs = [...requirements];
      if (field === 'count') {
        newReqs[index] = {...newReqs[index], count: parseInt(value, 10) || 1};
      } else {
        newReqs[index] = {...newReqs[index], qualificationId: value};
      }
      setRequirements(newReqs);
    };

    const addRequirement = () => {
      if(qualifications.length > 0) {
        setRequirements([...requirements, { qualificationId: qualifications[0].id, count: 1 }]);
      }
    };
    
    const removeRequirement = (index: number) => {
      setRequirements(requirements.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Neuen Einsatz erstellen</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Einsatzart" value={type} onChange={e => setType(e.target.value)} required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white"/>
                        <select value={teamId} onChange={e => setTeamId(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"><option value="" className="text-gray-800">Team wählen...</option>{teams.map(t => <option className="text-gray-800" key={t.id} value={t.id}>{t.name}</option>)}</select>
                        {/* FIX: Corrected malformed value attribute */}
                        <select value={locationId} onChange={e => setLocationId(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"><option value="" className="text-gray-800">Ort wählen...</option>{locations.map(l => <option className="text-gray-800" key={l.id} value={l.id}>{l.name}</option>)}</select>
                        <div className="grid grid-cols-3 gap-4">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"/>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"/>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"/>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Benötigte Qualifikationen</h3>
                          {requirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                              <select value={req.qualificationId} onChange={e => handleReqChange(index, 'qualificationId', e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]">
                                {qualifications.map(q => <option className="text-gray-800" key={q.id} value={q.id}>{q.name}</option>)}
                              </select>
                              <input type="number" min="1" value={req.count} onChange={e => handleReqChange(index, 'count', e.target.value)} className="w-20 p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white"/>
                              <button type="button" onClick={() => removeRequirement(index)} className="p-2 bg-red-500 text-white rounded">X</button>
                            </div>
                          ))}
                          <button type="button" onClick={addRequirement} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Anforderung hinzufügen</button>
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

export default NewShiftModal;