import React, { useState, useEffect } from 'react';
import { generateDailyDevotional } from '../services/geminiService';
import { Devotional } from '../types';
import { ArrowLeft, RefreshCw, Heart, Calendar, Coffee, Sunrise, CheckCircle, Search, Sparkles } from 'lucide-react';

interface DailyDevotionalProps {
  onBack: () => void;
}

export const DailyDevotional: React.FC<DailyDevotionalProps> = ({ onBack }) => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
  
  // New state for manual input
  const [manualInput, setManualInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    // Tenta carregar do localStorage primeiro para não gastar tokens à toa no mesmo dia
    // Apenas se não houver input manual pendente
    if (!showInput) {
        const saved = localStorage.getItem('daily_devotional_v1');
        const today = new Date().toLocaleDateString();

        if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
            setDevotional(parsed);
            return;
        }
        }
    }
  }, [showInput]);

  const handleGenerate = async (useManual = false) => {
    setLoading(true);
    setDevotional(null);
    try {
      const referenceToUse = useManual ? manualInput : undefined;
      const data = await generateDailyDevotional(referenceToUse);
      
      setDevotional(data);
      // Only save to cache if it was the random daily one
      if (!useManual) {
          localStorage.setItem('daily_devotional_v1', JSON.stringify(data));
      }
      setMarkedRead(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar devocional.");
    } finally {
      setLoading(false);
      setShowInput(false);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-pink-700 transition-colors">
            <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-serif font-bold text-gray-800 ml-2">Devocional</h2>
        </div>
        {!loading && !showInput && (
            <button 
                onClick={() => setShowInput(true)} 
                className="text-xs bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full font-bold flex items-center hover:bg-pink-200 transition-colors"
            >
                <Search size={14} className="mr-1" /> Escolher Texto
            </button>
        )}
      </div>

      {showInput && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 animate-slide-up">
              <label className="block text-sm font-bold text-gray-700 mb-2">Escolha o Livro e Capítulo</label>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Ex: Salmos 23, João 1:1-14"
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                  <button 
                    onClick={() => handleGenerate(true)}
                    disabled={!manualInput}
                    className="bg-pink-600 text-white p-3 rounded-lg disabled:opacity-50 font-bold"
                  >
                      Gerar
                  </button>
              </div>
              <button onClick={() => setShowInput(false)} className="text-xs text-gray-500 mt-2 underline">Cancelar</button>
          </div>
      )}

      {loading ? (
        <div className="text-center py-24">
           <div className="inline-block animate-spin text-pink-500 mb-4">
             <RefreshCw size={40} />
           </div>
           <p className="text-gray-500 font-medium">Meditando na Palavra...</p>
        </div>
      ) : devotional ? (
        <div className="space-y-6">
          
          {/* Header Card */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-8 text-white shadow-xl shadow-pink-200 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <div className="relative z-10">
                <div className="flex items-center space-x-2 text-pink-100 text-xs font-bold uppercase tracking-wider mb-2">
                    <Calendar size={14} />
                    <span>{devotional.date}</span>
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4">Leitura do Dia</h3>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <p className="font-bold text-xl text-center flex items-center justify-center">
                        <Book size={24} className="mr-3 text-pink-200" />
                        {devotional.readingPlan}
                    </p>
                </div>
                {!markedRead ? (
                    <button 
                        onClick={() => setMarkedRead(true)}
                        className="w-full mt-4 bg-white text-pink-600 py-3 rounded-xl font-bold text-sm hover:bg-pink-50 transition-colors flex items-center justify-center"
                    >
                        <CheckCircle size={18} className="mr-2" />
                        Marcar Leitura como Concluída
                    </button>
                ) : (
                    <div className="mt-4 text-center bg-green-500/20 py-2 rounded-xl text-sm font-bold border border-green-200/30">
                        Leitura Concluída! 🎉
                    </div>
                )}
             </div>
          </div>

          {/* Versículo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center space-x-2 mb-3 text-pink-600 font-bold text-sm uppercase">
                <Sunrise size={18} />
                <span>Versículo Chave</span>
             </div>
             <p className="text-xl font-serif text-gray-800 italic leading-relaxed text-center">
                "{devotional.keyVerse}"
             </p>
          </div>

          {/* Meditação */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center space-x-2 mb-4 text-pink-600 font-bold text-sm uppercase">
                <Coffee size={18} />
                <span>Meditação da Palavra</span>
             </div>
             <div className="prose prose-pink text-gray-600 leading-relaxed text-justify text-sm">
                {devotional.meditation}
             </div>
          </div>

          {/* Oração e Ação */}
          <div className="grid grid-cols-1 gap-4">
              <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
                  <h4 className="font-bold text-pink-800 mb-2 flex items-center">
                      <Heart size={16} className="mr-2" /> Oração
                  </h4>
                  <p className="text-pink-900/80 text-sm italic">
                      "{devotional.prayer}"
                  </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                      <CheckCircle size={16} className="mr-2" /> Passo Prático
                  </h4>
                  <p className="text-blue-900/80 text-sm">
                      {devotional.actionStep}
                  </p>
              </div>
          </div>
          
        </div>
      ) : (
        <div className="text-center">
             <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                <Sparkles className="mx-auto text-gold-500 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Comece o dia com Deus</h3>
                <p className="text-gray-500 text-sm mb-6">Gere uma leitura aleatória ou escolha um texto específico para meditar hoje.</p>
                
                <div className="flex flex-col gap-3">
                    <button onClick={() => handleGenerate(false)} className="bg-bible-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                        Gerar Devocional Aleatório
                    </button>
                    <button onClick={() => setShowInput(true)} className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold">
                        Escolher Texto Manualmente
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

import { Book } from 'lucide-react';