import { useState } from 'react';
import { Save, Download, Upload, User, Mail, Phone, Briefcase, FolderOpen, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import type { Project, Task, ProcurementItem, FocalPoint } from '../App';

interface UserSettings {
  name: string;
  designation: string;
  mobile: string;
  email: string;
  dataSaveLocation: string;
}

interface SettingsProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  procurementItems: ProcurementItem[];
  setProcurementItems: (items: ProcurementItem[]) => void;
  focalPoints: FocalPoint[];
  setFocalPoints: (points: FocalPoint[]) => void;
  isDarkMode: boolean;
}

export function Settings({
  projects,
  setProjects,
  tasks,
  setTasks,
  procurementItems,
  setProcurementItems,
  focalPoints,
  setFocalPoints,
  isDarkMode,
}: SettingsProps) {
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('userSettings');
    return saved ? JSON.parse(saved) : {
      name: '',
      designation: '',
      mobile: '',
      email: '',
      dataSaveLocation: 'browser',
    };
  });

  const [showWipeConfirmation, setShowWipeConfirmation] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    toast.success('Settings saved successfully!');
  };

  const handleExportData = () => {
    const data = {
      userSettings,
      projects,
      tasks,
      procurementItems,
      focalPoints,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.projects || !data.tasks || !data.procurementItems || !data.focalPoints) {
          throw new Error('Invalid data format');
        }

        // Import data
        if (data.userSettings) {
          setUserSettings(data.userSettings);
          localStorage.setItem('userSettings', JSON.stringify(data.userSettings));
        }
        setProjects(data.projects);
        setTasks(data.tasks);
        setProcurementItems(data.procurementItems);
        setFocalPoints(data.focalPoints);

        toast.success('Data imported successfully!');
      } catch (error) {
        toast.error('Failed to import data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input value so the same file can be uploaded again
    event.target.value = '';
  };

  const handleChooseLocation = () => {
    // This is a placeholder for file system API which is limited in browsers
    // For now, we'll just show a toast explaining the limitation
    toast.info('Files are saved to browser storage by default. Use Export to save to your computer.');
  };

  const handleWipeData = () => {
    // Clear all data
    localStorage.removeItem('userSettings');
    localStorage.removeItem('projects');
    localStorage.removeItem('tasks');
    localStorage.removeItem('procurementItems');
    localStorage.removeItem('focalPoints');
    setProjects([]);
    setTasks([]);
    setProcurementItems([]);
    setFocalPoints([]);
    
    // Reset user settings
    setUserSettings({
      name: '',
      designation: '',
      mobile: '',
      email: '',
      dataSaveLocation: 'browser',
    });

    // Hide confirmation dialog
    setShowWipeConfirmation(false);

    toast.success('All data has been wiped successfully!');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className={`text-transparent bg-clip-text bg-gradient-to-r ${
            isDarkMode ? 'from-blue-400 to-cyan-400' : 'from-blue-600 to-cyan-600'
          }`}>Settings</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage your profile and application data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Details Card */}
          <Card className={`p-6 space-y-6 transition-all duration-200 hover:shadow-xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <div className={`p-3 rounded-xl ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30' 
                  : 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20'
              }`}>
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>User Details</h2>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className={`flex items-center gap-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <User className="w-4 h-4" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                  placeholder="Enter your full name"
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:bg-gray-700 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <Label htmlFor="designation" className={`flex items-center gap-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Briefcase className="w-4 h-4" />
                  Designation
                </Label>
                <Input
                  id="designation"
                  value={userSettings.designation}
                  onChange={(e) => setUserSettings({ ...userSettings, designation: e.target.value })}
                  placeholder="Enter your designation"
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:bg-gray-700 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <Label htmlFor="mobile" className={`flex items-center gap-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Phone className="w-4 h-4" />
                  Mobile
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={userSettings.mobile}
                  onChange={(e) => setUserSettings({ ...userSettings, mobile: e.target.value })}
                  placeholder="Enter your mobile number"
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:bg-gray-700 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className={`flex items-center gap-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                  placeholder="Enter your email address"
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:bg-gray-700 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveSettings}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 transform hover:scale-105"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </Card>

          {/* Data Management Card */}
          <Card className={`p-6 space-y-6 transition-all duration-200 hover:shadow-xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50 shadow-lg shadow-gray-900/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <div className={`p-3 rounded-xl ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/30' 
                  : 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/20'
              }`}>
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>Data Management</h2>
            </div>

            <div className="space-y-4">
              {/* Data Save Location */}
              <div className="space-y-2">
                <Label className={`flex items-center gap-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FolderOpen className="w-4 h-4" />
                  Data Save Location
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={userSettings.dataSaveLocation === 'browser' ? 'Browser Storage (Default)' : userSettings.dataSaveLocation}
                    readOnly
                    className={`flex-1 ${
                      isDarkMode
                        ? 'bg-gray-700/50 border-gray-600 text-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                  <Button
                    onClick={handleChooseLocation}
                    variant="outline"
                    className={`transition-all duration-200 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-blue-500'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    Choose
                  </Button>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Data is stored in browser storage. Use export/import for backups.
                </p>
              </div>

              {/* Export Data */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleExportData}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/30 transition-all duration-200 transform hover:scale-105"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Download all your data as a JSON file
                </p>
              </div>

              {/* Import Data */}
              <div className="space-y-2 pt-4">
                <Label
                  htmlFor="import-file"
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Import Data from File
                </Label>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Upload a previously exported JSON file
                </p>
              </div>

              {/* Wipe Data */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => setShowWipeConfirmation(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/30 transition-all duration-200 transform hover:scale-105"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Wipe All Data
                </Button>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  ⚠️ Permanently delete all stored data
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <Card className={`p-6 transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/30' 
            : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
        }`}>
          <div className="space-y-3">
            <h3 className={`flex items-center gap-2 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              💡 Data Storage Information
            </h3>
            <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>
                • Your data is stored locally in your browser's storage and persists between sessions.
              </p>
              <p>
                • Use the <strong>Export Data</strong> button regularly to create backups of all your projects, tasks, procurement items, and focal points.
              </p>
              <p>
                • You can restore your data anytime by using the <strong>Import Data</strong> button with a previously exported file.
              </p>
              <p>
                • Clearing your browser data will remove all stored information. Always keep backups!
              </p>
            </div>
          </div>
        </Card>

        {/* Wipe Confirmation Dialog */}
        {showWipeConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className={`max-w-md w-full p-6 transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-red-700/50' 
                : 'bg-white border-red-200'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-500 shadow-lg shadow-red-500/30">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={isDarkMode ? 'text-red-400' : 'text-red-700'}>
                    Confirm Data Wipe
                  </h3>
                </div>
                <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>
                    Are you absolutely sure you want to wipe all your data? This action cannot be undone and will permanently remove:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>All {projects.length} projects</li>
                    <li>All {tasks.length} tasks</li>
                    <li>All {procurementItems.length} procurement items</li>
                    <li>All {focalPoints.length} focal points</li>
                    <li>Your user settings</li>
                  </ul>
                  <p className="pt-2 font-semibold text-red-600">
                    This action is IRREVERSIBLE! Make sure you have exported your data before proceeding.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={() => setShowWipeConfirmation(false)}
                    variant="outline"
                    className={`transition-all duration-200 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWipeData}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/30 transition-all duration-200 transform hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Yes, Wipe Everything
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
