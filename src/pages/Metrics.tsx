import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import { storage } from '../lib/storage';
import { Metric } from '../types';
import { Plus, BarChart2, TrendingUp, Users, Eye, MousePointerClick, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMetric, setCurrentMetric] = useState<Partial<Metric>>({ month: new Date().toISOString().substring(0, 7) });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMetrics(storage.get<Metric>('metrics'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMetric.month) return;
    
    if (currentMetric.id) {
      storage.update<Metric>('metrics', currentMetric.id, currentMetric);
    } else {
      storage.add('metrics', {
        month: currentMetric.month,
        followers: Number(currentMetric.followers) || 0,
        views: Number(currentMetric.views) || 0,
        reach: Number(currentMetric.reach) || 0,
        visits: Number(currentMetric.visits) || 0,
        leads: Number(currentMetric.leads) || 0
      } as Omit<Metric, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentMetric({ month: new Date().toISOString().substring(0, 7) });
    loadData();
  };

  const deleteMetric = (id: string) => {
    if(confirm('Excluir este registro?')) {
      storage.remove<Metric>('metrics', id);
      loadData();
    }
  };

  const sortedMetrics = [...metrics].sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Métricas do Instagram</h1>
          <p className="text-slate-500 mt-1">Acompanhe a evolução do seu perfil mês a mês.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentMetric({ month: new Date().toISOString().substring(0, 7) }); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Registrar Mês
          </Button>
        </div>
      </header>

      {metrics.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Sem dados registrados</h3>
          <p className="text-slate-500 mb-4">Cadastre as métricas do seu Instagram para acompanhar a evolução.</p>
          <Button onClick={() => setIsModalOpen(true)}>Registrar primeiro mês</Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMetrics.map((metric, index) => {
            const previousMetric = sortedMetrics[index + 1];
            
            const calcGrowth = (current: number, prev?: number) => {
              if (!prev || prev === 0) return null;
              const percent = ((current - prev) / prev) * 100;
              return percent;
            };

            const followersGrowth = calcGrowth(metric.followers, previousMetric?.followers);
            const reachGrowth = calcGrowth(metric.reach, previousMetric?.reach);

            const date = new Date(metric.month + '-01T00:00:00');
            const monthName = format(date, 'MMMM yyyy', { locale: ptBR });

            return (
              <Card key={metric.id} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 capitalize">{monthName}</h3>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrentMetric(metric); setIsModalOpen(true); }}>Editar</Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMetric(metric.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">Excluir</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-500 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Seguidores</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold text-slate-900">{metric.followers.toLocaleString('pt-BR')}</p>
                      {followersGrowth !== null && (
                        <span className={cn("text-xs font-bold", followersGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {followersGrowth >= 0 ? '+' : ''}{followersGrowth.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-500 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Alcance</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold text-slate-900">{metric.reach.toLocaleString('pt-BR')}</p>
                      {reachGrowth !== null && (
                        <span className={cn("text-xs font-bold", reachGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {reachGrowth >= 0 ? '+' : ''}{reachGrowth.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-500 mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Views</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{metric.views.toLocaleString('pt-BR')}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-500 mb-2">
                      <MousePointerClick className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Visitas</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{metric.visits.toLocaleString('pt-BR')}</p>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Leads</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">{metric.leads.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentMetric.id ? 'Editar Métricas' : 'Registrar Métricas'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mês de Referência</label>
                <Input type="month" required value={currentMetric.month || ''} onChange={e => setCurrentMetric({...currentMetric, month: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total de Seguidores</label>
                  <Input type="number" required value={currentMetric.followers || ''} onChange={e => setCurrentMetric({...currentMetric, followers: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alcance Total</label>
                  <Input type="number" required value={currentMetric.reach || ''} onChange={e => setCurrentMetric({...currentMetric, reach: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Visualizações (Views)</label>
                  <Input type="number" required value={currentMetric.views || ''} onChange={e => setCurrentMetric({...currentMetric, views: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Visitas ao Perfil</label>
                  <Input type="number" required value={currentMetric.visits || ''} onChange={e => setCurrentMetric({...currentMetric, visits: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-indigo-700 mb-1">Leads (Contatos Recebidos)</label>
                  <Input type="number" required value={currentMetric.leads || ''} onChange={e => setCurrentMetric({...currentMetric, leads: Number(e.target.value)})} className="border-indigo-200 focus:ring-indigo-500" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Métricas</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
