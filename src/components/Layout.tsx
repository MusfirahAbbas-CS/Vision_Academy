import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 35, display: 'block',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always rendered; on mobile it slides in/out */}
      <aside
        className="sidebar"
        style={{
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '24px', background: 'rgb(248 250 252)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
