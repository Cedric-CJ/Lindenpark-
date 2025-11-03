export enum RoleType {
  ADMIN = 'admin',
  TEAM_LEAD = 'lead',
  STAFF = 'staff',
}

export enum ShiftStatus {
  PLANNED = 'geplant',
  OPEN = 'offen',
  CONFIRMED = 'bestätigt',
  DONE = 'abgeschlossen',
  CANCELLED = 'abgesagt',
}

export enum AssignmentStatus {
  PROPOSED = 'vorgeschlagen',
  CONFIRMED = 'bestätigt',
  DECLINED = 'abgesagt',
}

export enum RequestType {
  SUBSTITUTION = 'Vertretung',
  CHANGE = 'Änderung',
  VACATION = 'Urlaub',
}

export enum RequestStatus {
  PENDING = 'offen',
  APPROVED = 'genehmigt',
  DECLINED = 'abgelehnt',
}
