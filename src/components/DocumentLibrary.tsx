import React, { useState } from 'react';
import { 
  FolderKanban, 
  FileText, 
  Search, 
  Plus, 
  Tag, 
  Sparkles, 
  Calendar, 
  FileCode, 
  Eye, 
  X,
  Upload,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { DocItem } from '../types';
import { PRESET_DOCUMENTS } from '../data/presetDocuments';

interface DocumentLibraryProps {
  onTransformDoc: (doc: DocItem) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ onTransformDoc }) => {
  const [documents, setDocuments] = useState<DocItem[]>(PRESET_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);

  // Filtered List
  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'todos' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <FolderKanban className="w-3.5 h-3.5" /> Repositório de Conhecimento e Documentos
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Biblioteca de Documentos Corporativos Forma Vale
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Consulte manuais de RH, especificações técnicas de APIs, tabelas de auxílio alimentação e regulamentos do programa. Transforme qualquer documento em uma página web em apenas um clique.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, tag ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'beneficios', label: 'Benefícios' },
            { id: 'api', label: 'API & Técnica' },
            { id: 'rh', label: 'RH & Onboarding' },
            { id: 'financeiro', label: 'Financeiro & PAT' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">
                  {doc.fileType} • {doc.sizeKb} KB
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-3">
                {doc.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {doc.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800/80">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveDoc(doc)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-800 transition"
              >
                <Eye className="w-3.5 h-3.5" /> Visualizar
              </button>

              <button
                onClick={() => onTransformDoc(doc)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Web Page</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Detail Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{activeDoc.title}</h3>
                  <p className="text-xs text-slate-400">{activeDoc.category.toUpperCase()} • Atualizado em {activeDoc.updatedAt}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {activeDoc.description}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conteúdo do Documento:</label>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                  {activeDoc.content}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const doc = activeDoc;
                  setActiveDoc(null);
                  onTransformDoc(doc);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Transformar em Página Web Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
