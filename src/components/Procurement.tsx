import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Filter, Upload, CheckCircle, AlertTriangle, Clock, Search, Briefcase } from 'lucide-react';
import type { ProcurementItem, Project } from '../App';
import * as XLSX from 'xlsx';
import { toast } from 'sonner@2.0.3';

interface ProcurementProps {
  procurementItems: ProcurementItem[];
  setProcurementItems: (items: ProcurementItem[]) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  isDarkMode: boolean;
}

export function Procurement({ procurementItems, setProcurementItems, projects, setProjects, isDarkMode }: ProcurementProps) {
  const [activeTab, setActiveTab] = useState<'planned' | 'unplanned'>('planned');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUnplannedModal, setShowUnplannedModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcurementItem | null>(null);
  const [editingUnplanned, setEditingUnplanned] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<'submitted' | 'not-submitted' | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    item: '',
    sector: '',
    department: '',
    itemDescription: '',
    category: '',
    awardedBefore: '',
    allocatedBudget: '',
    requestedPreviously: '',
    prequalificationRecommended: '',
    recommendedVendors: '',
    additionalInformation: '',
    recommendedPRDate: '',
    itemReference: '',
  });
  const [formData, setFormData] = useState({
    item: '',
    sector: '',
    department: '',
    itemDescription: '',
    category: '',
    awardedBefore: '',
    allocatedBudget: '',
    requestedPreviously: '',
    prequalificationRecommended: '',
    recommendedVendors: '',
    additionalInformation: '',
    recommendedPRDate: '',
    itemReference: '',
    isSubmitted: false,
    status: 'pending' as 'pending' | 'in-progress' | 'awarded' | 'assigned',
  });

  const [unplannedFormData, setUnplannedFormData] = useState({
    name: '',
    description: '',
    sector: '',
    department: '',
    budget: '',
    prNumber: '',
    negotiationNumber: '',
    startDate: '',
    endDate: '',
    expectedSubmissionDate: '',
  });

  const categories = ['Hardware', 'Software', 'Equipment', 'Services', 'Supplies', 'Consulting', 'Other'];

  // Get unplanned projects (projects without projectId link from procurement)
  const unplannedProjects = projects.filter(p => 
    !procurementItems.some(item => item.projectId === p.id) && p.status !== 'completed'
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'dd-mm-yyyy' });
      
      if (jsonData.length > 0) {
        const headers = Object.keys(jsonData[0] as object);
        setExcelHeaders(headers);
        setExcelData(jsonData);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Helper function to convert Excel date serial number to DD-MM-YYYY format
  const convertExcelDate = (excelDate: any): string => {
    if (!excelDate) return '';
    
    // If it's already a string in DD-MM-YYYY format, return it
    if (typeof excelDate === 'string') {
      // Check if it's already in DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(excelDate)) {
        return excelDate;
      }
      // Check if it's in other common formats and try to parse
      if (excelDate.includes('/') || excelDate.includes('-')) {
        try {
          const date = new Date(excelDate);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          }
        } catch (e) {
          return excelDate; // Return as-is if parsing fails
        }
      }
      return excelDate;
    }
    
    // If it's a number (Excel serial date)
    if (typeof excelDate === 'number') {
      // Excel dates are stored as days since 1900-01-01 (with some quirks)
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    
    // If it's a Date object
    if (excelDate instanceof Date) {
      const day = String(excelDate.getDate()).padStart(2, '0');
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const year = excelDate.getFullYear();
      return `${day}-${month}-${year}`;
    }
    
    return String(excelDate);
  };

  const handleImport = () => {
    const requiredFields = ['item', 'sector', 'department', 'itemDescription', 'category', 'awardedBefore', 'allocatedBudget', 'recommendedPRDate', 'itemReference'];
    const missingMappings = requiredFields.filter(field => !columnMapping[field as keyof typeof columnMapping]);
    
    if (missingMappings.length > 0) {
      toast.error(`Please map all required fields. Missing: ${missingMappings.join(', ')}`);
      return;
    }

    const newItems: ProcurementItem[] = excelData.map((row, index) => {
      return {
        id: `import-${Date.now()}-${index}`,
        item: row[columnMapping.item] || '',
        sector: row[columnMapping.sector] || '',
        department: row[columnMapping.department] || '',
        itemDescription: row[columnMapping.itemDescription] || '',
        category: row[columnMapping.category] || '',
        awardedBefore: row[columnMapping.awardedBefore] || '',
        allocatedBudget: parseFloat(row[columnMapping.allocatedBudget]) || 0,
        requestedPreviously: row[columnMapping.requestedPreviously] || '',
        prequalificationRecommended: row[columnMapping.prequalificationRecommended] || '',
        recommendedVendors: row[columnMapping.recommendedVendors] || '',
        additionalInformation: row[columnMapping.additionalInformation] || '',
        recommendedPRDate: convertExcelDate(row[columnMapping.recommendedPRDate]),
        itemReference: row[columnMapping.itemReference] || '',
        isSubmitted: false,
        status: 'pending',
      };
    });

    setProcurementItems([...procurementItems, ...newItems]);
    resetImportModal();
    toast.success(`Successfully imported ${newItems.length} items`);
  };

  const resetImportModal = () => {
    setShowImportModal(false);
    setExcelData([]);
    setExcelHeaders([]);
    setColumnMapping({
      item: '',
      sector: '',
      department: '',
      itemDescription: '',
      category: '',
      awardedBefore: '',
      allocatedBudget: '',
      requestedPreviously: '',
      prequalificationRecommended: '',
      recommendedVendors: '',
      additionalInformation: '',
      recommendedPRDate: '',
      itemReference: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setProcurementItems(
        procurementItems.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                ...formData,
                allocatedBudget: parseFloat(formData.allocatedBudget),
              }
            : item
        )
      );
      toast.success('Procurement item updated successfully');
    } else {
      const newItem: ProcurementItem = {
        id: Date.now().toString(),
        ...formData,
        allocatedBudget: parseFloat(formData.allocatedBudget),
      };
      setProcurementItems([...procurementItems, newItem]);
      toast.success('Procurement item added successfully');
    }

    resetForm();
  };

  const handleUnplannedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUnplanned) {
      setProjects(
        projects.map(p =>
          p.id === editingUnplanned.id
            ? {
                ...p,
                name: unplannedFormData.name,
                description: unplannedFormData.description,
                sector: unplannedFormData.sector,
                department: unplannedFormData.department,
                budget: parseFloat(unplannedFormData.budget),
                prNumber: unplannedFormData.prNumber,
                negotiationNumber: unplannedFormData.negotiationNumber,
                startDate: unplannedFormData.startDate,
                endDate: unplannedFormData.endDate,
                expectedSubmissionDate: unplannedFormData.expectedSubmissionDate,
              }
            : p
        )
      );
      toast.success('Unplanned project updated successfully');
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        name: unplannedFormData.name,
        description: unplannedFormData.description,
        status: 'planning',
        startDate: unplannedFormData.startDate,
        endDate: unplannedFormData.endDate,
        progress: 0,
        budget: parseFloat(unplannedFormData.budget),
        spent: 0,
        prNumber: unplannedFormData.prNumber,
        negotiationNumber: unplannedFormData.negotiationNumber,
        workLogs: [],
        isWorkInProgress: false,
        sector: unplannedFormData.sector,
        department: unplannedFormData.department,
        expectedSubmissionDate: unplannedFormData.expectedSubmissionDate,
        isSubmitted: false,
      };
      setProjects([...projects, newProject]);
      toast.success('Unplanned project created and added to Projects & Tasks');
    }

    resetUnplannedForm();
  };

  const resetForm = () => {
    setFormData({
      item: '',
      sector: '',
      department: '',
      itemDescription: '',
      category: '',
      awardedBefore: '',
      allocatedBudget: '',
      requestedPreviously: '',
      prequalificationRecommended: '',
      recommendedVendors: '',
      additionalInformation: '',
      recommendedPRDate: '',
      itemReference: '',
      isSubmitted: false,
      status: 'pending',
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const resetUnplannedForm = () => {
    setUnplannedFormData({
      name: '',
      description: '',
      sector: '',
      department: '',
      budget: '',
      prNumber: '',
      negotiationNumber: '',
      startDate: '',
      endDate: '',
      expectedSubmissionDate: '',
    });
    setEditingUnplanned(null);
    setShowUnplannedModal(false);
  };

  const handleEdit = (item: ProcurementItem) => {
    setEditingItem(item);
    setFormData({
      item: item.item,
      sector: item.sector,
      department: item.department,
      itemDescription: item.itemDescription,
      category: item.category,
      awardedBefore: item.awardedBefore,
      allocatedBudget: item.allocatedBudget.toString(),
      requestedPreviously: item.requestedPreviously,
      prequalificationRecommended: item.prequalificationRecommended,
      recommendedVendors: item.recommendedVendors,
      additionalInformation: item.additionalInformation,
      recommendedPRDate: item.recommendedPRDate,
      itemReference: item.itemReference,
      isSubmitted: item.isSubmitted,
      status: item.status || 'pending',
    });
    setShowModal(true);
  };

  const handleEditUnplanned = (project: Project) => {
    setEditingUnplanned(project);
    setUnplannedFormData({
      name: project.name,
      description: project.description,
      sector: project.sector,
      department: project.department,
      budget: project.budget.toString(),
      prNumber: project.prNumber,
      negotiationNumber: project.negotiationNumber,
      startDate: project.startDate,
      endDate: project.endDate,
      expectedSubmissionDate: project.expectedSubmissionDate,
    });
    setShowUnplannedModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this procurement item?')) {
      setProcurementItems(procurementItems.filter(item => item.id !== id));
      toast.success('Procurement item deleted');
    }
  };

  const handleDeleteUnplanned = (id: string) => {
    if (confirm('Are you sure you want to delete this unplanned project?')) {
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Unplanned project deleted');
    }
  };

  const handleMarkAsSubmitted = (item: ProcurementItem) => {
    const submittedDate = new Date().toISOString().split('T')[0];
    const projectId = Date.now().toString();

    const newProject: Project = {
      id: projectId,
      name: `${item.item} - ${item.itemDescription}`,
      description: `Procurement Item: ${item.itemDescription}\nCategory: ${item.category}\nVendors: ${item.recommendedVendors}\nAdditional Info: ${item.additionalInformation}`,
      status: 'planning',
      startDate: submittedDate,
      endDate: item.recommendedPRDate,
      progress: 0,
      budget: item.allocatedBudget,
      spent: 0,
      prNumber: item.itemReference,
      negotiationNumber: '',
      workLogs: [],
      isWorkInProgress: false,
      sector: item.sector,
      department: item.department,
      expectedSubmissionDate: item.recommendedPRDate,
      isSubmitted: true,
      submittedDate,
    };

    setProcurementItems(
      procurementItems.map(proc =>
        proc.id === item.id ? { ...proc, isSubmitted: true, submittedDate, projectId, status: 'assigned' } : proc
      )
    );

    setProjects([...projects, newProject]);
    toast.success('Item marked as submitted and project created');
  };

  const handleMarkAsNotSubmitted = (item: ProcurementItem) => {
    if (!confirm(`This will mark the item as "Not Submitted" and delete the associated project.\n\nItem: ${item.item}\nDescription: ${item.itemDescription}`)) {
      return;
    }

    if (item.projectId) {
      setProjects(projects.filter(p => p.id !== item.projectId));
    }

    setProcurementItems(
      procurementItems.map(proc =>
        proc.id === item.id ? { ...proc, isSubmitted: false, submittedDate: undefined, projectId: undefined, status: 'pending' } : proc
      )
    );

    toast.success('Item reverted to not submitted');
  };

  // Filter and search for planned items
  const filteredItems = procurementItems.filter(item => {
    if (filterStatus === 'submitted' && !item.isSubmitted) return false;
    if (filterStatus === 'not-submitted' && item.isSubmitted) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterSector !== 'all' && item.sector !== filterSector) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.itemDescription.toLowerCase().includes(query) ||
        item.itemReference.toLowerCase().includes(query) ||
        item.item.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Filter and search for unplanned projects
  const filteredUnplanned = unplannedProjects.filter(project => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.prNumber.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getPRDateUrgency = (recommendedPRDate: string) => {
    // Handle cases where recommendedPRDate might be undefined or not a string
    if (!recommendedPRDate || typeof recommendedPRDate !== 'string') {
      return { color: isDarkMode ? 'text-gray-400 bg-gray-800/30 border-gray-700' : 'text-gray-700 bg-gray-50 border-gray-200', icon: Clock, label: '', days: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [day, month, year] = recommendedPRDate.split('-').map(Number);
    const prDate = new Date(year, month - 1, day);
    prDate.setHours(0, 0, 0, 0);
    
    const daysUntilPR = Math.ceil((prDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilPR < 0) {
      return { color: isDarkMode ? 'text-red-400 bg-red-900/30 border-red-700' : 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle, label: 'OVERDUE', days: Math.abs(daysUntilPR) };
    } else if (daysUntilPR <= 7) {
      return { color: isDarkMode ? 'text-orange-400 bg-orange-900/30 border-orange-700' : 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle, label: 'URGENT', days: daysUntilPR };
    } else if (daysUntilPR <= 14) {
      return { color: isDarkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700' : 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock, label: 'SOON', days: daysUntilPR };
    } else {
      return { color: isDarkMode ? 'text-gray-400 bg-gray-800/30 border-gray-700' : 'text-gray-700 bg-gray-50 border-gray-200', icon: Clock, label: '', days: daysUntilPR };
    }
  };

  const totalValue = filteredItems.reduce((sum, item) => sum + item.allocatedBudget, 0);
  const uniqueCategories = Array.from(new Set(procurementItems.map(item => item.category).filter(Boolean)));
  
  const prUrgencyStats = procurementItems.reduce((acc, item) => {
    if (!item.isSubmitted && item.recommendedPRDate) {
      const urgency = getPRDateUrgency(item.recommendedPRDate);
      if (urgency.label === 'OVERDUE') acc.overdue++;
      else if (urgency.label === 'URGENT') acc.urgent++;
      else if (urgency.label === 'SOON') acc.soon++;
    }
    return acc;
  }, { overdue: 0, urgent: 0, soon: 0 });

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-transparent bg-clip-text bg-gradient-to-r mb-2 ${
            isDarkMode ? 'from-blue-400 to-cyan-400' : 'from-blue-600 to-cyan-600'
          }`}>Procurement Management</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage procurement plan items and unplanned projects
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'planned' ? (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-5 h-5" />
                New Item
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg shadow-green-500/30"
              >
                <Upload className="w-5 h-5" />
                Import from Excel
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowUnplannedModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              New Unplanned Project
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('planned')}
          className={`px-6 py-3 font-medium transition-all duration-200 relative ${
            activeTab === 'planned'
              ? isDarkMode
                ? 'text-blue-400'
                : 'text-blue-600'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Procurement Plan
          {activeTab === 'planned' && (
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
            }`} />
          )}
        </button>
        <button
          onClick={() => setActiveTab('unplanned')}
          className={`px-6 py-3 font-medium transition-all duration-200 relative ${
            activeTab === 'unplanned'
              ? isDarkMode
                ? 'text-purple-400'
                : 'text-purple-600'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unplanned Projects
          {activeTab === 'unplanned' && (
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              isDarkMode ? 'bg-purple-400' : 'bg-purple-600'
            }`} />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'planned' ? "Search by description or reference..." : "Search by name, description, or PR number..."}
            className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:bg-gray-750 focus:border-blue-500'
                : 'bg-white border-gray-300 focus:border-blue-500'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>
      </div>

      {activeTab === 'planned' && (
        <>
          {/* Filters & Summary */}
          <div className={`p-4 rounded-lg border mb-6 transition-all duration-200 ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Filters:</span>
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as 'submitted' | 'not-submitted' | 'all')}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="not-submitted">Not Submitted</option>
                  <option value="submitted">Submitted</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterSector}
                  onChange={e => setFilterSector(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">All Sectors</option>
                  {Array.from(new Set(procurementItems.map(item => item.sector).filter(Boolean))).map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                {(filterStatus !== 'all' || filterCategory !== 'all' || filterSector !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterCategory('all');
                      setFilterSector('all');
                    }}
                    className={`text-sm transition-colors ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                {prUrgencyStats.overdue > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">{prUrgencyStats.overdue} Overdue</span>
                  </div>
                )}
                {prUrgencyStats.urgent > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">{prUrgencyStats.urgent} Urgent</span>
                  </div>
                )}
                {prUrgencyStats.soon > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{prUrgencyStats.soon} Due Soon</span>
                  </div>
                )}
                <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                  Total Budget: <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>AED {totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className={`rounded-lg border overflow-hidden transition-all duration-200 ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50'
              : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item #</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sector/Department</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget (AED)</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300 bg-blue-900/20' : 'text-gray-700 bg-blue-50'}`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span>PR Submit Date</span>
                      </div>
                    </th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item Reference</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredItems.map(item => (
                    <tr key={item.id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{item.item}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`line-clamp-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.itemDescription}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{item.sector}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{item.department}</div>
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.category}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.allocatedBudget.toLocaleString()}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
                        {(() => {
                          const urgency = getPRDateUrgency(item.recommendedPRDate);
                          const Icon = urgency.icon;
                          return (
                            <div className={`inline-flex flex-col gap-1 px-3 py-2 rounded-lg border-2 ${urgency.color}`}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span className="font-semibold">{item.recommendedPRDate}</span>
                              </div>
                              {urgency.label && (
                                <div className="text-xs flex items-center gap-1">
                                  <span className="font-semibold">{urgency.label}</span>
                                  <span>({urgency.days} {urgency.label === 'OVERDUE' ? 'days overdue' : 'days left'})</span>
                                </div>
                              )}
                              {!urgency.label && urgency.days > 0 && (
                                <div className="text-xs">{urgency.days} days left</div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.itemReference}</td>
                      <td className="px-6 py-4">
                        {item.isSubmitted ? (
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 w-fit ${
                              isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                            }`}>
                              <CheckCircle className="w-4 h-4" />
                              Submitted
                            </span>
                            {item.submittedDate && (
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{item.submittedDate}</span>
                            )}
                          </div>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            Not Submitted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 items-center">
                          {!item.isSubmitted ? (
                            <button
                              onClick={() => handleMarkAsSubmitted(item)}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md"
                              title="Mark as Submitted and Create Project"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Submitted
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsNotSubmitted(item)}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-600 transition-all duration-200 shadow-md"
                              title="Revert to Not Submitted (will delete project)"
                            >
                              <X className="w-4 h-4" />
                              Revert
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                  {searchQuery ? 'No procurement items found matching your search.' : 'No procurement items found matching the current filters.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'unplanned' && (
        <div className={`rounded-lg border overflow-hidden transition-all duration-200 ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50'
            : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Name</th>
                  <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</th>
                  <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sector/Department</th>
                  <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget (AED)</th>
                  <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>PR Number</th>
                  <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredUnplanned.map(project => (
                  <tr key={project.id} className={`transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{project.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`line-clamp-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{project.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{project.sector}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{project.department}</div>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{project.budget.toLocaleString()}</td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{project.prNumber || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        project.status === 'planning'
                          ? isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                          : project.status === 'in-progress'
                          ? isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                          : project.status === 'on-hold'
                          ? isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                          : isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        {project.status === 'in-progress' ? 'In Progress' : project.status === 'on-hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleEditUnplanned(project)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnplanned(project.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUnplanned.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                {searchQuery ? 'No unplanned projects found matching your search.' : 'No unplanned projects yet. Create one to get started.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Procurement Item Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                {editingItem ? 'Edit Procurement Item' : 'New Procurement Item'}
              </h2>
              <button
                onClick={resetForm}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.item}
                    onChange={e => setFormData({ ...formData, item: e.target.value })}
                    placeholder="e.g., 001, 002, 003"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sector *</label>
                    <input
                      type="text"
                      required
                      value={formData.sector}
                      onChange={e => setFormData({ ...formData, sector: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department *</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item Description *</label>
                  <textarea
                    required
                    value={formData.itemDescription}
                    onChange={e => setFormData({ ...formData, itemDescription: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Awarded Before (DD-MM-2026) *</label>
                    <input
                      type="text"
                      required
                      value={formData.awardedBefore}
                      onChange={e => setFormData({ ...formData, awardedBefore: e.target.value })}
                      placeholder="15-04-2026"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Allocated Budget (AED - Excl. VAT) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.allocatedBudget}
                    onChange={e => setFormData({ ...formData, allocatedBudget: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Requested Previously</label>
                    <select
                      value={formData.requestedPreviously}
                      onChange={e => setFormData({ ...formData, requestedPreviously: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Prequalification Recommended</label>
                    <select
                      value={formData.prequalificationRecommended}
                      onChange={e => setFormData({ ...formData, prequalificationRecommended: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recommended Vendor/s</label>
                  <input
                    type="text"
                    value={formData.recommendedVendors}
                    onChange={e => setFormData({ ...formData, recommendedVendors: e.target.value })}
                    placeholder="Enter vendor names separated by commas"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Additional Information</label>
                  <textarea
                    value={formData.additionalInformation}
                    onChange={e => setFormData({ ...formData, additionalInformation: e.target.value })}
                    rows={3}
                    placeholder="Information related to specifications, quantity, existing contracts, constraints, supply risks etc."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recommended PR Date (PR to PO) *</label>
                    <input
                      type="text"
                      required
                      value={formData.recommendedPRDate}
                      onChange={e => setFormData({ ...formData, recommendedPRDate: e.target.value })}
                      placeholder="01-03-2026"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item Reference *</label>
                    <input
                      type="text"
                      required
                      value={formData.itemReference}
                      onChange={e => setFormData({ ...formData, itemReference: e.target.value })}
                      placeholder="Use this Reference when raising PR"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unplanned Project Add/Edit Modal */}
      {showUnplannedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                {editingUnplanned ? 'Edit Unplanned Project' : 'New Unplanned Project'}
              </h2>
              <button
                onClick={resetUnplannedForm}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUnplannedSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Name *</label>
                  <input
                    type="text"
                    required
                    value={unplannedFormData.name}
                    onChange={e => setUnplannedFormData({ ...unplannedFormData, name: e.target.value })}
                    placeholder="Enter project name"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                  <textarea
                    required
                    value={unplannedFormData.description}
                    onChange={e => setUnplannedFormData({ ...unplannedFormData, description: e.target.value })}
                    rows={3}
                    placeholder="Enter project description"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sector *</label>
                    <input
                      type="text"
                      required
                      value={unplannedFormData.sector}
                      onChange={e => setUnplannedFormData({ ...unplannedFormData, sector: e.target.value })}
                      placeholder="Enter sector"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department *</label>
                    <input
                      type="text"
                      required
                      value={unplannedFormData.department}
                      onChange={e => setUnplannedFormData({ ...unplannedFormData, department: e.target.value })}
                      placeholder="Enter department"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget (AED) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={unplannedFormData.budget}
                    onChange={e => setUnplannedFormData({ ...unplannedFormData, budget: e.target.value })}
                    placeholder="Enter budget"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>PR Number</label>
                    <input
                      type="text"
                      value={unplannedFormData.prNumber}
                      onChange={e => setUnplannedFormData({ ...unplannedFormData, prNumber: e.target.value })}
                      placeholder="Enter PR number"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Negotiation Number</label>
                    <input
                      type="text"
                      value={unplannedFormData.negotiationNumber}
                      onChange={e => setUnplannedFormData({ ...unplannedFormData, negotiationNumber: e.target.value })}
                      placeholder="Enter negotiation number"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date *</label>
                    <input
                      type="date"
                      required
                      value={unplannedFormData.startDate}
                      onChange={e => setUnplannedFormData({ ...unplannedFormData, startDate: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date *</label>
                    <input
                      type="date"
                      required
                      value={unplannedFormData.endDate}
                      onChange={e => setUnplannedFormData({ ...unplannedFormData, endDate: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expected Submission *</label>
                    <input
                      type="date"
                      required
                      value={unplannedFormData.expectedSubmissionDate}
                      onChange={e => setUnplannedFormData({ ...unplannedFormData, expectedSubmissionDate: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200"
                >
                  {editingUnplanned ? 'Update Project' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={resetUnplannedForm}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal - keeping it same as before but with dark mode support */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>Import Procurement Plan Items</h2>
              <button
                onClick={resetImportModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className={`p-4 rounded-lg mb-4 ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <h3 className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Expected Excel Columns (in order from Column A):</h3>
                  <ol className={`text-sm list-decimal list-inside space-y-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    <li>Item</li>
                    <li>Sector</li>
                    <li>Department</li>
                    <li>Item Description</li>
                    <li>Category</li>
                    <li>Awarded Before (DD-MM-2026)</li>
                    <li>Allocated Budget OR Estimation (Shall be in AED - Excl. VAT)</li>
                    <li>Requested Previously</li>
                    <li>Prequalification Recommended</li>
                    <li>Recommended Vendor/s</li>
                    <li>Additional Information</li>
                    <li>Recommended PR Date (PR to PO)</li>
                    <li>Item Reference (Use this Reference when raising PR)</li>
                  </ol>
                </div>

                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upload Excel File</label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                {excelHeaders.length > 0 && (
                  <div>
                    <h3 className={`mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Map Excel Columns to Fields</h3>
                    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                      {Object.keys(columnMapping).map((field) => (
                        <div key={field}>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} {['item', 'sector', 'department', 'itemDescription', 'category', 'awardedBefore', 'allocatedBudget', 'recommendedPRDate', 'itemReference'].includes(field) && '*'}
                          </label>
                          <select
                            value={columnMapping[field as keyof typeof columnMapping]}
                            onChange={e => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            <option value="">Select column</option>
                            {excelHeaders.map(header => (
                              <option key={header} value={header}>{header}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-4 p-3 rounded-lg ${
                      isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
                    }`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        <strong>Note:</strong> All imported items will have status set to "Pending" by default.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={excelHeaders.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
                >
                  Import Items
                </button>
                <button
                  type="button"
                  onClick={resetImportModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
