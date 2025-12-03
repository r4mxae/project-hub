import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Play, StopCircle, Download, Clock, FileText } from 'lucide-react';
import type { Project, Task, WorkLog } from '../App';
import * as XLSX from 'xlsx';

interface ProjectsAndTasksProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  isDarkMode: boolean;
}

export function ProjectsAndTasks({ projects, setProjects, tasks, setTasks, isDarkMode }: ProjectsAndTasksProps) {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showViewLogsModal, setShowViewLogsModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentWorkItem, setCurrentWorkItem] = useState<{ type: 'project' | 'task'; item: Project | Task } | null>(null);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [logFormData, setLogFormData] = useState({
    logUpdate: '',
    upcomingAction: '',
  });
  const [selectedItemForLogs, setSelectedItemForLogs] = useState<{ type: 'project' | 'task'; item: Project | Task } | null>(null);

  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    startDate: '',
    endDate: '',
    budget: '',
    spent: '',
    prNumber: '',
    negotiationNumber: '',
    sector: '',
    department: '',
    expectedSubmissionDate: '',
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    assignee: '',
    dueDate: '',
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentWorkItem) {
      interval = setInterval(() => {
        setCurrentTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentWorkItem]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWork = (type: 'project' | 'task', item: Project | Task) => {
    setCurrentWorkItem({ type, item });
    setCurrentTimer(0);
    
    if (type === 'project') {
      setProjects(projects.map(p => 
        p.id === item.id 
          ? { ...p, isWorkInProgress: true, currentWorkStartTime: new Date().toISOString() }
          : p
      ));
    } else {
      setTasks(tasks.map(t => 
        t.id === item.id 
          ? { ...t, isWorkInProgress: true, currentWorkStartTime: new Date().toISOString() }
          : t
      ));
    }
  };

  const handleStopWork = () => {
    setShowLogModal(true);
  };

  const handleSaveLog = () => {
    if (!logFormData.logUpdate.trim()) {
      alert('Log update cannot be empty. The log will not be added.');
      setShowLogModal(false);
      resetWorkSession();
      return;
    }

    if (!currentWorkItem) return;

    const newLog: WorkLog = {
      id: Date.now().toString(),
      startTime: currentWorkItem.item.currentWorkStartTime || new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: currentTimer,
      logUpdate: logFormData.logUpdate,
      upcomingAction: logFormData.upcomingAction,
      date: new Date().toISOString().split('T')[0],
    };

    if (currentWorkItem.type === 'project') {
      setProjects(projects.map(p => 
        p.id === currentWorkItem.item.id 
          ? { 
              ...p, 
              workLogs: [...p.workLogs, newLog],
              isWorkInProgress: false,
              currentWorkStartTime: undefined,
            }
          : p
      ));
    } else {
      setTasks(tasks.map(t => 
        t.id === currentWorkItem.item.id 
          ? { 
              ...t, 
              workLogs: [...t.workLogs, newLog],
              isWorkInProgress: false,
              currentWorkStartTime: undefined,
            }
          : t
      ));
    }

    setShowLogModal(false);
    resetWorkSession();
  };

  const resetWorkSession = () => {
    setCurrentWorkItem(null);
    setCurrentTimer(0);
    setLogFormData({ logUpdate: '', upcomingAction: '' });
  };

  const handleExportLogs = (type: 'project' | 'task', item: Project | Task) => {
    const workLogs = item.workLogs;
    
    const exportData = workLogs.map(log => ({
      'Project/Task Name': item.name || (item as Task).title,
      'Description': item.description,
      'Date': log.date,
      'Start Time': new Date(log.startTime).toLocaleString(),
      'End Time': new Date(log.endTime).toLocaleString(),
      'Duration (Hours)': (log.duration / 3600).toFixed(2),
      'Log Update': log.logUpdate,
      'Upcoming Action': log.upcomingAction,
    }));

    // Add summary row
    const totalDuration = workLogs.reduce((sum, log) => sum + log.duration, 0);
    exportData.push({
      'Project/Task Name': 'TOTAL',
      'Description': '',
      'Date': '',
      'Start Time': '',
      'End Time': '',
      'Duration (Hours)': (totalDuration / 3600).toFixed(2),
      'Log Update': '',
      'Upcoming Action': '',
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Work Logs');
    
    const fileName = `${item.name || (item as Task).title}_WorkLogs_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProject) {
      setProjects(
        projects.map(p =>
          p.id === editingProject.id
            ? {
                ...p,
                ...projectFormData,
                budget: parseFloat(projectFormData.budget),
                spent: parseFloat(projectFormData.spent),
                progress: Math.min(100, Math.round((parseFloat(projectFormData.spent) / parseFloat(projectFormData.budget)) * 100)),
              }
            : p
        )
      );
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        ...projectFormData,
        budget: parseFloat(projectFormData.budget),
        spent: parseFloat(projectFormData.spent),
        progress: Math.min(100, Math.round((parseFloat(projectFormData.spent) / parseFloat(projectFormData.budget)) * 100)),
        workLogs: [],
        isWorkInProgress: false,
        isSubmitted: false,
      };
      setProjects([...projects, newProject]);
    }

    resetProjectForm();
  };

  const resetProjectForm = () => {
    setProjectFormData({
      name: '',
      description: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      budget: '',
      spent: '',
      prNumber: '',
      negotiationNumber: '',
      sector: '',
      department: '',
      expectedSubmissionDate: '',
    });
    setEditingProject(null);
    setShowProjectModal(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget.toString(),
      spent: project.spent.toString(),
      prNumber: project.prNumber,
      negotiationNumber: project.negotiationNumber,
      sector: project.sector,
      department: project.department,
      expectedSubmissionDate: project.expectedSubmissionDate,
    });
    setShowProjectModal(true);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const project = projects.find(p => p.id === taskFormData.projectId);
    
    if (editingTask) {
      setTasks(
        tasks.map(t =>
          t.id === editingTask.id
            ? {
                ...t,
                ...taskFormData,
                projectName: project?.name || '',
              }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskFormData,
        projectName: project?.name || '',
        createdDate: new Date().toISOString().split('T')[0],
        workLogs: [],
        isWorkInProgress: false,
      };
      setTasks([...tasks, newTask]);
    }

    resetTaskForm();
  };

  const resetTaskForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      projectId: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: '',
    });
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const statusColors = {
    planning: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-green-100 text-green-700',
    'on-hold': 'bg-orange-100 text-orange-700',
    completed: 'bg-purple-100 text-purple-700',
    todo: 'bg-gray-100 text-gray-700',
    review: 'bg-purple-100 text-purple-700',
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`p-8 h-full overflow-auto ${isDarkMode ? 'bg-gray-900' : ''}`}>
      <div className="mb-8">
        <h1 className={`mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Projects & Tasks</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Manage your projects and tasks with time tracking</p>
      </div>

      {/* Active Timer Display */}
      {currentWorkItem && (
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white p-6 rounded-2xl mb-6 flex items-center justify-between shadow-2xl shadow-blue-500/30 border border-blue-400/30 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <div className="text-sm opacity-90 font-medium">Working on:</div>
              <div className="text-xl font-bold">
                {currentWorkItem.item.name || (currentWorkItem.item as Task).title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-mono font-bold tracking-wider">{formatTime(currentTimer)}</div>
            <button
              onClick={handleStopWork}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <StopCircle className="w-5 h-5" />
              Stop
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Section */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Projects</h2>
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {projects.filter(p => p.status !== 'completed').length === 0 ? (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-600">No active projects. Completed projects are in the Completed tab.</p>
              </div>
            ) : (
              projects.filter(p => p.status !== 'completed').map(project => (
              <div key={project.id} className={`group p-5 rounded-xl border transition-all duration-300 hover:scale-102 hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/20' 
                  : 'bg-white border-gray-200 hover:border-blue-400/50 shadow-md hover:shadow-xl hover:shadow-blue-500/10'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[project.status]}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {project.prNumber && <div>PR: {project.prNumber}</div>}
                      {project.negotiationNumber && <div>Neg: {project.negotiationNumber}</div>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!project.isWorkInProgress && !currentWorkItem && (
                      <button
                        onClick={() => handleStartWork('project', project)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Start Work"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {project.workLogs.length > 0 && (
                      <>
                        <button
                          onClick={() => setSelectedItemForLogs({ type: 'project', item: project })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Logs"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportLogs('project', project)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Export Logs"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {project.workLogs.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Total Time: {formatTime(project.workLogs.reduce((sum, log) => sum + log.duration, 0))}
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tasks</h2>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:from-green-700 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {tasks.map(task => {
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
              
              return (
                <div key={task.id} className={`group p-5 rounded-xl border transition-all duration-300 hover:scale-102 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700 hover:border-green-500/50 shadow-lg hover:shadow-green-500/20' 
                    : 'bg-white border-gray-200 hover:border-green-400/50 shadow-md hover:shadow-xl hover:shadow-green-500/10'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[task.status]}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{task.description}</p>
                      <div className="text-xs text-gray-600">
                        Project: {task.projectName} | Due: <span className={isOverdue ? 'text-red-600' : ''}>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!task.isWorkInProgress && !currentWorkItem && (
                        <button
                          onClick={() => handleStartWork('task', task)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Start Work"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {task.workLogs.length > 0 && (
                        <>
                          <button
                            onClick={() => setSelectedItemForLogs({ type: 'task', item: task })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Logs"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportLogs('task', task)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Export Logs"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {task.workLogs.length > 0 && (
                    <div className="text-xs text-gray-600">
                      Total Time: {formatTime(task.workLogs.reduce((sum, log) => sum + log.duration, 0))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-gray-900">{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={resetProjectForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitProject} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.name}
                    onChange={e => setProjectFormData({ ...projectFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    value={projectFormData.description}
                    onChange={e => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">PR Number</label>
                    <input
                      type="text"
                      value={projectFormData.prNumber}
                      onChange={e => setProjectFormData({ ...projectFormData, prNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Negotiation Number</label>
                    <input
                      type="text"
                      value={projectFormData.negotiationNumber}
                      onChange={e => setProjectFormData({ ...projectFormData, negotiationNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={e => setProjectFormData({ ...projectFormData, status: e.target.value as Project['status'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      value={projectFormData.startDate}
                      onChange={e => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      required
                      value={projectFormData.endDate}
                      onChange={e => setProjectFormData({ ...projectFormData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Budget ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={projectFormData.budget}
                      onChange={e => setProjectFormData({ ...projectFormData, budget: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Spent ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={projectFormData.spent}
                      onChange={e => setProjectFormData({ ...projectFormData, spent: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Sector</label>
                    <input
                      type="text"
                      value={projectFormData.sector}
                      onChange={e => setProjectFormData({ ...projectFormData, sector: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={projectFormData.department}
                      onChange={e => setProjectFormData({ ...projectFormData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Expected Submission Date</label>
                  <input
                    type="date"
                    value={projectFormData.expectedSubmissionDate}
                    onChange={e => setProjectFormData({ ...projectFormData, expectedSubmissionDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={resetProjectForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-gray-900">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={resetTaskForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitTask} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskFormData.title}
                    onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    value={taskFormData.description}
                    onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Project</label>
                  <select
                    required
                    value={taskFormData.projectId}
                    onChange={e => setTaskFormData({ ...taskFormData, projectId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      value={taskFormData.status}
                      onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value as Task['status'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Priority</label>
                    <select
                      value={taskFormData.priority}
                      onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value as Task['priority'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="medium">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Assignee</label>
                    <input
                      type="text"
                      required
                      value={taskFormData.assignee}
                      onChange={e => setTaskFormData({ ...taskFormData, assignee: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      required
                      value={taskFormData.dueDate}
                      onChange={e => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-gray-900">Work Session Complete</h2>
              <p className="text-gray-600 text-sm mt-1">
                Time spent: {formatTime(currentTimer)}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Log Update *</label>
                  <textarea
                    value={logFormData.logUpdate}
                    onChange={e => setLogFormData({ ...logFormData, logUpdate: e.target.value })}
                    rows={4}
                    placeholder="What did you accomplish?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Required - Log will not be saved if empty</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Upcoming Action</label>
                  <textarea
                    value={logFormData.upcomingAction}
                    onChange={e => setLogFormData({ ...logFormData, upcomingAction: e.target.value })}
                    rows={2}
                    placeholder="What's next?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleSaveLog}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    resetWorkSession();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Logs Modal */}
      {selectedItemForLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-gray-900">
                Work Logs - {selectedItemForLogs.item.name || (selectedItemForLogs.item as Task).title}
              </h2>
              <button onClick={() => setSelectedItemForLogs(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {selectedItemForLogs.item.workLogs.map((log, index) => (
                  <div key={log.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        Session #{index + 1} - {log.date}
                      </div>
                      <div className="text-sm text-gray-900">
                        Duration: {formatTime(log.duration)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                    </div>
                    <div className="mb-2">
                      <div className="text-sm text-gray-700 mb-1">Update:</div>
                      <div className="text-gray-900">{log.logUpdate}</div>
                    </div>
                    {log.upcomingAction && (
                      <div>
                        <div className="text-sm text-gray-700 mb-1">Upcoming Action:</div>
                        <div className="text-gray-900">{log.upcomingAction}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-gray-700 mb-1">Total Time Spent</div>
                <div className="text-blue-600 text-2xl">
                  {formatTime(selectedItemForLogs.item.workLogs.reduce((sum, log) => sum + log.duration, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}