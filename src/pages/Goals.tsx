import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import { storage } from '../lib/storage';
import { Goal } from '../types';
import { Plus, Target, X } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal>>({ type: 'Projetos', month: new Date().toISOString().substring(0, 7) });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setGoals(storage.get<Goal>('goals'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGoal.title || !currentGoal.target) return;
    
    if (currentGoal.id) {
      storage.update('goals', currentGoal.id, currentGoal);
    } else {
      storage.add('goals', {
        title: currentGoal.title,
        type: currentGoal.type || 'Projetos',
        month: currentGoal.month || new Date().toISOString().substring(0, 7),
        target: Number(currentGoal.target),
        current: Number(currentGoal.current) || 0
      } as Omit<Goal, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentGoal({ type: 'Projetos', month: new Date().toISOString().substring(0, 7) });
    loadData();
  };

  const deleteGoal = (id: string) => {
    if(confirm('Excluir esta meta?')) {
      storage.remove('goals', id);
      loadData();
    }
  };

  const updateProgress = (id: string, current: number) => {
    storage.update<Goal>('goals', id, { current });
    loadData();
  };

  // Group by month
  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.month]) acc[goal.month] = [];
    acc[goal.month].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  const sortedMonths = Object.keys(groupedGoals).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Metas</h1>
          <p className="text-slate-500 mt-1">Acompanhe seus objetivos e crescimento.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentGoal({ type: 'Financeira', month: new Date().toISOString().substring(0, 7) }); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Meta
          </Button>
        </div>
      </header>

      {goals.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma meta definida</h3>
          <p className="text-slate-500 mb-4">Estabeleça objetivos mensais para manter o foco.</p>
          <Button onClick={() => setIsModalOpen(true)}>Criar primeira meta</Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map(monthStr => {
            const date = new Date(monthStr + '-01T00:00:00');
            const monthName = format(date, 'MMMM yyyy', { locale: ptBR });
            
            return (
              <div key={monthStr}>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Meta de {monthName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedGoals[monthStr].map(goal => {
                    const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                    const isFinance = goal.type === 'Financeira';
                    const isDone = percent >= 100;

                    return (
                      <Card key={goal.id} className="p-5 flex flex-col relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                           <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => { setCurrentGoal(goal); setIsModalOpen(true); }}>Editar</Button>
                           <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-red-500 hover:bg-red-50" onClick={() => deleteGoal(goal.id)}>Excluir</Button>
                        </div>
                        
                        <div className="mb-4">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
                            isFinance ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {goal.type}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-slate-900 mb-1 leading-tight pr-12">{goal.title}</h3>
                        
                        <div className="mt-4 mb-2 flex items-end justify-between">
                          <div className="text-2xl font-bold text-slate-900">
                            {isFinance ? formatCurrency(goal.current) : goal.current}
                          </div>
                          <div className="text-sm text-slate-400 mb-1 font-medium">
                            / {isFinance ? formatCurrency(goal.target) : goal.target}
                          </div>
                        </div>

                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-auto">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-1000", isDone ? "bg-emerald-500" : "bg-slate-900")} 
                            style={{ width: `${percent}%` }} 
                          />
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                           <span className={cn("text-xs font-bold", isDone ? "text-emerald-500" : "text-slate-400")}>
                             {percent}% Concluído
                           </span>
                           {!isDone && (
                             <div className="flex space-x-1">
                               <button onClick={() => updateProgress(goal.id, goal.current + 1)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium text-slate-600">+1</button>
                             </div>
                           )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentGoal.id ? 'Editar Meta' : 'Nova Meta'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mês de Referência</label>
                <Input type="month" required value={currentGoal.month || ''} onChange={e => setCurrentGoal({...currentGoal, month: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Meta</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={currentGoal.type || 'Financeira'}
                  onChange={e => setCurrentGoal({...currentGoal, type: e.target.value})}
                >
                  <option value="Financeira">Financeira</option>
                  <option value="Clientes">Clientes (Quantidade)</option>
                  <option value="Conteúdo">Conteúdo (Publicações)</option>
                  <option value="Projetos">Projetos (Entregas)</option>
                  <option value="Aprendizado">Aprendizado (Cursos/Livros)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título / Descrição</label>
                <Input required value={currentGoal.title || ''} onChange={e => setCurrentGoal({...currentGoal, title: e.target.value})} placeholder="Ex: Faturar 10k, Fechar 3 clientes..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo (Alvo)</label>
                  <Input type="number" required value={currentGoal.target || ''} onChange={e => setCurrentGoal({...currentGoal, target: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Atual (Já feito)</label>
                  <Input type="number" value={currentGoal.current || 0} onChange={e => setCurrentGoal({...currentGoal, current: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Meta</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
