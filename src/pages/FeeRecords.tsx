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

  const allMonths = useMemo(() => {
    const set = new Set<string>();
    state.feeRecords.forEach(r => set.add(r.month));
    return [...set].sort().reverse();
  }, [state.feeRecords]);

  const rows = useMemo(() => {
    return state.feeRecords
      .filter(r => {
        const student = state.students.find(s => s.id === r.studentId);
        if (!student) return false;
        if (filterStatus && r.status !== filterStatus) return false;
        if (filterMonth && r.month !== filterMonth) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            student.name.toLowerCase().includes(q) ||
            student.admissionNo.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map(r => {
        const student = state.students.find(s => s.id === r.studentId)!;
        return { ...r, student };
      })
      .sort((a, b) => b.month.localeCompare(a.month) || a.student.name.localeCompare(b.student.name));
  }, [state.feeRecords, state.students, search, filterStatus, filterMonth]);

  const totals = useMemo(() => ({
    payable: rows.reduce((s, r) => s + r.payable, 0),
    paid: rows.reduce((s, r) => s + r.paid, 0),
    remaining: rows.reduce((s, r) => s + r.remaining, 0),
  }), [rows]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Records</h1>
          <p className="page-subtitle">{rows.length} records shown</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Total Payable', value: totals.payable, color: 'text-slate-700' },
          { label: 'Total Collected', value: totals.paid, color: 'text-green-600' },
          { label: 'Total Remaining', value: totals.remaining, color: 'text-red-500' },
        ].map(item => (
          <div key={item.label} className="card px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className={`text-base font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="search-bar flex-1 min-w-[200px]">
          <Search size={15} className="search-icon" />
          <input id="fee-records-search" className="input" placeholder="Search student name or admission no…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto min-w-[130px]" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} id="filter-month">
          <option value="">All Months</option>
          {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="input w-auto min-w-[130px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="filter-fee-status">
          <option value="">All Status</option>
          {['PAID', 'PARTIAL', 'UNPAID', 'WAIVED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterStatus || filterMonth) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterMonth(''); }}>Clear</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Month</th>
                <th>Course</th>
                <th>Payable</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Payments</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No records found</td></tr>
              ) : rows.map(r => {
                const courses = r.student.courseIds.map(courseId => getCourse(courseId)?.name).filter(Boolean);
                return (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-700">{r.student.name}</p>
                        <p className="text-xs text-slate-400">{r.student.admissionNo}</p>
                      </div>
                    </td>
                    <td className="text-slate-600">{r.month}</td>
                    <td className="text-slate-600 text-xs">{courses.join(', ')}</td>
                    <td>{formatCurrency(r.payable)}</td>
                    <td className="text-green-600 font-medium">{formatCurrency(r.paid)}</td>
                    <td className={r.remaining > 0 ? 'text-red-500 font-medium' : 'text-slate-400'}>
                      {formatCurrency(r.remaining)}
                    </td>
                    <td>
                      <span className={`badge ${FEE_STATUS_COLORS[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="text-slate-500">{r.payments.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
