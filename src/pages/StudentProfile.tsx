import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, User, BookOpen, CreditCard, FileText, Edit2, Save, X,
  Calendar, Phone, Mail, MapPin, Award, Hash, DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_MONTHLY_FEE } from '../data/mockData';
import type { Student } from '../types';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  Active: 'badge-green', Inactive: 'badge-gray', Pending: 'badge-yellow',
};
const FEE_STATUS_COLORS: Record<string, string> = {
  PAID: 'badge-green', PARTIAL: 'badge-yellow', UNPAID: 'badge-red', WAIVED: 'badge-purple',
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { state, dispatch, getCourse, getStudentFeeRecords, formatCurrency } = useApp();
  const navigate = useNavigate();

  const student = state.students.find(s => s.id === id);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'edit' ? 'edit' : 'overview');
  const [editForm, setEditForm] = useState<Partial<Student>>(student || {});

  const feeRecords = useMemo(() => student ? getStudentFeeRecords(student.id) : [], [student, state.feeRecords]);
  const totalPaid = feeRecords.reduce((sum, r) => sum + r.paid, 0);
  const totalOutstanding = feeRecords.reduce((sum, r) => sum + r.remaining, 0);

  if (!student) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-medium">Student not found</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/students')}>Back to Students</button>
      </div>
    );
  }

  const enrolledCourses = student.courseIds.map(courseId => getCourse(courseId)?.name).filter(Boolean);

  const handleSave = () => {
    if (!editForm.name || !editForm.courseIds?.length) { toast.error('Name and at least one course are required'); return; }
    const updated: Student = {
      ...student,
      ...editForm,
      monthlyFee: editForm.courseIds.length * COURSE_MONTHLY_FEE,
    } as Student;
    dispatch({ type: 'UPDATE_STUDENT', payload: updated });
    toast.success('Student updated successfully');
    setActiveTab('overview');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={14} /> },
    { id: 'fee-history', label: 'Fee History', icon: <FileText size={14} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
    { id: 'admission', label: 'Admission Details', icon: <Award size={14} /> },
    { id: 'edit', label: 'Edit', icon: <Edit2 size={14} /> },
  ];

  const allPayments = feeRecords.flatMap(r => r.payments.map(p => ({ ...p, month: r.month })));

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-1" onClick={() => navigate('/students')}>
            <ArrowLeft size={14} /> All Students
          </button>
          <h1 className="page-title">{student.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge badge-blue">{student.admissionNo}</span>
            <span className={`badge ${STATUS_COLORS[student.status]}`}>{student.status}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/collect-fee', { state: { studentId: student.id } })}>
          <CreditCard size={16} /> Collect Fee
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Monthly Fee', value: formatCurrency(student.monthlyFee), color: 'text-blue-600' },
          { label: 'Total Paid', value: formatCurrency(totalPaid), color: 'text-green-600' },
          { label: 'Outstanding', value: formatCurrency(totalOutstanding), color: 'text-red-500' },
          { label: 'Fee Records', value: String(feeRecords.length), color: 'text-slate-700' },
        ].map(item => (
          <div key={item.label} className="card px-4 py-3">
            <p className="text-xs text-slate-400 font-medium mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="tabs overflow-x-auto px-2 pt-2 sm:px-4">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="section-title">Personal Information</p>
                <InfoRow icon={<User size={14} />} label="Full Name" value={student.name} />
                <InfoRow icon={<User size={14} />} label="Guardian" value={student.guardianName} />
                <InfoRow icon={<User size={14} />} label="Gender" value={student.gender} />
                <InfoRow icon={<Calendar size={14} />} label="Date of Birth" value={student.dob} />
                <InfoRow icon={<Phone size={14} />} label="Phone" value={student.phone} />
                <InfoRow icon={<Phone size={14} />} label="Guardian Phone" value={student.guardianPhone} />
                <InfoRow icon={<Mail size={14} />} label="Email" value={student.email} />
                <InfoRow icon={<MapPin size={14} />} label="Address" value={student.address} />
              </div>
              <div>
                <p className="section-title">Academic Information</p>
                <InfoRow icon={<BookOpen size={14} />} label="Courses" value={enrolledCourses.join(', ')} />
                <InfoRow icon={<Calendar size={14} />} label="Admission Date" value={student.admissionDate} />
                <InfoRow icon={<Hash size={14} />} label="Admission No" value={student.admissionNo} />
                <p className="section-title mt-6">Fee Information</p>
                <InfoRow icon={<DollarSign size={14} />} label="Monthly Fee" value={formatCurrency(student.monthlyFee)} />
              </div>
            </div>
          )}

          {/* Fee History Tab */}
          {activeTab === 'fee-history' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Payable</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRecords.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">No fee records yet</td></tr>
                  ) : feeRecords.sort((a, b) => b.month.localeCompare(a.month)).map(r => (
                    <tr key={r.id}>
                      <td className="font-medium">{r.month}</td>
                      <td>{formatCurrency(r.payable)}</td>
                      <td className="text-green-600 font-medium">{formatCurrency(r.paid)}</td>
                      <td className={r.remaining > 0 ? 'text-red-500 font-medium' : 'text-slate-400'}>{formatCurrency(r.remaining)}</td>
                      <td><span className={`badge ${FEE_STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                      <td className="text-slate-500">{r.payments.length} payment(s)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">No payments recorded</td></tr>
                  ) : allPayments.sort((a, b) => b.date.localeCompare(a.date)).map(p => (
                    <tr key={p.id}>
                      <td><span className="badge badge-blue text-xs">{p.receiptNo}</span></td>
                      <td>{p.month}</td>
                      <td className="font-semibold text-green-600">{formatCurrency(p.amount)}</td>
                      <td><span className="badge badge-gray">{p.method}</span></td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Admission Details Tab */}
          {activeTab === 'admission' && (
            <div className="max-w-lg">
              <div className="space-y-3">
                {[
                  ['Admission No', student.admissionNo],
                  ['Admission Date', student.admissionDate],
                  ['Courses', enrolledCourses.join(', ')],
                  ['Monthly Fee', formatCurrency(student.monthlyFee)],
                  ['Monthly Fee per Course', formatCurrency(COURSE_MONTHLY_FEE)],
                  ['Status', student.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-medium text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div className="form-grid">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Guardian Name</label>
                  <input className="input" value={editForm.guardianName || ''} onChange={e => setEditForm(f => ({ ...f, guardianName: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Guardian Phone</label>
                  <input className="input" value={editForm.guardianPhone || ''} onChange={e => setEditForm(f => ({ ...f, guardianPhone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={editForm.status || 'Active'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Student['status'] }))}>
                    <option>Active</option><option>Pending</option><option>Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <input className="input" value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Courses ({formatCurrency(COURSE_MONTHLY_FEE)} per course / month)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {state.courses.map(course => (
                      <label key={course.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={editForm.courseIds?.includes(course.id) || false}
                          onChange={e => setEditForm(f => ({
                            ...f,
                            courseIds: e.target.checked
                              ? [...(f.courseIds || []), course.id]
                              : (f.courseIds || []).filter(courseId => courseId !== course.id),
                          }))}
                        />
                        {course.name}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    New monthly fee: {formatCurrency((editForm.courseIds?.length || 0) * COURSE_MONTHLY_FEE)}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={() => { setEditForm(student); setActiveTab('overview'); }}>
                  <X size={14} /> Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
