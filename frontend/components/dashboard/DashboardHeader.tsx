"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, User, LogOut, Settings, ChevronDown, Bell, Plus, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="relative z-50 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-lg">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
      
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <Shield className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-all duration-300 transform group-hover:scale-110" />
                <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm group-hover:bg-blue-400/30 transition-all duration-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  JobShield AI
                </h1>
                <p className="text-xs text-slate-400 font-medium">Threat Intelligence Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500/50 transition-all duration-200"
              onClick={() => router.push('/analyze')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500/50 transition-all duration-200"
              onClick={() => router.push('/reports')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-200"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5" />
              </Button>
              {isSearchOpen && (
                <div className="absolute right-0 top-12 w-80 bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-600/50 shadow-xl p-3">
                  <input
                    type="text"
                    placeholder="Search analyses, reports..."
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-md px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-200 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </div>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-3 text-slate-200 hover:text-white hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 rounded-lg px-3 py-2"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name || user.email}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate max-w-32">
                  {user.email}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-2xl py-2 transform transition-all duration-200 ease-out">
                <div className="px-4 py-3 border-b border-slate-600/50">
                  <p className="text-sm font-semibold text-white">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
                
                <div className="py-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Close dropdowns when clicking outside */}
      {(isUserMenuOpen || isSearchOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsSearchOpen(false);
          }}
        />
      )}
    </header>
  );
}
