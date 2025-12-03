import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Mail, Phone, Search } from 'lucide-react';
import type { FocalPoint, Project, Task, ProcurementItem } from '../App';

interface FocalPointsProps {
  focalPoints: FocalPoint[];
  setFocalPoints: (focalPoints: FocalPoint[]) => void;
  projects: Project[];
  tasks: Task[];
  procurementItems: ProcurementItem[];
  isDarkMode: boolean;
}

export function FocalPoints({ focalPoints, setFocalPoints, isDarkMode }: FocalPointsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingFocalPoint, setEditingFocalPoint] = useState<FocalPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    department: '',
    email: '',
    phoneNumber: '',
  });

  // Get unique sectors and departments for filters
  const sectors = Array.from(new Set(focalPoints.map(fp => fp.sector)));
  const departments = Array.from(new Set(focalPoints.map(fp => fp.department)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFocalPoint) {
      setFocalPoints(
        focalPoints.map(fp =>
          fp.id === editingFocalPoint.id
            ? { ...fp, ...formData }
            : fp
        )
      );
    } else {
      const newFocalPoint: FocalPoint = {
        id: Date.now().toString(),
        ...formData,
      };
      setFocalPoints([...focalPoints, newFocalPoint]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sector: '',
      department: '',
      email: '',
      phoneNumber: '',
    });
    setEditingFocalPoint(null);
    setShowModal(false);
  };

  const handleEdit = (focalPoint: FocalPoint) => {
    setEditingFocalPoint(focalPoint);
    setFormData({
      name: focalPoint.name,
      sector: focalPoint.sector,
      department: focalPoint.department,
      email: focalPoint.email,
      phoneNumber: focalPoint.phoneNumber,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this focal point?')) {
      setFocalPoints(focalPoints.filter(fp => fp.id !== id));
    }
  };

  // Filter focal points
  const filteredFocalPoints = focalPoints.filter(fp => {
    const matchesSearch = searchQuery === '' || 
      fp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fp.phoneNumber.includes(searchQuery);
    
    const matchesSector = filterSector === 'all' || fp.sector === filterSector;
    const matchesDepartment = filterDepartment === 'all' || fp.department === filterDepartment;
    
    return matchesSearch && matchesSector && matchesDepartment;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Focal Points</h1>
          <p className="text-gray-600">Manage contact information for focal points across sectors and departments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Focal Point
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterSector}
            onChange={e => setFilterSector(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(department => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>

        {(searchQuery || filterSector !== 'all' || filterDepartment !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSector('all');
                setFilterDepartment('all');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Clear all filters
            </button>
            <span className="text-gray-600 text-sm">
              Showing {filteredFocalPoints.length} of {focalPoints.length} focal points
            </span>
          </div>
        )}
      </div>

      {/* Focal Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFocalPoints.map(focalPoint => (
          <div key={focalPoint.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">{focalPoint.name}</h3>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {focalPoint.sector}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded">
                      {focalPoint.department}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(focalPoint)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(focalPoint.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              <a
                href={`mailto:${focalPoint.email}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">{focalPoint.email}</span>
              </a>
              <a
                href={`tel:${focalPoint.phoneNumber}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{focalPoint.phoneNumber}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredFocalPoints.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">
            {searchQuery || filterSector !== 'all' || filterDepartment !== 'all'
              ? 'No focal points found matching the current filters.'
              : 'No focal points added yet. Click "New Focal Point" to get started.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-gray-900">
                {editingFocalPoint ? 'Edit Focal Point' : 'New Focal Point'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Sector</label>
                    <input
                      type="text"
                      required
                      value={formData.sector}
                      onChange={e => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="IT"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Development"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123-456-7890"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingFocalPoint ? 'Update Focal Point' : 'Create Focal Point'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
