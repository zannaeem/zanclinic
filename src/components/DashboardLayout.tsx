import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  Bell, 
  FileText, 
  Settings,
  Menu,
  X,
  Smartphone,
  Home,
  Bot,
  CalendarIcon,
  BellIcon,
  BarChartIcon,
  SettingsIcon,
  SmartphoneIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: BarChart3 },
  { name: 'Chatbot Performance', href: '/dashboard/chatbot', icon: MessageSquare },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KS</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold gradient-text">Klinik Subha</h1>
                <p className="text-xs text-gray-500">Clinic AI Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
                      : 'text-gray-700 hover:bg-gray-100/70 hover:text-green-600'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">DC</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Klinik Subha</p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-900">Klinik Subha</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
