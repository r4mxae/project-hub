import { LayoutDashboard, FolderKanban, ShoppingCart, Users, AlertTriangle, ChevronLeft, ChevronRight, Moon, Sun, DollarSign, CheckCircle, Settings, CalendarClock, BarChart3 } from 'lucide-react';
import type { View } from '../App';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse, isDarkMode, onToggleTheme }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects-tasks' as View, label: 'Projects & Tasks', icon: FolderKanban },
    { id: 'completed' as View, label: 'Completed', icon: CheckCircle },
    { id: 'savings' as View, label: 'Savings', icon: DollarSign },
    { id: 'procurement' as View, label: 'Procurement Plan', icon: ShoppingCart },
    { id: 'upcoming' as View, label: 'Upcoming', icon: CalendarClock },
    { id: 'focal-points' as View, label: 'Focal Points', icon: Users },
    { id: 'risks' as View, label: 'Risks', icon: AlertTriangle },
    { id: 'analysis' as View, label: 'Analysis', icon: BarChart3 },
    { id: 'settings' as View, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700/50' 
        : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'
    } border-r flex flex-col transition-all duration-300 ease-in-out shadow-xl`}>
      {/* Header */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b ${
        isDarkMode ? 'border-gray-700/50' : 'border-gray-200'
      } flex items-center justify-between backdrop-blur-sm`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-8 rounded-full ${
              isDarkMode ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 'bg-gradient-to-b from-blue-500 to-blue-700'
            }`} />
            <h1 className={`${
              isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600'
            }`}>Project Hub</h1>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          } ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-200 transform relative overflow-hidden group ${
                    isActive
                      ? isDarkMode 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700/50 hover:scale-105 hover:shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:scale-105 hover:shadow-md'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  {!isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      isDarkMode ? 'from-blue-600/0 to-blue-500/0 group-hover:from-blue-600/10 group-hover:to-blue-500/10' : 'from-blue-600/0 to-blue-500/0 group-hover:from-blue-600/5 group-hover:to-blue-500/5'
                    } transition-all duration-200`} />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  {!isCollapsed && (
                    <span className="relative z-10 font-medium">{item.label}</span>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'} backdrop-blur-sm`}>
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 relative overflow-hidden group ${
            isDarkMode
              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 hover:from-yellow-500/30 hover:to-orange-500/30 shadow-lg shadow-yellow-500/10'
              : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 hover:from-indigo-500/20 hover:to-purple-500/20 shadow-md'
          }`}
          title={isCollapsed ? (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : ''}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 group-hover:from-white/5 group-hover:to-white/20 transition-all duration-200" />
          {isDarkMode ? (
            <Sun className="w-5 h-5 flex-shrink-0 relative z-10 animate-pulse" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 relative z-10" />
          )}
          {!isCollapsed && (
            <span className="relative z-10 font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>
      </div>
    </aside>
  );
}