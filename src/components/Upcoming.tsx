import { useState, useMemo } from 'react';
import { Calendar, Mail, CheckSquare, Square, Users, Building2, Clock, Send } from 'lucide-react';
import type { ProcurementItem, FocalPoint } from '../App';
import { toast } from 'sonner@2.0.3';

interface UpcomingProps {
  procurementItems: ProcurementItem[];
  focalPoints: FocalPoint[];
  isDarkMode: boolean;
}

export function Upcoming({ procurementItems, focalPoints, isDarkMode }: UpcomingProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Get current date
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calculate next month
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // Filter items expected next month (shown from 24th onwards)
  const upcomingItems = useMemo(() => {
    // Only show upcoming items if we're on or after the 24th
    if (currentDay < 24) {
      return [];
    }

    return procurementItems.filter(item => {
      if (item.isSubmitted) return false; // Don't show already submitted items
      if (!item.recommendedPRDate || typeof item.recommendedPRDate !== 'string') return false;
      
      const [day, month, year] = item.recommendedPRDate.split('-').map(Number);
      const prDate = new Date(year, month - 1, day);
      
      // Check if the PR date is in the next month
      return prDate.getMonth() === nextMonth && prDate.getFullYear() === nextMonthYear;
    }).sort((a, b) => {
      // Sort by PR date
      if (!a.recommendedPRDate || !b.recommendedPRDate) return 0;
      const [dayA, monthA, yearA] = a.recommendedPRDate.split('-').map(Number);
      const [dayB, monthB, yearB] = b.recommendedPRDate.split('-').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });
  }, [procurementItems, currentDay, nextMonth, nextMonthYear]);

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedItems.size === upcomingItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(upcomingItems.map(item => item.id)));
    }
  };

  // Group selected items by sector and department
  const groupItemsByFocalPoint = () => {
    const selectedItemsData = upcomingItems.filter(item => selectedItems.has(item.id));
    
    // Group by sector and department
    const grouped = new Map<string, ProcurementItem[]>();
    
    selectedItemsData.forEach(item => {
      const key = `${item.sector}|${item.department}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    return grouped;
  };

  // Generate emails
  const generateEmails = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to generate emails');
      return;
    }

    const grouped = groupItemsByFocalPoint();
    let emailsGenerated = 0;

    grouped.forEach((items, key) => {
      const [sector, department] = key.split('|');
      
      // Find focal point for this sector/department
      const focalPoint = focalPoints.find(
        fp => fp.sector === sector && fp.department === department
      );

      if (!focalPoint) {
        toast.warning(`No focal point found for ${sector} / ${department}`);
        return;
      }

      // Get month name
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const nextMonthName = monthNames[nextMonth];

      // Generate email content
      const subject = `Reminder: PR Submissions Expected in ${nextMonthName} ${nextMonthYear} - ${sector} / ${department}`;
      
      let body = `Dear ${focalPoint.name},\n\n`;
      body += `This is a friendly reminder that the following procurement requisition(s) are expected to be submitted in ${nextMonthName} ${nextMonthYear}:\n\n`;
      
      items.forEach((item, index) => {
        body += `${index + 1}. Item ${item.item}: ${item.itemDescription}\n`;
        body += `   - Category: ${item.category}\n`;
        body += `   - Budget: AED ${item.allocatedBudget.toLocaleString()}\n`;
        body += `   - Expected PR Date: ${item.recommendedPRDate}\n`;
        body += `   - Reference: ${item.itemReference}\n\n`;
      });

      body += `Please ensure that the PR submission(s) are prepared and submitted on or before the expected date(s).\n\n`;
      body += `If you have any questions or concerns, please don't hesitate to reach out.\n\n`;
      body += `Best regards,\n`;
      body += `Procurement Team`;

      // Create mailto link
      const mailtoLink = `mailto:${focalPoint.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      emailsGenerated++;
    });

    toast.success(`Generated ${emailsGenerated} email(s) for ${grouped.size} focal point(s)`);
  };

  // Get days until PR date
  const getDaysUntil = (prDate: string) => {
    if (!prDate || typeof prDate !== 'string') return 0;
    const [day, month, year] = prDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get month name
  const getNextMonthName = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[nextMonth];
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-transparent bg-clip-text bg-gradient-to-r mb-2 ${
          isDarkMode ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-600'
        }`}>Upcoming PR Submissions</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Projects expected in {getNextMonthName()} {nextMonthYear} - Available from 24th of each month
        </p>
      </div>

      {currentDay < 24 ? (
        // Show message if before 24th
        <div className={`p-12 text-center rounded-lg border transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
            : 'bg-white border-gray-200'
        }`}>
          <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Upcoming Items Available from 24th
          </h3>
          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
            The list of next month's PR submissions will be available starting from the 24th of this month.
          </p>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Current date: {today.toLocaleDateString()}
          </p>
        </div>
      ) : upcomingItems.length === 0 ? (
        // No items for next month
        <div className={`p-12 text-center rounded-lg border transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50' 
            : 'bg-white border-gray-200'
        }`}>
          <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No Upcoming PR Submissions
          </h3>
          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
            There are no procurement items expected in {getNextMonthName()} {nextMonthYear}.
          </p>
        </div>
      ) : (
        <>
          {/* Stats and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {upcomingItems.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Items Expected in {getNextMonthName()}
              </div>
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
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {selectedItems.size}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Items Selected
              </div>
            </div>

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
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-3xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {groupItemsByFocalPoint().size}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Focal Points to Contact
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className={`p-4 rounded-lg border mb-6 flex items-center justify-between ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700/50'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSelectAll}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedItems.size === upcomingItems.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedItems.size === upcomingItems.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {selectedItems.size} of {upcomingItems.length} selected
              </span>
            </div>

            <button
              onClick={generateEmails}
              disabled={selectedItems.size === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg ${
                selectedItems.size === 0
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/30'
              }`}
            >
              <Send className="w-4 h-4" />
              Generate Email Reminders
            </button>
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
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={toggleSelectAll}
                        className={`transition-colors ${
                          isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {selectedItems.size === upcomingItems.length ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sector / Department</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget (AED)</th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300 bg-purple-900/20' : 'text-gray-700 bg-purple-50'}`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span>Expected PR Date</span>
                      </div>
                    </th>
                    <th className={`px-6 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Focal Point</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {upcomingItems.map(item => {
                    const focalPoint = focalPoints.find(
                      fp => fp.sector === item.sector && fp.department === item.department
                    );
                    const daysUntil = getDaysUntil(item.recommendedPRDate);

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors cursor-pointer ${
                          selectedItems.has(item.id)
                            ? isDarkMode
                              ? 'bg-purple-900/20'
                              : 'bg-purple-50'
                            : isDarkMode
                              ? 'hover:bg-gray-700/30'
                              : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItemSelection(item.id);
                            }}
                            className={`transition-colors ${
                              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {selectedItems.has(item.id) ? (
                              <CheckSquare className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{item.item}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`line-clamp-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {item.itemDescription}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <div>
                              <div className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{item.sector}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                {item.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {item.category}
                        </td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {item.allocatedBudget.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
                          <div className={`inline-flex flex-col gap-1 px-3 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-purple-900/20 border-purple-700 text-purple-400'
                              : 'bg-purple-100 border-purple-200 text-purple-700'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold">{item.recommendedPRDate}</span>
                            </div>
                            <div className="text-xs">
                              {daysUntil} days away
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {focalPoint ? (
                            <div>
                              <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                <Users className="w-4 h-4" />
                                {focalPoint.name}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                {focalPoint.email}
                              </div>
                            </div>
                          ) : (
                            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                              No focal point assigned
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
