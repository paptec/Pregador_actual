import React, { useState, useEffect } from 'react';
import { SermonFormData } from '../types';
import { Wand2, Book, Users, Layers, AlertCircle, Flame } from 'lucide-react';

interface SermonFormProps {
  initialTopic?: string;
  initialReference?: string;
  onSubmit: (data: SermonFormData) => void;
  isLoading: boolean;
}

export const SermonForm: React.FC<SermonFormProps> = ({ initialTopic = '', initialReference = '', onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SermonFormData>({
    topic: initialTopic,
    reference: initialReference,
    audience: 'Geral',
    tone: 'Temático'
  });

  // Update local state if props change (e.g. coming from Theme Generator)
  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        topic: initialTopic,
        reference: initialReference
    }));
  }, [initialTopic, initialReference]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;
    onSubmit(formData);
  };

  const audiences: SermonFormData['audience'][] = ['Geral', 'Jovens', 'Liderança', 'Crianças', 'Casais', 'Evangelístico'];
  const tones: SermonFormData['tone'][] = ['Temático', 'Expositivo', 'Textual', 'Devocional'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-bible-900">Novo Esboço</h2>
        <p className="text-gray-500 text-sm mt-1">Preencha os detalhes para gerar a sua pregação</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <Book size={16} className="mr-2 text-bible-500" />
            Tema ou Assunto
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="Ex: A Graça, O Filho Pródigo"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bible-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {/* Reference Input (Optional) */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <Layers size={16} className="mr-2 text-bible-500" />
            Referência Bíblica (Opcional)
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            placeholder="Ex: Salmos 23, João 3:16"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bible-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Users size={16} className="mr-2 text-bible-500" />
              Público-alvo
            </label>
            <div className="relative">
                <select
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value as any }))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bible-500 outline-none appearance-none"
                >
                {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <AlertCircle size={16} className="mr-2 text-bible-500" />
              Estilo
            </label>
            <div className="relative">
                <select
                value={formData.tone}
                onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value as any }))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bible-500 outline-none appearance-none"
                >
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
          </div>
        </div>
        
        {/* Aviso Espiritual */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-start text-xs text-gray-500 leading-tight gap-2">
            <Flame size={16} className="text-bible-500 flex-shrink-0" />
            <p>Lembre-se: A tecnologia estrutura as ideias, mas a unção vem do Espírito Santo. Ore antes de pregar.</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.topic}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isLoading || !formData.topic
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-bible-800 to-bible-500 hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Gerando Esboço...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Gerar Pregação</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};