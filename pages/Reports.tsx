import React, { useState } from 'react';
import type { Shift, Team, User, Location } from '../types';

interface ReportsProps {
    shifts: Shift[];
    teams: Team[];
    users: User[];
    locations: Location[];
}

const Reports: React.FC<ReportsProps> = ({ shifts, teams, users, locations }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');

    const handleExport = () => {
        if (!selectedTeamId) {
            alert("Bitte wählen Sie ein Team aus.");
            return;
        }

        const teamShifts = shifts.filter(s => s.teamId === selectedTeamId);
        
        if (teamShifts.length === 0) {
            alert("Für dieses Team gibt es keine Einsätze zum Exportieren.");
            return;
        }

        const headers = ["Einsatz ID", "Typ", "Startzeit", "Endzeit", "Ort", "Raum", "Zugewiesene Mitarbeiter"];
        const csvRows = [headers.join(',')];

        teamShifts.forEach(shift => {
            const location = locations.find(l => l.id === shift.locationId);
            const assigned = shift.assignments.map(a => {
                const user = users.find(u => u.id === a.userId);
                return user ? `${user.firstName} ${user.lastName}` : 'Unbekannt';
            }).join('; ');

            const row = [
                shift.id,
                `"${shift.type}"`,
                shift.startsAt.toLocaleString('de-DE'),
                shift.endsAt.toLocaleString('de-DE'),
                `"${location?.name || ''}"`,
                `"${location?.room || ''}"`,
                `"${assigned}"`
            ].join(',');
            csvRows.push(row);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const teamName = teams.find(t => t.id === selectedTeamId)?.name || 'report';
        link.setAttribute('download', `einsatzbericht_${teamName.replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Berichte & Exporte</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Wochenbericht exportieren</h3>
                <div className="flex items-center space-x-4">
                    <select 
                        value={selectedTeamId} 
                        onChange={e => setSelectedTeamId(e.target.value)} 
                        className="p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]"
                    >
                        <option value="" disabled className="text-gray-800">Team auswählen...</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id} className="text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {team.name}
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={handleExport}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
                        disabled={!selectedTeamId}
                    >
                        CSV Exportieren
                    </button>
                </div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Exportiert alle Einsätze für das ausgewählte Team in eine CSV-Datei, die mit Excel geöffnet werden kann.
                </p>
            </div>
        </div>
    );
};

export default Reports;
