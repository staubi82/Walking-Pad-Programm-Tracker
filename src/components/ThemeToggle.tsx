import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
        isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      } ${className}`}
      title={`Zu ${isDark ? 'hellem' : 'dunklem'} Modus wechseln`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'Hell' : 'Dunkel'}
        </span>
      )}
    </button>
  );
};