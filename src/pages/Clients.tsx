import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '../components/ui';
import { storage } from '../lib/storage';
import { Client, StatusClient } from '../types';
import { Plus, Search, Building2, Phone, Mail, Camera, ChevronRight, X, Kanban, List } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

type ViewType = 'list' | 'funnel';

const FUNNEL_STAGES: StatusClient[] = ['Lead', 'Contato', 'Proposta', 'Fechado', 'Em andamento', 'Concluído'];

export function ClientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewType>('list');
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('new') === 'true');
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === 'true') {
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, []);

  const loadData = () => {
    setClients(storage.get<Client>('clients'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient.name) return;
    
    if (currentClient.id) {
      storage.update('clients', currentClient.id, currentClient);
    } else {
      storage.add('clients', {
        ...currentClient,
        date: new Date().toISOString(),
        status: currentClient.status || 'Lead',
        value: Number(currentClient.value) || 0
      } as Omit<Client, 'id'>);
    }
    
    setIsModalOpen(false);
    setCurrentClient({});
    loadData();
  };

  const deleteClient = (id: string) => {
    if(confirm('Excluir este cliente? Todos os dados vinculados podem ficar órfãos.')) {
      storage.remove('clients', id);
      loadData();
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">Gerencie seus contatos e propostas.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setCurrentClient({}); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-max">
          <button
            onClick={() => setView('list')}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center", view === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900')}
          >
            <List className="w-4 h-4 mr-2" />
            Lista
          </button>
          <button
            onClick={() => setView('funnel')}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center", view === 'funnel' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900')}
          >
            <Kanban className="w-4 h-4 mr-2" />
            Funil de Vendas
          </button>
        </div>
        
        {view === 'list' && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar cliente..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <Card key={client.id} className="flex flex-col h-full group hover:shadow-md transition-shadow">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                    {client.company && (
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <Building2 className="w-4 h-4 mr-1" />
                        {client.company}
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "inline-flex px-2 py-1 rounded text-xs font-semibold",
                    client.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' :
                    client.status === 'Em andamento' ? 'bg-blue-100 text-blue-700' :
                    client.status === 'Fechado' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-700'
                  )}>
                    {client.status}
                  </span>
                </div>
                
                <div className="space-y-2 mt-6">
                  {client.service && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Serviço:</span>
                      <span className="font-medium">{client.service}</span>
                    </div>
                  )}
                  {client.value > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Valor:</span>
                      <span className="font-medium">{formatCurrency(client.value)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex justify-between items-center">
                <div className="flex space-x-2">
                  {client.whatsapp && (
                    <a href={`https://wa.me/${client.whatsapp}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {client.instagram && (
                    <a href={`https://instagram.com/${client.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-pink-500 transition-colors">
                      <Camera className="w-4 h-4" />
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentClient(client); setIsModalOpen(true); }}>Editar</Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteClient(client.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50"><X className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === 'funnel' && (
        <div className="flex space-x-4 overflow-x-auto pb-8 snap-x">
          {FUNNEL_STAGES.map(stage => {
            const stageClients = clients.filter(c => c.status === stage);
            const stageValue = stageClients.reduce((acc, curr) => acc + (curr.value || 0), 0);
            
            return (
              <div key={stage} className="min-w-[300px] flex-shrink-0 snap-start">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">{stage}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{stageClients.length}</span>
                </div>
                <div className="space-y-3">
                  {stageClients.map(client => (
                    <Card key={client.id} className="p-4 cursor-pointer hover:border-slate-300 transition-colors" onClick={() => { setCurrentClient(client); setIsModalOpen(true); }}>
                      <h4 className="font-bold text-slate-900">{client.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">{client.service || 'Sem serviço definido'}</p>
                      {client.value > 0 && (
                        <p className="text-sm font-medium text-emerald-600 mt-2">{formatCurrency(client.value)}</p>
                      )}
                    </Card>
                  ))}
                  {stageClients.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center">
                      <span className="text-sm text-slate-400">Vazio</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{currentClient.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
                  <Input required value={currentClient.name || ''} onChange={e => setCurrentClient({...currentClient, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                  <Input value={currentClient.company || ''} onChange={e => setCurrentClient({...currentClient, company: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                  <Input value={currentClient.whatsapp || ''} onChange={e => setCurrentClient({...currentClient, whatsapp: e.target.value})} placeholder="Ex: 11999999999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
                  <Input value={currentClient.instagram || ''} onChange={e => setCurrentClient({...currentClient, instagram: e.target.value})} placeholder="@usuario" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <Input type="email" value={currentClient.email || ''} onChange={e => setCurrentClient({...currentClient, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentClient.status || 'Lead'}
                    onChange={e => setCurrentClient({...currentClient, status: e.target.value as any})}
                  >
                    {FUNNEL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Serviço de interesse</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={currentClient.service || 'Landing Page'}
                    onChange={e => setCurrentClient({...currentClient, service: e.target.value})}
                  >
                    <option value="Landing Page">Landing Page</option>
                    <option value="Mini Site Bio">Mini Site Bio</option>
                    <option value="Design">Design</option>
                    <option value="Site Institucional">Site Institucional</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Potencial/Fechado (R$)</label>
                  <Input type="number" value={currentClient.value || ''} onChange={e => setCurrentClient({...currentClient, value: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <Textarea value={currentClient.notes || ''} onChange={e => setCurrentClient({...currentClient, notes: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Cliente</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
