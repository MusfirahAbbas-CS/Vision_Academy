import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, CreditCard, Ellipsis, FileText, Home, LogOut, Settings, Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const moreLinks = [
  { label: 'Fee Records', path: '/fee-records', icon: FileText },
  { label: 'Outstanding Fees', path: '/outstanding', icon: CreditCard },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Fee Structure', path: '/fee-structure', icon: CreditCard },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function BottomNavigation() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const isFeesActive = ['/collect-fee', '/fee-records', '/outstanding'].some(
    path => location.pathname === path || location.pathname.startsWith(`${path}/`),
  );
  const isStudentsActive = location.pathname.startsWith('/students');
  const isMoreActive = ['/courses', '/fee-structure', '/settings'].some(
    path => location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  const closeMore = () => setMoreOpen(false);
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    closeMore();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const tabClass = (active: boolean) =>
    `flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-medium transition-colors ${
      active ? 'text-blue-600' : 'text-slate-500'
    }`;

  return (
    <div className="md:hidden">
      {moreOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-slate-900/20"
            onClick={closeMore}
            aria-label="Close more navigation"
          />
          <div className="mobile-more-menu fixed inset-x-3 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            {moreLinks.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={closeMore}
                className={({ isActive }) =>
                  `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </>
      )}

      <nav
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-slate-200 bg-white px-2 pt-1"
        aria-label="Mobile navigation"
      >
        <NavLink to="/dashboard" className={({ isActive }) => tabClass(isActive)}>
          {({ isActive }) => <><Home size={20} strokeWidth={isActive ? 2.5 : 2} /><span>Home</span></>}
        </NavLink>
        <NavLink to="/students" className={() => tabClass(isStudentsActive)}>
          <Users size={20} strokeWidth={isStudentsActive ? 2.5 : 2} />
          <span>Students</span>
        </NavLink>
        <NavLink to="/collect-fee" className={() => tabClass(isFeesActive)}>
          <CreditCard size={20} strokeWidth={isFeesActive ? 2.5 : 2} />
          <span>Fees</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => tabClass(isActive)}>
          {({ isActive }) => <><FileText size={20} strokeWidth={isActive ? 2.5 : 2} /><span>Reports</span></>}
        </NavLink>
        <button
          type="button"
          onClick={() => setMoreOpen(open => !open)}
          className={tabClass(moreOpen || isMoreActive)}
          aria-expanded={moreOpen}
          aria-label="More navigation options"
        >
          <Ellipsis size={20} strokeWidth={moreOpen || isMoreActive ? 2.5 : 2} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
