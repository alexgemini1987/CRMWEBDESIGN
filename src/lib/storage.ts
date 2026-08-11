import {
  Client,
  Project,
  Content,
  Idea,
  Task,
  Finance,
  Learning,
  Note,
  Goal,
  Metric,
  Portfolio,
} from '../types';

const PREFIX = 'creatorhub_';

export const storage = {
  get<T>(key: string): T[] {
    const data = localStorage.getItem(PREFIX + key);
    return data ? JSON.parse(data) : [];
  },
  save<T>(key: string, data: T[]): void {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  },
  add<T extends { id: string }>(key: string, item: Omit<T, 'id'>): T {
    const items = storage.get<T>(key);
    const newItem = { ...item, id: crypto.randomUUID() } as T;
    items.push(newItem);
    storage.save(key, items);
    return newItem;
  },
  update<T extends { id: string }>(key: string, id: string, item: Partial<T>): T | null {
    const items = storage.get<T>(key);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...item };
    storage.save(key, items);
    return items[index];
  },
  remove<T extends { id: string }>(key: string, id: string): void {
    const items = storage.get<T>(key);
    storage.save(
      key,
      items.filter((i) => i.id !== id)
    );
  },
  clearAll(): void {
    const keys = [
      'clients',
      'projects',
      'contents',
      'ideas',
      'tasks',
      'finances',
      'learnings',
      'notes',
      'goals',
      'metrics',
      'portfolio',
    ];
    keys.forEach((key) => localStorage.removeItem(PREFIX + key));
  },
};

export const initializeMockData = () => {
  if (localStorage.getItem(PREFIX + 'initialized')) return;

  const clients: Client[] = [
    {
      id: crypto.randomUUID(),
      name: 'João Silva',
      company: 'Clínica Bella',
      instagram: '@clinicabella',
      whatsapp: '11999999999',
      email: 'contato@clinicabella.com',
      service: 'Landing Page',
      value: 1297,
      date: new Date().toISOString(),
      status: 'Em andamento',
      notes: 'Cliente precisa de urgência para campanha de botox.',
    },
  ];

  const contents: Content[] = [
    {
      id: crypto.randomUUID(),
      title: '3 erros que fazem sua Landing Page perder clientes',
      format: 'Reel',
      pillar: 'Landing Pages',
      status: 'Ideia',
      date: new Date(Date.now() + 86400000).toISOString(),
      caption: '',
      cta: 'Link na bio',
      notes: '',
    },
  ];

  const tasks: Task[] = [
    { id: crypto.randomUUID(), text: 'Finalizar Landing Page Gabrielle', done: false, date: new Date().toISOString() },
    { id: crypto.randomUUID(), text: 'Criar Reel', done: true, date: new Date().toISOString() },
  ];

  storage.save('clients', clients);
  storage.save('contents', contents);
  storage.save('tasks', tasks);
  localStorage.setItem(PREFIX + 'initialized', 'true');
};
