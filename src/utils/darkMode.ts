// Dark mode utility functions
export const darkModeClasses = {
  // Backgrounds
  bgPrimary: (isDark: boolean) => isDark ? 'bg-gray-900' : 'bg-gray-50',
  bgSecondary: (isDark: boolean) => isDark ? 'bg-gray-800' : 'bg-white',
  bgTertiary: (isDark: boolean) => isDark ? 'bg-gray-700' : 'bg-gray-50',
  
  // Text
  textPrimary: (isDark: boolean) => isDark ? 'text-gray-100' : 'text-gray-900',
  textSecondary: (isDark: boolean) => isDark ? 'text-gray-400' : 'text-gray-600',
  textTertiary: (isDark: boolean) => isDark ? 'text-gray-500' : 'text-gray-500',
  
  // Borders
  border: (isDark: boolean) => isDark ? 'border-gray-700' : 'border-gray-200',
  
  // Cards
  card: (isDark: boolean) => isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  
  // Inputs
  input: (isDark: boolean) => isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
  
  // Modals
  modal: (isDark: boolean) => isDark ? 'bg-gray-800' : 'bg-white',
  modalOverlay: (isDark: boolean) => isDark ? 'bg-black/70' : 'bg-black/50',
  
  // Hover states
  hover: (isDark: boolean) => isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
};
