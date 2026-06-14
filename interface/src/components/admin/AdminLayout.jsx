import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bell,
  LogOut,
  Menu,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../config/api';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/sessions', label: 'Sessions', icon: Calendar },
  { to: '/admin/bookings', label: 'Bookings', icon: Users },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
];

// Map route paths to breadcrumb labels
const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/sessions': 'Sessions',
  '/admin/bookings': 'Bookings',
  '/admin/notifications': 'Notifications',
};

const AdminLayout = () => {
  const { user, session, loading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(apiUrl('/admin/notifications/unread-count'), {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [session?.access_token]);

  // Poll every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  // Get current breadcrumb
  const getBreadcrumb = () => {
    // Check for exact match first
    if (breadcrumbMap[location.pathname]) {
      return breadcrumbMap[location.pathname];
    }
    // Find closest parent match
    const segments = location.pathname.split('/');
    while (segments.length > 1) {
      segments.pop();
      const parentPath = segments.join('/');
      if (breadcrumbMap[parentPath]) {
        return breadcrumbMap[parentPath];
      }
    }
    return 'Dashboard';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-neatgreen animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800/50
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neatgreen/15 border border-neatgreen/25 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-neatgreen" />
            </div>
            <span className="font-source font-bold text-white text-lg tracking-tight">
              Admin<span className="text-neatgreen">Panel</span>
            </span>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-neatgreen/10 text-neatgreen'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? 'text-neatgreen' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  />
                  <span className="flex-1">{label}</span>
                  {/* Unread badge on Notifications */}
                  {label === 'Notifications' && unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-neatgreen text-gray-900 text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider + Sign Out */}
        <div className="border-t border-gray-800/50 p-3">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            {signingOut ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <LogOut className="w-[18px] h-[18px]" />
            )}
            <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Left side: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-500">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-white font-medium">{getBreadcrumb()}</span>
            </nav>
          </div>

          {/* Right side: user info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium truncate max-w-[200px]">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-neatgreen/15 border border-neatgreen/25 flex items-center justify-center">
              <span className="text-neatgreen text-xs font-bold uppercase">
                {user.email?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
