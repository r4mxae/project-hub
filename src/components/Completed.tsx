import { useState } from 'react';
import { CheckCircle, Calendar, DollarSign, FileText, Eye, Download, Clock, ListTodo, X, Tag, User } from 'lucide-react';
import type { Project, Task, WorkLog } from '../App';
import * as XLSX from 'xlsx';

interface CompletedProps {
  projects: Project[];
  tasks: Task[];
  isDarkMode: boolean;
}

export function Completed({ projects, tasks, isDarkMode }: CompletedProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showTaskLogsModal, setShowTaskLogsModal] = useState(false);

  // Filter completed projects and tasks
  const completedProjects = projects.filter(p => p.status === 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Export project details to Excel
  const exportProjectDetails = (project: Project) => {
    const projectData = [{
      'Project Name': project.name,
      'Description': project.description,
      'Sector': project.sector,
      'Department': project.department,
      'PR Number': project.prNumber,
      'Negotiation Number': project.negotiationNumber,
      'Start Date': project.startDate,
      'End Date': project.endDate,
      'Budget (AED)': project.budget,
      'Spent (AED)': project.spent,
      'Savings (AED)': project.budget - project.spent,
      'Progress': project.progress + '%',
      'Submitted': project.isSubmitted ? 'Yes' : 'No',
      'Submitted Date': project.submittedDate || 'N/A',
    }];

    const ws = XLSX.utils.json_to_sheet(projectData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Project Details');

    // Add work logs if available
    if (project.workLogs && project.workLogs.length > 0) {
      const logsData = project.workLogs.map(log => ({
        'Date': log.date,
        'Start Time': new Date(log.startTime).toLocaleTimeString(),
        'End Time': new Date(log.endTime).toLocaleTimeString(),
        'Duration (hours)': (log.duration / 3600).toFixed(2),
        'Log Update': log.logUpdate,
        'Upcoming Action': log.upcomingAction || 'N/A',
      }));
      const logsWs = XLSX.utils.json_to_sheet(logsData);
      XLSX.utils.book_append_sheet(wb, logsWs, 'Work Logs');
    }

    XLSX.writeFile(wb, `${project.name.replace(/[^a-z0-9]/gi, '_')}_completed.xlsx`);
  };

  // Export task details to Excel
  const exportTaskDetails = (task: Task) => {
    const taskData = [{
      'Task Title': task.title,
      'Description': task.description,
      'Project': task.projectName,
      'Assignee': task.assignee,
      'Priority': task.priority,
      'Created Date': task.createdDate,
      'Due Date': task.dueDate,
    }];

    const ws = XLSX.utils.json_to_sheet(taskData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Task Details');

    // Add work logs if available
    if (task.workLogs && task.workLogs.length > 0) {
      const logsData = task.workLogs.map(log => ({
        'Date': log.date,
        'Start Time': new Date(log.startTime).toLocaleTimeString(),
        'End Time': new Date(log.endTime).toLocaleTimeString(),
        'Duration (hours)': (log.duration / 3600).toFixed(2),
        'Log Update': log.logUpdate,
        'Upcoming Action': log.upcomingAction || 'N/A',
      }));
      const logsWs = XLSX.utils.json_to_sheet(logsData);
      XLSX.utils.book_append_sheet(wb, logsWs, 'Work Logs');
    }

    XLSX.writeFile(wb, `${task.title.replace(/[^a-z0-9]/gi, '_')}_completed.xlsx`);
  };

  // Export all completed items
  const exportAllCompleted = () => {
    if (activeTab === 'projects') {
      const exportData = completedProjects.map(project => ({
        'Project Name': project.name,
        'Sector': project.sector,
        'Department': project.department,
        'PR Number': project.prNumber,
        'Negotiation Number': project.negotiationNumber,
        'Budget (AED)': project.budget,
        'Spent (AED)': project.spent,
        'Savings (AED)': project.budget - project.spent,
        'Start Date': project.startDate,
        'End Date': project.endDate,
        'Completed Date': project.submittedDate || 'N/A',
        'Total Work Hours': (project.workLogs.reduce((sum, log) => sum + log.duration, 0) / 3600).toFixed(2),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Completed Projects');
      XLSX.writeFile(wb, `completed_projects_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      const exportData = completedTasks.map(task => ({
        'Task Title': task.title,
        'Description': task.description,
        'Project': task.projectName,
        'Assignee': task.assignee,
        'Priority': task.priority,
        'Created Date': task.createdDate,
        'Due Date': task.dueDate,
        'Total Work Hours': (task.workLogs.reduce((sum, log) => sum + log.duration, 0) / 3600).toFixed(2),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Completed Tasks');
      XLSX.writeFile(wb, `completed_tasks_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  };

  // View work logs modal
  const viewProjectLogs = (project: Project) => {
    setSelectedProject(project);
    setShowLogsModal(true);
  };

  const viewTaskLogs = (task: Task) => {
    setSelectedTask(task);
    setShowTaskLogsModal(true);
  };

  const totalHoursWorked = (logs: WorkLog[]) => {
    return logs.reduce((sum, log) => sum + log.duration, 0) / 3600;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      case 'high':
        return isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700';
      case 'medium':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'low':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-transparent bg-clip-text bg-gradient-to-r mb-2 ${
            isDarkMode ? 'from-green-400 to-emerald-400' : 'from-green-600 to-emerald-600'
          }`}>Completed Items</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Archive of all completed projects and tasks with details and work logs
          </p>
        </div>
        {((activeTab === 'projects' && completedProjects.length > 0) || (activeTab === 'tasks' && completedTasks.length > 0)) && (
          <button
            onClick={exportAllCompleted}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg shadow-green-500/30"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 font-medium transition-all duration-200 relative ${
            activeTab === 'projects'
              ? isDarkMode
                ? 'text-green-400'
                : 'text-green-600'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Projects ({completedProjects.length})
          </div>
          {activeTab === 'projects' && (
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              isDarkMode ? 'bg-green-400' : 'bg-green-600'
            }`} />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 font-medium transition-all duration-200 relative ${
            activeTab === 'tasks'
              ? isDarkMode
                ? 'text-green-400'
                : 'text-green-600'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            Tasks ({completedTasks.length})
          </div>
          {activeTab === 'tasks' && (
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              isDarkMode ? 'bg-green-400' : 'bg-green-600'
            }`} />
          )}
        </button>
      </div>

      {activeTab === 'projects' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/30' 
                    : 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/20'
                }`}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {completedProjects.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed Projects</div>
            </div>

            <div className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20'
                }`}>
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                AED {(completedProjects.reduce((sum, p) => sum + (p.budget - p.spent), 0) / 1000).toFixed(0)}k
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Savings</div>
            </div>

            <div className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30' 
                    : 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20'
                }`}>
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {completedProjects.reduce((sum, p) => sum + totalHoursWorked(p.workLogs), 0).toFixed(0)}h
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours Worked</div>
            </div>
          </div>

          {/* Projects Grid */}
          {completedProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{project.name}</h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {project.description}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Sector / Department:</span>
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                        {project.sector} / {project.department}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>PR Number:</span>
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{project.prNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Negotiation Number:</span>
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{project.negotiationNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Budget Info */}
                  <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Budget</div>
                        <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                          AED {project.budget.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Spent</div>
                        <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                          AED {project.spent.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Savings</div>
                        <div className={isDarkMode ? 'text-green-400' : 'text-green-600'}>
                          AED {(project.budget - project.spent).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {project.startDate} - {project.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Work Logs Summary */}
                  {project.workLogs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {totalHoursWorked(project.workLogs).toFixed(1)} hours worked
                      </span>
                      <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {project.workLogs.length} work sessions
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {project.workLogs.length > 0 && (
                      <button
                        onClick={() => viewProjectLogs(project)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 flex-1 ${
                          isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-green-500'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-green-500'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        View Logs
                      </button>
                    )}
                    <button
                      onClick={() => exportProjectDetails(project)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 flex-1 ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-green-500'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-green-500'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-12 text-center rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
                : 'bg-white border-gray-200'
            }`}>
              <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Completed Projects Yet</h3>
              <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                Projects marked as completed will appear here
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'tasks' && (
        <>
          {/* Tasks Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/30' 
                    : 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/20'
                }`}>
                  <ListTodo className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {completedTasks.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed Tasks</div>
            </div>

            <div className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30' 
                    : 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20'
                }`}>
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {completedTasks.reduce((sum, t) => sum + totalHoursWorked(t.workLogs), 0).toFixed(0)}h
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours Worked</div>
            </div>
          </div>

          {/* Tasks Grid */}
          {completedTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{task.title}</h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Project:</span>
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{task.projectName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Assignee:</span>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{task.assignee}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Priority:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Work Logs Summary */}
                  {task.workLogs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {totalHoursWorked(task.workLogs).toFixed(1)} hours worked
                      </span>
                      <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {task.workLogs.length} work sessions
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {task.workLogs.length > 0 && (
                      <button
                        onClick={() => viewTaskLogs(task)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 flex-1 ${
                          isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-green-500'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-green-500'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        View Logs
                      </button>
                    )}
                    <button
                      onClick={() => exportTaskDetails(task)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 flex-1 ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-green-500'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-green-500'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-12 text-center rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
                : 'bg-white border-gray-200'
            }`}>
              <ListTodo className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Completed Tasks Yet</h3>
              <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                Tasks marked as completed will appear here
              </p>
            </div>
          )}
        </>
      )}

      {/* Project Work Logs Modal */}
      {showLogsModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Work Logs</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedProject.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedProject.workLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.date}</span>
                      </div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {(log.duration / 3600).toFixed(2)} hours
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Time: {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Log Update:</div>
                      <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{log.logUpdate}</div>
                    </div>
                    {log.upcomingAction && (
                      <div>
                        <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming Action:</div>
                        <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{log.upcomingAction}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Work Logs Modal */}
      {showTaskLogsModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Work Logs</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedTask.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowTaskLogsModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedTask.workLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.date}</span>
                      </div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {(log.duration / 3600).toFixed(2)} hours
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Time: {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Log Update:</div>
                      <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{log.logUpdate}</div>
                    </div>
                    {log.upcomingAction && (
                      <div>
                        <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming Action:</div>
                        <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{log.upcomingAction}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
