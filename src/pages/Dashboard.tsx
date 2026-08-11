import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import { storage } from '../lib/storage';
import { Task, Content, Client, Project, Finance } from '../types';
import { CheckCircle2, Circle, Plus, Calendar, TrendingUp, Users, FolderKanban, FileText } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { format, isAfter, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [nextContent, setNextContent] = useState<Content | null>(null);
  
  const [stats, setStats] = useState({
    revenue: 0,
    activeClients: 0,
    ongoingProjects: 0,
    publishedContent: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTasks(storage.get<Task>('tasks'));
    
    const contents = storage.get<Content>('contents');
    const futureContents = contents
      .filter(c => c.status !== 'Publicado' && isAfter(new Date(c.date), new Date(new Date().setHours(0,0,0,0))))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (futureContents.length > 0) {
      setNextContent(futureContents[0]);
    }

    const clients = storage.get<Client>('clients');
    const projects = storage.get<Project>('projects');
    const finances = storage.get<Finance>('finances');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthRevenue = finances
      .filter(f => {
        const d = new Date(f.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && f.status === 'Pago';
      })
      .reduce((acc, curr) => acc + curr.value, 0);

    const publishedThisMonth = contents.filter(c => {
      const d = new Date(c.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && c.status === 'Publicado';
    }).length;

    setStats({
      revenue: monthRevenue,
      activeClients: clients.filter(c => c.status === 'Em andamento').length,
      ongoingProjects: projects.filter(p => p.status !== 'Entregue').length,
      publishedContent: publishedThisMonth
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    storage.add('tasks', { text: newTaskText, done: false, date: new Date().toISOString() });
    setNewTaskText('');
    loadData();
  };

  const toggleTask = (id: string, done: boolean) => {
    storage.update<Task>('tasks', id, { done: !done });
    loadData();
  };

  const formatContentDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'HOJE';
    if (isTomorrow(date)) return 'AMANHÃ';
    return format(date, "dd 'de' MMMM", { locale: ptBR }).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Bom dia, João</h1>
        <p className="text-slate-500 mt-1">Aqui está o resumo do seu negócio hoje.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento (Mês)</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.revenue)}</p>
        </Card>
        
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Clientes Ativos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.activeClients}</p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <FolderKanban className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Projetos Ativos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.ongoingProjects}</p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Publicados (Mês)</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.publishedContent}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Prioridades de hoje</h2>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <form onSubmit={handleAddTask} className="flex space-x-2">
                <Input 
                  placeholder="Adicionar nova tarefa..." 
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="border-none shadow-none focus:ring-0 bg-slate-50"
                />
                <Button type="submit" size="icon" variant="secondary" className="shrink-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </form>
            </div>
            <ul className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <li className="p-6 text-center text-slate-400 text-sm">Nenhuma prioridade cadastrada.</li>
              ) : (
                tasks.map(task => (
                  <li key={task.id} className="p-4 flex items-center space-x-3 hover:bg-slate-50/50 transition-colors">
                    <button onClick={() => toggleTask(task.id, task.done)} className="text-slate-400 hover:text-slate-900">
                      {task.done ? <CheckCircle2 className="w-6 h-6 text-slate-900" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <span className={cn("text-sm font-medium", task.done && "text-slate-400 line-through")}>
                      {task.text}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Próximo Conteúdo</h2>
          </div>
          {nextContent ? (
            <Card className="bg-slate-900 text-white p-6 relative overflow-hidden group border-transparent">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Calendar className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  {formatContentDate(nextContent.date)}
                </p>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm mb-4">
                  <span>{nextContent.format}</span>
                </div>
                <h3 className="text-2xl font-bold mb-8 leading-tight">
                  "{nextContent.title}"
                </h3>
                <Button variant="secondary" className="w-max bg-white text-slate-900 hover:bg-slate-100" asChild>
                  <Link to="/content">Ver calendário</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[250px] border-dashed border-2">
              <Calendar className="w-10 h-10 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium mb-4">Nenhum conteúdo programado.</p>
              <Button asChild>
                <Link to="/content">Planejar Conteúdo</Link>
              </Button>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
