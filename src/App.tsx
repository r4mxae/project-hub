import { useState, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoadingFallback } from './components/LoadingFallback';

// Lazy load heavy components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const ProjectsAndTasks = lazy(() => import('./components/ProjectsAndTasks').then(m => ({ default: m.ProjectsAndTasks })));
const Procurement = lazy(() => import('./components/Procurement').then(m => ({ default: m.Procurement })));
const FocalPoints = lazy(() => import('./components/FocalPoints').then(m => ({ default: m.FocalPoints })));
const Risks = lazy(() => import('./components/Risks').then(m => ({ default: m.Risks })));
const Savings = lazy(() => import('./components/Savings').then(m => ({ default: m.Savings })));
const Completed = lazy(() => import('./components/Completed').then(m => ({ default: m.Completed })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const Upcoming = lazy(() => import('./components/Upcoming').then(m => ({ default: m.Upcoming })));
const Analysis = lazy(() => import('./components/Analysis').then(m => ({ default: m.Analysis })));

export type View = 'dashboard' | 'projects-tasks' | 'procurement' | 'focal-points' | 'risks' | 'savings' | 'completed' | 'settings' | 'upcoming' | 'analysis';

export interface WorkLog {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  logUpdate: string;
  upcomingAction: string;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed';
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  spent: number;
  prNumber: string;
  negotiationNumber: string;
  workLogs: WorkLog[];
  isWorkInProgress: boolean;
  currentWorkStartTime?: string;
  sector: string;
  department: string;
  expectedSubmissionDate: string;
  isSubmitted: boolean;
  submittedDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  createdDate: string;
  workLogs: WorkLog[];
  isWorkInProgress: boolean;
  currentWorkStartTime?: string;
}

export interface ProcurementItem {
  id: string;
  item: string;
  sector: string;
  department: string;
  itemDescription: string;
  category: string;
  awardedBefore: string;
  allocatedBudget: number;
  requestedPreviously: string;
  prequalificationRecommended: string;
  recommendedVendors: string;
  additionalInformation: string;
  recommendedPRDate: string;
  itemReference: string;
  isSubmitted: boolean;
  submittedDate?: string;
  projectId?: string;
  status?: 'pending' | 'in-progress' | 'awarded' | 'assigned';
}

export interface FocalPoint {
  id: string;
  name: string;
  sector: string;
  department: string;
  email: string;
  phoneNumber: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
      status: 'in-progress',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 65,
      budget: 50000,
      spent: 32500,
      prNumber: '',
      negotiationNumber: '',
      workLogs: [],
      isWorkInProgress: false,
      sector: 'IT',
      department: 'Digital Services',
      expectedSubmissionDate: '2024-03-01',
      isSubmitted: true,
      submittedDate: '2024-02-28',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native iOS and Android application for customer portal',
      status: 'in-progress',
      startDate: '2024-02-01',
      endDate: '2024-08-15',
      progress: 40,
      budget: 120000,
      spent: 48000,
      prNumber: '',
      negotiationNumber: '',
      workLogs: [],
      isWorkInProgress: false,
      sector: 'IT',
      department: 'Development',
      expectedSubmissionDate: '2024-11-20',
      isSubmitted: false,
    },
    {
      id: '3',
      name: 'Infrastructure Upgrade',
      description: 'Server and network infrastructure modernization',
      status: 'planning',
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      progress: 15,
      budget: 85000,
      spent: 12750,
      prNumber: '',
      negotiationNumber: '',
      workLogs: [],
      isWorkInProgress: false,
      sector: 'IT',
      department: 'Infrastructure',
      expectedSubmissionDate: '2024-11-25',
      isSubmitted: false,
    },
    {
      id: '4',
      name: 'Marketing Campaign Q2',
      description: 'Digital marketing campaign for product launch',
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      progress: 100,
      budget: 35000,
      spent: 33500,
      prNumber: '',
      negotiationNumber: '',
      workLogs: [],
      isWorkInProgress: false,
      sector: 'Marketing',
      department: 'Digital Marketing',
      expectedSubmissionDate: '2024-02-15',
      isSubmitted: true,
      submittedDate: '2024-02-10',
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design homepage mockups',
      description: 'Create high-fidelity mockups for new homepage',
      projectId: '1',
      projectName: 'Website Redesign',
      status: 'completed',
      priority: 'high',
      assignee: 'Sarah Chen',
      dueDate: '2024-03-15',
      createdDate: '2024-01-20',
      workLogs: [
        {
          id: '5',
          startTime: '2024-01-20T09:00:00Z',
          endTime: '2024-01-20T17:00:00Z',
          duration: 28800,
          logUpdate: 'Initial design mockups created',
          upcomingAction: 'Review with team',
          date: '2024-01-20',
        },
      ],
      isWorkInProgress: false,
    },
    {
      id: '2',
      title: 'Develop authentication system',
      description: 'Implement secure user authentication and authorization',
      projectId: '2',
      projectName: 'Mobile App Development',
      status: 'in-progress',
      priority: 'urgent',
      assignee: 'Michael Roberts',
      dueDate: '2024-04-10',
      createdDate: '2024-02-05',
      workLogs: [
        {
          id: '6',
          startTime: '2024-02-05T09:00:00Z',
          endTime: '2024-02-05T17:00:00Z',
          duration: 28800,
          logUpdate: 'Authentication system design started',
          upcomingAction: 'Implement authentication',
          date: '2024-02-05',
        },
      ],
      isWorkInProgress: false,
    },
    {
      id: '3',
      title: 'Review server specifications',
      description: 'Evaluate and finalize server hardware requirements',
      projectId: '3',
      projectName: 'Infrastructure Upgrade',
      status: 'review',
      priority: 'medium',
      assignee: 'David Kumar',
      dueDate: '2024-04-20',
      createdDate: '2024-03-01',
      workLogs: [
        {
          id: '7',
          startTime: '2024-03-01T09:00:00Z',
          endTime: '2024-03-01T17:00:00Z',
          duration: 28800,
          logUpdate: 'Server specifications reviewed',
          upcomingAction: 'Finalize hardware requirements',
          date: '2024-03-01',
        },
      ],
      isWorkInProgress: false,
    },
    {
      id: '4',
      title: 'Content creation for blog',
      description: 'Write and publish 5 blog posts for SEO',
      projectId: '1',
      projectName: 'Website Redesign',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Emma Wilson',
      dueDate: '2024-04-30',
      createdDate: '2024-02-10',
      workLogs: [
        {
          id: '8',
          startTime: '2024-02-10T09:00:00Z',
          endTime: '2024-02-10T17:00:00Z',
          duration: 28800,
          logUpdate: 'Blog post draft created',
          upcomingAction: 'Review and publish',
          date: '2024-02-10',
        },
      ],
      isWorkInProgress: false,
    },
    {
      id: '5',
      title: 'User testing sessions',
      description: 'Conduct user testing with beta testers',
      projectId: '2',
      projectName: 'Mobile App Development',
      status: 'todo',
      priority: 'high',
      assignee: 'Sarah Chen',
      dueDate: '2024-05-15',
      createdDate: '2024-03-10',
      workLogs: [],
      isWorkInProgress: false,
    },
  ]);

  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([
    {
      id: '1',
      item: '001',
      sector: 'IT',
      department: 'Infrastructure',
      itemDescription: 'Dell PowerEdge Servers - High-performance rack servers for data center upgrade',
      category: 'Hardware',
      awardedBefore: '15-04-2026',
      allocatedBudget: 17500,
      requestedPreviously: 'No',
      prequalificationRecommended: 'Yes',
      recommendedVendors: 'TechSupply Inc, Dell Direct',
      additionalInformation: 'Existing contract expires in Q2. Require 5 units with redundant power supplies.',
      recommendedPRDate: '01-03-2026',
      itemReference: 'IT-HW-2026-001',
      isSubmitted: false,
    },
    {
      id: '2',
      item: '002',
      sector: 'Marketing',
      department: 'Digital Marketing',
      itemDescription: 'Adobe Creative Cloud Licenses - Annual enterprise licenses for creative team',
      category: 'Software',
      awardedBefore: '01-02-2026',
      allocatedBudget: 6000,
      requestedPreviously: 'Yes',
      prequalificationRecommended: 'No',
      recommendedVendors: 'Adobe Systems',
      additionalInformation: 'Renewal of existing licenses. 10 seats required.',
      recommendedPRDate: '15-01-2026',
      itemReference: 'MKT-SW-2026-001',
      isSubmitted: true,
      submittedDate: '2024-01-10',
      projectId: '1',
    },
    {
      id: '3',
      item: '003',
      sector: 'IT',
      department: 'Infrastructure',
      itemDescription: 'Network Switches - Enterprise-grade network switches for office expansion',
      category: 'Hardware',
      awardedBefore: '25-04-2026',
      allocatedBudget: 9600,
      requestedPreviously: 'No',
      prequalificationRecommended: 'Yes',
      recommendedVendors: 'NetGear Solutions, Cisco',
      additionalInformation: 'Need 8 units with minimum 48 ports each. Must support PoE+',
      recommendedPRDate: '10-03-2026',
      itemReference: 'IT-HW-2026-002',
      isSubmitted: false,
    },
  ]);

  const [focalPoints, setFocalPoints] = useState<FocalPoint[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      sector: 'IT',
      department: 'Digital Services',
      email: 'sarah.johnson@example.com',
      phoneNumber: '555-0101',
    },
    {
      id: '2',
      name: 'Michael Chen',
      sector: 'IT',
      department: 'Development',
      email: 'michael.chen@example.com',
      phoneNumber: '555-0102',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      sector: 'IT',
      department: 'Infrastructure',
      email: 'emily.rodriguez@example.com',
      phoneNumber: '555-0103',
    },
    {
      id: '4',
      name: 'David Kim',
      sector: 'Marketing',
      department: 'Digital Marketing',
      email: 'david.kim@example.com',
      phoneNumber: '555-0104',
    },
  ]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
      <main className={`flex-1 overflow-auto ${isDarkMode ? 'dark:bg-gray-900' : ''}`}>
        {currentView === 'dashboard' && (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard
              projects={projects}
              tasks={tasks}
              procurementItems={procurementItems}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'projects-tasks' && (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectsAndTasks 
              projects={projects} 
              setProjects={setProjects} 
              tasks={tasks} 
              setTasks={setTasks}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'procurement' && (
          <Suspense fallback={<LoadingFallback />}>
            <Procurement
              procurementItems={procurementItems}
              setProcurementItems={setProcurementItems}
              projects={projects}
              setProjects={setProjects}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'focal-points' && (
          <Suspense fallback={<LoadingFallback />}>
            <FocalPoints
              projects={projects}
              tasks={tasks}
              procurementItems={procurementItems}
              focalPoints={focalPoints}
              setFocalPoints={setFocalPoints}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'risks' && (
          <Suspense fallback={<LoadingFallback />}>
            <Risks
              projects={projects}
              setProjects={setProjects}
              focalPoints={focalPoints}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'savings' && (
          <Suspense fallback={<LoadingFallback />}>
            <Savings
              projects={projects}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'completed' && (
          <Suspense fallback={<LoadingFallback />}>
            <Completed
              projects={projects}
              tasks={tasks}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'settings' && (
          <Suspense fallback={<LoadingFallback />}>
            <Settings
              projects={projects}
              setProjects={setProjects}
              tasks={tasks}
              setTasks={setTasks}
              procurementItems={procurementItems}
              setProcurementItems={setProcurementItems}
              focalPoints={focalPoints}
              setFocalPoints={setFocalPoints}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'upcoming' && (
          <Suspense fallback={<LoadingFallback />}>
            <Upcoming
              procurementItems={procurementItems}
              focalPoints={focalPoints}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
        {currentView === 'analysis' && (
          <Suspense fallback={<LoadingFallback />}>
            <Analysis
              projects={projects}
              tasks={tasks}
              procurementItems={procurementItems}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
}

export default App;