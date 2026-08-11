import { ReactNode, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';
import {
  Home,
  FileText,
  Users,
  FolderKanban,
  StickyNote,
  Sparkles,
  Plus,
  X,
  Target,
  BookOpen,
  Briefcase,
  Search,
  CircleDollarSign,
  BarChart2,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Início', path: '/', icon: Home },
  { name: 'Conteúdo', path: '/content', icon: FileText },
  { name: 'Clientes', path: '/clients', icon: Users },
  { name: 'Projetos', path: '/projects', icon: FolderKanban },
  { name: 'Notas', path: '/notes', icon: StickyNote },
  { name: 'IA', path: '/ai', icon: Sparkles },
];

const secondaryNavItems = [
  { name: 'Financeiro', path: '/finance', icon: CircleDollarSign },
  { name: 'Métricas', path: '/metrics', icon: BarChart2 },
  { name: 'Aprendizado', path: '/learning', icon: BookOpen },
  { name: 'Metas', path: '/goals', icon: Target },
  { name: 'Portfólio', path: '/portfolio', icon: Briefcase },
];

export function Layout() {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Creator Hub</h1>
          <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
          <div>
            <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Principal</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gestão</p>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between md:hidden">
           <h1 className="text-lg font-bold">Creator Hub</h1>
           <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-slate-100">
             <Search className="w-5 h-5 text-slate-600" />
           </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex items-center justify-around pb-safe z-40">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-full py-3',
                isActive ? 'text-slate-900' : 'text-slate-400'
              )}
            >
              <item.icon className={cn('h-6 w-6 mb-1', isActive ? 'fill-slate-900/10' : '')} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="bg-slate-900 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 transition-transform active:scale-95"
        >
          {isFabOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>

        {isFabOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col items-end space-y-2 mb-2">
            {[
              { label: 'Novo Conteúdo', icon: FileText, to: '/content?new=true' },
              { label: 'Novo Cliente', icon: Users, to: '/clients?new=true' },
              { label: 'Nova Nota', icon: StickyNote, to: '/notes?new=true' },
            ].map((action, i) => (
              <NavLink
                key={i}
                to={action.to}
                onClick={() => setIsFabOpen(false)}
                className="flex items-center space-x-3 bg-white px-4 py-3 rounded-full shadow-md border border-slate-100 w-max"
              >
                <span className="text-sm font-medium">{action.label}</span>
                <action.icon className="w-5 h-5 text-slate-600" />
              </NavLink>
            ))}
          </div>
        )}
      </div>
      
      {/* Overlay for FAB */}
      {isFabOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsFabOpen(false)}
        />
      )}
    </div>
  );
}
