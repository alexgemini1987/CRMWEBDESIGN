import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '../components/ui';
import { storage } from '../lib/storage';
import { Note } from '../types';
import { Plus, Pin, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';

const CATEGORIES = ['Ideia', 'Importante', 'Cliente', 'Estudo', 'Conteúdo'];

export function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('new') === 'true');
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({ category: 'Ideia' });

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === 'true') {
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, []);

  const loadData = () => {
    setNotes(storage.get<Note>('notes'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNote.text) return;
    
    if (currentNote.id) {
      storage.update('notes', currentNote.id, currentNote);
    } else {
      storage.add('notes', {
        title: currentNote.title || '',
        text: currentNote.text,
        category: currentNote.category || 'Ideia',
        pinned: currentNote.pinned || false,
        date: new Date().toISOString()
      } as Omit<Note, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentNote({ category: 'Ideia' });
    loadData();
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Excluir esta nota?')) {
      storage.remove('notes', id);
      loadData();
    }
  };

  const togglePin = (id: string, pinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.update<Note>('notes', id, { pinned: !pinned });
    loadData();
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned === b.pinned) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.pinned ? -1 : 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notas</h1>
          <p className="text-slate-500 mt-1">Anotações rápidas e ideias.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentNote({ category: 'Ideia' }); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Nota
          </Button>
        </div>
      </header>

      {sortedNotes.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <p className="text-slate-500">Nenhuma nota criada.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedNotes.map(note => (
            <Card 
              key={note.id} 
              className={cn(
                "p-4 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col h-[200px]",
                note.pinned ? "border-amber-200 bg-amber-50/30" : ""
              )}
              onClick={() => { setCurrentNote(note); setIsModalOpen(true); }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {note.category}
                </span>
                <button 
                  onClick={(e) => togglePin(note.id, note.pinned, e)}
                  className={cn("p-1 rounded transition-colors", note.pinned ? "text-amber-500 hover:bg-amber-100" : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600 hover:bg-slate-100")}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>
              
              {note.title && <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{note.title}</h3>}
              <p className="text-sm text-slate-600 line-clamp-4 flex-1 whitespace-pre-wrap">{note.text}</p>
              
              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
                <span>{format(new Date(note.date), 'dd/MM/yyyy')}</span>
                <button 
                  onClick={(e) => deleteNote(note.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentNote.id ? 'Editar Nota' : 'Nova Nota'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Input placeholder="Título (opcional)" value={currentNote.title || ''} onChange={e => setCurrentNote({...currentNote, title: e.target.value})} className="border-none text-lg font-bold px-0 focus:ring-0 shadow-none bg-transparent" />
              </div>
              <div>
                <Textarea required placeholder="Escreva sua nota aqui..." value={currentNote.text || ''} onChange={e => setCurrentNote({...currentNote, text: e.target.value})} className="min-h-[200px] border-none px-0 focus:ring-0 shadow-none bg-transparent resize-none text-slate-700" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <select 
                    className="flex h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentNote.category || 'Ideia'}
                    onChange={e => setCurrentNote({...currentNote, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setCurrentNote({...currentNote, pinned: !currentNote.pinned})}
                    className={cn("p-1.5 rounded-md transition-colors", currentNote.pinned ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
