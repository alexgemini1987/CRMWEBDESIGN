import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '../components/ui';
import { storage } from '../lib/storage';
import { Content as ContentType, Idea } from '../types';
import { Plus, Search, Calendar, List, Lightbulb, MoreVertical, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

type ViewType = 'calendar' | 'list' | 'ideas';

export function ContentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewType>('list');
  const [contents, setContents] = useState<ContentType[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  
  const [isContentModalOpen, setIsContentModalOpen] = useState(searchParams.get('new') === 'true');
  const [currentContent, setCurrentContent] = useState<Partial<ContentType>>({});
  
  const [newIdeaText, setNewIdeaText] = useState('');

  // Filters
  const [filterFormat, setFilterFormat] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === 'true') {
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, []);

  const loadData = () => {
    setContents(storage.get<ContentType>('contents'));
    setIdeas(storage.get<Idea>('ideas'));
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContent.title || !currentContent.date) return;
    
    if (currentContent.id) {
      storage.update('contents', currentContent.id, currentContent);
    } else {
      storage.add('contents', {
        title: currentContent.title,
        format: currentContent.format || 'Post',
        pillar: currentContent.pillar || '',
        status: currentContent.status || 'Ideia',
        date: currentContent.date,
        caption: currentContent.caption || '',
        cta: currentContent.cta || '',
        notes: currentContent.notes || ''
      } as Omit<ContentType, 'id'>);
    }
    
    setIsContentModalOpen(false);
    setCurrentContent({});
    loadData();
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;
    storage.add('ideas', { text: newIdeaText, date: new Date().toISOString() });
    setNewIdeaText('');
    loadData();
  };

  const deleteContent = (id: string) => {
    if(confirm('Excluir este conteúdo?')) {
      storage.remove('contents', id);
      loadData();
    }
  };

  const deleteIdea = (id: string) => {
    storage.remove('ideas', id);
    loadData();
  };

  const promoteIdeaToContent = (idea: Idea) => {
    setCurrentContent({ title: idea.text, status: 'Ideia', format: 'Post' });
    setIsContentModalOpen(true);
    setView('list');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Conteúdo</h1>
          <p className="text-slate-500 mt-1">Planeje e organize suas publicações.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentContent({}); setIsContentModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Conteúdo
          </Button>
        </div>
      </header>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-max">
        <button
          onClick={() => setView('list')}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center", view === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900')}
        >
          <List className="w-4 h-4 mr-2" />
          Lista
        </button>
        <button
          onClick={() => setView('calendar')}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center", view === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Calendário
        </button>
        <button
          onClick={() => setView('ideas')}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center", view === 'ideas' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900')}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Ideias
        </button>
      </div>

      {view === 'list' && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Formato</label>
              <select className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={filterFormat} onChange={e => setFilterFormat(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Post">Post</option>
                <option value="Reel">Reel</option>
                <option value="Carrossel">Carrossel</option>
                <option value="Story">Story</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Ideia">Ideia</option>
                <option value="Roteiro">Roteiro</option>
                <option value="Produção">Produção</option>
                <option value="Pronto">Pronto</option>
                <option value="Publicado">Publicado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mês (AAAA-MM)</label>
              <Input type="month" className="h-9 bg-slate-50 border-slate-200" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
            </div>
            {(filterFormat !== 'Todos' || filterStatus !== 'Todos' || filterMonth !== '') && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterFormat('Todos'); setFilterStatus('Todos'); setFilterMonth(''); }} className="h-9 text-slate-500">
                Limpar Filtros
              </Button>
            )}
          </Card>

          <Card className="p-0 overflow-hidden">
            {contents.length === 0 ? (
               <div className="p-12 text-center">
                 <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum conteúdo planejado</h3>
                 <p className="text-slate-500 mb-4">Comece a organizar suas publicações criando o primeiro conteúdo.</p>
                 <Button onClick={() => setIsContentModalOpen(true)}>Criar primeiro conteúdo</Button>
               </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {contents
                  .filter(c => filterFormat === 'Todos' || c.format === filterFormat)
                  .filter(c => filterStatus === 'Todos' || c.status === filterStatus)
                  .filter(c => filterMonth === '' || c.date.startsWith(filterMonth))
                  .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(content => (
                <div key={content.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="bg-slate-100 p-3 rounded-xl flex flex-col items-center justify-center min-w-[4rem]">
                      <span className="text-xs font-bold text-slate-500 uppercase">{format(new Date(content.date), 'MMM', { locale: ptBR })}</span>
                      <span className="text-lg font-bold text-slate-900">{format(new Date(content.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{content.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{content.format}</span>
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                          content.status === 'Publicado' ? 'bg-emerald-100 text-emerald-700' :
                          content.status === 'Pronto' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        )}>
                          {content.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrentContent(content); setIsContentModalOpen(true); }}>Editar</Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteContent(content.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50"><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        </div>
      )}

      {view === 'calendar' && (
        <Card className="p-8 text-center border-dashed border-2">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Visualização de Calendário</h3>
          <p className="text-slate-500">A visualização em grade mensal será implementada na próxima atualização.</p>
        </Card>
      )}

      {view === 'ideas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
             <Card>
               <h3 className="font-bold text-slate-900 mb-4">Nova Ideia</h3>
               <form onSubmit={handleAddIdea} className="space-y-4">
                 <Textarea 
                   placeholder="Sobre o que você quer falar?"
                   value={newIdeaText}
                   onChange={(e) => setNewIdeaText(e.target.value)}
                   className="min-h-[120px]"
                 />
                 <Button type="submit" className="w-full">Salvar Ideia</Button>
               </form>
             </Card>
          </div>
          <div className="md:col-span-2 space-y-4">
             {ideas.length === 0 ? (
               <Card className="p-8 text-center border-dashed border-2">
                  <p className="text-slate-500">Seu banco de ideias está vazio.</p>
               </Card>
             ) : (
               ideas.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(idea => (
                 <Card key={idea.id} className="p-4 flex items-start justify-between group">
                   <p className="text-slate-700 leading-relaxed pr-4">{idea.text}</p>
                   <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                     <Button variant="outline" size="sm" onClick={() => promoteIdeaToContent(idea)}>
                       Transformar em Post
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => deleteIdea(idea.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                       <X className="w-4 h-4" />
                     </Button>
                   </div>
                 </Card>
               ))
             )}
          </div>
        </div>
      )}

      {/* Content Modal */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentContent.id ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h2>
              <button onClick={() => setIsContentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveContent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título / Ideia central</label>
                <Input required value={currentContent.title || ''} onChange={e => setCurrentContent({...currentContent, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Formato</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentContent.format || 'Post'}
                    onChange={e => setCurrentContent({...currentContent, format: e.target.value as any})}
                  >
                    <option value="Post">Post</option>
                    <option value="Reel">Reel</option>
                    <option value="Carrossel">Carrossel</option>
                    <option value="Story">Story</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentContent.status || 'Ideia'}
                    onChange={e => setCurrentContent({...currentContent, status: e.target.value as any})}
                  >
                    <option value="Ideia">Ideia</option>
                    <option value="Roteiro">Roteiro</option>
                    <option value="Produção">Produção</option>
                    <option value="Pronto">Pronto</option>
                    <option value="Publicado">Publicado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Publicação</label>
                  <Input type="date" required value={currentContent.date ? currentContent.date.split('T')[0] : ''} onChange={e => setCurrentContent({...currentContent, date: new Date(e.target.value).toISOString()})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pilar de Conteúdo</label>
                  <Input value={currentContent.pillar || ''} onChange={e => setCurrentContent({...currentContent, pillar: e.target.value})} placeholder="Ex: Design, Dica..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Legenda / Roteiro</label>
                <Textarea value={currentContent.caption || ''} onChange={e => setCurrentContent({...currentContent, caption: e.target.value})} className="min-h-[150px]" />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsContentModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Conteúdo</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
