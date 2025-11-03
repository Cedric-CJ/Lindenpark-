import type { Team, User, Location, Shift, Qualification, ChangeRequest, Absence } from '../types';
import { RoleType, ShiftStatus, AssignmentStatus, RequestType, RequestStatus } from '../constants';

export const mockQualifications: Qualification[] = [
  { id: 'Q1', name: 'IT-Helpdesk' },
  { id: 'Q2', name: 'Ersthelfer' },
  { id: 'Q3', name: 'Veranstaltungstechnik' },
  { id: 'Q4', name: 'Beratung' },
  { id: 'Q5', name: 'Sicherheitsdienst' },
];

export const mockTeams: Team[] = [
  { id: 'T-IT', name: 'IT-Support', description: 'Technische Unterstützung', color: 'blue' },
  { id: 'T-EVENT', name: 'Veranstaltungen', description: 'Planung und Durchführung von Events', color: 'purple' },
  { id: 'T-SERVICE', name: 'Bürgerservice', description: 'Beratung und Information', color: 'green' },
];

export const mockUsers: User[] = [
  {
    id: 'U1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@lindenpark.de',
    phone: '0123-4567890',
    teamId: 'T-IT',
    role: RoleType.ADMIN,
    qualificationIds: ['Q1', 'Q2', 'Q3'],
    avatarUrl: 'https://picsum.photos/seed/U1/100/100',
    birthdate: '1980-01-01',
    address: 'Hauptstr. 1, 12345 Stadt'
  },
  {
    id: 'U2',
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max@lindenpark.de',
    phone: '0123-4567891',
    teamId: 'T-IT',
    role: RoleType.TEAM_LEAD,
    qualificationIds: ['Q1', 'Q2'],
    avatarUrl: 'https://picsum.photos/seed/U2/100/100',
    birthdate: '1985-05-10',
    address: 'Nebenstr. 2, 12345 Stadt'
  },
  {
    id: 'U3',
    firstName: 'Erika',
    lastName: 'Musterfrau',
    email: 'erika@lindenpark.de',
    phone: '0123-4567892',
    teamId: 'T-EVENT',
    role: RoleType.TEAM_LEAD,
    qualificationIds: ['Q3', 'Q5'],
    avatarUrl: 'https://picsum.photos/seed/U3/100/100',
    birthdate: '1990-03-15',
    address: 'Feldweg 3, 12345 Stadt'
  },
  {
    id: 'U4',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@lindenpark.de',
    phone: '0123-4567893',
    teamId: 'T-IT',
    role: RoleType.STAFF,
    qualificationIds: ['Q1'],
    avatarUrl: 'https://picsum.photos/seed/U4/100/100',
    birthdate: '1992-11-20',
    address: 'Gasse 4, 12345 Stadt'
  },
  {
    id: 'U5',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@lindenpark.de',
    phone: '0123-4567894',
    teamId: 'T-EVENT',
    role: RoleType.STAFF,
    qualificationIds: ['Q3'],
    avatarUrl: 'https://picsum.photos/seed/U5/100/100',
    birthdate: '1995-07-25',
    address: 'Platz 5, 12345 Stadt'
  },
   {
    id: 'U6',
    firstName: 'Peter',
    lastName: 'Jones',
    email: 'peter@lindenpark.de',
    phone: '0123-4567895',
    teamId: 'T-SERVICE',
    role: RoleType.TEAM_LEAD,
    qualificationIds: ['Q4', 'Q2'],
    avatarUrl: 'https://picsum.photos/seed/U6/100/100',
    birthdate: '1988-09-30',
    address: 'Allee 6, 12345 Stadt'
  },
  {
    id: 'U7',
    firstName: 'Sabine',
    lastName: 'Schmidt',
    email: 'sabine@lindenpark.de',
    phone: '0123-4567896',
    teamId: 'T-SERVICE',
    role: RoleType.STAFF,
    qualificationIds: ['Q4'],
    avatarUrl: 'https://picsum.photos/seed/U7/100/100',
    birthdate: '1993-02-05',
    address: 'Boulevard 7, 12345 Stadt'
  }
];

