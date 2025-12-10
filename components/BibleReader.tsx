import React, { useState } from 'react';
import { Search, ArrowLeft, BookOpen, Copy } from 'lucide-react';
import { getBibleText } from '../services/geminiService';

interface BibleReaderProps {
  onBack: () => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({ onBack }) => {
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedRef, setSearchedRef] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setSearchedRef(reference);
    try {
      const result = await getBibleText(reference);
      setText(result);
    } catch (error) {
      setText("Erro ao buscar o texto.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${searchedRef}\n\n${text}`);
    alert('Texto copiado!');
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-bible-800">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-serif font-bold text-bible-900 ml-2">Bíblia Sagrada</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
        <div className="bg-bible-900 p-6 text-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-bible-200 mb-2">
            Pesquisa Rápida (ARC)
          </label>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: Salmos 23, João 3:16"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-bible-200 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
            />
            <Search className="absolute left-3 top-3.5 text-bible-200 pointer-events-none" size={18} />
          </form>
        </div>
      </div>

      {loading && (
         <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="animate-spin mb-3 text-bible-500"><BookOpen size={32} /></div>
            <p>Buscando nas escrituras...</p>
         </div>
      )}

      {!loading && text && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-slide-up relative">
          <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-bible-600 bg-gray-50 rounded-full"
            title="Copiar"
          >
            <Copy size={18} />
          </button>
          
          <h3 className="font-bold text-xl text-bible-900 mb-4 pb-2 border-b border-gray-100">
            {searchedRef}
          </h3>
          <div className="prose prose-lg text-gray-800 font-serif leading-relaxed whitespace-pre-line">
            {text}
          </div>
          <div className="mt-6 text-xs text-gray-400 text-center uppercase tracking-widest">
            Almeida Revista e Corrigida
          </div>
        </div>
      )}
    </div>
  );
};