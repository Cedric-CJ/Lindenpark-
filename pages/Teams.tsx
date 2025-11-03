import React, { useState } from 'react';
import type { Team, User } from '../types';
import UserEditModal from '../components/UserEditModal';

interface TeamsProps {
  teams: Team[];
  users: User[];
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

const Teams: React.FC<TeamsProps> = ({ teams, users, currentUser, onUpdateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (updatedUser: User) => {
    onUpdateUser(updatedUser);
    handleCloseModal();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Teams & Personen</h2>
        {teams.map(team => (
          <div key={team.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2" style={{ color: team.color }}>{team.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{team.description}</p>
            <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Mitarbeiter:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.filter(u => u.teamId === team.id).map(user => (
                <li 
                  key={user.id} 
                  className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleUserClick(user)}
                >
                  <img src={user.avatarUrl} alt={user.firstName} className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {isModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </>
  );
};

export default Teams;
