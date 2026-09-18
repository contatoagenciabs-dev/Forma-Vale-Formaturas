import React, { useState } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code, 
  Eye, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Edit3, 
  Share2, 
  CheckCircle2,
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { GeneratedPage } from '../types';

interface WebPageViewerProps {
  page: GeneratedPage;
  onGoToApiPlayground: (apiPath?: string) => void;
  onNewGeneration: () => void;
}

export const WebPageViewer: React.FC<WebPageViewerProps> = ({
  page,
  onGoToApiPlayground,
  onNewGeneration
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'json'>('visual');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Customization state
  const [editedTitle, setEditedTitle] = useState<string>(page.pageTitle);
  const [editedTagline, setEditedTagline] = useState<string>(page.tagline);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Generate full HTML template string for export
  const fullExportHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${editedTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">

  <!-- Header / Navigation -->
  <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex justify-between items-center">
    <div className="font-bold text-xl text-emerald-400 font-sans">FormaVale</div>
    <a href="#cta" class="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm">Acessar Serviços</a>
  </header>

  <!-- Hero Section -->
  <section class="max-w-5xl mx-auto px-6 py-16 text-center">
    <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">Forma Vale Document AI</span>
    <h1 class="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4 tracking-tight">${editedTitle}</h1>
    <p class="text-lg text-slate-300 max-w-2xl mx-auto">${editedTagline}</p>
    <div class="mt-8 flex justify-center gap-4">
      <a href="#cta" class="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg">Começar Agora</a>
    </div>
  </section>

  <!-- Key Sections -->
  ${page.sections.map(sec => `
  <section class="max-w-5xl mx-auto px-6 py-8">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <h2 class="text-2xl font-bold text-white mb-2">${sec.title}</h2>
      ${sec.subtitle ? `<p class="text-slate-400 text-sm mb-6">${sec.subtitle}</p>` : ''}
    </div>
  </section>
  `).join('\n')}

  <!-- Footer -->
  <footer class="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
    <p>© 2026 Forma Vale. Gerado a partir de documentos oficiais via IA.</p>
  </footer>

</body>
</html>`;

  // Copy code handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullExportHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download HTML handler
  const handleDownloadHtml = () => {
    const blob = new Blob([fullExportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formavale-pagina-${page.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title & Document Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white line-clamp-1">
                {editedTitle}
              </h2>
              <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {page.archetype.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Origem: <span className="text-slate-200">{page.docTitle}</span> • {page.createdAt}
            </p>
          </div>
        </div>

        {/* View Mode Controls & Device Switcher */}
        <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
          
          {/* Device Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                device === 'desktop' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Visão Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                device === 'tablet' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Visão Tablet (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                device === 'mobile' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Visão Mobile (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'visual' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Render
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'code' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> HTML/JSX
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'json' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> JSON
            </button>
          </div>

          {/* Actions: Download / Copy / Edit */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                isEditing ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Editar Título e Subtítulo"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              title="Copiar HTML"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedCode ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
              title="Baixar HTML Completo"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>

        </div>

      </div>

      {/* Suggested APIs Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              APIs da Forma Vale Sugeridas para esta Página:
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {page.suggestedApis.map((api, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400">
                  {api}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onGoToApiPlayground(page.suggestedApis[0])}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <span>Testar API no Playground</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline Quick Editor Bar */}
      {isEditing && (
        <div className="p-4 bg-slate-900 border border-amber-500/40 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Ajustar Título e Subtítulo da Página Web:</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">Concluído</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Título Principal:</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Subtítulo / Tagline:</label>
              <input
                type="text"
                value={editedTagline}
                onChange={(e) => setEditedTagline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE CONTENT AREA */}

      {/* 1. VISUAL RENDER MODE */}
      {viewMode === 'visual' && (
        <div className="flex justify-center transition-all">
          <div
            className={`w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
              device === 'mobile'
                ? 'max-w-[380px]'
                : device === 'tablet'
                ? 'max-w-[768px]'
                : 'max-w-full'
            }`}
          >
            {/* Mock Browser Topbar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="bg-slate-950 px-4 py-1 rounded-full border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-2 max-w-sm truncate">
                <span className="text-emerald-400">https://</span>
                <span className="truncate">formavale.com.br/portal/2026</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {device.toUpperCase()}
              </div>
            </div>

            {/* PAGE VISUAL CANVAS */}
            <div className="bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-12">
              
              {/* Render Section: HERO */}
              <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Forma Vale 2026 Official Page
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {editedTitle}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {editedTagline}
                </p>
                
                {/* Hero CTAs */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#sec-cta"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 transition"
                  >
                    Acessar Portal do Colaborador
                  </a>
                  <button
                    onClick={() => onGoToApiPlayground()}
                    className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
                  >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Documentação de APIs</span>
                  </button>
                </div>
              </div>

              {/* Render Key Insights Pills */}
              {page.keyInsights && page.keyInsights.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 max-w-4xl mx-auto">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Principais Destaques do Documento
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {page.keyInsights.map((insight, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 font-medium leading-snug">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Section Types */}
              {page.sections.map((section) => {
                
                // Metrics Cards Section
                if (section.type === 'metrics' && Array.isArray(section.content)) {
                  return (
                    <div key={section.id} className="space-y-4 max-w-4xl mx-auto">
                      <h2 className="text-lg font-bold text-white text-center">{section.title}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {section.content.map((m: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl text-center space-y-1 hover:border-emerald-500/40 transition">
                            <p className="text-xs text-slate-400 font-medium">{m.label}</p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                              {m.value}
                            </p>
                            <p className="text-[11px] text-slate-400">{m.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Features Grid
                if (section.type === 'features' && Array.isArray(section.content)) {
                  return (
                    <div key={section.id} className="space-y-6 max-w-4xl mx-auto">
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-white">{section.title}</h2>
                        {section.subtitle && <p className="text-xs text-slate-400 mt-1">{section.subtitle}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {section.content.map((f: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-slate-700 transition">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                              0{idx + 1}
                            </div>
                            <h3 className="text-sm font-bold text-white">{f.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Table Section
                if (section.type === 'table' && section.content?.headers && section.content?.rows) {
                  return (
                    <div key={section.id} className="space-y-4 max-w-4xl mx-auto">
                      <div>
                        <h2 className="text-lg font-bold text-white">{section.title}</h2>
                        {section.subtitle && <p className="text-xs text-slate-400">{section.subtitle}</p>}
                      </div>
                      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase font-semibold">
                            <tr>
                              {section.content.headers.map((h: string, idx: number) => (
                                <th key={idx} className="p-3.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {section.content.rows.map((row: string[], rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                                {row.map((cell: string, cIdx: number) => (
                                  <td key={cIdx} className={`p-3.5 ${cIdx === 0 ? 'font-semibold text-white' : ''}`}>
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                // FAQ Accordion
                if (section.type === 'faq' && Array.isArray(section.content)) {
                  return (
                    <div key={section.id} className="space-y-4 max-w-3xl mx-auto">
                      <h2 className="text-lg font-bold text-white text-center">{section.title}</h2>
                      <div className="space-y-2">
                        {section.content.map((item: any, idx: number) => {
                          const isOpen = openFaqIndex === idx;
                          return (
                            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                              <button
                                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                className="w-full p-4 text-left text-xs font-semibold text-white flex items-center justify-between gap-2 hover:bg-slate-800/50 transition"
                              >
                                <span>{item.question}</span>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-4 text-xs text-slate-300 border-t border-slate-800/60 pt-3 bg-slate-950/40">
                                  {item.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // CTA Section
                if (section.type === 'cta') {
                  return (
                    <div id="sec-cta" key={section.id} className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4 max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                      <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">{section.subtitle}</p>
                      <div className="pt-2 flex items-center justify-center gap-3">
                        <button
                          onClick={() => onGoToApiPlayground()}
                          className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 transition flex items-center gap-2"
                        >
                          <Terminal className="w-4 h-4" />
                          <span>{section.content?.buttonText || 'Integrar via API'}</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              {/* Page Footer */}
              <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500 space-y-1">
                <p>© 2026 Forma Vale Benefícios S/A. Documentação convertida automaticamente.</p>
                <p className="text-[11px] text-slate-600">Integrável com os serviços de API REST / RESTful Forma Vale v2.4</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. CODE MODE (HTML/JSX) */}
      {viewMode === 'code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-0">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400">formavale-export.html</span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto max-h-[600px] leading-relaxed select-all">
            {fullExportHtml}
          </pre>
        </div>
      )}

      {/* 3. JSON MODE */}
      {viewMode === 'json' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400">structured-page-data.json</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(page, null, 2));
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar JSON</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300/90 bg-slate-950 overflow-x-auto max-h-[600px] leading-relaxed">
            {JSON.stringify(page, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};
