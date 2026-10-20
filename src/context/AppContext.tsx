import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { AppState, AppAction, Student, Course, FeeRecord } from '../types';
import { mockCourses, generateStudents, generateFeeRecords, defaultSettings } from '../data/mockData';

const STORAGE_KEY = 'visionAcademy_state_v2';

// ─── Seed ─────────────────────────────────────────────────────────────────────
function seedInitialState(): AppState {
  const students = generateStudents();
  const feeRecords = generateFeeRecords(students);
  return {
    isAuthenticated: false,
    students,
    courses: mockCourses,
    feeRecords,
    settings: defaultSettings,
    admissionCounter: students.length + 1,
    receiptCounter: feeRecords.flatMap(r => r.payments).length + 1,
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Keep isAuthenticated false on cold start (fresh tab)
    return { ...seedInitialState(), ...parsed, isAuthenticated: false };
  } catch {
    return seedInitialState();
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded */ }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };

    case 'ADD_STUDENT':
      return {
        ...state,
        students: [...state.students, action.payload],
        admissionCounter: state.admissionCounter + 1,
      };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(s => s.id === action.payload.id ? action.payload : s),
      };

    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c),
      };

    case 'ADD_FEE_RECORD':
      return { ...state, feeRecords: [...state.feeRecords, action.payload] };
    case 'UPDATE_FEE_RECORD':
      return {
        ...state,
        feeRecords: state.feeRecords.map(r => r.id === action.payload.id ? action.payload : r),
      };

    case 'COLLECT_PAYMENT': {
      const { feeRecordId, payment } = action.payload;
      const newFeeRecords = state.feeRecords.map(r => {
        if (r.id !== feeRecordId) return r;
        const newPaid = r.paid + payment.amount;
        const newRemaining = r.payable - newPaid;
        const newStatus: FeeRecord['status'] = newRemaining <= 0 ? 'PAID' : 'PARTIAL';
        return {
          ...r,
          paid: newPaid,
          remaining: Math.max(0, newRemaining),
          status: newStatus,
          payments: [...r.payments, payment],
        };
      });
      return {
        ...state,
        feeRecords: newFeeRecords,
        receiptCounter: state.receiptCounter + 1,
      };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'HYDRATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  // Helper selectors
  getStudent: (id: string) => Student | undefined;
  getCourse: (id: string) => Course | undefined;
  getStudentFeeRecords: (studentId: string) => FeeRecord[];
  formatCurrency: (amount: number) => string;
  nextAdmissionNo: () => string;
  nextReceiptNo: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  // Persist to localStorage on every state change (skip auth field)
  useEffect(() => {
    saveState(state);
  }, [state]);

  const getStudent = (id: string) => state.students.find(s => s.id === id);
  const getCourse = (id: string) => state.courses.find(c => c.id === id);
  const getStudentFeeRecords = (studentId: string) => state.feeRecords.filter(r => r.studentId === studentId);

  const formatCurrency = (amount: number) =>
    `Rs ${amount.toLocaleString('en-PK')}`;

  const nextAdmissionNo = () => {
    const year = new Date().getFullYear();
    return `${state.settings.admissionPrefix}-${year}-${String(state.admissionCounter).padStart(4, '0')}`;
  };

  const nextReceiptNo = () => {
    const year = new Date().getFullYear();
    return `${state.settings.receiptPrefix}-${year}-${String(state.receiptCounter).padStart(4, '0')}`;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getStudent, getCourse, getStudentFeeRecords, formatCurrency, nextAdmissionNo, nextReceiptNo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
