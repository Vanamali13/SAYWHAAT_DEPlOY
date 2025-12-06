import React, { useContext, useEffect } from "react";
import { Link, useLocation, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils/utils";
import { Heart, Gift, Users, Upload, LayoutDashboard, ListChecks, LogOut, History, Layers, Truck, User } from "lucide-react";
import { Sidebar } from "./Components/ui/sidebar";
import Footer from "./Components/Footer";
import HomePage from "./Pages/home";
import AdminDashboard from "./Pages/AdminDashboard";
import DonorDashboard from "./Pages/DonorDashboard";
import BatchStaffDashboard from "./Pages/BatchStaffDashboard";
import DonorsList from "./Pages/DonorsList";
import BatchStaffList from "./Pages/BatchStaffList";
import CreateDonation from "./Pages/CreateDonation";
import RegisterReceiver from "./Pages/RegisterReceiver";
import UploadProof from "./Pages/UploadProof";
import DonationDetails from "./Pages/DonationDetails";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Profile from "./Pages/Profile";
import Payment from "./Pages/Payment";
import { AuthContext } from "./context/authContext";
import { ThemeContext } from "./context/ThemeContext";
import DonationRequests from "./Pages/DonationRequests";
import DonationHistory from "./Pages/DonationHistory";
import Pools from "./Pages/Pools";
import ThemeToggle from "./Components/ui/ThemeToggle";
import NotificationDropdown from "./Components/ui/NotificationDropdown";

import { Button } from "./Components/ui/button";


const donorNavigationItems = [
  { title: "Donor Dashboard", url: createPageUrl("donordashboard"), icon: LayoutDashboard, component: DonorDashboard },
  { title: "Create Donation", url: createPageUrl("createdonation"), icon: Gift, component: CreateDonation },
  { title: "Donation History", url: createPageUrl("donation-history"), icon: History, component: DonationHistory },
  { title: "Profile", url: createPageUrl("profile"), icon: User, component: Profile },
];

const batchStaffNavigationItems = [
  { title: "Batch Staff Dashboard", url: createPageUrl("batch-staff-dashboard"), icon: LayoutDashboard, component: BatchStaffDashboard },
  { title: "Register Receiver", url: createPageUrl("registerreceiver"), icon: Users, component: RegisterReceiver },
  { title: "Upload Proof", url: createPageUrl("uploadproof"), icon: Upload, component: UploadProof },
  { title: "Profile", url: createPageUrl("profile"), icon: User, component: Profile },
];

const adminNavigationItems = [
  { title: "Admin Dashboard", url: createPageUrl("admin-dashboard"), icon: LayoutDashboard, component: AdminDashboard },
  { title: "Donation Requests", url: createPageUrl("donation-requests"), icon: ListChecks, component: DonationRequests },
  { title: "Donation History", url: createPageUrl("donation-history"), icon: History, component: DonationHistory },
  { title: "Pools", url: createPageUrl("pools"), icon: Layers, component: Pools },
  { title: "Donors List", url: createPageUrl("donorslist"), icon: Users, component: DonorsList },
  { title: "Batch Staff List", url: createPageUrl("batchstafflist"), icon: Truck, component: BatchStaffList },
  { title: "Profile", url: createPageUrl("profile"), icon: User, component: Profile },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const logoSrc = theme === 'dark' ? '/assets/images/logo-dark.png' : '/assets/images/logo-light.png';

  useEffect(() => {
    const authPages = ['/login', '/signup'];
    if (user && authPages.includes(location.pathname)) {
      const role = user.role;
      if (role === 'Administrator') {
        navigate('/admin-dashboard');
      } else if (role === 'Batch staff') {
        navigate('/batch-staff-dashboard');
      } else {
        navigate('/donordashboard');
      }
    }
  }, [user, navigate, location.pathname]);

  // Determine if the sidebar should be shown based on the current route
  const noSidebarRoutes = ["/home", "/", "/login", "/signup"];
  const showSidebar = user && !noSidebarRoutes.includes(location.pathname);

  // Determine which navigation items to show based on user role
  let sidebarItems = [];
  if (user) {
    if (user.role === 'Administrator') {
      sidebarItems = adminNavigationItems;
    } else if (user.role === 'Batch staff') {
      sidebarItems = batchStaffNavigationItems;
    } else if (user.role === 'Donor') {
      sidebarItems = donorNavigationItems;
    }
  }

  return (
    <div className={`min-h-screen w-full ${showSidebar ? 'flex' : ''} bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300`}>
      <div className={`${!showSidebar ? 'bg-zinc-50 dark:bg-zinc-950' : ''} absolute inset-0 -z-10 transition-colors duration-300`} />
      {showSidebar ? (
        <Sidebar className="border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex flex-col h-screen transition-colors duration-300">
          <div className="p-6">
            <div className="flex items-center justify-center gap-3">
              <img src={logoSrc} alt="Say Whatt Logo" className="h-32 w-auto object-contain" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="p-3">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </p>
              <div>
                <div>
                  {sidebarItems.map((item) => (
                    <div key={item.title}>
                      <Link to={item.url} className={`mb-1 transition-all duration-200 rounded-xl flex items-center gap-3 px-4 py-3 ${(location.pathname === item.url || (location.pathname === '/' && item.url === '/home'))
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border border-zinc-200 dark:border-zinc-700'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    navigate('/home');
                  }
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </Sidebar>
      ) : (
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            {/* Hide logo on home page as it is displayed in the hero section */}
            {(location.pathname !== "/" && location.pathname !== "/home") ? (
              <Link to={createPageUrl("home")} className="flex items-center gap-3">
                <img src={logoSrc} alt="Say Whatt Logo" className="h-10 w-auto object-contain" />
              </Link>
            ) : (
              <div /> // Spacer to keep flex layout working if needed, or just nothing
            )}
            <div className="flex items-center gap-4">
              {user && <NotificationDropdown align="right" />}
              <ThemeToggle />
              {(location.pathname === "/" || location.pathname === "/home") && (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="font-semibold px-4 py-2 text-md border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white bg-transparent">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 py-2 text-md">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col relative">
        {showSidebar && (
          <header className="sticky top-0 z-50 flex justify-end items-center px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <NotificationDropdown align="right" />
            </div>
          </header>
        )}
        <div className="flex-1 overflow-auto flex flex-col relative">
          <div className={`flex-1 ${!showSidebar ? '' : 'p-6'}`}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/donordashboard" element={user ? <DonorDashboard /> : <Navigate to="/login" replace />} />
              <Route path="/admin-dashboard" element={user && user.role === 'Administrator' ? <AdminDashboard /> : <Navigate to="/login" replace />} />
              <Route path="/donation-requests" element={user && user.role === 'Administrator' ? <DonationRequests /> : <Navigate to="/login" replace />} />
              <Route path="/donation-history" element={user ? <DonationHistory /> : <Navigate to="/login" replace />} />
              <Route path="/donorslist" element={user && user.role === 'Administrator' ? <DonorsList /> : <Navigate to="/login" replace />} />
              <Route path="/batchstafflist" element={user && user.role === 'Administrator' ? <BatchStaffList /> : <Navigate to="/login" replace />} />
              <Route path="/batch-staff-dashboard" element={user && user.role === 'Batch staff' ? <BatchStaffDashboard /> : <Navigate to="/login" replace />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              {/* Remove navigationItems.map, use sidebarItems.map instead */}
              {sidebarItems.map(item => (
                <Route key={item.url} path={item.url} element={user ? <item.component /> : <Navigate to="/login" replace />} />
              ))}
              <Route path="/donations/:id" element={user ? <DonationDetails /> : <Navigate to="/login" replace />} />
              <Route path="/payment" element={user ? <Payment /> : <Navigate to="/login" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
