import { useState } from 'react';
import { AlertTriangle, Mail, Copy, Check, Filter } from 'lucide-react';
import type { Project, FocalPoint } from '../App';

interface RisksProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  focalPoints: FocalPoint[];
  isDarkMode: boolean;
}

export function Risks({ projects, setProjects, focalPoints, isDarkMode }: RisksProps) {
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [emailGenerated, setEmailGenerated] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '', recipients: [] as FocalPoint[] });
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Get unique sectors and departments from projects
  const sectors = Array.from(new Set(projects.map(p => p.sector)));
  const departments = Array.from(new Set(projects.map(p => p.department)));

  // Get at-risk projects (not submitted and past expected submission date)
  const atRiskProjects = projects.filter(project => {
    const isOverdue = new Date(project.expectedSubmissionDate) < new Date() && !project.isSubmitted;
    const matchesSector = filterSector === 'all' || project.sector === filterSector;
    const matchesDepartment = filterDepartment === 'all' || project.department === filterDepartment;
    
    return isOverdue && matchesSector && matchesDepartment;
  });

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
    setEmailGenerated(false);
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === atRiskProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(atRiskProjects.map(p => p.id));
    }
    setEmailGenerated(false);
  };

  const handleMarkAsSubmitted = (projectId: string) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? { ...p, isSubmitted: true, submittedDate: new Date().toISOString().split('T')[0] }
          : p
      )
    );
  };

  const generateReminderEmail = () => {
    if (selectedProjects.length === 0) {
      alert('Please select at least one project');
      return;
    }

    const selectedProjectDetails = projects.filter(p => selectedProjects.includes(p.id));
    
    // Get unique focal points for the selected projects
    const uniqueFocalPoints = new Map<string, FocalPoint>();
    
    selectedProjectDetails.forEach(project => {
      const matchingFocalPoints = focalPoints.filter(
        fp => fp.sector === project.sector && fp.department === project.department
      );
      
      matchingFocalPoints.forEach(fp => {
        uniqueFocalPoints.set(fp.id, fp);
      });
    });

    const recipients = Array.from(uniqueFocalPoints.values());

    if (recipients.length === 0) {
      alert('No focal points found for the selected projects. Please add focal points with matching sectors and departments.');
      return;
    }

    // Group projects by sector/department
    const projectsBySectorDept = new Map<string, Project[]>();
    selectedProjectDetails.forEach(project => {
      const key = `${project.sector} - ${project.department}`;
      if (!projectsBySectorDept.has(key)) {
        projectsBySectorDept.set(key, []);
      }
      projectsBySectorDept.get(key)!.push(project);
    });

    // Generate email subject
    const subject = `Reminder: Overdue Project Submissions - ${new Date().toLocaleDateString()}`;

    // Generate email body
    let body = `Dear Team,\n\nThis is a friendly reminder regarding the following project(s) that were expected to be submitted but have not been received yet:\n\n`;

    projectsBySectorDept.forEach((projects, key) => {
      body += `${key}:\n`;
      projects.forEach(project => {
        const daysOverdue = Math.floor((new Date().getTime() - new Date(project.expectedSubmissionDate).getTime()) / (1000 * 60 * 60 * 24));
        body += `  • ${project.name}\n`;
        body += `    Expected Submission Date: ${new Date(project.expectedSubmissionDate).toLocaleDateString()}\n`;
        body += `    Days Overdue: ${daysOverdue}\n`;
        body += `    Description: ${project.description}\n\n`;
      });
    });

    body += `Please provide an update on the status of these project(s) at your earliest convenience.\n\n`;
    body += `If you have already submitted these projects, please disregard this reminder and confirm the submission date.\n\n`;
    body += `Thank you for your cooperation.\n\n`;
    body += `Best regards,\n`;
    body += `Project Management Team`;

    setGeneratedEmail({ subject, body, recipients });
    setEmailGenerated(true);
    setCopiedToClipboard(false);
  };

  const copyToClipboard = () => {
    const emailText = `To: ${generatedEmail.recipients.map(r => r.email).join('; ')}\n\nSubject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(emailText);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const openInEmailClient = () => {
    const recipients = generatedEmail.recipients.map(r => r.email).join(',');
    const mailtoLink = `mailto:${recipients}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Risks - Overdue Project Submissions</h1>
        <p className="text-gray-600">Track projects that were expected to be submitted but have not been received</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Filters:</span>
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

          {(filterSector !== 'all' || filterDepartment !== 'all') && (
            <button
              onClick={() => {
                setFilterSector('all');
                setFilterDepartment('all');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-gray-900">Overdue Projects</h3>
          </div>
          <div className="text-3xl text-red-600">{atRiskProjects.length}</div>
          <div className="text-sm text-gray-600 mt-1">Projects past expected submission date</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">Selected</h3>
          </div>
          <div className="text-3xl text-blue-600">{selectedProjects.length}</div>
          <div className="text-sm text-gray-600 mt-1">Projects selected for reminder</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
            <h3 className="text-gray-900">Average Days Overdue</h3>
          </div>
          <div className="text-3xl text-purple-600">
            {atRiskProjects.length > 0
              ? Math.round(
                  atRiskProjects.reduce((sum, p) => {
                    const days = Math.floor(
                      (new Date().getTime() - new Date(p.expectedSubmissionDate).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return sum + days;
                  }, 0) / atRiskProjects.length
                )
              : 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Days past expected date</div>
        </div>
      </div>

      {/* Action Buttons */}
      {atRiskProjects.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {selectedProjects.length === atRiskProjects.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={generateReminderEmail}
              disabled={selectedProjects.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generate Reminder Email
            </button>
          </div>
        </div>
      )}

      {/* Overdue Projects List */}
      <div className="space-y-4 mb-6">
        {atRiskProjects.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <AlertTriangle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Overdue Projects</h3>
            <p className="text-gray-600">
              {filterSector !== 'all' || filterDepartment !== 'all'
                ? 'No overdue projects found matching the current filters.'
                : 'All projects have been submitted on time!'}
            </p>
          </div>
        ) : (
          atRiskProjects.map(project => {
            const daysOverdue = Math.floor((new Date().getTime() - new Date(project.expectedSubmissionDate).getTime()) / (1000 * 60 * 60 * 24));
            const isSelected = selectedProjects.includes(project.id);
            const matchingFocalPoints = focalPoints.filter(
              fp => fp.sector === project.sector && fp.department === project.department
            );

            return (
              <div
                key={project.id}
                className={`bg-white p-6 rounded-lg border-2 transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleProjectSelect(project.id)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-gray-900 mb-1">{project.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {project.sector}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                            {project.department}
                          </span>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                            {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleMarkAsSubmitted(project.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        Mark as Submitted
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Expected Submission:</span>
                        <span className="text-gray-900 ml-2">
                          {new Date(project.expectedSubmissionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Project Status:</span>
                        <span className="text-gray-900 ml-2 capitalize">
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-700 mb-2">
                        Focal Points ({matchingFocalPoints.length}):
                      </div>
                      {matchingFocalPoints.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {matchingFocalPoints.map(fp => (
                            <div key={fp.id} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-sm">
                              <span className="text-gray-900">{fp.name}</span>
                              <span className="text-gray-600">({fp.email})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-red-600 text-sm">
                          No focal points assigned to this sector/department
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Generated Email Display */}
      {emailGenerated && (
        <div className="bg-white p-6 rounded-lg border-2 border-blue-500 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Generated Reminder Email
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copiedToClipboard ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                onClick={openInEmailClient}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Open in Email Client
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Recipients ({generatedEmail.recipients.length}):</label>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                {generatedEmail.recipients.map((recipient, index) => (
                  <div key={recipient.id} className="text-sm text-gray-900">
                    {recipient.name} ({recipient.email})
                    {index < generatedEmail.recipients.length - 1 && '; '}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Subject:</label>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm text-gray-900">{generatedEmail.subject}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Body:</label>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">{generatedEmail.body}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
