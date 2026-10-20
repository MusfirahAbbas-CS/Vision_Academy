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

  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterCourse(''); };

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{filtered.length} of {state.students.length} students</p>
        </div>
        <button className="btn btn-primary w-full md:w-auto" onClick={() => navigate('/students/new')}>
          <UserPlus size={16} /> New Admission
        </button>
      </div>

      <div className="card mb-4 grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-3">
        <div className="search-bar min-w-0">
          <Search size={15} className="search-icon" />
          <input
            className="input"
            placeholder="Search by name, admission no, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="student-search"
          />
        </div>
        <select className="input w-full min-w-0" value={filterCourse} onChange={e => setFilterCourse(e.target.value)} id="filter-course">
          <option value="">All Courses</option>
          {state.courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        <select className="input w-full min-w-0" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="filter-status">
          <option value="">All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Inactive</option>
        </select>
        {(filterStatus || filterCourse || search) && (
          <button className="btn btn-secondary w-full md:col-span-3 md:w-auto md:justify-self-end" onClick={clearFilters}>Clear</button>
        )}
      </div>

      <div className="card hidden md:block">
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
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No students found</td></tr>
              ) : filtered.map((student: Student) => {
                const courses = student.courseIds.map(id => getCourse(id)?.name).filter(Boolean);
                return (
                  <tr key={student.id}>
                    <td><span className="badge badge-blue">{student.admissionNo}</span></td>
                    <td>
                      <p className="font-medium text-slate-700">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.gender} · {student.dob}</p>
                    </td>
                    <td className="text-slate-600">{student.guardianName}</td>
                    <td className="text-slate-600">{courses.join(', ') || '—'}</td>
                    <td className="text-slate-600">{student.phone}</td>
                    <td className="font-medium">Rs {student.monthlyFee.toLocaleString()} / month</td>
                    <td><span className={`badge ${STATUS_COLORS[student.status] || 'badge-gray'}`}>{student.status}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-icon btn-secondary" title="View Profile" aria-label={`View ${student.name}`} onClick={() => navigate(`/students/${student.id}`)} id={`view-student-${student.id}`}>
                          <Eye size={16} />
                        </button>
                        <button className="btn btn-icon btn-secondary" title="Edit" aria-label={`Edit ${student.name}`} onClick={() => navigate(`/students/${student.id}?tab=edit`)} id={`edit-student-${student.id}`}>
                          <Edit2 size={16} />
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

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="card p-6 text-center text-slate-400">No students found</div>
        ) : filtered.map(student => {
          const courses = student.courseIds.map(id => getCourse(id)?.name).filter(Boolean);
          return (
            <article key={student.id} className="card min-w-0 p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-semibold text-slate-800">{student.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{student.admissionNo}</p>
                </div>
                <span className={`badge shrink-0 ${STATUS_COLORS[student.status] || 'badge-gray'}`}>{student.status}</span>
              </div>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-slate-500">Course</dt>
                <dd className="break-words text-right text-slate-700">{courses.join(', ') || '—'}</dd>
                <dt className="text-slate-500">Guardian</dt>
                <dd className="break-words text-right text-slate-700">{student.guardianName}</dd>
                <dt className="text-slate-500">Phone</dt>
                <dd className="break-all text-right text-slate-700">{student.phone}</dd>
                <dt className="text-slate-500">Monthly Fee</dt>
                <dd className="text-right font-medium text-slate-800">Rs {student.monthlyFee.toLocaleString()} / month</dd>
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <button className="btn btn-secondary justify-center" onClick={() => navigate(`/students/${student.id}`)} id={`view-student-mobile-${student.id}`}>
                  <Eye size={16} /> View
                </button>
                <button className="btn btn-secondary justify-center" onClick={() => navigate(`/students/${student.id}?tab=edit`)} id={`edit-student-mobile-${student.id}`}>
                  <Edit2 size={16} /> Edit
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
