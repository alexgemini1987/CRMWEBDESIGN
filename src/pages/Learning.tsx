import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '../components/ui';
import { storage } from '../lib/storage';
import { Learning } from '../types';
import { Plus, Search, BookOpen, ExternalLink, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CATEGORIES = ['Landing Pages', 'Copywriting', 'Elementor', 'UX/UI', 'Vendas', 'Prospecção', 'SEO', 'Analytics', 'Automação', 'Outros'];

export function LearningPage() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLearning, setCurrentLearning] = useState<Partial<Learning>>({ category: 'Landing Pages' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLearnings(storage.get<Learning>('learnings'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLearning.title) return;
    
    if (currentLearning.id) {
      storage.update('learnings', currentLearning.id, currentLearning);
    } else {
      storage.add('learnings', {
        title: currentLearning.title,
        category: currentLearning.category || 'Outros',
        learned: currentLearning.learned || '',
        apply: currentLearning.apply || '',
        error: currentLearning.error || '',
        idea: currentLearning.idea || '',
        links: currentLearning.links || '',
        date: new Date().toISOString()
      } as Omit<Learning, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentLearning({ category: 'Landing Pages' });
    loadData();
  };

  const deleteLearning = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Excluir este aprendizado?')) {
      storage.remove('learnings', id);
      loadData();
    }
  };

  const filteredLearnings = learnings.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.learned.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aprendizado</h1>
          <p className="text-slate-500 mt-1">Seu caderno digital de estudos e insights.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentLearning({ category: 'Landing Pages' }); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Anotação
          </Button>
        </div>
      </header>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Buscar aprendizado por título, categoria ou conteúdo..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredLearnings.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum aprendizado registrado</h3>
          <p className="text-slate-500 mb-4">Comece a documentar o que você estuda para consultar depois.</p>
          <Button onClick={() => setIsModalOpen(true)}>Nova anotação</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLearnings.map(learning => (
            <Card key={learning.id} className="p-6 cursor-pointer hover:shadow-md transition-all group" onClick={() => { setCurrentLearning(learning); setIsModalOpen(true); }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {learning.category}
                    </span>
                    <span className="text-xs text-slate-400">{format(new Date(learning.date), 'dd/MM/yyyy')}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{learning.title}</h3>
                </div>
                <button 
                  onClick={(e) => deleteLearning(learning.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {learning.learned && (
                  <div>
                    <h4 className="text-sm font-bold text-emerald-700 mb-1 uppercase tracking-wider">O que aprendi</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{learning.learned}</p>
                  </div>
                )}
                {learning.apply && (
                  <div>
                    <h4 className="text-sm font-bold text-blue-700 mb-1 uppercase tracking-wider">Como aplicar</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{learning.apply}</p>
                  </div>
                )}
                {learning.error && (
                  <div>
                    <h4 className="text-sm font-bold text-red-700 mb-1 uppercase tracking-wider">Erro a evitar</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{learning.error}</p>
                  </div>
                )}
                {learning.idea && (
                  <div>
                    <h4 className="text-sm font-bold text-amber-700 mb-1 uppercase tracking-wider">Ideia que surgiu</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{learning.idea}</p>
                  </div>
                )}
              </div>
              
              {learning.links && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-start space-x-2 text-sm text-blue-600">
                    <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" />
                    <a href={learning.links} target="_blank" rel="noreferrer" className="hover:underline break-all" onClick={e => e.stopPropagation()}>
                      {learning.links}
                    </a>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentLearning.id ? 'Editar Aprendizado' : 'Nova Anotação'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título principal</label>
                  <Input required value={currentLearning.title || ''} onChange={e => setCurrentLearning({...currentLearning, title: e.target.value})} placeholder="Ex: Masterclass de Copy para LPs" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentLearning.category || 'Landing Pages'}
                    onChange={e => setCurrentLearning({...currentLearning, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1 font-bold">O que aprendi?</label>
                  <Textarea value={currentLearning.learned || ''} onChange={e => setCurrentLearning({...currentLearning, learned: e.target.value})} className="min-h-[100px] border-emerald-200 bg-emerald-50/30 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1 font-bold">Como vou aplicar na prática?</label>
                  <Textarea value={currentLearning.apply || ''} onChange={e => setCurrentLearning({...currentLearning, apply: e.target.value})} className="min-h-[100px] border-blue-200 bg-blue-50/30 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1 font-bold">Qual erro devo evitar?</label>
                  <Textarea value={currentLearning.error || ''} onChange={e => setCurrentLearning({...currentLearning, error: e.target.value})} className="min-h-[100px] border-red-200 bg-red-50/30 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1 font-bold">Alguma ideia que surgiu?</label>
                  <Textarea value={currentLearning.idea || ''} onChange={e => setCurrentLearning({...currentLearning, idea: e.target.value})} className="min-h-[100px] border-amber-200 bg-amber-50/30 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Links ou Referências</label>
                <Input value={currentLearning.links || ''} onChange={e => setCurrentLearning({...currentLearning, links: e.target.value})} placeholder="https://..." />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Anotação</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
