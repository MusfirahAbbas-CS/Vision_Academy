import { BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_MONTHLY_FEE } from '../data/mockData';

export default function Courses() {
  const { state, formatCurrency } = useApp();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">{state.courses.length} courses · one monthly fee per course</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.courses.map(course => (
          <div key={course.id} className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-700">{course.name}</h2>
                <p className="text-xs text-slate-400">Monthly enrollment</p>
              </div>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-500">Monthly fee</span>
              <span className="font-semibold text-slate-700">{formatCurrency(COURSE_MONTHLY_FEE)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
