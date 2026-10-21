import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

export default function Layout() {
  return (
    <div className="app-shell flex min-h-screen w-full">
      <aside className="sidebar" aria-label="Main navigation">
        <Sidebar />
      </aside>

      <div className="main-content flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="mobile-main min-w-0 flex-1 bg-slate-50 p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
