export type Gender = 'Male' | 'Female';
export type StudentStatus = 'Active' | 'Inactive' | 'Pending';
export type CourseStatus = 'Active' | 'Inactive';
export type FeeStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'WAIVED';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Cheque' | 'Other';

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  guardianName: string;
  gender: Gender;
  dob: string;
  phone: string;
  guardianPhone: string;
  email: string;
  address: string;
  courseIds: string[];
  admissionDate: string;
  monthlyFee: number;
  status: StudentStatus;
}

export interface Course {
  id: string;
  name: string;
  monthlyFee: number;
  status: CourseStatus;
}

export interface Payment {
  id: string;
  feeRecordId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  receiptNo: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string; // "2026-08"
  payable: number;
  paid: number;
  remaining: number;
  status: FeeStatus;
  payments: Payment[];
}

export interface Settings {
  academyName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  admissionPrefix: string;
  receiptPrefix: string;
}

export interface AppState {
  isAuthenticated: boolean;
  students: Student[];
  courses: Course[];
  feeRecords: FeeRecord[];
  settings: Settings;
  admissionCounter: number;
  receiptCounter: number;
}

export type AppAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'ADD_FEE_RECORD'; payload: FeeRecord }
  | { type: 'UPDATE_FEE_RECORD'; payload: FeeRecord }
  | { type: 'COLLECT_PAYMENT'; payload: { feeRecordId: string; payment: Payment } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'HYDRATE'; payload: Partial<AppState> };
