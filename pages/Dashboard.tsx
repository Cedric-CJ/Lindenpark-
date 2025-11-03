import React from 'react';
import type { Shift, User, ChangeRequest } from '../types';
import { ShiftStatus, RoleType, RequestStatus } from '../constants';

type Page = 'Dashboard' | 'Planung' | 'Teams & Personen' | 'Orte & Veranstaltungen' | 'Anfragen & Vertretungen' | 'Berichte';

interface DashboardProps {
    shifts: Shift[];
    currentUser: User;
    setActivePage: (page: Page) => void;
    changeRequests: ChangeRequest[];
}

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
};

const DashboardCard: React.FC<{title: string; value: number; onClick?: () => void; colorClass: string; children?: React.ReactNode}> = ({ title, value, onClick, colorClass, children }) => {
    const CardContent = () => (
         <div className={`p-6 rounded-lg shadow-md h-full flex flex-col justify-between bg-white dark:bg-gray-800 ${onClick ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all' : ''}`}>
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
                <p className={`text-4xl font-bold mt-2 ${colorClass}`}>{value}</p>
            </div>
            {children}
        </div>
    );

    if (onClick) {
        return <button onClick={onClick} className="text-left w-full h-full"><CardContent /></button>
    }
    return <CardContent />;
}


const Dashboard: React.FC<DashboardProps> = ({ shifts, currentUser, setActivePage, changeRequests }) => {
    const userShifts = shifts.filter(s => s.assignments.some(a => a.userId === currentUser.id));
    const todayShifts = userShifts.filter(s => isToday(s.startsAt));
    const openShifts = shifts.filter(s => s.status === ShiftStatus.OPEN && (s.assignments.length < s.required.reduce((acc, r) => acc + r.count, 0)));
    const pendingRequestsCount = changeRequests.filter(r => r.status === RequestStatus.PENDING).length;

    const canManage = currentUser.role === RoleType.ADMIN || currentUser.role === RoleType.TEAM_LEAD;
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Willkommen zurück, {currentUser.firstName}!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <DashboardCard title="Heutige Einsätze" value={todayShifts.length} colorClass="text-brand-primary" onClick={() => setActivePage('Planung')} />

                <DashboardCard title="Offene Einsätze" value={openShifts.length} colorClass="text-status-yellow" onClick={() => setActivePage('Planung')} />

                {canManage && (
                    <DashboardCard title="Offene Anfragen" value={pendingRequestsCount} colorClass="text-status-red" onClick={() => setActivePage('Anfragen & Vertretungen')} />
                )}
                
                <DashboardCard title="Meine gesamten Einsätze" value={userShifts.length} colorClass="text-status-green" onClick={() => setActivePage('Planung')} />
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Meine heutigen Einsätze</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    {todayShifts.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                           {todayShifts.map(shift => (
                               <li key={shift.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                                   <p className="font-semibold text-gray-800 dark:text-gray-100">{shift.type}</p>
                                   <p className="text-sm text-gray-500 dark:text-gray-400">
                                       {shift.startsAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {shift.endsAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                   </p>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-gray-500 dark:text-gray-400">Keine Einsätze für heute geplant.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