export const mockLocations: Location[] = [
  { id: 'L-HalleA', name: 'Halle A', address: 'Lindenpark 1', room: 'Raum 101', capacity: 100 },
  { id: 'L-HalleB', name: 'Halle B', address: 'Lindenpark 1', room: 'Raum 202', capacity: 200 },
  { id: 'L-Buero', name: 'Büro Bürgerservice', address: 'Lindenpark 2', room: 'EG', capacity: 10 },
  { id: 'L-Werkstatt', name: 'Kreativwerkstatt', address: 'Lindenpark 3', room: 'UG', capacity: 25 },
];

const today = new Date();

const getShiftDate = (dayOffset: number, hour: number, durationHours: number) => {
    const startDate = new Date();
    startDate.setDate(today.getDate() + dayOffset);
    
    // Avoid scheduling on Sundays (0)
    if (startDate.getDay() === 0) {
        startDate.setDate(startDate.getDate() + 1);
    }
    
    startDate.setHours(hour, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + durationHours);
    return { startsAt: startDate, endsAt: endDate };
};


export const mockShifts: Shift[] = [
  {
    id: 'E-001',
    ...getShiftDate(0, 8, 4),
    teamId: 'T-IT',
    locationId: 'L-HalleA',
    type: 'IT-Support Bürgerfest',
    required: [{ qualificationId: 'Q1', count: 2 }],
    assignments: [
        { id: 'A1', userId: 'U2', status: AssignmentStatus.CONFIRMED, roleInShift: 'Teamleitung' },
        { id: 'A5', userId: 'U4', status: AssignmentStatus.CONFIRMED, roleInShift: 'Techniker' },
    ],
    status: ShiftStatus.CONFIRMED,
    notes: 'Vorbereitungen für das Bürgerfest.',
  },
  {
    id: 'E-002',
    ...getShiftDate(0, 10, 6),
    teamId: 'T-EVENT',
    locationId: 'L-HalleB',
    type: 'Aufbau Konzert',
    required: [{ qualificationId: 'Q3', count: 1 }, { qualificationId: 'Q5', count: 1 }],
    assignments: [
      { id: 'A2', userId: 'U3', status: AssignmentStatus.CONFIRMED, roleInShift: 'Leitung Aufbau' },
      { id: 'A3', userId: 'U5', status: AssignmentStatus.CONFIRMED, roleInShift: 'Helfer' },
    ],
    status: ShiftStatus.CONFIRMED,
  },
  {
    id: 'E-003',
    ...getShiftDate(1, 9, 8),
    teamId: 'T-SERVICE',
    locationId: 'L-Buero',
    type: 'Bürgerberatung',
    required: [{ qualificationId: 'Q4', count: 1 }],
    assignments: [{ id: 'A4', userId: 'U7', status: AssignmentStatus.CONFIRMED, roleInShift: 'Berater' }],
    status: ShiftStatus.CONFIRMED,
  },
  {
    id: 'E-004',
    ...getShiftDate(2, 14, 4),
    teamId: 'T-IT',
    locationId: 'L-HalleA',
    type: 'Netzwerkwartung',
    required: [{ qualificationId: 'Q1', count: 1 }],
    assignments: [],
    status: ShiftStatus.OPEN,
  },
  {
    id: 'E-005',
    ...getShiftDate(8, 18, 5),
    teamId: 'T-EVENT',
    locationId: 'L-HalleB',
    type: 'Abbau Konzert',
    required: [{ qualificationId: 'Q3', count: 2 }],
    assignments: [],
    status: ShiftStatus.OPEN,
  },
  {
    id: 'E-006',
    ...getShiftDate(10, 9, 3),
    teamId: 'T-SERVICE',
    locationId: 'L-Buero',
    type: 'Sondersprechstunde',
    required: [{ qualificationId: 'Q4', count: 2 }],
    assignments: [
      { id: 'A6', userId: 'U6', status: AssignmentStatus.CONFIRMED }
    ],
    status: ShiftStatus.PLANNED,
  },
  {
    id: 'E-007',
    ...getShiftDate(3, 10, 5),
    teamId: 'T-IT',
    locationId: 'L-Werkstatt',
    type: 'Workshop-Support',
    required: [{ qualificationId: 'Q1', count: 1 }],
    assignments: [{ id: 'A7', userId: 'U4', status: AssignmentStatus.CONFIRMED }],
    status: ShiftStatus.CONFIRMED,
  },
  {
    id: 'E-008',
    ...getShiftDate(4, 17, 4),
    teamId: 'T-EVENT',
    locationId: 'L-HalleA',
    type: 'Gemeinschaftsabend',
    required: [{ qualificationId: 'Q3', count: 1 }, { qualificationId: 'Q2', count: 1 }],
    assignments: [{ id: 'A8', userId: 'U5', status: AssignmentStatus.CONFIRMED }],
    status: ShiftStatus.PLANNED,
  },
  {
    id: 'E-009',
    ...getShiftDate(5, 9, 8),
    teamId: 'T-SERVICE',
    locationId: 'L-Buero',
    type: 'Dokumentenbearbeitung',
    required: [{ qualificationId: 'Q4', count: 1 }],
    assignments: [],
    status: ShiftStatus.OPEN,
  },
  {
    id: 'E-010',
    ...getShiftDate(9, 8, 8),
    teamId: 'T-IT',
    locationId: 'L-Buero',
    type: 'IT-Helpdesk',
    required: [{ qualificationId: 'Q1', count: 2 }],
    assignments: [{ id: 'A9', userId: 'U2', status: AssignmentStatus.CONFIRMED }],
    status: ShiftStatus.PLANNED,
  },
  {
    id: 'E-011',
    ...getShiftDate(12, 14, 3),
    teamId: 'T-EVENT',
    locationId: 'L-Werkstatt',
    type: 'Planungstreffen Event',
    required: [{ qualificationId: 'Q3', count: 1 }],
    assignments: [{ id: 'A10', userId: 'U3', status: AssignmentStatus.CONFIRMED }],
    status: ShiftStatus.CONFIRMED,
  },
];


