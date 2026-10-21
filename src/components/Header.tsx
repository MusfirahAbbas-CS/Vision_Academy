import { LogOut, Bell, User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Header() {
  const { dispatch, state } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
    <header className="mobile-app-bar sticky top-0 z-30 flex w-full items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold leading-tight text-slate-800">{state.settings.academyName}</div>
          <div className="text-xs leading-tight text-slate-400">Management System</div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600" aria-label="Admin profile">
          <User size={16} className="text-white" />
        </div>
      </div>
    </header>

    <header className="sticky top-0 z-30 hidden h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 md:flex md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <div className="hidden text-sm text-slate-500 md:block">
          Welcome back, <span className="font-semibold text-slate-700">Administrator</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 sm:gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-700">Admin</div>
            <div className="text-xs text-slate-400">admin@academy.com</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 sm:ml-1"
            title="Logout"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
