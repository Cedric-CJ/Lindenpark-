import React from 'react';
import type { Shift, Team } from '../types';
import { ShiftStatus } from '../constants';

interface ShiftCardProps {
  shift: Shift;
  team?: Team;
  onClick: () => void;
}

const statusColors: Record<ShiftStatus, string> = {
  [ShiftStatus.PLANNED]: 'bg-gray-200 text-gray-800',
  [ShiftStatus.OPEN]: 'bg-yellow-200 text-yellow-800',
  [ShiftStatus.CONFIRMED]: 'bg-green-200 text-green-800',
  [ShiftStatus.DONE]: 'bg-blue-200 text-blue-800',
  [ShiftStatus.CANCELLED]: 'bg-red-200 text-red-800',
};

const teamColors: Record<string, { bg: string, text: string, border: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-500' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
    default: { bg: 'bg-gray-100 dark:bg-gray-700/50', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-500' }
};

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197M15 21a6 6 0 00-9-5.197" />
    </svg>
);


const ShiftCard: React.FC<ShiftCardProps> = ({ shift, team, onClick }) => {
  const totalRequired = shift.required.reduce((acc, req) => acc + req.count, 0);
  const totalAssigned = shift.assignments.length;

  const color = team ? teamColors[team.color] || teamColors.default : teamColors.default;

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${color.bg} ${color.text} ${color.border}`}
    >
      <p className="font-bold text-sm truncate">{shift.type}</p>
      <p className="text-xs">
        {shift.startsAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {shift.endsAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <div className="flex items-center justify-between mt-1 text-xs">
        <span>{team?.name || 'Kein Team'}</span>
        <div className={`flex items-center px-2 py-0.5 rounded-full ${totalAssigned < totalRequired ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-500/30 dark:text-yellow-200' : 'bg-green-200 text-green-800 dark:bg-green-500/30 dark:text-green-200'}`}>
            <UsersIcon />
            <span>{totalAssigned}/{totalRequired}</span>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;