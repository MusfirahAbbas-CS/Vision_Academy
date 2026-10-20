import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Banknote, TrendingUp, AlertCircle,
  UserPlus, Clock, Percent, ArrowRight, CreditCard
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = { PAID: '#22c55e', PARTIAL: '#f59e0b', UNPAID: '#ef4444', WAIVED: '#8b5cf6' };

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, getCourse, formatCurrency } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = state.students.length;
    const active = state.students.filter(s => s.status === 'Active').length;
    const pending = state.students.filter(s => s.status === 'Pending').length;

    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.slice(0, 7); // "2026-10"
    const allPayments = state.feeRecords.flatMap(r => r.payments);

    const todayCollection = allPayments
      .filter(p => p.date === today)
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyCollection = allPayments
      .filter(p => p.date.startsWith(thisMonth))
      .reduce((sum, p) => sum + p.amount, 0);

    const outstanding = state.feeRecords
      .filter(r => r.status !== 'PAID' && r.status !== 'WAIVED')
      .reduce((sum, r) => sum + r.remaining, 0);

    const newAdmissions = state.students
      .filter(s => s.admissionDate.startsWith(thisMonth)).length;

    const totalExpected = state.feeRecords.reduce((sum, r) => sum + r.payable, 0);
    const totalCollected = state.feeRecords.reduce((sum, r) => sum + r.paid, 0);
    const collectionRate = totalExpected > 0
      ? Math.round((totalCollected / totalExpected) * 100)
      : 0;

    return { total, active, pending, todayCollection, monthlyCollection, outstanding, newAdmissions, collectionRate };
  }, [state]);

  // Monthly collection chart data (last 6 months up to current)
  const monthlyChartData = useMemo(() => {
    const allPayments = state.feeRecords.flatMap(r => r.payments);
    const buckets: Record<string, number> = {};
    allPayments.forEach(p => {
      const m = p.date.slice(0, 7);
      buckets[m] = (buckets[m] || 0) + p.amount;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        name: MONTHS_SHORT[parseInt(month.slice(5, 7), 10) - 1] + ' ' + month.slice(2, 4),
        amount,
      }));
  }, [state.feeRecords]);

  // Fee status pie
  const feeStatusData = useMemo(() => {
    const counts: Record<string, number> = { PAID: 0, PARTIAL: 0, UNPAID: 0, WAIVED: 0 };
    state.feeRecords.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [state.feeRecords]);

  // Course-wise revenue
  const courseRevenueData = useMemo(() => {
    const courseMap: Record<string, number> = {};
    state.feeRecords.forEach(r => {
      const student = state.students.find(s => s.id === r.studentId);
      if (!student) return;
      student.courseIds.forEach(courseId => {
        const course = getCourse(courseId);
        if (!course) return;
        courseMap[course.name] = (courseMap[course.name] || 0) + r.paid / student.courseIds.length;
      });
    });
    return Object.entries(courseMap).map(([name, revenue]) => ({ name: name.split(' ')[0], revenue }));
  }, [state.feeRecords, state.students, getCourse]);

  // Recent payments
  const recentPayments = useMemo(() => {
    return state.feeRecords
      .flatMap(r => r.payments.map(p => ({ ...p, month: r.month })))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);
  }, [state.feeRecords]);

  // Outstanding students
  const outstandingStudents = useMemo(() => {
    const studentOutstanding: Record<string, { name: string; admissionNo: string; amount: number; records: number }> = {};
    state.feeRecords
      .filter(r => r.remaining > 0 && r.status !== 'WAIVED')
      .forEach(r => {
        const s = state.students.find(st => st.id === r.studentId);
        if (!s) return;
        if (!studentOutstanding[s.id]) {
          studentOutstanding[s.id] = { name: s.name, admissionNo: s.admissionNo, amount: 0, records: 0 };
        }
        studentOutstanding[s.id].amount += r.remaining;
        studentOutstanding[s.id].records += 1;
      });
    return Object.values(studentOutstanding)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [state.feeRecords, state.students]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of academy performance</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/students/new')}>
          <UserPlus size={16} /> New Admission
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={<Users size={18} className="text-blue-600" />} label="Total Students" value={String(stats.total)} color="bg-blue-50" />
        <StatCard icon={<UserCheck size={18} className="text-green-600" />} label="Active Students" value={String(stats.active)} color="bg-green-50" />
        <StatCard icon={<Banknote size={18} className="text-emerald-600" />} label="Today's Collection" value={formatCurrency(stats.todayCollection)} color="bg-emerald-50" />
        <StatCard icon={<TrendingUp size={18} className="text-indigo-600" />} label="Monthly Collection" value={formatCurrency(stats.monthlyCollection)} color="bg-indigo-50" />
        <StatCard icon={<AlertCircle size={18} className="text-red-500" />} label="Outstanding Fees" value={formatCurrency(stats.outstanding)} color="bg-red-50" />
        <StatCard icon={<UserPlus size={18} className="text-purple-600" />} label="New Admissions" value={String(stats.newAdmissions)} sub="This month" color="bg-purple-50" />
        <StatCard icon={<Clock size={18} className="text-yellow-600" />} label="Pending Students" value={String(stats.pending)} color="bg-yellow-50" />
        <StatCard icon={<Percent size={18} className="text-teal-600" />} label="Collection Rate" value={`${stats.collectionRate}%`} color="bg-teal-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Monthly Collection */}
        <div className="card min-w-0 p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Fee Collection</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={v => [`Rs ${Number(v ?? 0).toLocaleString()}`, 'Collected']}
                contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Status Pie */}
        <div className="card min-w-0 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Fee Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={feeStatusData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {feeStatusData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#94a3b8'} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>}
              />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Revenue + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="card min-w-0 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Course-wise Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={courseRevenueData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                formatter={v => [`Rs ${Number(v ?? 0).toLocaleString()}`, 'Revenue']}
                contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Payments */}
        <div className="card min-w-0 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Recent Payments</h3>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={() => navigate('/fee-records')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentPayments.map(p => {
              const student = state.students.find(s => s.id === p.studentId);
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center">
                      <CreditCard size={13} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{student?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{p.receiptNo} · {p.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outstanding Students */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Outstanding Students</h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={() => navigate('/outstanding')}>
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="table-wrapper border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                <th>Months Due</th>
                <th>Outstanding</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {outstandingStudents.map(s => (
                <tr key={s.admissionNo}>
                  <td className="font-medium text-slate-700">{s.name}</td>
                  <td><span className="badge badge-gray">{s.admissionNo}</span></td>
                  <td>{s.records}</td>
                  <td className="font-semibold text-red-600">{formatCurrency(s.amount)}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/collect-fee')}
                    >
                      <CreditCard size={12} /> Collect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
