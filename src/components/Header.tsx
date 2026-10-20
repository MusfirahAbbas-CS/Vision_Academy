import { Menu, LogOut, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600"
        >
          <Menu size={18} />
        </button>
        <div className="hidden lg:block text-sm text-slate-500">
          Welcome back, <span className="font-semibold text-slate-700">Administrator</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-slate-100 text-slate-500 relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-700">Admin</div>
            <div className="text-xs text-slate-400">admin@academy.com</div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 p-2 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
