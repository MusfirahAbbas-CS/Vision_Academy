import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, BookOpen, DollarSign,
  CreditCard, FileText, AlertCircle, BarChart2, Settings, GraduationCap, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavSection {
  title: string;
  items: { label: string; path: string; icon: React.ReactNode }[];
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'Students',
    items: [
      { label: 'All Students', path: '/students', icon: <Users size={16} /> },
      { label: 'New Admission', path: '/students/new', icon: <UserPlus size={16} /> },
    ],
  },
  {
    title: 'Academics',
    items: [
      { label: 'Courses', path: '/courses', icon: <BookOpen size={16} /> },
      { label: 'Fee Structure', path: '/fee-structure', icon: <DollarSign size={16} /> },
    ],
  },
  {
    title: 'Fees',
    items: [
      { label: 'Collect Fee', path: '/collect-fee', icon: <CreditCard size={16} /> },
      { label: 'Fee Records', path: '/fee-records', icon: <FileText size={16} /> },
      { label: 'Outstanding', path: '/outstanding', icon: <AlertCircle size={16} /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Reports', path: '/reports', icon: <BarChart2 size={16} /> },
      { label: 'Settings', path: '/settings', icon: <Settings size={16} /> },
    ],
  },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { state } = useApp();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 leading-tight">
              {state.settings.academyName}
            </div>
            <div className="text-xs text-slate-400">Management System</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded hover:bg-slate-100 text-slate-500"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navSections.map(section => (
          <div key={section.title} className="mb-4">
            <div className="px-5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {section.title}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="text-xs text-slate-400 text-center">
          Academy Fee System v1.0
        </div>
      </div>
    </div>
  );
}
