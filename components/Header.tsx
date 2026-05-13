import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from './icons/Icons';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-lg sticky top-0 z-30 border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center min-w-0">
            <img src="https://cdn-icons-png.flaticon.com/512/10321/10321889.png" alt="Firewall Icon" className="w-8 h-8 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground ml-3 truncate font-header">Firewall Configuration Analyzer</h1>
          </div>
          <div className="flex items-center">
             <button
              onClick={toggleTheme}
              className="relative p-2 rounded-full text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Toggle theme"
            >
              <SunIcon className="w-6 h-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute top-2 left-2 w-6 h-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;