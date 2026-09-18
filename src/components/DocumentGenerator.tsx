import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  FileCode, 
  Layout, 
  Palette, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { DocItem, PageArchetype, DesignStyle, TargetAudience, GeneratedPage } from '../types';
import { PRESET_DOCUMENTS } from '../data/presetDocuments';

interface DocumentGeneratorProps {
  onPageGenerated: (page: GeneratedPage) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  onPageGenerated,
  isGenerating,
  setIsGenerating
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(PRESET_DOCUMENTS[0].id);
  const [rawText, setRawText] = useState<string>(PRESET_DOCUMENTS[0].content);
  const [docTitle, setDocTitle] = useState<string>(PRESET_DOCUMENTS[0].title);
  
  // Customization controls
  const [archetype, setArchetype] = useState<PageArchetype>('portal');
  const [style, setStyle] = useState<DesignStyle>('emerald');
  const [audience, setAudience] = useState<TargetAudience>('colaboradores');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Preset Selection
  const handleSelectPreset = (doc: DocItem) => {
    setSelectedDocId(doc.id);
    setRawText(doc.content);
    setDocTitle(doc.title);
    setErrorMessage(null);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedDocId('custom-file');
    setDocTitle(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text || '');
      setErrorMessage(null);
    };
    reader.onerror = () => {
      setErrorMessage("Erro ao ler o arquivo selecionado.");
    };
    reader.readAsText(file);
  };

  // Handle Submit Generation
  const handleGenerate = async () => {
    if (!rawText || rawText.trim().length < 20) {
      setErrorMessage("Por favor, selecione um documento ou insira um texto com pelo menos 20 caracteres.");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: rawText,
          archetype,
          style,
          audience
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao gerar página web.');
      }

      const data = await response.json();
      
      if (data.success && data.page) {
        const newPage: GeneratedPage = {
          id: `page-${Date.now()}`,
          docId: selectedDocId,
          docTitle: docTitle || 'Documento Forma Vale',
          pageTitle: data.page.pageTitle || 'Página Gerada Forma Vale',
          tagline: data.page.tagline || 'Página gerada via Inteligência Artificial a partir de documentos.',
          archetype,
          style,
          audience,
          sections: data.page.sections || [],
          generatedHtml: data.page.generatedHtml || '',
          createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          keyInsights: data.page.keyInsights || [],
          suggestedApis: data.page.suggestedApis || ['/api/v2/benefits/calculate', '/api/v2/documents/parse']
        };

        onPageGenerated(newPage);
      } else {
        throw new Error('Formato de resposta inválido retornado pelo servidor.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Falha na conexão com o servidor de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Intro Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Transformação Inteligente de Documentos em Web Pages
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Use seus documentos corporativos para criar <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Páginas Web Interativas</span>
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Selecione uma política, manual de integração ou especificação técnica da <strong>Forma Vale</strong>.
            Nossa Inteligência Artificial estruturará os dados e construirá a página web com preparação automática de APIs.
          </p>
        </div>
      </div>

      {/* Main Grid: Document Selection & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Document Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Preset Selection Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                1. Escolha ou envie um documento
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {PRESET_DOCUMENTS.length} documentos da Forma Vale
              </span>
            </div>

            {/* Document Presets Carousel/Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_DOCUMENTS.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectPreset(doc)}
                    className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300">
                          {doc.category}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {doc.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{doc.sizeKb} KB</span>
                      <span className="text-emerald-400 font-medium">{doc.fileType.toUpperCase()}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* File Upload Zone */}
            <div className="pt-2">
              <label className="block relative group cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.md,.json,.pdf,.docx,.csv"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
                <div className="border-2 border-dashed border-slate-800 group-hover:border-emerald-500/50 bg-slate-950/50 group-hover:bg-slate-950 rounded-xl p-4 text-center transition-all">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white">
                        Carregar documento próprio (.txt, .md, .json)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Arraste um arquivo ou clique para selecionar do computador
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Document Content Preview / Editor Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Conteúdo do Documento a Processar:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(PRESET_DOCUMENTS[0].content);
                    setSelectedDocId(PRESET_DOCUMENTS[0].id);
                    setDocTitle(PRESET_DOCUMENTS[0].title);
                  }}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar Padrão
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setSelectedDocId('custom-text');
                }}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 resize-y"
                placeholder="Cole aqui o texto do seu documento, política de benefícios, contrato ou especificação de API..."
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{rawText.length} caracteres</span>
                <span>~{Math.ceil(rawText.split(/\s+/).filter(Boolean).length)} palavras</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Generation Settings & Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 sticky top-20">
            
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-emerald-400" />
              2. Estilo e Destino da Página Web
            </h2>

            {/* Archetype Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Arquétipo de Estrutura:</span>
                <span className="text-[11px] text-emerald-400 font-normal">Como a página será organizada</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'portal', label: 'Portal de Serviços', desc: 'Para colaboradores & RH' },
                  { id: 'landing', label: 'Landing Page Comercial', desc: 'Foco em vendas & atração' },
                  { id: 'technical', label: 'Manual Técnico de API', desc: 'Com snippets e rotas' },
                  { id: 'guide', label: 'Guia & Onboarding', desc: 'Passo a passo explicativo' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setArchetype(item.id as PageArchetype)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      archetype === item.id
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Design Style / Palette */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-400" /> Paleta & Estilo Visual
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'emerald', name: 'Emerald', color: 'from-emerald-500 to-teal-600' },
                  { id: 'indigo', name: 'Indigo', color: 'from-indigo-500 to-violet-600' },
                  { id: 'slate', name: 'Slate Tech', color: 'from-slate-400 to-zinc-600' },
                  { id: 'amber', name: 'Amber Gold', color: 'from-amber-500 to-orange-600' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setStyle(p.id as DesignStyle)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      style === p.id
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-full h-3 rounded bg-gradient-to-r ${p.color}`}></div>
                    <span className="text-[11px] font-medium text-slate-300">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Público Alvo Principal
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as TargetAudience)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="colaboradores">Colaboradores & Usuários do Benefício</option>
                <option value="gestores">Gestores de RH & Administradores</option>
                <option value="desenvolvedores">Desenvolvedores & Engenheiros de Software</option>
                <option value="clientes">Clientes e Empresas Parceiras</option>
              </select>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generate Trigger Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isGenerating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 hover:brightness-110 shadow-emerald-500/20 active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-950 rounded-full animate-spin"></div>
                  <span>Processando documento com Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Página Web a partir do Documento</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </button>

            {/* Info Banner */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                A IA lerá seu documento, gerará seções responsivas, tabelas, destaques de taxas e preparará as APIs Forma Vale correspondentes para integração imediata.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
