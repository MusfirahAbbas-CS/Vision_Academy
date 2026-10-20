import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell flex min-h-screen w-full">
      {sidebarOpen && (
        <div
          className="sidebar-overlay active md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="main-content flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 bg-slate-50 p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
