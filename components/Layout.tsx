import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  user?: { name: string; isAdmin: boolean } | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-white text-brand-black flex flex-col">
      <header className="border-b border-gray-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-brand-black text-white flex items-center justify-center rounded-lg font-bold text-lg">S</div>
            <h1 className="font-bold text-xl tracking-tight">SyncUp</h1>
          </Link>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500 hidden sm:block">
                {user.name} {user.isAdmin && <span className="bg-brand-black text-white text-xs px-2 py-0.5 rounded-full ml-1">Admin</span>}
              </span>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} SyncUp. Build better teams.
      </footer>
    </div>
  );
};

export default Layout;