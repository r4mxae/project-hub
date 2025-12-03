import { DollarSign, TrendingUp, Calendar, CheckCircle, Download } from 'lucide-react';
import type { Project } from '../App';
import * as XLSX from 'xlsx';

interface SavingsProps {
  projects: Project[];
  isDarkMode: boolean;
}

export function Savings({ projects, isDarkMode }: SavingsProps) {
  // Filter completed projects
  const completedProjects = projects.filter(p => p.status === 'completed');

  // Calculate savings for each project
  const savingsData = completedProjects.map(project => ({
    id: project.id,
    name: project.name,
    budget: project.budget,
    spent: project.spent,
    savings: project.budget - project.spent,
    savingsPercentage: ((project.budget - project.spent) / project.budget) * 100,
    completedDate: project.submittedDate || 'N/A',
    sector: project.sector,
    department: project.department,
  }));

  // Calculate total savings
  const totalBudget = savingsData.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = savingsData.reduce((sum, p) => sum + p.spent, 0);
  const totalSavings = totalBudget - totalSpent;
  const totalSavingsPercentage = totalBudget > 0 ? (totalSavings / totalBudget) * 100 : 0;

  // Export to Excel
  const exportToExcel = () => {
    const exportData = savingsData.map(item => ({
      'Project Name': item.name,
      'Sector': item.sector,
      'Department': item.department,
      'Budget (AED)': item.budget,
      'Spent (AED)': item.spent,
      'Savings (AED)': item.savings,
      'Savings %': item.savingsPercentage.toFixed(2) + '%',
      'Completed Date': item.completedDate,
    }));

    // Add summary row
    exportData.push({
      'Project Name': 'TOTAL',
      'Sector': '',
      'Department': '',
      'Budget (AED)': totalBudget,
      'Spent (AED)': totalSpent,
      'Savings (AED)': totalSavings,
      'Savings %': totalSavingsPercentage.toFixed(2) + '%',
      'Completed Date': '',
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Savings Report');
    XLSX.writeFile(wb, `savings_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className={`p-8 ${isDarkMode ? 'bg-gray-900' : ''}`}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Savings Tracker</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Track budget savings from completed projects
          </p>
        </div>
        {savingsData.length > 0 && (
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            AED {(totalBudget / 1000).toFixed(0)}k
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Budget</div>
        </div>

        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-50'}`}>
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            AED {(totalSpent / 1000).toFixed(0)}k
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</div>
        </div>

        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-50'}`}>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className={`text-3xl mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            AED {(totalSavings / 1000).toFixed(0)}k
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Savings</div>
        </div>

        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900' : 'bg-purple-50'}`}>
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {totalSavingsPercentage.toFixed(1)}%
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Savings Rate</div>
        </div>
      </div>

      {/* Savings Table */}
      {savingsData.length > 0 ? (
        <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project
                  </th>
                  <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sector / Department
                  </th>
                  <th className={`px-6 py-3 text-right text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Budget
                  </th>
                  <th className={`px-6 py-3 text-right text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Spent
                  </th>
                  <th className={`px-6 py-3 text-right text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Savings
                  </th>
                  <th className={`px-6 py-3 text-right text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Savings %
                  </th>
                  <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {savingsData.map((item) => (
                  <tr key={item.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {item.name}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div>{item.sector}</div>
                      <div className="text-sm">{item.department}</div>
                    </td>
                    <td className={`px-6 py-4 text-right ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      AED {item.budget.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      AED {item.spent.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right ${item.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      AED {item.savings.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right ${item.savingsPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.savingsPercentage.toFixed(2)}%
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {item.completedDate}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <td colSpan={2} className={`px-6 py-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    <strong>TOTAL</strong>
                  </td>
                  <td className={`px-6 py-4 text-right ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    <strong>AED {totalBudget.toLocaleString()}</strong>
                  </td>
                  <td className={`px-6 py-4 text-right ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    <strong>AED {totalSpent.toLocaleString()}</strong>
                  </td>
                  <td className={`px-6 py-4 text-right ${totalSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <strong>AED {totalSavings.toLocaleString()}</strong>
                  </td>
                  <td className={`px-6 py-4 text-right ${totalSavingsPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <strong>{totalSavingsPercentage.toFixed(2)}%</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className={`p-12 text-center rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <DollarSign className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Savings Data Yet</h3>
          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
            Complete projects to start tracking your budget savings
          </p>
        </div>
      )}
    </div>
  );
}
