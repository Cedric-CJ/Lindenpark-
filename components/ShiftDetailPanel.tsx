import React, { useState, useMemo, useEffect } from 'react';
import type { Shift, User, Team, Location, Qualification, Assignment, ChangeRequest, Absence } from '../types';
import { AssignmentStatus, ShiftStatus, RoleType, RequestType } from '../constants';
import RequestSubstitutionModal from './RequestSubstitutionModal';

interface ShiftDetailPanelProps {
  shift: Shift;
  users: User[];
  teams: Team[];
  locations: Location[];
  qualifications: Qualification[];
  absences: Absence[];
  onClose: () => void;
  onUpdate: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
  onAddRequest: (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>) => void;
  currentUser: User;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const ShiftDetailPanel: React.FC<ShiftDetailPanelProps> = ({ shift, users, teams, locations, qualifications, absences, onClose, onUpdate, onDelete, onAddRequest, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableShift, setEditableShift] = useState(shift);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  useEffect(() => {
    setEditableShift(shift);
    // Do not reset isEditing on shift prop change to allow viewing other shifts while editing.
    // User must explicitly save or cancel.
  }, [shift]);

  const team = teams.find(t => t.id === shift.teamId);
  const location = locations.find(l => l.id === shift.locationId);
  
  const { role, teamId, id: currentUserId } = currentUser;
  const isTeamLeadOfThisTeam = role === RoleType.TEAM_LEAD && teamId === shift.teamId;
  const isAdmin = role === RoleType.ADMIN;
  const canManageShift = isAdmin || isTeamLeadOfThisTeam;
  const isStaffAssigned = role === RoleType.STAFF && shift.assignments.some(a => a.userId === currentUserId);

  const assignedUsers = useMemo(() => {
    return shift.assignments.map(a => users.find(u => u.id === a.userId)).filter(Boolean) as User[];
  }, [shift.assignments, users]);
  
  const isUserOnVacation = (userId: string, date: Date) => {
    return absences.some(a => a.userId === userId && date >= a.startsAt && date <= a.endsAt);
  };

  const unassignedUsers = useMemo(() => {
    const assignedUserIds = new Set(assignedUsers.map(u => u.id));
    return users.filter(u => 
        !assignedUserIds.has(u.id) && 
        u.teamId === shift.teamId &&
        !isUserOnVacation(u.id, shift.startsAt)
    );
  }, [users, assignedUsers, shift.teamId, shift.startsAt, absences]);
  
  const handleAssignUser = (userId: string) => {
    const userToAssign = users.find(u => u.id === userId);
    if (!userToAssign) return;

    // Qualification Check
    const requiredQualIds = new Set(shift.required.map(r => r.qualificationId));
    if (requiredQualIds.size > 0) {
        const userQualIds = new Set(userToAssign.qualificationIds);
        const hasRequiredQual = [...requiredQualIds].some(qId => userQualIds.has(qId));
        if (!hasRequiredQual) {
            if (!window.confirm(`Mitarbeiter:in ${userToAssign.firstName} ${userToAssign.lastName} hat keine der benötigten Qualifikationen. Trotzdem zuweisen?`)) {
                return;
            }
        }
    }
    
    const newAssignment: Assignment = {
        id: `A-${Date.now()}`,
        userId,
        status: AssignmentStatus.CONFIRMED,
    };
    const updatedShift = {
        ...shift,
        assignments: [...shift.assignments, newAssignment],
    };
    onUpdate(updatedShift);
  };
  
  const handleUnassignUser = (userId: string) => {
    const updatedShift = {
        ...shift,
        assignments: shift.assignments.filter(a => a.userId !== userId)
    };
    onUpdate(updatedShift);
  };
  
  const handleDelete = () => {
    if (window.confirm("Diesen Einsatz wirklich löschen?")) {
        onDelete(shift.id);
        onClose();
    }
  };

  const handleRequestChange = () => {
    const comment = prompt("Bitte beschreiben Sie Ihre Änderungsanfrage:");
    if (comment) {
        onAddRequest({
            shiftId: shift.id,
            requesterId: currentUserId,
            type: RequestType.CHANGE,
            comment: comment
        });
        onClose();
    }
  };
  
  const handleProposeSubstitution = (substituteUserId: string, comment: string) => {
    onAddRequest({
        shiftId: shift.id,
        requesterId: currentUserId,
        type: RequestType.SUBSTITUTION,
        substituteUserId,
        comment
    });
    setIsSubModalOpen(false);
    onClose();
  };
  
  const handleSave = () => {
      onUpdate(editableShift);
      setIsEditing(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'date' || name === 'startTime' || name === 'endTime') {
        const date = name === 'date' ? value : editableShift.startsAt.toISOString().split('T')[0];
        const startTime = name === 'startTime' ? value : editableShift.startsAt.toTimeString().slice(0, 5);
        const endTime = name === 'endTime' ? value : editableShift.endsAt.toTimeString().slice(0, 5);
        setEditableShift({
            ...editableShift,
            startsAt: new Date(`${date}T${startTime}`),
            endsAt: new Date(`${date}T${endTime}`)
        });
    } else {
        setEditableShift({ ...editableShift, [name]: value });
    }
  }


  return (
    <>
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Einsatzdetails</h3>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100">
            <XIcon />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-gray-700 dark:text-gray-300">
        <div>
            {isEditing ? (
                 <input type="text" name="type" value={editableShift.type} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white" />
            ) : (
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{shift.type}</h4>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">{team?.name}</p>
        </div>
        
        <div className="text-sm space-y-1">
           <p><strong className="text-gray-600 dark:text-gray-400">Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${
             shift.status === ShiftStatus.CONFIRMED ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
             shift.status === ShiftStatus.OPEN ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
             'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
           }`}>{shift.status}</span></p>

           {isEditing ? (
             <div className="grid grid-cols-3 gap-2">
                 <input type="date" name="date" value={editableShift.startsAt.toISOString().split('T')[0]} onChange={handleInputChange} className="p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]" />
                 <input type="time" name="startTime" value={editableShift.startsAt.toTimeString().slice(0, 5)} onChange={handleInputChange} className="p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]" />
                 <input type="time" name="endTime" value={editableShift.endsAt.toTimeString().slice(0, 5)} onChange={handleInputChange} className="p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]" />
             </div>
           ) : (
            <p><strong className="text-gray-600 dark:text-gray-400">Zeit:</strong> {shift.startsAt.toLocaleString('de-DE')} - {shift.endsAt.toLocaleString('de-DE', {hour: '2-digit', minute:'2-digit'})}</p>
           )}
            
           {isEditing ? (
                <select name="locationId" value={editableShift.locationId} onChange={handleInputChange} className="w-full mt-2 p-2 border dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white dark:[color-scheme:dark]">
                    {locations.map(l => <option className="text-gray-800" key={l.id} value={l.id}>{l.name} ({l.room})</option>)}
                </select>
            ) : (
                <p><strong className="text-gray-600 dark:text-gray-400">Ort:</strong> {location?.name} ({location?.room})</p>
            )}

        </div>

        <div>
            <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Soll/Ist Besetzung</h5>
            <div className="space-y-2 text-sm">
                {shift.required.map(req => {
                    const qualName = qualifications.find(q => q.id === req.qualificationId)?.name || 'Unbekannt';
                    const assignedWithQual = assignedUsers.filter(u => u.qualificationIds.includes(req.qualificationId)).length;
                    return (
                        <div key={req.qualificationId} className="flex justify-between items-center">
                            <span>{qualName}</span>
                            <span className={`font-mono px-2 py-0.5 rounded ${assignedWithQual < req.count ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' : 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200'}`}>
                                {assignedWithQual} / {req.count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        <div>
            <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Zugewiesene Mitarbeiter</h5>
            <ul className="space-y-2">
                {assignedUsers.map(user => (
                    <li key={user.id} className="flex items-start justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        <div className="flex items-start flex-grow">
                            <img src={user.avatarUrl} alt={user.firstName} className="h-8 w-8 rounded-full mr-2" />
                            <div className="flex-grow">
                                <p className="text-sm">{user.firstName} {user.lastName}</p>
                                {isEditing && canManageShift ? (
                                    <input 
                                        type="text" 
                                        placeholder="Rolle im Einsatz"
                                        value={editableShift.assignments.find(a => a.userId === user.id)?.roleInShift || ''}
                                        onChange={(e) => {
                                            const updatedAssignments = editableShift.assignments.map(a => 
                                                a.userId === user.id ? { ...a, roleInShift: e.target.value } : a
                                            );
                                            setEditableShift(prev => ({ ...prev, assignments: updatedAssignments }));
                                        }}
                                        className="w-full mt-1 p-1 text-xs border rounded bg-transparent dark:border-gray-600"
                                    />
                                ) : (
                                    shift.assignments.find(a => a.userId === user.id)?.roleInShift &&
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{shift.assignments.find(a => a.userId === user.id)?.roleInShift}</p>
                                )}
                            </div>
                        </div>
                        {canManageShift && !isEditing && (
                          <button onClick={() => handleUnassignUser(user.id)} className="text-red-500 hover:text-red-700 flex-shrink-0">
                            <XIcon />
                          </button>
                        )}
                    </li>
                ))}
                {assignedUsers.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Niemand zugewiesen.</p>}
            </ul>
        </div>
        
         {canManageShift && !isEditing && (
          <div>
              <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Verfügbare Mitarbeiter vorschlagen</h5>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {unassignedUsers.map(user => (
                      <li key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                          <div className="flex items-center">
                              <img src={user.avatarUrl} alt={user.firstName} className="h-8 w-8 rounded-full mr-2" />
                              <div>
                                  <p className="text-sm">{user.firstName} {user.lastName}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.qualificationIds.map(qId => qualifications.find(q => q.id === qId)?.name).join(', ')}</p>
                              </div>
                          </div>
                          <button onClick={() => handleAssignUser(user.id)} className="text-sm bg-brand-primary text-white px-2 py-1 rounded hover:bg-blue-700">
                            Zuordnen
                          </button>
                      </li>
                  ))}
                  {unassignedUsers.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Keine verfügbaren Mitarbeiter im Team.</p>}
              </ul>
          </div>
         )}

      </div>
        
      {isStaffAssigned && (
          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex flex-col gap-2">
            <button
                onClick={() => setIsSubModalOpen(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                Vertretung vorschlagen
            </button>
            <button
                onClick={handleRequestChange}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
                Änderung anfragen
            </button>
          </div>
      )}

      <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
        <div className="flex gap-2">
            {canManageShift && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><EditIcon /> Bearbeiten</button>
            )}
            {canManageShift && isEditing && (
                <>
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Speichern</button>
                    <button onClick={() => { setIsEditing(false); setEditableShift(shift); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Abbrechen</button>
                </>
            )}
            {canManageShift ? (
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"><TrashIcon/> Löschen</button>
            ) : <div />}
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Schließen</button>
      </div>
    </div>
    {isSubModalOpen && (
        <RequestSubstitutionModal
            isOpen={isSubModalOpen}
            onClose={() => setIsSubModalOpen(false)}
            onSubmit={handleProposeSubstitution}
            teamUsers={users.filter(u => u.teamId === currentUser.teamId && u.id !== currentUser.id && !isUserOnVacation(u.id, shift.startsAt))}
        />
    )}
    </>
  );
};

export default ShiftDetailPanel;
