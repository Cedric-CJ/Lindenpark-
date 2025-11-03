import type { RoleType, ShiftStatus, AssignmentStatus, RequestStatus, RequestType } from './constants';

export interface Role {
  id: number;
  key: RoleType;
  label: string;
}

export interface Qualification {
  id:string;
  name: string;
}

export interface User {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  teamId: string;
  role: RoleType;
  qualificationIds: string[];
  avatarUrl: string;
  birthdate: string; // YYYY-MM-DD
  address: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  room: string;
  capacity: number;
}

export interface Event {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  locationId: string;
}

export interface ShiftRequirement {
  qualificationId: string;
  count: number;
}

export interface Assignment {
  id: string;
  userId: string;
  status: AssignmentStatus;
  comment?: string;
  roleInShift?: string;
}

export interface Shift {
  id: string;
  startsAt: Date;
  endsAt: Date;
  teamId: string;
  locationId: string;
  eventId?: string | null;
  type: string;
  required: ShiftRequirement[];
  assignments: Assignment[];
  status: ShiftStatus;
  notes?: string;
}

export interface ChangeRequest {
  id: string;
  shiftId?: string; // Optional for vacation requests
  requesterId: string;
  type: RequestType;
  substituteUserId?: string; // for substitution requests
  comment: string;
  status: RequestStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  // For vacation requests
  startsAt?: Date;
  endsAt?: Date;
}

export interface Absence {
    id: string;
    userId: string;
    startsAt: Date;
    endsAt: Date;
    type: 'Urlaub';
    status: 'genehmigt';
}
