import React, { useState } from 'react';
import { Search, ArrowLeft, Copy, BookA } from 'lucide-react';
import { getResourceContent } from '../services/geminiService';

interface SimpleResourceProps {
  type: 'dictionary'; // Hymn removed
  onBack: () => void;
}

export const SimpleResource: React.FC<SimpleResourceProps> = ({ type, onBack }) => {
  const [query, setQuery] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await getResourceContent(query);
      setContent(result);
    } catch (error) {
      setContent("Erro ao buscar conteúdo. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-bible-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-serif font-bold text-gray-800 ml-2">Dicionário Teológico</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 text-white">
            <div className="flex flex-col items-center mb-6 text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3 backdrop-blur-sm">
                    <BookA size={32} />
                </div>
                <h3 className="font-bold text-lg">Vocabulário Bíblico</h3>
                <p className="text-emerald-100 text-xs mt-1 max-w-xs">Consulte termos gregos, hebraicos e conceitos teológicos.</p>
            </div>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Justificação, Logos, Pentecostes..."
              className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl transition-shadow"
            />
            <Search className="absolute left-4 top-4.5 text-gray-400 pointer-events-none" size={20} />
          </form>
        </div>
      </div>

      {loading && (
         <div className="text-center py-20 text-gray-400">
            <div className="inline-block animate-bounce mb-3 text-emerald-600"><BookA size={32} /></div>
            <p className="font-medium text-sm">Pesquisando nas referências...</p>
         </div>
      )}

      {!loading && content && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-slide-up relative">
          <button 
            onClick={() => navigator.clipboard.writeText(content)}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-full transition-all"
            title="Copiar texto"
          >
            <Copy size={18} />
          </button>
          
          <h3 className="font-bold text-xl text-gray-900 mb-4 capitalize">{query}</h3>
          <div className="prose prose-lg text-gray-700 font-serif leading-relaxed whitespace-pre-line text-justify">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};