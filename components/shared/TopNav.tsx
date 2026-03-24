'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const getPageTitle = () => {
    const path = pathname.replace('/dashboard/', '').split('/')[0];
    const titles: Record<string, string> = {
      '': 'Dashboard',
      'products': 'Products',
      'inventory': 'Inventory',
      'sales': 'Sales',
      'suppliers': 'Suppliers',
      'reports': 'Reports',
      'settings': 'Settings',
      'help': 'Help & Support',
    };
    return titles[path] || 'Dashboard';
  };

  useEffect(() => {
    const storedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-green-200 dark:border-teal-700 shadow-sm sticky top-0 z-40">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-teal-100">{getPageTitle()}</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-teal-400 hover:text-green-700 dark:hover:text-teal-300"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 text-xs sm:text-sm"
          >
            <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
