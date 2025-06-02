import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-400">
              Salary Story
            </h1>
            <div className="flex space-x-6">
              <a 
                href="#intro" 
                className="text-slate-300 hover:text-blue-400 transition-colors duration-200"
              >
                Introduction
              </a>
              <a 
                href="#hero" 
                className="text-slate-300 hover:text-blue-400 transition-colors duration-200"
              >
                Analysis
              </a>
              <a 
                href="#takeaways" 
                className="text-slate-300 hover:text-blue-400 transition-colors duration-200"
              >
                Takeaways
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-slate-400">
            <p>Salary Analysis Dashboard. Built with Next.js and D3.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 