import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, FolderKanban, CheckSquare, ShoppingCart, AlertCircle, Sparkles, Bell, X, Clock, Calendar } from 'lucide-react';
import type { Project, Task, ProcurementItem } from '../App';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  procurementItems: ProcurementItem[];
  isDarkMode: boolean;
}

export function Dashboard({ projects, tasks, procurementItems, isDarkMode }: DashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Calculate stats
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeTasks = tasks.filter(t => t.status !== 'completed').length;
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const pendingProcurement = procurementItems.filter(i => !i.isSubmitted).length;

  // Get notifications
  const getNotifications = () => {
    const notifications = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Overdue projects
    projects.forEach(p => {
      if (p.status !== 'completed' && !p.isSubmitted && p.endDate && typeof p.endDate === 'string') {
        const [day, month, year] = p.endDate.split('-').map(Number);
        const endDate = new Date(year, month - 1, day);
        if (endDate < today) {
          notifications.push({
            type: 'error',
            title: 'Overdue Project',
            message: `${p.name} - End date: ${p.endDate}`,
            priority: 1,
          });
        } else if (endDate <= threeDaysFromNow) {
          notifications.push({
            type: 'warning',
            title: 'Project Due Soon',
            message: `${p.name} - Due: ${p.endDate}`,
            priority: 2,
          });
        }
      }
    });

    // Overdue tasks
    tasks.forEach(t => {
      if (t.status !== 'completed' && t.dueDate && typeof t.dueDate === 'string') {
        const [day, month, year] = t.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        if (dueDate < today) {
          notifications.push({
            type: 'error',
            title: 'Overdue Task',
            message: `${t.title} - Due: ${t.dueDate}`,
            priority: t.priority === 'urgent' ? 1 : 2,
          });
        } else if (dueDate <= threeDaysFromNow) {
          notifications.push({
            type: 'warning',
            title: 'Task Due Soon',
            message: `${t.title} - Due: ${t.dueDate}`,
            priority: 3,
          });
        }
      }
    });

    // Projects needing submission
    const projectsNeedingSubmission = projects.filter(p => 
      p.status === 'completed' && !p.isSubmitted
    );
    if (projectsNeedingSubmission.length > 0) {
      notifications.push({
        type: 'info',
        title: 'Projects Ready for Submission',
        message: `${projectsNeedingSubmission.length} completed project(s) need to be submitted`,
        priority: 3,
      });
    }

    // Budget warnings (over 90% spent)
    projects.forEach(p => {
      if (p.status !== 'completed' && p.budget > 0) {
        const spentPercentage = (p.spent / p.budget) * 100;
        if (spentPercentage >= 90) {
          notifications.push({
            type: 'warning',
            title: 'Budget Alert',
            message: `${p.name} - ${spentPercentage.toFixed(0)}% budget used`,
            priority: 2,
          });
        }
      }
    });

    // Urgent tasks
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
    if (urgentTasks.length > 0) {
      notifications.push({
        type: 'error',
        title: 'Urgent Tasks',
        message: `${urgentTasks.length} urgent task(s) require attention`,
        priority: 1,
      });
    }

    // Sort by priority
    return notifications.sort((a, b) => a.priority - b.priority);
  };

  const notifications = getNotifications();
  const notificationCount = notifications.length;

  // Project status distribution
  const projectStatusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#3b82f6' },
    { name: 'In Progress', value: projects.filter(p => p.status === 'in-progress').length, color: '#10b981' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#f59e0b' },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#6366f1' },
  ].filter(item => item.value > 0);

  // Budget by project
  const budgetData = projects.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    budget: p.budget,
    spent: p.spent,
  }));

  // Task priority distribution
  const taskPriorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length, color: '#10b981' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length, color: '#3b82f6' },
    { name: 'High', value: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length, color: '#f59e0b' },
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600'}`}>
              Dashboard
            </h1>
          </div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Overview of all projects, tasks, and procurement activities</p>
        </div>

        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-xl transition-all duration-200 ${
              notificationCount > 0
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse hover:from-red-700 hover:to-red-600'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-md'
            }`}
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-red-600 rounded-full text-xs flex items-center justify-center font-bold shadow-lg">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className={`absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-y-auto rounded-xl border shadow-2xl z-50 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className={`p-4 border-b sticky top-0 z-10 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className={`p-1 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-2">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div
                      key={index}
                      className={`p-4 mb-2 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        notif.type === 'error'
                          ? isDarkMode
                            ? 'bg-red-900/20 border-red-700/50 hover:bg-red-900/30'
                            : 'bg-red-50 border-red-200 hover:bg-red-100'
                          : notif.type === 'warning'
                            ? isDarkMode
                              ? 'bg-yellow-900/20 border-yellow-700/50 hover:bg-yellow-900/30'
                              : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                            : isDarkMode
                              ? 'bg-blue-900/20 border-blue-700/50 hover:bg-blue-900/30'
                              : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notif.type === 'error'
                            ? 'bg-red-600'
                            : notif.type === 'warning'
                              ? 'bg-yellow-600'
                              : 'bg-blue-600'
                        }`}>
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium mb-1 ${
                            notif.type === 'error'
                              ? isDarkMode ? 'text-red-400' : 'text-red-700'
                              : notif.type === 'warning'
                                ? isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                                : isDarkMode ? 'text-blue-400' : 'text-blue-700'
                          }`}>
                            {notif.title}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notif.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`p-8 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Projects Card */}
        <div className={`group p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/20' 
            : 'bg-white/90 border-gray-200 hover:border-blue-400/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              isDarkMode ? 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30' : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
            }`}>
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-500 text-sm font-medium px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              {activeProjects} active
            </span>
          </div>
          <div className={`text-4xl mb-1 font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{projects.length}</div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Projects</div>
          <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${(activeProjects / projects.length) * 100 || 0}%` }} />
          </div>
        </div>

        {/* Active Tasks Card */}
        <div className={`group p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50 hover:border-green-500/50 shadow-lg hover:shadow-green-500/20' 
            : 'bg-white/90 border-gray-200 hover:border-green-400/50 shadow-lg hover:shadow-xl hover:shadow-green-500/10'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              isDarkMode ? 'bg-gradient-to-br from-green-600 to-emerald-500 shadow-lg shadow-green-500/30' : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
            }`}>
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            {overdueTasks > 0 && (
              <span className="text-red-500 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse">
                <AlertCircle className="w-4 h-4" />
                {overdueTasks} overdue
              </span>
            )}
          </div>
          <div className={`text-4xl mb-1 font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{activeTasks}</div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Tasks</div>
          <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(activeTasks / tasks.length) * 100 || 0}%` }} />
          </div>
        </div>

        {/* Procurement Items Card */}
        <div className={`group p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/20' 
            : 'bg-white/90 border-gray-200 hover:border-purple-400/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/10'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              isDarkMode ? 'bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/30' : 'bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/30'
            }`}>
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-orange-500 text-sm font-medium px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              {pendingProcurement} pending
            </span>
          </div>
          <div className={`text-4xl mb-1 font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{procurementItems.length}</div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Procurement Items</div>
          <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500" style={{ width: `${((procurementItems.length - pendingProcurement) / procurementItems.length) * 100 || 0}%` }} />
          </div>
        </div>

        {/* Budget Card */}
        <div className={`group p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50 hover:border-orange-500/50 shadow-lg hover:shadow-orange-500/20' 
            : 'bg-white/90 border-gray-200 hover:border-orange-400/50 shadow-lg hover:shadow-xl hover:shadow-orange-500/10'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              isDarkMode ? 'bg-gradient-to-br from-orange-600 to-amber-500 shadow-lg shadow-orange-500/30' : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30'
            }`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              totalSpent / totalBudget > 0.8 
                ? 'text-red-500 bg-red-500/10 border border-red-500/20' 
                : 'text-gray-500 bg-gray-500/10 border border-gray-500/20'
            }`}>
              {((totalSpent / totalBudget) * 100).toFixed(0)}% used
            </span>
          </div>
          <div className={`text-4xl mb-1 font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            AED {(totalBudget / 1000).toFixed(0)}k
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Budget</div>
          <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${
              totalSpent / totalBudget > 0.8 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
            }`} style={{ width: `${(totalSpent / totalBudget) * 100 || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        {projectStatusData.length > 0 && (
          <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50' 
              : 'bg-white/90 border-gray-200 shadow-lg'
          }`}>
            <h2 className={`mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Project Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Budget Overview */}
        {budgetData.length > 0 && (
          <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50' 
              : 'bg-white/90 border-gray-200 shadow-lg'
          }`}>
            <h2 className={`mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Budget Overview by Project</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                <Tooltip contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }} />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="spent" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Task Priority Distribution */}
        {taskPriorityData.length > 0 && (
          <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50' 
              : 'bg-white/90 border-gray-200 shadow-lg'
          }`}>
            <h2 className={`mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Task Priority Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskPriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Stats */}
        <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-gray-700/50' 
            : 'bg-white/90 border-gray-200 shadow-lg'
        }`}>
          <h2 className={`mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Quick Stats</h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all hover:scale-105`}>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Completed Projects</span>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{completedProjects}</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all hover:scale-105`}>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total Savings</span>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  AED {((totalBudget - totalSpent) / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all hover:scale-105`}>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Completed Tasks</span>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}