import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import { storage } from '../lib/storage';
import { Project, Client, StatusProject, ChecklistItem } from '../types';
import { Plus, FolderKanban, CheckCircle2, Circle, X } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DEFAULT_LANDING_PAGE_CHECKLIST: ChecklistItem[] = [
  { id: '1', text: 'Briefing', done: false },
  { id: '2', text: 'Referências', done: false },
  { id: '3', text: 'Copy', done: false },
  { id: '4', text: 'Wireframe', done: false },
  { id: '5', text: 'Design', done: false },
  { id: '6', text: 'Desenvolvimento (Elementor/React)', done: false },
  { id: '7', text: 'Responsividade', done: false },
  { id: '8', text: 'Formulário / Integrações', done: false },
  { id: '9', text: 'Analytics (Pixel/Tag Manager)', done: false },
  { id: '10', text: 'Revisão Final', done: false },
  { id: '11', text: 'Publicação', done: false },
];

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProjects(storage.get<Project>('projects'));
    setClients(storage.get<Client>('clients'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.name || !currentProject.clientId) return;
    
    if (currentProject.id) {
      storage.update('projects', currentProject.id, currentProject);
    } else {
      const isLandingPage = currentProject.service === 'Landing Page';
      storage.add('projects', {
        ...currentProject,
        startDate: currentProject.startDate || new Date().toISOString(),
        deadline: currentProject.deadline || new Date().toISOString(),
        status: currentProject.status || 'Briefing',
        checklist: isLandingPage ? [...DEFAULT_LANDING_PAGE_CHECKLIST] : [],
        value: Number(currentProject.value) || 0
      } as Omit<Project, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentProject({});
    loadData();
  };

  const deleteProject = (id: string) => {
    if(confirm('Excluir este projeto?')) {
      storage.remove('projects', id);
      loadData();
    }
  };

  const toggleChecklistItem = (projectId: string, itemId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const newChecklist = project.checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    
    storage.update<Project>('projects', projectId, { checklist: newChecklist });
    loadData();
  };

  const calculateProgress = (checklist: ChecklistItem[]) => {
    if (checklist.length === 0) return 0;
    const done = checklist.filter(i => i.done).length;
    return Math.round((done / checklist.length) * 100);
  };

  const activeClients = clients.filter(c => c.status === 'Fechado' || c.status === 'Em andamento');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projetos</h1>
          <p className="text-slate-500 mt-1">Acompanhe a entrega dos seus serviços.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentProject({}); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </header>

      {projects.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum projeto em andamento</h3>
          <p className="text-slate-500 mb-4">Crie um projeto para começar a gerenciar suas entregas.</p>
          <Button onClick={() => setIsModalOpen(true)}>Criar primeiro projeto</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            const progress = calculateProgress(project.checklist);
            
            return (
              <Card key={project.id} className="flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
                    <span className={cn(
                      "inline-flex px-2 py-1 rounded text-xs font-semibold",
                      project.status === 'Entregue' ? 'bg-emerald-100 text-emerald-700' :
                      project.status === 'Revisão' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {project.status}
                    </span>
                  </div>
                  {client && (
                    <p className="text-sm text-slate-500">Cliente: <span className="font-medium text-slate-700">{client.name}</span></p>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Prazo</span>
                      <span className="font-medium">{format(new Date(project.deadline), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-xs">Valor</span>
                      <span className="font-medium">{formatCurrency(project.value)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Checklist</h4>
                    <span className="text-xs font-bold text-slate-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mb-4 overflow-hidden">
                    <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {project.checklist.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Sem checklist definido.</p>
                    ) : (
                      project.checklist.map(item => (
                        <button 
                          key={item.id} 
                          className="flex items-start text-left space-x-3 w-full group"
                          onClick={() => toggleChecklistItem(project.id, item.id)}
                        >
                          <div className="mt-0.5 shrink-0 text-slate-400 group-hover:text-slate-900">
                            {item.done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                          </div>
                          <span className={cn("text-sm", item.done && "text-slate-400 line-through")}>
                            {item.text}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-white border-t border-slate-100 flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentProject(project); setIsModalOpen(true); }}>Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)} className="text-red-500 hover:text-red-600">Excluir</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentProject.id ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto</label>
                  <Input required value={currentProject.name || ''} onChange={e => setCurrentProject({...currentProject, name: e.target.value})} placeholder="Ex: Landing Page Clínica Bella" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentProject.clientId || ''}
                    onChange={e => setCurrentProject({...currentProject, clientId: e.target.value})}
                  >
                    <option value="" disabled>Selecione um cliente</option>
                    {activeClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={currentProject.service || 'Landing Page'}
                      onChange={e => setCurrentProject({...currentProject, service: e.target.value})}
                    >
                      <option value="Landing Page">Landing Page</option>
                      <option value="Mini Site Bio">Mini Site Bio</option>
                      <option value="Design">Design</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={currentProject.status || 'Briefing'}
                      onChange={e => setCurrentProject({...currentProject, status: e.target.value as any})}
                    >
                      <option value="Briefing">Briefing</option>
                      <option value="Design">Design</option>
                      <option value="Desenvolvimento">Desenvolvimento</option>
                      <option value="Revisão">Revisão</option>
                      <option value="Entregue">Entregue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                    <Input type="date" required value={currentProject.startDate ? currentProject.startDate.split('T')[0] : ''} onChange={e => setCurrentProject({...currentProject, startDate: new Date(e.target.value).toISOString()})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Entrega</label>
                    <Input type="date" required value={currentProject.deadline ? currentProject.deadline.split('T')[0] : ''} onChange={e => setCurrentProject({...currentProject, deadline: new Date(e.target.value).toISOString()})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <Input type="number" required value={currentProject.value || ''} onChange={e => setCurrentProject({...currentProject, value: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Projeto</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
