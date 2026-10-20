import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Eye, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Student } from '../types';

const STATUS_COLORS: Record<string, string> = {
  Active: 'badge-green',
  Inactive: 'badge-gray',
  Pending: 'badge-yellow',
};

export default function Students() {
  const { state, getCourse } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const filtered = useMemo(() => {
    let list = state.students;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.guardianName.toLowerCase().includes(q)
      );
    }
    if (filterStatus) list = list.filter(s => s.status === filterStatus);
    if (filterCourse) list = list.filter(s => s.courseIds.includes(filterCourse));
    return list;
  }, [state.students, search, filterStatus, filterCourse]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{filtered.length} of {state.students.length} students</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/students/new')}>
          <UserPlus size={16} /> New Admission
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="search-bar flex-1 min-w-[200px]">
          <Search size={15} className="search-icon" />
          <input
            className="input"
            placeholder="Search by name, admission no, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="student-search"
          />
        </div>
        <select
          className="input w-auto min-w-[140px]"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          id="filter-status"
        >
          <option value="">All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Inactive</option>
        </select>
        <select
          className="input w-auto min-w-[160px]"
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
          id="filter-course"
        >
          <option value="">All Courses</option>
          {state.courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {(filterStatus || filterCourse || search) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterCourse(''); }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Guardian</th>
                <th>Course</th>
                <th>Phone</th>
                <th>Monthly Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">No students found</td>
                </tr>
              ) : filtered.map((s: Student) => {
                const courses = s.courseIds.map(id => getCourse(id)?.name).filter(Boolean);
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="badge badge-blue">{s.admissionNo}</span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-700">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.gender} · {s.dob}</p>
                      </div>
                    </td>
                    <td className="text-slate-600">{s.guardianName}</td>
                    <td className="text-slate-600">{courses.join(', ') || '—'}</td>
                    <td className="text-slate-600">{s.phone}</td>
                    <td className="font-medium">
                      Rs {s.monthlyFee.toLocaleString()} / month
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[s.status] || 'badge-gray'}`}>{s.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="btn btn-icon btn-secondary btn-sm"
                          title="View Profile"
                          onClick={() => navigate(`/students/${s.id}`)}
                          id={`view-student-${s.id}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-icon btn-secondary btn-sm"
                          title="Edit"
                          onClick={() => navigate(`/students/${s.id}?tab=edit`)}
                          id={`edit-student-${s.id}`}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
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
