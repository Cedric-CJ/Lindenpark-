import React, { useMemo } from 'react';
import type { User, ChangeRequest } from '../types';
import { RequestStatus, RoleType } from '../constants';

type Page = 'Dashboard' | 'Planung' | 'Teams & Personen' | 'Orte & Veranstaltungen' | 'Anfragen & Vertretungen' | 'Berichte';


interface HeaderProps {
  pageTitle: string;
  user: User;
  allUsers: User[];
  onUserChange: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  changeRequests: ChangeRequest[];
  setActivePage: (page: Page) => void;
}

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ pageTitle, user, allUsers, onUserChange, isDarkMode, onToggleDarkMode, changeRequests, setActivePage }) => {
  
  const pendingRequestsCount = useMemo(() => {
    if (user.role === RoleType.STAFF) {
        return 0; // Staff don't approve requests
    }
    return changeRequests.filter(r => {
        if(r.status !== RequestStatus.PENDING) return false;
        if(user.role === RoleType.ADMIN) return true;
        // Team leads see requests from their team members
        const requester = allUsers.find(u => u.id === r.requesterId);
        return requester?.teamId === user.teamId;
    }).length;
  }, [changeRequests, user, allUsers]);

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{pageTitle}</h2>
      <div className="flex items-center space-x-4">
        <button onClick={onToggleDarkMode} className="p-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring">
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
        <button 
          className="relative p-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring"
          onClick={() => setActivePage('Anfragen & Vertretungen')}
          aria-label={`${pendingRequestsCount} offene Anfragen`}
        >
            <BellIcon />
            {pendingRequestsCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingRequestsCount}
                </span>
            )}
        </button>
        <div className="flex items-center">
            <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt="User avatar" />
            <div className="ml-3">
                <select 
                  value={user.id} 
                  onChange={(e) => {
                    const selectedUser = allUsers.find(u => u.id === e.target.value);
                    if (selectedUser) onUserChange(selectedUser);
                  }}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent border-none focus:ring-0"
                  aria-label="Benutzer wechseln"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id} className="text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
