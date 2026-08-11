import React from 'react';
import { useState } from 'react';
import { Card, Button, Input, Textarea } from '../components/ui';
import { AIService } from '../lib/ai-service';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

type AITool = 'ideas' | 'reel' | 'carousel' | 'caption' | 'analyze';

export function AIPage() {
  const [activeTool, setActiveTool] = useState<AITool>('ideas');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [theme, setTheme] = useState('');
  const [audience, setAudience] = useState('');
  const [pillar, setPillar] = useState('');
  const [format, setFormat] = useState('Reel');
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState('Curto (Até 30s)');
  const [tone, setTone] = useState('Profissional');
  const [cta, setCta] = useState('');
  const [ideaText, setIdeaText] = useState('');

  const tools = [
    { id: 'ideas', label: 'Gerar Ideias' },
    { id: 'reel', label: 'Roteiro de Reel' },
    { id: 'carousel', label: 'Criar Carrossel' },
    { id: 'caption', label: 'Criar Legenda' },
    { id: 'analyze', label: 'Analisar Ideia' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');
    setCopied(false);

    try {
      let response = '';
      switch (activeTool) {
        case 'ideas':
          response = await AIService.generateIdeas(theme, audience, pillar, format);
          break;
        case 'reel':
          response = await AIService.createReelScript(theme, objective, duration);
          break;
        case 'carousel':
          response = await AIService.createCarousel(theme);
          break;
        case 'caption':
          response = await AIService.createCaption(theme, tone, cta);
          break;
        case 'analyze':
          response = await AIService.analyzeIdea(ideaText);
          break;
      }
      setResult(response);
    } catch (error) {
      setResult('Ocorreu um erro ao gerar o conteúdo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center space-x-3 mb-8">
        <div className="bg-slate-900 p-2.5 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assistente Criativo</h1>
          <p className="text-slate-500 mt-1">Gere ideias e scripts usando Inteligência Artificial.</p>
        </div>
      </header>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as AITool); setResult(''); }}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              activeTool === tool.id 
                ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            
            {(activeTool === 'ideas' || activeTool === 'reel' || activeTool === 'carousel' || activeTool === 'caption') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tema principal</label>
                <Input required value={theme} onChange={e => setTheme(e.target.value)} placeholder="Ex: Importância de uma Landing Page rápida" />
              </div>
            )}

            {activeTool === 'ideas' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Público-alvo</label>
                  <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Ex: Nutricionistas" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pilar</label>
                    <Input value={pillar} onChange={e => setPillar(e.target.value)} placeholder="Ex: Educacional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Formato preferido</label>
                    <select className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={format} onChange={e => setFormat(e.target.value)}>
                      <option value="Reel">Reel</option>
                      <option value="Carrossel">Carrossel</option>
                      <option value="Qualquer">Qualquer</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTool === 'reel' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
                  <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ex: Salvar o post, Comentar EU QUERO" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duração</label>
                  <select className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value="Curto (Até 30s)">Curto (Até 30s)</option>
                    <option value="Médio (Até 60s)">Médio (Até 60s)</option>
                    <option value="Longo (Mais de 60s)">Longo (Mais de 60s)</option>
                  </select>
                </div>
              </>
            )}

            {activeTool === 'caption' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tom de voz</label>
                  <select className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={tone} onChange={e => setTone(e.target.value)}>
                    <option value="Profissional">Profissional e Direto</option>
                    <option value="Descontraído">Descontraído e Leve</option>
                    <option value="Inspirador">Inspirador e Motivacional</option>
                    <option value="Polêmico">Polêmico / Quebra de padrão</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chamada para Ação (CTA)</label>
                  <Input value={cta} onChange={e => setCta(e.target.value)} placeholder="Ex: Clique no link da bio" />
                </div>
              </>
            )}

            {activeTool === 'analyze' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sua Ideia Bruta</label>
                <Textarea required value={ideaText} onChange={e => setIdeaText(e.target.value)} placeholder="Escreva a ideia que você teve..." className="min-h-[150px]" />
              </div>
            )}

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Gerando...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Gerar Resposta</>
              )}
            </Button>
          </form>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col bg-slate-900 text-slate-100 min-h-[400px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <h3 className="font-medium text-sm text-slate-400">Resultado</h3>
            {result && (
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-slate-400 hover:text-white hover:bg-slate-800 h-8">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            )}
          </div>
          <div className="p-6 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed font-mono">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>A IA está pensando...</p>
              </div>
            ) : result ? (
              <div dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600">
                <Sparkles className="w-8 h-8 mb-4 opacity-50" />
                <p className="text-center max-w-xs">Preencha os campos e clique em gerar para ver a mágica acontecer.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
