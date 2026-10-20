import type { Course, Student, FeeRecord, Payment, Settings } from '../types';

export const COURSE_MONTHLY_FEE = 1200;

export const mockCourses: Course[] = [
  { id: 'c1', name: 'Physics', monthlyFee: COURSE_MONTHLY_FEE, status: 'Active' },
  { id: 'c2', name: 'Math', monthlyFee: COURSE_MONTHLY_FEE, status: 'Active' },
  { id: 'c3', name: 'Chemistry', monthlyFee: COURSE_MONTHLY_FEE, status: 'Active' },
  { id: 'c4', name: 'Biology', monthlyFee: COURSE_MONTHLY_FEE, status: 'Active' },
  { id: 'c5', name: 'Computer', monthlyFee: COURSE_MONTHLY_FEE, status: 'Active' },
];

const studentNames = [
  'Ali Khan', 'Ayesha Malik', 'Hassan Ahmed', 'Fatima Hussain', 'Bilal Sheikh',
  'Sara Qureshi', 'Usman Ali', 'Zainab Akhtar', 'Omar Siddiqui', 'Maryam Raza',
  'Hamza Chaudhry', 'Noor Javed', 'Talha Iqbal', 'Hina Abbasi', 'Saad Mirza',
  'Iqra Ansari', 'Ahmed Nawaz', 'Sana Butt', 'Imran Hashmi', 'Amna Baig',
];

const courseEnrollments = [
  ['c1'], ['c2'], ['c3'], ['c4'], ['c5'],
  ['c1', 'c2'], ['c2', 'c3'], ['c3', 'c4'], ['c4', 'c5'], ['c1', 'c5'],
  ['c1', 'c3'], ['c2', 'c4'], ['c3', 'c5'], ['c1', 'c4'], ['c2', 'c5'],
  ['c1', 'c2', 'c3'], ['c2', 'c3', 'c4'], ['c3', 'c4', 'c5'],
  ['c1', 'c4', 'c5'], ['c1', 'c2', 'c3', 'c4', 'c5'],
];

export function generateStudents(): Student[] {
  return studentNames.map((name, index) => ({
    id: `s${index + 1}`,
    admissionNo: `ADM-2026-${String(index + 1).padStart(4, '0')}`,
    name,
    guardianName: `${name.split(' ')[0]} Guardian`,
    gender: index % 2 === 0 ? 'Male' : 'Female',
    dob: `${2000 + (index % 8)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
    phone: `0300${String(1000000 + index).padStart(7, '0')}`,
    guardianPhone: `0310${String(2000000 + index).padStart(7, '0')}`,
    email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
    address: `House ${index + 1}, Lahore`,
    courseIds: courseEnrollments[index],
    admissionDate: `2026-${String((index % 9) + 1).padStart(2, '0')}-01`,
    monthlyFee: courseEnrollments[index].length * COURSE_MONTHLY_FEE,
    status: 'Active',
  }));
}

export function generateFeeRecords(students: Student[]): FeeRecord[] {
  const records: FeeRecord[] = [];
  const months = ['2026-08', '2026-09', '2026-10'];

  students.forEach((student, studentIndex) => {
    months.forEach((month, monthIndex) => {
      const payable = student.monthlyFee;
      const scenario = (studentIndex + monthIndex) % 4;
      const paid = scenario === 0 ? payable : scenario === 1 ? Math.round(payable / 2) : 0;
      const payments: Payment[] = paid > 0 ? [{
        id: `pay-${student.id}-${month}`,
        feeRecordId: `fr-${student.id}-${month}`,
        studentId: student.id,
        amount: paid,
        method: 'Cash',
        date: `${month}-${scenario === 0 ? '10' : '05'}`,
        receiptNo: `REC-2026-${String(records.length + 1).padStart(4, '0')}`,
      }] : [];

      records.push({
        id: `fr-${student.id}-${month}`,
        studentId: student.id,
        month,
        payable,
        paid,
        remaining: payable - paid,
        status: paid === payable ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID',
        payments,
      });
    });
  });

  return records;
}

export const defaultSettings: Settings = {
  academyName: 'Vision Academy',
  phone: '03001234567',
  email: 'info@visionacademy.pk',
  address: 'Plot 12, Main Boulevard, Lahore, Pakistan',
  currency: 'PKR',
  admissionPrefix: 'ADM',
  receiptPrefix: 'REC',
};
