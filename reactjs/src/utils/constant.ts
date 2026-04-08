export const path = {
  HOME: '/',
  HOMEPAGE: '/home',
  LOGIN: '/login',
  LOG_OUT: '/logout',
  SYSTEM: '/system',
  PATIENT_PROFILE: '/patient-profile',
  DETAIL_DOCTOR: '/detail-doctor/:id',
  DETAIL_SPECIALTY: '/detail-specialty/:id',
  DETAIL_CLINIC: '/detail-clinic/:id',
  VERIFY_EMAIL_BOOKING: '/verify-booking',
} as const;

export const LANGUAGES = {
  VI: 'vi',
  EN: 'en',
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export const CRUD_ACTIONS = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  READ: 'READ',
} as const;

export const manageActions = {
  ADD: 'ADD',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
} as const;

export const dateFormat = {
  SEND_TO_SERVER: 'DD/MM/YYYY',
} as const;

export const YesNoObj = {
  YES: 'Y',
  NO: 'N',
} as const;

export const USER_ROLE = {
  ADMIN: 'R1',
  DOCTOR: 'R2',
  PATIENT: 'R3',
} as const;
