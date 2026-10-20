import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OutstandingFees() {
  const { state, getCourse, formatCurrency } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const allMonths = useMemo(() => {
    const set = new Set<string>();
    state.feeRecords.forEach(r => set.add(r.month));
    return [...set].sort().reverse();
  }, [state.feeRecords]);

  const outstandingRecords = useMemo(() => {
    return state.feeRecords
      .filter(r => (r.status === 'PARTIAL' || r.status === 'UNPAID'))
      .filter(r => {
        if (filterMonth && r.month !== filterMonth) return false;
        const s = state.students.find(st => st.id === r.studentId);
        if (!s) return false;
        if (search) {
          const q = search.toLowerCase();
          return s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q);
        }
        return true;
      })
      .map(r => {
        const student = state.students.find(s => s.id === r.studentId)!;
        return { ...r, student };
      })
      .sort((a, b) => b.remaining - a.remaining);
  }, [state.feeRecords, state.students, search, filterMonth]);

  const totalOutstanding = outstandingRecords.reduce((s, r) => s + r.remaining, 0);
  const partialCount = outstandingRecords.filter(r => r.status === 'PARTIAL').length;
  const unpaidCount = outstandingRecords.filter(r => r.status === 'UNPAID').length;
  const studentsWithDues = new Set(outstandingRecords.map(r => r.studentId)).size;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Outstanding Fees</h1>
          <p className="page-subtitle">Pending and partial fee records</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Outstanding', value: formatCurrency(totalOutstanding), color: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle size={18} className="text-red-500" /> },
          { label: 'Students with Dues', value: String(studentsWithDues), color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertCircle size={18} className="text-orange-500" /> },
          { label: 'Partial Payments', value: String(partialCount), color: 'text-yellow-700', bg: 'bg-yellow-50', icon: <AlertCircle size={18} className="text-yellow-500" /> },
          { label: 'Unpaid Students', value: String(unpaidCount), color: 'text-red-700', bg: 'bg-red-50', icon: <AlertCircle size={18} className="text-red-400" /> },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </div>
              <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center`}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="search-bar flex-1 min-w-[200px]">
          <Search size={15} className="search-icon" />
          <input id="outstanding-search" className="input" placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto min-w-[130px]" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">All Months</option>
          {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {(search || filterMonth) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterMonth(''); }}>Clear</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Month</th>
                <th>Due</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {outstandingRecords.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No outstanding fees 🎉</td></tr>
              ) : outstandingRecords.map(r => {
                const courses = r.student.courseIds.map(courseId => getCourse(courseId)?.name).filter(Boolean);
                return (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-700">{r.student.name}</p>
                        <p className="text-xs text-slate-400">{r.student.admissionNo}</p>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{courses.join(', ')}</td>
                    <td className="text-slate-600">{r.month}</td>
                    <td>{formatCurrency(r.payable)}</td>
                    <td className="text-green-600">{formatCurrency(r.paid)}</td>
                    <td className="font-semibold text-red-600">{formatCurrency(r.remaining)}</td>
                    <td>
                      <span className={`badge ${r.status === 'PARTIAL' ? 'badge-yellow' : 'badge-red'}`}>{r.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/collect-fee', { state: { studentId: r.studentId } })}
                        id={`collect-outstanding-${r.id}`}
                      >
                        <CreditCard size={12} /> Collect
                      </button>
                    </td>
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
