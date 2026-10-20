import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { useApp } from '../context/AppContext';
import { TrendingUp, DollarSign, AlertCircle, Percent } from 'lucide-react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = { PAID: '#22c55e', PARTIAL: '#f59e0b', UNPAID: '#ef4444', WAIVED: '#8b5cf6' };
const COURSE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const { state, getCourse, formatCurrency } = useApp();

  const { expected, collected, outstanding, collectionRate } = useMemo(() => {
    const expected = state.feeRecords.reduce((s, r) => s + r.payable, 0);
    const collected = state.feeRecords.reduce((s, r) => s + r.paid, 0);
    const outstanding = state.feeRecords.reduce((s, r) => s + r.remaining, 0);
    const collectionRate = expected > 0 ? Math.round((collected / expected) * 100) : 0;
    return { expected, collected, outstanding, collectionRate };
  }, [state.feeRecords]);

  const monthlyData = useMemo(() => {
    const allPayments = state.feeRecords.flatMap(r => r.payments);
    const buckets: Record<string, { collected: number; expected: number }> = {};
    state.feeRecords.forEach(r => {
      const m = r.month;
      if (!buckets[m]) buckets[m] = { collected: 0, expected: 0 };
      buckets[m].expected += r.payable;
    });
    allPayments.forEach(p => {
      const m = p.date.slice(0, 7);
      if (!buckets[m]) buckets[m] = { collected: 0, expected: 0 };
      buckets[m].collected += p.amount;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        name: MONTHS_SHORT[parseInt(month.slice(5, 7), 10) - 1] + ' ' + month.slice(2, 4),
        ...data,
      }));
  }, [state.feeRecords]);

  const feeStatusData = useMemo(() => {
    const counts: Record<string, number> = { PAID: 0, PARTIAL: 0, UNPAID: 0, WAIVED: 0 };
    state.feeRecords.forEach(r => { counts[r.status]++; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [state.feeRecords]);

  const courseData = useMemo(() => {
    const data: Record<string, { revenue: number; students: number }> = {};
    state.feeRecords.forEach(r => {
      const student = state.students.find(s => s.id === r.studentId);
      if (!student) return;
      student.courseIds.forEach(courseId => {
        const course = getCourse(courseId);
        if (!course) return;
        if (!data[course.name]) data[course.name] = { revenue: 0, students: 0 };
        data[course.name].revenue += r.paid / student.courseIds.length;
      });
    });
    state.students.forEach(s => {
      s.courseIds.forEach(courseId => {
        const course = getCourse(courseId);
        if (!course) return;
        if (!data[course.name]) data[course.name] = { revenue: 0, students: 0 };
        data[course.name].students++;
      });
    });
    return Object.entries(data).map(([name, v]) => ({ name: name.split(' ').slice(0, 2).join(' '), ...v }));
  }, [state.feeRecords, state.students, getCourse]);

  const admissionsData = useMemo(() => {
    const buckets: Record<string, number> = {};
    state.students.forEach(s => {
      const m = s.admissionDate.slice(0, 7);
      buckets[m] = (buckets[m] || 0) + 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        name: MONTHS_SHORT[parseInt(month.slice(5, 7), 10) - 1] + ' ' + month.slice(2, 4),
        admissions: count,
      }));
  }, [state.students]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Financial and enrollment analytics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Expected Revenue', value: formatCurrency(expected), icon: <DollarSign size={18} className="text-blue-600" />, color: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Collected Revenue', value: formatCurrency(collected), icon: <TrendingUp size={18} className="text-green-600" />, color: 'bg-green-50', text: 'text-green-600' },
          { label: 'Outstanding Revenue', value: formatCurrency(outstanding), icon: <AlertCircle size={18} className="text-red-500" />, color: 'bg-red-50', text: 'text-red-600' },
          { label: 'Collection Rate', value: `${collectionRate}%`, icon: <Percent size={18} className="text-teal-600" />, color: 'bg-teal-50', text: 'text-teal-600' },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.text}`}>{item.value}</p>
              </div>
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Collections Chart */}
      <div className="card min-w-0 p-4 sm:p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Expected vs Collected (Monthly)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v, name) => [`Rs ${Number(v ?? 0).toLocaleString()}`, name === 'expected' ? 'Expected' : 'Collected']}
              contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
            <Bar dataKey="expected" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={18} name="Expected" />
            <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} name="Collected" />
            <Legend formatter={v => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-5">
        {/* Fee Status Distribution */}
        <div className="card min-w-0 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Fee Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={feeStatusData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {feeStatusData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#94a3b8'} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Course Revenue */}
        <div className="card min-w-0 p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Course-wise Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courseData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={v => [`Rs ${Number(v ?? 0).toLocaleString()}`, 'Revenue']}
                contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {courseData.map((_, i) => (
                  <Cell key={i} fill={COURSE_COLORS[i % COURSE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Admissions Trend */}
      <div className="card min-w-0 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Admissions Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={admissionsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            <Line type="monotone" dataKey="admissions" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} name="Admissions" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
