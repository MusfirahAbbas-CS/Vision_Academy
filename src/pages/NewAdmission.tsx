import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, BookOpen, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_MONTHLY_FEE } from '../data/mockData';
import type { FeeRecord, Student } from '../types';
import toast from 'react-hot-toast';

export default function NewAdmission() {
  const { state, dispatch, nextAdmissionNo, formatCurrency } = useApp();
  const navigate = useNavigate();
  const admissionNo = nextAdmissionNo();
  const [form, setForm] = useState({
    name: '', guardianName: '', gender: 'Male', dob: '', phone: '',
    guardianPhone: '', email: '', address: '',
    courseIds: state.courses[0] ? [state.courses[0].id] : [],
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const monthlyFee = form.courseIds.length * COURSE_MONTHLY_FEE;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.courseIds.length === 0) {
      toast.error('Enter the student name and select at least one course');
      return;
    }

    const id = `s${Date.now()}`;
    const student: Student = {
      id,
      admissionNo,
      name: form.name,
      guardianName: form.guardianName,
      gender: form.gender as Student['gender'],
      dob: form.dob,
      phone: form.phone,
      guardianPhone: form.guardianPhone,
      email: form.email,
      address: form.address,
      courseIds: form.courseIds,
      admissionDate: form.admissionDate,
      monthlyFee,
      status: form.status as Student['status'],
    };
    dispatch({ type: 'ADD_STUDENT', payload: student });
    const feeMonth = student.admissionDate.slice(0, 7);
    const feeRecord: FeeRecord = {
      id: `fr-${student.id}-${feeMonth}`,
      studentId: student.id,
      month: feeMonth,
      payable: student.monthlyFee,
      paid: 0,
      remaining: student.monthlyFee,
      status: 'UNPAID',
      payments: [],
    };
    dispatch({ type: 'ADD_FEE_RECORD', payload: feeRecord });
    toast.success(`Student admitted: ${student.name}`);
    navigate(`/students/${id}`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-1" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">New Admission</h1>
          <p className="page-subtitle">Admission No: <span className="font-semibold text-blue-600">{admissionNo}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-blue-500" />
            <h2 className="section-title mb-0 border-0 pb-0">Personal Information</h2>
          </div>
          <div className="form-grid">
            <div><label className="label">Full Name *</label><input name="name" className="input" required value={form.name} onChange={handleChange} /></div>
            <div><label className="label">Guardian Name *</label><input name="guardianName" className="input" required value={form.guardianName} onChange={handleChange} /></div>
            <div>
              <label className="label">Gender *</label>
              <select name="gender" className="input" value={form.gender} onChange={handleChange}><option>Male</option><option>Female</option></select>
            </div>
            <div><label className="label">Date of Birth</label><input name="dob" type="date" className="input" value={form.dob} onChange={handleChange} /></div>
            <div><label className="label">Student Phone *</label><input name="phone" className="input" required placeholder="03XXXXXXXXX" value={form.phone} onChange={handleChange} /></div>
            <div><label className="label">Guardian Phone *</label><input name="guardianPhone" className="input" required placeholder="03XXXXXXXXX" value={form.guardianPhone} onChange={handleChange} /></div>
            <div><label className="label">Email</label><input name="email" type="email" className="input" value={form.email} onChange={handleChange} /></div>
            <div className="md:col-span-2"><label className="label">Address</label><input name="address" className="input" value={form.address} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-blue-500" />
            <h2 className="section-title mb-0 border-0 pb-0">Course Enrollment</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">Select one or more courses. Each course costs {formatCurrency(COURSE_MONTHLY_FEE)} per month.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.courses.map(course => (
              <label key={course.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.courseIds.includes(course.id)}
                    onChange={e => setForm(f => ({
                      ...f,
                      courseIds: e.target.checked
                        ? [...f.courseIds, course.id]
                        : f.courseIds.filter(id => id !== course.id),
                    }))}
                  />
                  {course.name}
                </span>
                <span className="text-sm text-slate-500">{formatCurrency(COURSE_MONTHLY_FEE)}/month</span>
              </label>
            ))}
          </div>
          <div className="form-grid mt-4">
            <div><label className="label">Admission Date *</label><input name="admissionDate" type="date" className="input" value={form.admissionDate} onChange={handleChange} required /></div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="input" value={form.status} onChange={handleChange}><option>Active</option><option>Pending</option><option>Inactive</option></select>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-blue-500" />
            <h2 className="section-title mb-0 border-0 pb-0">Monthly Fee</h2>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">{form.courseIds.length} selected course(s) × {formatCurrency(COURSE_MONTHLY_FEE)}</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(monthlyFee)} / month</span>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary w-full justify-center sm:w-auto" onClick={() => navigate('/students')}>Cancel</button>
          <button type="submit" className="btn btn-primary w-full justify-center sm:w-auto" id="submit-admission"><Save size={16} /> Save Admission</button>
        </div>
      </form>
    </div>
  );
}
