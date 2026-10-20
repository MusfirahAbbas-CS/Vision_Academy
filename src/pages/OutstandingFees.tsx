import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OutstandingFees() {
  const { state, getCourse, formatCurrency } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const allMonths = useMemo(() => [...new Set(state.feeRecords.map(record => record.month))].sort().reverse(), [state.feeRecords]);
  const outstandingRecords = useMemo(() => state.feeRecords
    .filter(record => record.status === 'PARTIAL' || record.status === 'UNPAID')
    .filter(record => {
      if (filterMonth && record.month !== filterMonth) return false;
      const student = state.students.find(item => item.id === record.studentId);
      if (!student) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      return student.name.toLowerCase().includes(query) || student.admissionNo.toLowerCase().includes(query);
    })
    .map(record => ({ ...record, student: state.students.find(item => item.id === record.studentId)! }))
    .sort((a, b) => b.remaining - a.remaining),
  [state.feeRecords, state.students, search, filterMonth]);

  const totalOutstanding = outstandingRecords.reduce((sum, record) => sum + record.remaining, 0);
  const partialCount = outstandingRecords.filter(record => record.status === 'PARTIAL').length;
  const unpaidCount = outstandingRecords.filter(record => record.status === 'UNPAID').length;
  const studentsWithDues = new Set(outstandingRecords.map(record => record.studentId)).size;
  const courseNames = (student: typeof outstandingRecords[number]['student']) =>
    student.courseIds.map(courseId => getCourse(courseId)?.name).filter(Boolean).join(', ');
  const clearFilters = () => { setSearch(''); setFilterMonth(''); };
  const collectFee = (studentId: string) => navigate('/collect-fee', { state: { studentId } });

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <div><h1 className="page-title">Outstanding Fees</h1><p className="page-subtitle">Pending and partial fee records</p></div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Outstanding', value: formatCurrency(totalOutstanding), color: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle size={18} className="text-red-500" /> },
          { label: 'Students with Dues', value: String(studentsWithDues), color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertCircle size={18} className="text-orange-500" /> },
          { label: 'Partial Payments', value: String(partialCount), color: 'text-yellow-700', bg: 'bg-yellow-50', icon: <AlertCircle size={18} className="text-yellow-500" /> },
          { label: 'Unpaid Students', value: String(unpaidCount), color: 'text-red-700', bg: 'bg-red-50', icon: <AlertCircle size={18} className="text-red-400" /> },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className="flex items-start justify-between gap-2">
              <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p><p className={`text-xl font-bold ${item.color}`}>{item.value}</p></div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4 grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2">
        <div className="search-bar min-w-0">
          <Search size={15} className="search-icon" />
          <input id="outstanding-search" className="input" placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-full min-w-0" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} id="outstanding-filter-month">
          <option value="">All Months</option>
          {allMonths.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
        {(search || filterMonth) && <button className="btn btn-secondary w-full md:col-span-2 md:w-auto md:justify-self-end" onClick={clearFilters}>Clear</button>}
      </div>

      <div className="card hidden md:block">
        <div className="table-wrapper border-0 rounded-none">
          <table>
            <thead><tr><th>Student</th><th>Course</th><th>Month</th><th>Due</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {outstandingRecords.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-500">No outstanding fees 🎉</td></tr>
              ) : outstandingRecords.map(record => (
                <tr key={record.id}>
                  <td><p className="font-medium text-slate-700">{record.student.name}</p><p className="text-xs text-slate-500">{record.student.admissionNo}</p></td>
                  <td className="text-slate-600">{courseNames(record.student)}</td>
                  <td className="text-slate-600">{record.month}</td>
                  <td>{formatCurrency(record.payable)}</td>
                  <td className="text-green-600">{formatCurrency(record.paid)}</td>
                  <td className="font-semibold text-red-600">{formatCurrency(record.remaining)}</td>
                  <td><span className={`badge ${record.status === 'PARTIAL' ? 'badge-yellow' : 'badge-red'}`}>{record.status}</span></td>
                  <td><button className="btn btn-primary" onClick={() => collectFee(record.studentId)} id={`collect-outstanding-${record.id}`}><CreditCard size={16} /> Collect</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {outstandingRecords.length === 0 ? (
          <div className="card p-6 text-center text-slate-500">No outstanding fees 🎉</div>
        ) : outstandingRecords.map(record => (
          <article key={record.id} className="card min-w-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words font-semibold text-slate-800">{record.student.name}</h2>
                <p className="text-sm text-slate-500">{record.student.admissionNo} · {record.month}</p>
                <p className="mt-1 break-words text-sm text-slate-600">{courseNames(record.student)}</p>
              </div>
              <span className={`badge shrink-0 ${record.status === 'PARTIAL' ? 'badge-yellow' : 'badge-red'}`}>{record.status}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
              <div><dt className="text-slate-500">Due</dt><dd className="font-medium">{formatCurrency(record.payable)}</dd></div>
              <div><dt className="text-slate-500">Paid</dt><dd className="font-medium text-green-600">{formatCurrency(record.paid)}</dd></div>
              <div><dt className="text-slate-500">Remaining</dt><dd className="font-semibold text-red-600">{formatCurrency(record.remaining)}</dd></div>
            </dl>
            <button className="btn btn-primary mt-4 w-full justify-center" onClick={() => collectFee(record.studentId)} id={`collect-outstanding-mobile-${record.id}`}>
              <CreditCard size={16} /> Collect Fee
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
