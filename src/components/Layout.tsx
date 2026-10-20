import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className="app-shell flex min-h-screen w-full">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay md:hidden"
          onClick={closeSidebar}
          aria-label="Close navigation drawer"
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        aria-label="Main navigation"
      >
        <Sidebar onClose={closeSidebar} />
      </aside>

      <div className="main-content flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={openSidebar} />
        <main className="min-w-0 flex-1 bg-slate-50 p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
