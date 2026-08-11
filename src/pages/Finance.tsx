import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import { storage } from '../lib/storage';
import { Finance, Client } from '../types';
import { Plus, CircleDollarSign, TrendingUp, X } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FinancePage() {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFinance, setCurrentFinance] = useState<Partial<Finance>>({ status: 'Pago', date: new Date().toISOString() });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFinances(storage.get<Finance>('finances'));
    setClients(storage.get<Client>('clients'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFinance.clientId || !currentFinance.value) return;
    
    if (currentFinance.id) {
      storage.update<Finance>('finances', currentFinance.id, currentFinance);
    } else {
      storage.add('finances', {
        clientId: currentFinance.clientId,
        service: currentFinance.service || '',
        value: Number(currentFinance.value),
        status: currentFinance.status || 'Pago',
        date: currentFinance.date || new Date().toISOString()
      } as Omit<Finance, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentFinance({ status: 'Pago', date: new Date().toISOString() });
    loadData();
  };

  const deleteFinance = (id: string) => {
    if(confirm('Excluir este registro?')) {
      storage.remove<Finance>('finances', id);
      loadData();
    }
  };

  const toggleStatus = (finance: Finance) => {
    storage.update<Finance>('finances', finance.id, { status: finance.status === 'Pago' ? 'Pendente' : 'Pago' });
    loadData();
  };

  const totalSold = finances.reduce((acc, f) => acc + f.value, 0);
  const totalReceived = finances.filter(f => f.status === 'Pago').reduce((acc, f) => acc + f.value, 0);
  const totalPending = finances.filter(f => f.status === 'Pendente').reduce((acc, f) => acc + f.value, 0);

  const activeClients = clients.filter(c => c.status === 'Fechado' || c.status === 'Em andamento' || c.status === 'Concluído');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-1">Acompanhe seus recebimentos e pendências.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentFinance({ status: 'Pago', date: new Date().toISOString() }); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Lançamento
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Vendido</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalSold)}</p>
        </Card>
        <Card className="p-6 border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <CircleDollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Recebido</span>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{formatCurrency(totalReceived)}</p>
        </Card>
        <Card className="p-6 border-amber-100 bg-amber-50/30">
          <div className="flex items-center space-x-2 text-amber-600 mb-2">
            <CircleDollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Pendente</span>
          </div>
          <p className="text-3xl font-bold text-amber-700">{formatCurrency(totalPending)}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {finances.length === 0 ? (
          <div className="p-12 text-center">
            <CircleDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum lançamento</h3>
            <p className="text-slate-500 mb-4">Registre suas vendas para acompanhar o faturamento.</p>
            <Button onClick={() => setIsModalOpen(true)}>Adicionar Lançamento</Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {finances.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(finance => {
              const client = clients.find(c => c.id === finance.clientId);
              return (
                <div key={finance.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="bg-slate-100 p-3 rounded-xl flex flex-col items-center justify-center min-w-[4rem]">
                      <span className="text-xs font-bold text-slate-500 uppercase">{format(new Date(finance.date), 'MMM', { locale: ptBR })}</span>
                      <span className="text-lg font-bold text-slate-900">{format(new Date(finance.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{client?.name || 'Cliente Removido'}</h4>
                      <p className="text-sm text-slate-500">{finance.service}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <button 
                          onClick={() => toggleStatus(finance)}
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors",
                            finance.status === 'Pago' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          )}>
                          {finance.status}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="font-bold text-slate-900">{formatCurrency(finance.value)}</span>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => { setCurrentFinance(finance); setIsModalOpen(true); }} className="h-6 px-2 text-xs">Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteFinance(finance.id)} className="h-6 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">Excluir</Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentFinance.id ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select 
                  required
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={currentFinance.clientId || ''}
                  onChange={e => setCurrentFinance({...currentFinance, clientId: e.target.value})}
                >
                  <option value="" disabled>Selecione um cliente</option>
                  {activeClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serviço/Descrição</label>
                <Input required value={currentFinance.service || ''} onChange={e => setCurrentFinance({...currentFinance, service: e.target.value})} placeholder="Ex: Pagamento 1/2 Landing Page" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <Input type="number" required value={currentFinance.value || ''} onChange={e => setCurrentFinance({...currentFinance, value: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentFinance.status || 'Pago'}
                    onChange={e => setCurrentFinance({...currentFinance, status: e.target.value as 'Pago' | 'Pendente'})}
                  >
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <Input type="date" required value={currentFinance.date ? currentFinance.date.split('T')[0] : ''} onChange={e => setCurrentFinance({...currentFinance, date: new Date(e.target.value).toISOString()})} />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
