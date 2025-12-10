import React from 'react';
import { AppView } from '../types';
import { Book, BookA, ArrowRight, Heart, ListOrdered, ShieldCheck, HelpCircle } from 'lucide-react';

interface ToolsMenuProps {
  onSelect: (view: AppView) => void;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({ onSelect }) => {
  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-bible-900">Ferramentas de Estudo</h2>
        <p className="text-gray-500 text-sm mt-1">Recursos teológicos para aprofundar o seu conhecimento.</p>
      </div>

      <div className="grid gap-5">
        <button
            onClick={() => onSelect(AppView.DEVOTIONAL)}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-lg hover:border-pink-200 transition-all active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg mr-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Heart size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-pink-700 transition-colors">Devocional Diário</h3>
              <p className="text-sm text-gray-500 leading-tight">Hábito de leitura, meditação e oração para fortalecer o espírito.</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                 <ArrowRight className="text-gray-300 group-hover:text-pink-600 transition-colors" size={20} />
            </div>
          </button>

          <button
            onClick={() => onSelect(AppView.SERVICE_PROGRAM)}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-lg hover:border-purple-200 transition-all active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mr-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <ListOrdered size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">Programa de Culto</h3>
              <p className="text-sm text-gray-500 leading-tight">Gere e imprima a ordem de serviço litúrgico.</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-purple-50 transition-colors">
                 <ArrowRight className="text-gray-300 group-hover:text-purple-600 transition-colors" size={20} />
            </div>
          </button>

        <button
            onClick={() => onSelect(AppView.BIBLE)}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-lg hover:border-bible-200 transition-all active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-bible-800 to-bible-900 rounded-2xl flex items-center justify-center shadow-lg mr-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Book size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-bible-800 transition-colors">Bíblia Sagrada</h3>
              <p className="text-sm text-gray-500 leading-tight">Almeida Revista e Corrigida (ARC) com pesquisa inteligente.</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-bible-50 transition-colors">
                 <ArrowRight className="text-gray-300 group-hover:text-bible-600 transition-colors" size={20} />
            </div>
          </button>

          <button
            onClick={() => onSelect(AppView.DICTIONARY)}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-lg hover:border-emerald-200 transition-all active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center shadow-lg mr-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <BookA size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-emerald-800 transition-colors">Dicionário & Vocabulário</h3>
              <p className="text-sm text-gray-500 leading-tight">Definições teológicas, grego, hebraico e contextos históricos.</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-emerald-50 transition-colors">
                 <ArrowRight className="text-gray-300 group-hover:text-emerald-600 transition-colors" size={20} />
            </div>
          </button>

          {/* Botão de Assinatura / Admin */}
          <button
            onClick={() => onSelect(AppView.PAYWALL)}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-lg hover:border-gold-200 transition-all active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg mr-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={32} className="text-gold-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-gold-600 transition-colors">Minha Assinatura</h3>
              <p className="text-sm text-gray-500 leading-tight">Gerenciar plano ou acessar área administrativa.</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-gold-50 transition-colors">
                 <ArrowRight className="text-gray-300 group-hover:text-gold-600 transition-colors" size={20} />
            </div>
          </button>

          {/* Botão de Ajuda / Guia */}
          <button
            onClick={() => onSelect(AppView.HELP)}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-lg hover:border-blue-200 transition-all active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg mr-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <HelpCircle size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">Guia de Uso</h3>
              <p className="text-sm text-gray-500 leading-tight">Aprenda a usar todas as funcionalidades do aplicativo.</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                 <ArrowRight className="text-gray-300 group-hover:text-blue-600 transition-colors" size={20} />
            </div>
          </button>
      </div>
    </div>
  );
};