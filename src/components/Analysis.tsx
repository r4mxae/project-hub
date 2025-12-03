import { useState, useRef } from 'react';
import { BarChart3, Download, Calendar, DollarSign, Clock, TrendingUp, PieChart, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Project, Task, ProcurementItem, WorkLog } from '../App';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner@2.0.3';

interface AnalysisProps {
  projects: Project[];
  tasks: Task[];
  procurementItems: ProcurementItem[];
  isDarkMode: boolean;
}

export function Analysis({ projects, tasks, procurementItems, isDarkMode }: AnalysisProps) {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const analysisRef = useRef<HTMLDivElement>(null);

  // Calculate statistics
  const completedProjects = projects.filter(p => p.status === 'completed');
  const inProgressProjects = projects.filter(p => p.status === 'in-progress');
  const pendingProjects = projects.filter(p => p.status === 'pending');
  const submittedProjects = projects.filter(p => p.isSubmitted);

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const submittedProcurement = procurementItems.filter(p => p.isSubmitted);
  const pendingProcurement = procurementItems.filter(p => !p.isSubmitted);

  // Budget analysis
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const totalSavings = totalBudget - totalSpent;
  const savingsPercentage = totalBudget > 0 ? ((totalSavings / totalBudget) * 100).toFixed(1) : '0';

  // Work hours analysis
  const getAllWorkLogs = () => {
    const projectLogs = projects.flatMap(p => p.workLogs);
    const taskLogs = tasks.flatMap(t => t.workLogs);
    return [...projectLogs, ...taskLogs];
  };

  const totalWorkHours = getAllWorkLogs().reduce((sum, log) => sum + log.duration, 0) / 3600;
  const totalWorkSessions = getAllWorkLogs().length;

  // Procurement budget analysis
  const totalProcurementBudget = procurementItems.reduce((sum, p) => sum + p.allocatedBudget, 0);
  const submittedProcurementBudget = submittedProcurement.reduce((sum, p) => sum + p.allocatedBudget, 0);

  // Project status data for charts
  const projectStatusData = [
    { name: 'Completed', value: completedProjects.length, color: '#10b981' },
    { name: 'In Progress', value: inProgressProjects.length, color: '#3b82f6' },
    { name: 'Pending', value: pendingProjects.length, color: '#f59e0b' },
  ];

  const taskStatusData = [
    { name: 'Completed', value: completedTasks.length, color: '#10b981' },
    { name: 'In Progress', value: inProgressTasks.length, color: '#3b82f6' },
    { name: 'Pending', value: pendingTasks.length, color: '#f59e0b' },
  ];

  // Budget by sector
  const sectorBudgetData = projects.reduce((acc, project) => {
    const existing = acc.find(item => item.sector === project.sector);
    if (existing) {
      existing.budget += project.budget;
      existing.spent += project.spent;
      existing.savings += (project.budget - project.spent);
    } else {
      acc.push({
        sector: project.sector,
        budget: project.budget,
        spent: project.spent,
        savings: project.budget - project.spent,
      });
    }
    return acc;
  }, [] as { sector: string; budget: number; spent: number; savings: number }[]);

  // Monthly work hours trend
  const getMonthlyWorkHours = () => {
    const monthlyData = new Map<string, number>();
    
    getAllWorkLogs().forEach(log => {
      if (!log.date || typeof log.date !== 'string') return;
      const [day, month, year] = log.date.split('-');
      const monthKey = `${month}-${year}`;
      const hours = log.duration / 3600;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + hours);
    });

    return Array.from(monthlyData.entries())
      .map(([month, hours]) => ({ month, hours: parseFloat(hours.toFixed(1)) }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split('-').map(Number);
        const [monthB, yearB] = b.month.split('-').map(Number);
        return yearA - yearB || monthA - monthB;
      })
      .slice(-6); // Last 6 months
  };

  const monthlyWorkData = getMonthlyWorkHours();

  // Task priority distribution
  const priorityData = [
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#f97316' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#eab308' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#3b82f6' },
  ];

  // Overdue analysis
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueProjects = projects.filter(p => {
    if (p.status === 'completed' || p.isSubmitted) return false;
    if (!p.endDate || typeof p.endDate !== 'string') return false;
    const [day, month, year] = p.endDate.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    return endDate < today;
  });

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.dueDate || typeof t.dueDate !== 'string') return false;
    const [day, month, year] = t.dueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    return dueDate < today;
  });

  // Export function
  const exportAnalysis = async () => {
    if (!analysisRef.current) return;

    try {
      toast.info(`Generating ${exportFormat.toUpperCase()} export...`);

      // Capture the element as canvas
      const canvas = await html2canvas(analysisRef.current, {
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        scale: 2,
        logging: true,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Remove all existing stylesheets that might contain oklch
          const existingStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          existingStyles.forEach(style => {
            const content = style.textContent || '';
            if (content.includes('oklch')) {
              style.remove();
            }
          });
          
          // Add CSS to override any oklch colors with safe rgb equivalents
          const style = clonedDoc.createElement('style');
          style.textContent = `
            :root, .dark {
              --foreground: #000000 !important;
              --background: #ffffff !important;
              --card-foreground: #000000 !important;
              --popover-foreground: #000000 !important;
              --primary-foreground: #ffffff !important;
              --secondary-foreground: #000000 !important;
              --muted-foreground: #717182 !important;
              --accent-foreground: #000000 !important;
              --destructive-foreground: #ffffff !important;
              --ring: #b3b3b3 !important;
              --sidebar-foreground: #000000 !important;
              --sidebar-primary-foreground: #ffffff !important;
              --sidebar-accent-foreground: #333333 !important;
              --sidebar-ring: #b3b3b3 !important;
            }
            .dark {
              --foreground: #f5f5f5 !important;
              --background: #252525 !important;
              --card-foreground: #f5f5f5 !important;
              --popover-foreground: #f5f5f5 !important;
              --primary-foreground: #333333 !important;
              --secondary-foreground: #f5f5f5 !important;
              --muted-foreground: #b3b3b3 !important;
              --accent-foreground: #f5f5f5 !important;
              --ring: #707070 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      if (exportFormat === 'png' || exportFormat === 'jpg') {
        // Convert to image
        const imageType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
        const imageData = canvas.toDataURL(imageType, 1.0);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `analysis_snapshot_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        link.href = imageData;
        link.click();
        
        toast.success(`Analysis exported as ${exportFormat.toUpperCase()}`);
      } else if (exportFormat === 'pdf') {
        // Convert to PDF
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`analysis_snapshot_${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast.success('Analysis exported as PDF');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analysis');
    }
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-transparent bg-clip-text bg-gradient-to-r mb-2 ${
            isDarkMode ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
          }`}>Analysis & Insights</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Comprehensive overview and analytics of all projects, tasks, and procurement
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpg' | 'pdf')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={exportAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/30"
          >
            <Download className="w-4 h-4" />
            Export Snapshot
          </button>
        </div>
      </div>

      {/* Analysis Content */}
      <div ref={analysisRef} className={`space-y-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        
        {/* Key Metrics */}
        <div>
          <h2 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <BarChart3 className="w-6 h-6" />
            Key Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className={`p-3 rounded-xl mb-4 inline-flex ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30' 
                  : 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20'
              }`}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {projects.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Projects</div>
              <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {completedProjects.length} completed, {inProgressProjects.length} in progress
              </div>
            </div>

            <div className={`p-6 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className={`p-3 rounded-xl mb-4 inline-flex ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/30' 
                  : 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/20'
              }`}>
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {tasks.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</div>
              <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {completedTasks.length} completed, {inProgressTasks.length} in progress
              </div>
            </div>

            <div className={`p-6 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className={`p-3 rounded-xl mb-4 inline-flex ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30' 
                  : 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20'
              }`}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {totalWorkHours.toFixed(0)}h
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Work Hours</div>
              <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {totalWorkSessions} work sessions logged
              </div>
            </div>

            <div className={`p-6 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className={`p-3 rounded-xl mb-4 inline-flex ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-yellow-600 to-yellow-500 shadow-lg shadow-yellow-500/30' 
                  : 'bg-gradient-to-br from-yellow-600 to-yellow-500 shadow-lg shadow-yellow-500/20'
              }`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {savingsPercentage}%
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Budget Savings Rate</div>
              <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                AED {(totalSavings / 1000).toFixed(0)}k saved
              </div>
            </div>
          </div>
        </div>

        {/* Budget Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Overview */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <DollarSign className="w-5 h-5" />
              Budget Overview
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Budget</span>
                  <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    AED {totalBudget.toLocaleString()}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</span>
                  <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    AED {totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-500" 
                    style={{ width: `${totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}%` }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Savings</span>
                  <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    AED {totalSavings.toLocaleString()}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-500" 
                    style={{ width: `${totalBudget > 0 ? (totalSavings / totalBudget) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <h4 className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Procurement Budget</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Allocated:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                    AED {totalProcurementBudget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Submitted Items:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                    AED {submittedProcurementBudget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget by Sector */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <TrendingUp className="w-5 h-5" />
              Budget by Sector
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sectorBudgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="sector" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#f3f4f6' : '#111827'
                  }}
                />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="spent" fill="#f97316" name="Spent" />
                <Bar dataKey="savings" fill="#10b981" name="Savings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Status */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <PieChart className="w-5 h-5" />
              Project Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <PieChart className="w-5 h-5" />
              Task Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Task Priority */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <PieChart className="w-5 h-5" />
              Task Priority
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Work Hours Trend */}
        {monthlyWorkData.length > 0 && (
          <div className={`p-6 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <Clock className="w-5 h-5" />
              Work Hours Trend (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyWorkData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="month" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#f3f4f6' : '#111827'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Hours Worked"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Alerts and Issues */}
        {(overdueProjects.length > 0 || overdueTasks.length > 0) && (
          <div className={`p-6 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-red-900/20 to-gray-850 border-red-700/50' 
              : 'bg-gradient-to-br from-red-50 to-white border-red-200 shadow-lg'
          }`}>
            <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
              <AlertCircle className="w-5 h-5" />
              Alerts & Issues
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdueProjects.length > 0 && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <div className={`text-2xl mb-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                    {overdueProjects.length}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overdue Projects
                  </div>
                  <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Require immediate attention
                  </div>
                </div>
              )}
              {overdueTasks.length > 0 && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <div className={`text-2xl mb-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                    {overdueTasks.length}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overdue Tasks
                  </div>
                  <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Require immediate attention
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
        }`}>
          <h3 className={`mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <Calendar className="w-5 h-5" />
            Summary Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className={`text-2xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {submittedProjects.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Submitted Projects
              </div>
            </div>
            <div>
              <div className={`text-2xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {submittedProcurement.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Submitted Procurement
              </div>
            </div>
            <div>
              <div className={`text-2xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {pendingProcurement.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Procurement
              </div>
            </div>
            <div>
              <div className={`text-2xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {(totalWorkHours / (projects.length + tasks.length || 1)).toFixed(1)}h
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Hours per Item
              </div>
            </div>
          </div>
        </div>

        {/* Generated timestamp */}
        <div className={`text-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Analysis generated on {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}