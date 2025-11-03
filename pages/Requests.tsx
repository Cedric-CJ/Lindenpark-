import React from 'react';
import type { ChangeRequest, Shift, User } from '../types';
import { RequestStatus, RoleType, RequestType } from '../constants';

interface RequestsProps {
    changeRequests: ChangeRequest[];
    shifts: Shift[];
    users: User[];
    currentUser: User;
    onUpdateRequest: (requestId: string, newStatus: RequestStatus) => void;
}

const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.PENDING:
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        case RequestStatus.APPROVED:
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
        case RequestStatus.DECLINED:
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
    }
}

const Requests: React.FC<RequestsProps> = ({ changeRequests, shifts, users, currentUser, onUpdateRequest }) => {

    const canManage = currentUser.role === RoleType.ADMIN || currentUser.role === RoleType.TEAM_LEAD;

    const filteredRequests = changeRequests.filter(req => {
        if (currentUser.role === RoleType.ADMIN) return true;
        if (currentUser.role === RoleType.TEAM_LEAD) {
            const requester = users.find(u => u.id === req.requesterId);
            return requester?.teamId === currentUser.teamId;
        }
        // Staff can only see their own requests
        return req.requesterId === currentUser.id;
    }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Anfragen & Vertretungen</h2>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Datum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Antragsteller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Einsatz / Zeitraum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                {canManage && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktion</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRequests.map(req => {
                                const shift = req.shiftId ? shifts.find(s => s.id === req.shiftId) : null;
                                const requester = users.find(u => u.id === req.requesterId);
                                const substitute = req.substituteUserId ? users.find(u => u.id === req.substituteUserId) : null;

                                return (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.createdAt.toLocaleDateString('de-DE')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{requester?.firstName} {requester?.lastName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {shift ? shift.type : ''}
                                            {req.type === RequestType.VACATION && req.startsAt && req.endsAt && (
                                                `${req.startsAt.toLocaleDateString('de-DE')} - ${req.endsAt.toLocaleDateString('de-DE')}`
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <p className="font-semibold">{req.type}</p>
                                            {req.type === RequestType.SUBSTITUTION && substitute && <p>Vertretung: {substitute.firstName} {substitute.lastName}</p>}
                                            <p className="italic">"{req.comment}"</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {req.status === RequestStatus.PENDING ? (
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => onUpdateRequest(req.id, RequestStatus.APPROVED)} className="text-green-600 hover:text-green-900">Genehmigen</button>
                                                        <button onClick={() => onUpdateRequest(req.id, RequestStatus.DECLINED)} className="text-red-600 hover:text-red-900">Ablehnen</button>
                                                    </div>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                             {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={canManage ? 6 : 5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                                        Keine Anfragen gefunden.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Requests;
