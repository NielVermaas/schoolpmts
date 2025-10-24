import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, School, FileText, CreditCard, DollarSign, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Schools', href: '/admin/schools', icon: School },
    { name: 'Families', href: '/admin/families', icon: Users },
    { name: 'Invoices', href: '/admin/invoices', icon: FileText },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Payouts', href: '/admin/payouts', icon: DollarSign },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-gradient-dark shadow-soft-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">SchoolPay</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 mr-3 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 mx-4 mb-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-400">Test Mode</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-72">
        <main className="p-8 min-h-screen">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