export const mockChangeRequests: ChangeRequest[] = [
  {
    id: 'CR-001',
    shiftId: 'E-001',
    requesterId: 'U4',
    type: RequestType.SUBSTITUTION,
    substituteUserId: 'U2',
    comment: 'Kann leider nicht, Max springt ein.',
    status: RequestStatus.PENDING,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'CR-002',
    shiftId: 'E-003',
    requesterId: 'U7',
    type: RequestType.CHANGE,
    comment: 'Kann ich 30 Minuten früher gehen?',
    status: RequestStatus.PENDING,
    createdAt: new Date(),
  },
  {
    id: 'CR-003',
    requesterId: 'U5',
    type: RequestType.VACATION,
    comment: 'Sommerurlaub',
    status: RequestStatus.PENDING,
    createdAt: new Date(),
    startsAt: getShiftDate(20, 0, 0).startsAt,
    endsAt: getShiftDate(25, 0, 0).startsAt,
  }
];

export const mockAbsences: Absence[] = [
    {
        id: 'A-U4-1',
        userId: 'U4',
        startsAt: getShiftDate(14, 0, 0).startsAt,
        endsAt: getShiftDate(18, 0, 0).startsAt,
        type: 'Urlaub',
        status: 'genehmigt',
    },
    {
        id: 'A-U2-1',
        userId: 'U2',
        startsAt: getShiftDate(4, 0, 0).startsAt,
        endsAt: getShiftDate(5, 0, 0).startsAt,
        type: 'Urlaub',
        status: 'genehmigt',
    },
    {
        id: 'A-U3-1',
        userId: 'U3',
        startsAt: getShiftDate(30, 0, 0).startsAt,
        endsAt: getShiftDate(37, 0, 0).startsAt,
        type: 'Urlaub',
        status: 'genehmigt',
    },
    {
        id: 'A-U7-1',
        userId: 'U7',
        startsAt: getShiftDate(60, 0, 0).startsAt,
        endsAt: getShiftDate(70, 0, 0).startsAt,
        type: 'Urlaub',
        status: 'genehmigt',
    }
];
