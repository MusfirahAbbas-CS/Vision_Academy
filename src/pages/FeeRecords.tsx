import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FEE_STATUS_COLORS: Record<string, string> = {
  PAID: 'badge-green', PARTIAL: 'badge-yellow', UNPAID: 'badge-red', WAIVED: 'badge-purple',
};

export default function FeeRecords() {
  const { state, getCourse, formatCurrency } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const allMonths = useMemo(() => [...new Set(state.feeRecords.map(record => record.month))].sort().reverse(), [state.feeRecords]);
  const rows = useMemo(() => state.feeRecords
    .filter(record => {
      const student = state.students.find(s => s.id === record.studentId);
      if (!student) return false;
      if (filterStatus && record.status !== filterStatus) return false;
      if (filterMonth && record.month !== filterMonth) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      return student.name.toLowerCase().includes(query) || student.admissionNo.toLowerCase().includes(query);
    })
    .map(record => ({ ...record, student: state.students.find(s => s.id === record.studentId)! }))
    .sort((a, b) => b.month.localeCompare(a.month) || a.student.name.localeCompare(b.student.name)),
  [state.feeRecords, state.students, search, filterStatus, filterMonth]);

  const totals = useMemo(() => ({
    payable: rows.reduce((sum, row) => sum + row.payable, 0),
    paid: rows.reduce((sum, row) => sum + row.paid, 0),
    remaining: rows.reduce((sum, row) => sum + row.remaining, 0),
  }), [rows]);

  const courseNames = (student: typeof rows[number]['student']) =>
    student.courseIds.map(courseId => getCourse(courseId)?.name).filter(Boolean).join(', ');

  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterMonth(''); };

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <div><h1 className="page-title">Fee Records</h1><p className="page-subtitle">{rows.length} records shown</p></div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Payable', value: totals.payable, color: 'text-slate-700' },
          { label: 'Total Collected', value: totals.paid, color: 'text-green-600' },
          { label: 'Total Remaining', value: totals.remaining, color: 'text-red-500' },
        ].map(item => (
          <div key={item.label} className="card px-4 py-3">
            <p className="mb-1 text-xs text-slate-500">{item.label}</p>
            <p className={`text-base font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="card mb-4 grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-3">
        <div className="search-bar min-w-0">
          <Search size={15} className="search-icon" />
          <input id="fee-records-search" className="input" placeholder="Search student name or admission no…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-full min-w-0" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} id="filter-month">
          <option value="">All Months</option>
          {allMonths.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
        <select className="input w-full min-w-0" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="filter-fee-status">
          <option value="">All Status</option>
          {['PAID', 'PARTIAL', 'UNPAID', 'WAIVED'].map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        {(search || filterStatus || filterMonth) && (
          <button className="btn btn-secondary w-full md:col-span-3 md:w-auto md:justify-self-end" onClick={clearFilters}>Clear</button>
        )}
      </div>

      <div className="card hidden md:block">
        <div className="table-wrapper border-0 rounded-none">
          <table>
            <thead><tr><th>Student</th><th>Month</th><th>Course</th><th>Payable</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Payments</th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">No records found</td></tr>
              ) : rows.map(record => (
                <tr key={record.id}>
                  <td><p className="font-medium text-slate-700">{record.student.name}</p><p className="text-xs text-slate-500">{record.student.admissionNo}</p></td>
                  <td className="text-slate-600">{record.month}</td>
                  <td className="text-slate-600">{courseNames(record.student)}</td>
                  <td>{formatCurrency(record.payable)}</td>
                  <td className="font-medium text-green-600">{formatCurrency(record.paid)}</td>
                  <td className={record.remaining > 0 ? 'font-medium text-red-500' : 'text-slate-500'}>{formatCurrency(record.remaining)}</td>
                  <td><span className={`badge ${FEE_STATUS_COLORS[record.status]}`}>{record.status}</span></td>
                  <td className="text-slate-500">{record.payments.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <div className="card p-6 text-center text-slate-400">No records found</div>
        ) : rows.map(record => (
          <article key={record.id} className="card min-w-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words font-semibold text-slate-800">{record.student.name}</h2>
                <p className="text-sm text-slate-500">{record.student.admissionNo} · {record.month}</p>
                <p className="mt-1 break-words text-sm text-slate-600">{courseNames(record.student)}</p>
              </div>
              <span className={`badge shrink-0 ${FEE_STATUS_COLORS[record.status]}`}>{record.status}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
              <div><dt className="text-slate-500">Payable</dt><dd className="font-medium">{formatCurrency(record.payable)}</dd></div>
              <div><dt className="text-slate-500">Paid</dt><dd className="font-medium text-green-600">{formatCurrency(record.paid)}</dd></div>
              <div><dt className="text-slate-500">Remaining</dt><dd className={`font-medium ${record.remaining > 0 ? 'text-red-500' : 'text-slate-700'}`}>{formatCurrency(record.remaining)}</dd></div>
              <div><dt className="text-slate-500">Payments</dt><dd className="font-medium">{record.payments.length}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
