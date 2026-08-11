import React, { useState, useEffect } from 'react';
import { Search, X, Users, FileText, FolderKanban, StickyNote, BookOpen } from 'lucide-react';
import { Input } from './ui';
import { storage } from '../lib/storage';
import { Client, Project, Content, Note, Learning } from '../types';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const [results, setResults] = useState<{ id: string, title: string, type: string, path: string, icon: any }[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchStr = query.toLowerCase();
    const found: any[] = [];

    // Search Clients
    const clients = storage.get<Client>('clients');
    clients.filter(c => c.name.toLowerCase().includes(searchStr) || c.company.toLowerCase().includes(searchStr)).forEach(c => {
      found.push({ id: c.id, title: c.name, type: 'Cliente', path: '/clients', icon: Users });
    });

    // Search Projects
    const projects = storage.get<Project>('projects');
    projects.filter(p => p.name.toLowerCase().includes(searchStr) || p.service.toLowerCase().includes(searchStr)).forEach(p => {
      found.push({ id: p.id, title: p.name, type: 'Projeto', path: '/projects', icon: FolderKanban });
    });

    // Search Contents
    const contents = storage.get<Content>('contents');
    contents.filter(c => c.title.toLowerCase().includes(searchStr) || c.caption.toLowerCase().includes(searchStr)).forEach(c => {
      found.push({ id: c.id, title: c.title, type: 'Conteúdo', path: '/content', icon: FileText });
    });

    // Search Notes
    const notes = storage.get<Note>('notes');
    notes.filter(n => n.title.toLowerCase().includes(searchStr) || n.text.toLowerCase().includes(searchStr)).forEach(n => {
      found.push({ id: n.id, title: n.title, type: 'Nota', path: '/notes', icon: StickyNote });
    });

    // Search Learnings
    const learnings = storage.get<Learning>('learnings');
    learnings.filter(l => l.title.toLowerCase().includes(searchStr) || l.learned.toLowerCase().includes(searchStr)).forEach(l => {
      found.push({ id: l.id, title: l.title, type: 'Aprendizado', path: '/learning', icon: BookOpen });
    });

    setResults(found.slice(0, 10)); // Limit to 10 results
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            autoFocus
            placeholder="Buscar clientes, projetos, notas..." 
            className="flex-1 text-lg border-none focus:outline-none focus:ring-0 p-0 text-slate-900 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {query.trim().length >= 2 && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <ul className="py-2">
                {results.map((result, i) => (
                  <li key={`${result.id}-${i}`}>
                    <button
                      onClick={() => {
                        navigate(result.path);
                        onClose();
                      }}
                      className="w-full text-left px-4 py-3 flex items-center space-x-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <result.icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{result.title}</h4>
                        <p className="text-xs text-slate-500">{result.type}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>Nenhum resultado encontrado para "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
