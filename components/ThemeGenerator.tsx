import React, { useState } from 'react';
import { generateBiblicalThemes } from '../services/geminiService';
import { SuggestedTheme } from '../types';
import { Sparkles, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';

interface ThemeGeneratorProps {
  onSelectTheme: (theme: SuggestedTheme) => void;
}

const CATEGORIES = [
  "Fé em Tempos Difíceis", "Consolação", "Doutrina", 
  "Evangelismo", "Liderança", "Família", "Milagres de Jesus",
  "Personagens do Antigo Testamento", "Parábolas"
];

export const ThemeGenerator: React.FC<ThemeGeneratorProps> = ({ onSelectTheme }) => {
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState<SuggestedTheme[]>([]);
  const [customInput, setCustomInput] = useState('');

  const handleGenerate = async (category: string) => {
    setLoading(true);
    setThemes([]); // Clear previous
    try {
      const results = await generateBiblicalThemes(category);
      setThemes(results);
    } catch (error) {
      alert("Não foi possível gerar temas. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-bible-800 to-bible-900 p-6 rounded-b-3xl -mx-4 mb-6 text-white shadow-lg">
        <h2 className="text-2xl font-serif font-bold mb-2">Gerador de Temas</h2>
        <p className="text-bible-100 text-sm opacity-90">
          Está sem inspiração? Deixe a IA sugerir temas bíblicos profundos para a sua próxima mensagem.
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Area */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Sobre o que gostaria de pregar hoje?
          </label>
          
          <div className="flex gap-2 mb-4">
            <input 
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ex: Gratidão, Ansiedade..."
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bible-500 outline-none"
            />
            <button 
              onClick={() => customInput && handleGenerate(customInput)}
              disabled={loading || !customInput}
              className="bg-bible-800 text-white p-3 rounded-lg disabled:opacity-50"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => handleGenerate(cat)}
                disabled={loading}
                className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-bible-50 hover:text-bible-600 hover:border-bible-200 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin text-bible-500 mb-3">
              <RefreshCw size={32} />
            </div>
            <p className="text-gray-500 text-sm font-medium">Consultando as Escrituras...</p>
          </div>
        )}

        {/* Results List */}
        {themes.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="font-bold text-gray-800 flex items-center">
              <Sparkles size={16} className="text-gold-500 mr-2" />
              Sugestões Encontradas
            </h3>
            
            {themes.map((theme, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold-400"></div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-1">{theme.title}</h4>
                <div className="flex items-center text-bible-600 text-sm font-medium mb-3">
                  <BookOpen size={14} className="mr-1.5" />
                  {theme.reference}
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 border-l-2 border-gray-100 pl-3">
                  {theme.context}
                </p>

                <button
                  onClick={() => onSelectTheme(theme)}
                  className="w-full py-2.5 bg-bible-50 text-bible-700 font-semibold rounded-lg text-sm group-hover:bg-bible-800 group-hover:text-white transition-colors"
                >
                  Criar Pregação com este Tema
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
