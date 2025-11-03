import React, { useState, useMemo } from 'react';
import type { Shift, User, Team, Location, Qualification, ChangeRequest, Absence } from '../types';
import ShiftCard from '../components/ShiftCard';
import ShiftDetailPanel from '../components/ShiftDetailPanel';
import NewShiftModal from '../components/NewShiftModal';
import RequestVacationModal from '../components/RequestVacationModal';
import { RoleType } from '../constants';

interface PlanningProps {
  shifts: Shift[];
  users: User[];
  teams: Team[];
  locations: Location[];
  qualifications: Qualification[];
  absences: Absence[];
  onUpdateShift: (shift: Shift) => void;
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddRequest: (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>) => void;
  currentUser: User;
}

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates = [];
    // Start from the beginning of the week of the first day
    const startDate = getStartOfWeek(firstDay);
    
    let currentDate = new Date(startDate);
    while(currentDate.getMonth() < month + 1 || currentDate < lastDay) {
        if(currentDate.getFullYear() > year && currentDate.getMonth() > month) break; // prevent infinite loops
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        if(dates.length > 42) break; // Max 6 weeks
    }
    return dates;
};

const Planning: React.FC<PlanningProps> = ({ shifts, users, teams, locations, qualifications, absences, onUpdateShift, onAddShift, onDeleteShift, onAddRequest, currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isNewShiftModalOpen, setIsNewShiftModalOpen] = useState(false);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [view, setView] = useState<'week' | 'month'>('week');

  const filteredShifts = useMemo(() => {
    if (currentUser.role === RoleType.ADMIN) {
        return shifts;
    }
    if (currentUser.role === RoleType.TEAM_LEAD) {
        const teamUserIds = users.filter(u => u.teamId === currentUser.teamId).map(u => u.id);
        return shifts.filter(s => teamUserIds.some(userId => s.assignments.some(a => a.userId === userId)) || s.teamId === currentUser.teamId);
    }
    return shifts.filter(s => s.assignments.some(a => a.userId === currentUser.id));
  }, [shifts, currentUser, users]);

  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [startOfWeek]);

  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate]);
  
  const handleDateChange = (offset: number) => {
      const newDate = new Date(currentDate);
      if (view === 'week') {
          newDate.setDate(currentDate.getDate() + (offset * 7));
      } else {
          newDate.setMonth(currentDate.getMonth() + offset);
      }
      setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedShift(null);
  };

  const getShiftsForDate = (date: Date) => {
      return filteredShifts
          .filter(shift => shift.startsAt.toDateString() === date.toDateString())
          .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  };
  
  const getAbsencesForDate = (date: Date) => {
      return absences.filter(a => date >= a.startsAt && date <= a.endsAt);
  };

  const canCreateShift = currentUser.role === RoleType.ADMIN || currentUser.role === RoleType.TEAM_LEAD;

  const currentMonthName = currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  
  const renderWeekView = () => (
    <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
      {weekDates.map(date => (
        <div key={date.toISOString()} className="bg-gray-50 dark:bg-gray-800 flex flex-col min-h-[400px]">
          <div className="text-center py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{date.toLocaleDateString('de-DE', { weekday: 'short' })}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{date.getDate()}</p>
          </div>
          <div className="flex-1 p-1 space-y-1 overflow-y-auto">
            {getShiftsForDate(date).map(shift => (
                <ShiftCard 
                    key={shift.id} 
                    shift={shift} 
                    team={teams.find(t => t.id === shift.teamId)} 
                    onClick={() => setSelectedShift(shift)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMonthView = () => (
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 h-full">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="text-center py-2 bg-gray-100 dark:bg-gray-900 text-sm font-semibold text-gray-600 dark:text-gray-300">{day}</div>
          ))}
          {monthDates.map(date => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isSunday = date.getDay() === 0;
              const shiftsOnDate = getShiftsForDate(date);
              const absencesOnDate = getAbsencesForDate(date);
              const userIdsOnAbsence = new Set(absencesOnDate.map(a => a.userId));
              
              return (
                  <div key={date.toISOString()} className={`relative flex flex-col p-1 ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800/50'} ${isSunday ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <p className={`text-sm ${isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{date.getDate()}</p>
                      <div className="flex-1 space-y-1 overflow-y-auto mt-1">
                          {isSunday && <div className="text-xs text-center text-red-600 dark:text-red-400 font-semibold">Feiertag</div>}
                          {shiftsOnDate.slice(0, 2).map(shift => (
                              <div key={shift.id} onClick={() => setSelectedShift(shift)} className={`text-xs p-1 rounded-md cursor-pointer truncate ${teams.find(t=>t.id === shift.teamId)?.color === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{shift.type}</div>
                          ))}
                          {shiftsOnDate.length > 2 && <div className="text-xs text-gray-500">+{shiftsOnDate.length-2} mehr</div>}
                          {Array.from(userIdsOnAbsence).map(userId => {
                              const user = users.find(u => u.id === userId);
                              return user ? <div key={userId} className="text-xs p-1 rounded-md bg-yellow-100 text-yellow-800 truncate" title={`${user.firstName} ${user.lastName} (Urlaub)`}>🌴 {user.lastName}</div> : null
                          })}
                      </div>
                  </div>
              )
          })}
      </div>
  )

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex-wrap gap-4">
            <div className="flex items-center space-x-2">
                <button onClick={() => handleDateChange(-1)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600">{'<'}</button>
                <button onClick={() => handleDateChange(1)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600">{'>'}</button>
                <button onClick={handleToday} className="px-4 py-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Heute</button>
                <div className="flex rounded-md shadow-sm">
                  <button onClick={() => setView('week')} className={`px-4 py-1 rounded-l-md ${view === 'week' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>Woche</button>
                  <button onClick={() => setView('month')} className={`px-4 py-1 rounded-r-md ${view === 'month' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>Monat</button>
                </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                {currentMonthName}
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                  onClick={() => setIsVacationModalOpen(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                  Urlaub beantragen
              </button>
              {canCreateShift && (
                  <button 
                      onClick={() => setIsNewShiftModalOpen(true)}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                      Neuen Einsatz anlegen
                  </button>
              )}
            </div>
        </div>
        {view === 'week' ? renderWeekView() : renderMonthView()}
      </div>
      {selectedShift && (
        <ShiftDetailPanel
          key={selectedShift.id} // Add key to force re-mount on shift change
          shift={selectedShift}
          users={users}
          teams={teams}
          locations={locations}
          qualifications={qualifications}
          absences={absences}
          onClose={() => setSelectedShift(null)}
          onUpdate={onUpdateShift}
          onDelete={onDeleteShift}
          currentUser={currentUser}
          onAddRequest={onAddRequest}
        />
      )}
      <NewShiftModal
        isOpen={isNewShiftModalOpen}
        onClose={() => setIsNewShiftModalOpen(false)}
        onAddShift={onAddShift}
        teams={teams}
        locations={locations}
        qualifications={qualifications}
      />
      <RequestVacationModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        onSubmit={(startDate, endDate, comment) => {
          onAddRequest({
            requesterId: currentUser.id,
            type: 'Urlaub',
            comment,
            startsAt: startDate,
            endsAt: endDate
          })
        }}
      />
    </div>
  );
};

export default Planning;
