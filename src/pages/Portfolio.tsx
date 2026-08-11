import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '../components/ui';
import { storage } from '../lib/storage';
import { Portfolio } from '../types';
import { Plus, Briefcase, ExternalLink, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function PortfolioPage() {
  const [items, setItems] = useState<Portfolio[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Portfolio>>({ type: 'Landing Page', status: 'Cliente real' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(storage.get<Portfolio>('portfolio'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.name) return;
    
    if (currentItem.id) {
      storage.update('portfolio', currentItem.id, currentItem);
    } else {
      storage.add('portfolio', {
        name: currentItem.name,
        client: currentItem.client || '',
        segment: currentItem.segment || '',
        type: currentItem.type || 'Landing Page',
        url: currentItem.url || '',
        description: currentItem.description || '',
        problem: currentItem.problem || '',
        solution: currentItem.solution || '',
        result: currentItem.result || '',
        status: currentItem.status || 'Cliente real'
      } as Omit<Portfolio, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentItem({ type: 'Landing Page', status: 'Cliente real' });
    loadData();
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Excluir este case do portfólio?')) {
      storage.remove('portfolio', id);
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portfólio & Cases</h1>
          <p className="text-slate-500 mt-1">Registre seus melhores projetos para criar propostas matadoras.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentItem({ type: 'Landing Page', status: 'Cliente real' }); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Case
          </Button>
        </div>
      </header>

      {items.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Portfólio vazio</h3>
          <p className="text-slate-500 mb-4">Adicione projetos concluídos para ter um histórico dos seus resultados.</p>
          <Button onClick={() => setIsModalOpen(true)}>Adicionar primeiro case</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <Card key={item.id} className="flex flex-col overflow-hidden group">
              <div className="bg-slate-900 text-white p-6 relative">
                <div className="flex justify-between items-start mb-6">
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
                    item.status === 'Cliente real' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-300"
                  )}>
                    {item.status}
                  </span>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded">Editar</button>
                    <button onClick={(e) => deleteItem(item.id, e)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded">Excluir</button>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="bg-white/10 px-2 py-0.5 rounded">{item.type}</span>
                  {item.segment && <span className="bg-white/10 px-2 py-0.5 rounded">{item.segment}</span>}
                </div>
              </div>
              
              <div className="p-6 flex-1 bg-white space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">O Desafio (Problema)</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.problem || 'Não preenchido.'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">A Solução</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.solution || 'Não preenchido.'}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Resultado Alcançado</h4>
                  <p className="text-sm text-emerald-900 leading-relaxed font-medium">{item.result || 'Ainda não mensurado.'}</p>
                </div>
                
                {item.url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Ver projeto ao vivo
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentItem.id ? 'Editar Case' : 'Novo Case'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto</label>
                  <Input required value={currentItem.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} placeholder="Ex: Redesign Landing Page XYZ" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente (opcional)</label>
                  <Input value={currentItem.client || ''} onChange={e => setCurrentItem({...currentItem, client: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nicho / Segmento</label>
                  <Input value={currentItem.segment || ''} onChange={e => setCurrentItem({...currentItem, segment: e.target.value})} placeholder="Ex: Saúde, Infoproduto, E-commerce..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentItem.type || 'Landing Page'}
                    onChange={e => setCurrentItem({...currentItem, type: e.target.value})}
                  >
                    <option value="Landing Page">Landing Page</option>
                    <option value="Mini Site Bio">Mini Site Bio</option>
                    <option value="Identidade Visual">Identidade Visual</option>
                    <option value="Design Social Media">Design Social Media</option>
                    <option value="Site Institucional">Site Institucional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status do Projeto</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentItem.status || 'Cliente real'}
                    onChange={e => setCurrentItem({...currentItem, status: e.target.value as any})}
                  >
                    <option value="Cliente real">Cliente Real</option>
                    <option value="Projeto conceitual">Projeto Conceitual / Fictício</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL (Link do projeto ao vivo)</label>
                  <Input value={currentItem.url || ''} onChange={e => setCurrentItem({...currentItem, url: e.target.value})} placeholder="https://..." />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900">História do Case</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-bold">Problema (O que o cliente precisava resolver?)</label>
                  <Textarea value={currentItem.problem || ''} onChange={e => setCurrentItem({...currentItem, problem: e.target.value})} className="min-h-[80px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-bold">Solução (O que você entregou?)</label>
                  <Textarea value={currentItem.solution || ''} onChange={e => setCurrentItem({...currentItem, solution: e.target.value})} className="min-h-[80px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1 font-bold">Resultado (Qual foi o impacto?)</label>
                  <Textarea value={currentItem.result || ''} onChange={e => setCurrentItem({...currentItem, result: e.target.value})} placeholder="Ex: Aumento de 30% na conversão de leads..." className="min-h-[80px] border-emerald-200 bg-emerald-50/30" />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Case</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
