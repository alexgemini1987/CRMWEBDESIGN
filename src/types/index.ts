export type StatusClient = 'Lead' | 'Contato' | 'Proposta' | 'Fechado' | 'Em andamento' | 'Concluído';
export type StatusProject = 'Briefing' | 'Design' | 'Desenvolvimento' | 'Revisão' | 'Entregue';
export type StatusContent = 'Ideia' | 'Roteiro' | 'Produção' | 'Pronto' | 'Publicado';

export interface Client {
  id: string;
  name: string;
  company: string;
  instagram: string;
  whatsapp: string;
  email: string;
  service: string;
  value: number;
  date: string;
  status: StatusClient;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  service: string;
  value: number;
  startDate: string;
  deadline: string;
  status: StatusProject;
  checklist: ChecklistItem[];
}

export interface Content {
  id: string;
  title: string;
  format: 'Reel' | 'Carrossel' | 'Post' | 'Story';
  pillar: string;
  status: StatusContent;
  date: string;
  caption: string;
  cta: string;
  notes: string;
}

export interface Idea {
  id: string;
  text: string;
  date: string;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  date: string;
}

export interface Finance {
  id: string;
  clientId: string;
  service: string;
  value: number;
  status: 'Pago' | 'Pendente';
  date: string;
}

export interface Learning {
  id: string;
  title: string;
  category: string;
  learned: string;
  apply: string;
  error: string;
  idea: string;
  links: string;
  date: string;
}

export interface Note {
  id: string;
  title: string;
  text: string;
  pinned: boolean;
  category: string;
  date: string;
}

export interface Goal {
  id: string;
  month: string;
  type: string; // Financeira, Clientes, Conteúdo, Aprendizado, Projetos
  target: number;
  current: number;
  title: string;
}

export interface Metric {
  id: string;
  month: string;
  followers: number;
  views: number;
  reach: number;
  visits: number;
  leads: number;
}

export interface Portfolio {
  id: string;
  name: string;
  client: string;
  segment: string;
  type: string;
  url: string;
  description: string;
  problem: string;
  solution: string;
  result: string;
  status: 'Projeto conceitual' | 'Cliente real';
}
