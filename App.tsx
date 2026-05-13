import React from 'react';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './hooks/useTheme';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
        <Dashboard />
      </div>
    </ThemeProvider>
  );
};

export default App;