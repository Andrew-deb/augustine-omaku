import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Expertise from './pages/Expertise';
import Work from './pages/Work';
import YouTube from './pages/YouTube';
import LiveSessions from './pages/LiveSessions';
import Contact from './pages/Contact';
import AboutMe from './pages/AboutMe';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSessions from './pages/admin/AdminSessions';
import AdminBookings from './pages/admin/AdminBookings';
import AdminNotifications from './pages/admin/AdminNotifications';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

/**
 * Public layout wrapper — renders Navbar + Footer around public pages.
 * Admin pages use their own AdminLayout instead.
 */
const PublicLayout = () => (
  <div id="page" className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ── Public Routes (with Navbar + Footer) ── */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/expertise" element={<Expertise />} />
              <Route path="/work" element={<Work />} />
              <Route path="/youtube" element={<YouTube />} />
              <Route path="/livesessions" element={<LiveSessions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutMe />} />
            </Route>

            {/* ── Admin Routes (no Navbar/Footer — AdminLayout provides its own) ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="sessions" element={<AdminSessions />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
