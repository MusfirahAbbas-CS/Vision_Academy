import { DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_MONTHLY_FEE } from '../data/mockData';

export default function FeeStructure() {
  const { state, formatCurrency } = useApp();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Structure</h1>
          <p className="page-subtitle">Monthly fees only; no admission, registration, or security charges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.courses.map(course => (
          <div key={course.id} className="card overflow-hidden">
            <div className="bg-blue-600 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-white">{course.name}</h2>
              <DollarSign size={20} className="text-blue-200" />
            </div>
            <div className="p-5 flex justify-between items-center">
              <span className="text-sm text-slate-600">Monthly fee</span>
              <span className="font-bold text-blue-600">{formatCurrency(COURSE_MONTHLY_FEE)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
