
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Teams from './pages/Teams';
import Locations from './pages/Locations';
import Reports from './pages/Reports';
import Requests from './pages/Requests';
import { mockShifts, mockUsers, mockTeams, mockLocations, mockQualifications, mockChangeRequests, mockAbsences } from './data/mockData';
import type { Shift, User, Assignment, Team, Location, Qualification, ChangeRequest, Absence } from './types';
import { ShiftStatus, AssignmentStatus, RequestStatus, RoleType, RequestType } from './constants';

type Page = 'Dashboard' | 'Planung' | 'Teams & Personen' | 'Orte & Veranstaltungen' | 'Anfragen & Vertretungen' | 'Berichte';

const isOverlapping = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    return s1 < e2 && s2 < e1;
};

const getPageFromHash = (): Page => {
    const hash = window.location.hash.substring(2); // remove #/
    const page = decodeURIComponent(hash);
    const validPages: Page[] = ['Dashboard', 'Planung', 'Teams & Personen', 'Orte & Veranstaltungen', 'Anfragen & Vertretungen', 'Berichte'];
    if (validPages.includes(page as Page)) {
        return page as Page;
    }
    return 'Dashboard';
};


const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(getPageFromHash());
  
  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const savedShifts = window.localStorage.getItem('shifts');
      if (savedShifts) {
        const parsed = JSON.parse(savedShifts);
        return parsed.map((s: any) => ({
          ...s,
          startsAt: new Date(s.startsAt),
          endsAt: new Date(s.endsAt),
        }));
      }
    } catch (error) {
      console.error("Failed to parse shifts from localStorage", error);
    }
    return mockShifts;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    try {
        const saved = window.localStorage.getItem('users');
        return saved ? JSON.parse(saved) : mockUsers;
    } catch (e) {
        return mockUsers;
    }
  });

  const [absences, setAbsences] = useState<Absence[]>(() => {
     try {
      const saved = window.localStorage.getItem('absences');
      if (saved) {
        return JSON.parse(saved).map((a: any) => ({...a, startsAt: new Date(a.startsAt), endsAt: new Date(a.endsAt)}));
      }
    } catch (error) {
       console.error("Failed to parse absences from localStorage", error);
    }
    return mockAbsences;
  });

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(() => {
    try {
        const savedRequests = window.localStorage.getItem('changeRequests');
        if (savedRequests) {
            return JSON.parse(savedRequests).map((r: any) => ({
                ...r,
                createdAt: new Date(r.createdAt),
                resolvedAt: r.resolvedAt ? new Date(r.resolvedAt) : undefined,
                startsAt: r.startsAt ? new Date(r.startsAt) : undefined,
                endsAt: r.endsAt ? new Date(r.endsAt) : undefined,
            }));
        }
    } catch (error) {
        console.error("Failed to parse change requests from localStorage", error);
    }
    return mockChangeRequests;
  });

  const [teams] = useState<Team[]>(mockTeams);
  const [locations, setLocations] = useState<Location[]>(() => {
    try {
      const saved = window.localStorage.getItem('locations');
      return saved ? JSON.parse(saved) : mockLocations;
    } catch(e) {
      return mockLocations;
    }
  });
  const [qualifications] = useState<Qualification[]>(mockQualifications);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = window.localStorage.getItem('darkMode');
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = window.localStorage.getItem('currentUserId');
    const user = users.find(u => u.id === savedUserId);
    if (user) return user;
    // Ensure the currentUser from mock data is used if it exists, otherwise default to the first user
    const mockUser = mockUsers.find(u => u.id === savedUserId);
    return mockUser || users[0];
  });
  
  useEffect(() => {
    const handleHashChange = () => {
        setActivePage(getPageFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    
    if (!window.location.hash || window.location.hash === "#" || window.location.hash === "#/") {
        window.location.hash = '#/Dashboard';
    } else {
        handleHashChange();
    }

    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  useEffect(() => {
    window.localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    window.localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    window.localStorage.setItem('absences', JSON.stringify(absences));
  }, [absences]);

  useEffect(() => {
    window.localStorage.setItem('changeRequests', JSON.stringify(changeRequests));
  }, [changeRequests]);

  useEffect(() => {
    window.localStorage.setItem('locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    window.localStorage.setItem('currentUserId', currentUser.id);
  }, [currentUser]);
  
  const navigate = (page: Page) => {
    window.location.hash = `#/${page}`;
  };

  const notifyUser = (userId: string, message: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        // In a real app, this would be a push notification or an in-app toast.
        // For this demo, we use a simple alert.
        console.log(`NOTIFICATION for ${user.firstName} ${user.lastName}: ${message}`);
        // To avoid spamming alerts during development, you can comment this out.
        // alert(`NOTIFICATION for ${user.firstName} ${user.lastName}:\n${message}`);
    }
  };

  const handleUpdateShift = useCallback((updatedShift: Shift) => {
    const originalShift = shifts.find(s => s.id === updatedShift.id);
    if (!originalShift) return;

    // --- CONFLICT CHECKS ---
    // 1. Location conflict check (if time or location changed)
    if (originalShift.locationId !== updatedShift.locationId || originalShift.startsAt.getTime() !== updatedShift.startsAt.getTime() || originalShift.endsAt.getTime() !== updatedShift.endsAt.getTime()) {
        const locationConflict = shifts.find(s => 
            s.id !== updatedShift.id &&
            s.locationId === updatedShift.locationId &&
            isOverlapping(s.startsAt, s.endsAt, updatedShift.startsAt, updatedShift.endsAt)
        );

        if (locationConflict) {
            alert(`Konflikt! Der Ort "${locations.find(l => l.id === updatedShift.locationId)?.name}" ist zu dieser Zeit bereits für den Einsatz "${locationConflict.type}" gebucht.`);
            return;
        }
    }

    // 2. User overlap check for all assigned users
    const assignedUserIds = new Set(updatedShift.assignments.map(a => a.userId));
    for (const userId of assignedUserIds) {
        const otherShiftsForUser = shifts.filter(s => 
            s.id !== updatedShift.id && 
            s.assignments.some(a => a.userId === userId)
        );

        for (const otherShift of otherShiftsForUser) {
            if (isOverlapping(otherShift.startsAt, otherShift.endsAt, updatedShift.startsAt, updatedShift.endsAt)) {
                const user = users.find(u => u.id === userId);
                alert(`Konflikt! ${user?.firstName} ${user?.lastName} ist bereits für den Einsatz "${otherShift.type}" von ${otherShift.startsAt.toLocaleTimeString()} bis ${otherShift.endsAt.toLocaleTimeString()} eingeteilt.`);
                return;
            }
        }
    }
    // --- END CONFLICT CHECKS ---

    setShifts(prevShifts => prevShifts.map(s => s.id === updatedShift.id ? updatedShift : s));

    // Notifications
    const originalUserIds = new Set<string>(originalShift.assignments.map(a => String(a.userId)));
    const updatedUserIds = new Set<string>(updatedShift.assignments.map(a => String(a.userId)));
    
    updatedUserIds.forEach(userId => {
        if (!originalUserIds.has(userId)) {
            notifyUser(userId, `Sie wurden dem Einsatz "${updatedShift.type}" am ${updatedShift.startsAt.toLocaleDateString()} zugewiesen.`);
        }
    });
    originalUserIds.forEach(userId => {
        if (!updatedUserIds.has(userId)) {
            notifyUser(userId, `Sie wurden vom Einsatz "${updatedShift.type}" am ${updatedShift.startsAt.toLocaleDateString()} entfernt.`);
        }
    });

    if (originalShift.startsAt.getTime() !== updatedShift.startsAt.getTime() || originalShift.endsAt.getTime() !== updatedShift.endsAt.getTime()) {
        updatedUserIds.forEach(userId => notifyUser(userId, `Die Zeit für den Einsatz "${updatedShift.type}" wurde geändert.`));
    }

  }, [shifts, users, locations]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    alert(`Profil für ${updatedUser.firstName} ${updatedUser.lastName} aktualisiert.`);
  }, [currentUser.id]);

  const handleAddShift = useCallback((newShiftData: Omit<Shift, 'id'>) => {
    // Location conflict check
    const locationConflict = shifts.find(s => 
        s.locationId === newShiftData.locationId &&
        isOverlapping(s.startsAt, s.endsAt, newShiftData.startsAt, newShiftData.endsAt)
    );

    if (locationConflict) {
        alert(`Konflikt! Der Ort "${locations.find(l => l.id === newShiftData.locationId)?.name}" ist bereits für den Einsatz "${locationConflict.type}" von ${locationConflict.startsAt.toLocaleTimeString()} bis ${locationConflict.endsAt.toLocaleTimeString()} gebucht.`);
        return;
    }

    const newShift: Shift = {
        ...newShiftData,
        id: `E-${Date.now()}`
    };
    setShifts(prevShifts => [...prevShifts, newShift]);
  }, [shifts, locations]);
  
  const handleDeleteShift = useCallback((shiftId: string) => {
    const shiftToDelete = shifts.find(s => s.id === shiftId);
    if(shiftToDelete){
        shiftToDelete.assignments.forEach(a => {
            notifyUser(a.userId, `Der Einsatz "${shiftToDelete.type}" am ${shiftToDelete.startsAt.toLocaleDateString()} wurde abgesagt.`);
        });
    }
    setShifts(prevShifts => prevShifts.filter(s => s.id !== shiftId));
  }, [shifts, users]);

  const handleAddRequest = useCallback((requestData: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: ChangeRequest = {
        ...requestData,
        id: `CR-${Date.now()}`,
        createdAt: new Date(),
        status: RequestStatus.PENDING,
    };
    setChangeRequests(prev => [...prev, newRequest]);
    alert('Ihre Anfrage wurde übermittelt.');
  }, []);

  const handleUpdateRequest = useCallback((requestId: string, newStatus: RequestStatus) => {
    let updatedShift: Shift | undefined;
    const requestToUpdate = changeRequests.find(req => req.id === requestId);
    if(!requestToUpdate) return;
    
    const updatedRequests = changeRequests.map(req => {
        if (req.id === requestId) {
            return {
                ...req,
                status: newStatus,
                resolvedAt: new Date(),
                resolvedBy: currentUser.id,
            };
        }
        return req;
    });

    if (newStatus === RequestStatus.APPROVED) {
        notifyUser(requestToUpdate.requesterId, `Ihre Anfrage (${requestToUpdate.type}) wurde genehmigt.`);
        switch(requestToUpdate.type){
            case RequestType.SUBSTITUTION:
                if(requestToUpdate.substituteUserId && requestToUpdate.shiftId){
                    const shiftToUpdate = shifts.find(s => s.id === requestToUpdate.shiftId);
                    if (shiftToUpdate) {
                        updatedShift = {
                            ...shiftToUpdate,
                            assignments: [
                                ...shiftToUpdate.assignments.filter(a => a.userId !== requestToUpdate.requesterId),
                                { id: `A-${Date.now()}`, userId: requestToUpdate.substituteUserId, status: AssignmentStatus.CONFIRMED }
                            ]
                        };
                        notifyUser(requestToUpdate.substituteUserId, `Sie wurden als Vertretung für den Einsatz "${shiftToUpdate.type}" eingeteilt.`);
                    }
                }
                break;
            case RequestType.VACATION:
                if (requestToUpdate.startsAt && requestToUpdate.endsAt) {
                    const newAbsence: Absence = {
                        id: `ABS-${Date.now()}`,
                        userId: requestToUpdate.requesterId,
                        startsAt: requestToUpdate.startsAt,
                        endsAt: requestToUpdate.endsAt,
                        type: 'Urlaub',
                        status: 'genehmigt',
                    };
                    setAbsences(prev => [...prev, newAbsence]);
                }
                break;
        }
    } else if (newStatus === RequestStatus.DECLINED) {
         notifyUser(requestToUpdate.requesterId, `Ihre Anfrage (${requestToUpdate.type}) wurde leider abgelehnt.`);
    }

    setChangeRequests(updatedRequests);

    if (updatedShift) {
        setShifts(prevShifts => prevShifts.map(s => s.id === updatedShift!.id ? updatedShift! : s));
    }
  }, [changeRequests, shifts, currentUser.id, users]);

  const handleAddLocation = useCallback((newLocationData: Omit<Location, 'id'>) => {
    const newLocation: Location = {
        ...newLocationData,
        id: `L-${Date.now()}`
    };
    setLocations(prev => [...prev, newLocation]);
  }, []);
  
  const handleUpdateLocation = useCallback((updatedLocation: Location) => {
    setLocations(prev => prev.map(l => l.id === updatedLocation.id ? updatedLocation : l));
  }, []);

  const handleDeleteLocation = useCallback((locationId: string) => {
    if (window.confirm("Diesen Ort wirklich löschen? Alle zugehörigen Einsätze müssen manuell einem neuen Ort zugewiesen werden.")) {
      setLocations(prev => prev.filter(l => l.id !== locationId));
    }
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard shifts={shifts} currentUser={currentUser} setActivePage={navigate} changeRequests={changeRequests} />;
      case 'Planung':
        return <Planning shifts={shifts} users={users} teams={teams} locations={locations} qualifications={qualifications} absences={absences} onUpdateShift={handleUpdateShift} onAddShift={handleAddShift} onDeleteShift={handleDeleteShift} currentUser={currentUser} onAddRequest={handleAddRequest} />;
      case 'Teams & Personen':
        return <Teams teams={teams} users={users} currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'Orte & Veranstaltungen':
        return <Locations locations={locations} currentUser={currentUser} onAddLocation={handleAddLocation} onUpdateLocation={handleUpdateLocation} onDeleteLocation={handleDeleteLocation} />;
      case 'Anfragen & Vertretungen':
        return <Requests changeRequests={changeRequests} shifts={shifts} users={users} currentUser={currentUser} onUpdateRequest={handleUpdateRequest} />;
      case 'Berichte':
        return <Reports shifts={shifts} teams={teams} users={users} locations={locations} />;
      default:
        return <Dashboard shifts={shifts} currentUser={currentUser} setActivePage={navigate} changeRequests={changeRequests} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar activePage={activePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={activePage} 
          user={currentUser} 
          allUsers={users}
          onUserChange={setCurrentUser}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          changeRequests={changeRequests}
          setActivePage={navigate}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;