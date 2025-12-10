import React from 'react';
import { Home, PlusCircle, Lightbulb, Briefcase } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  
  // Logic to determine which tab is active based on current view
  const isHomeActive = [AppView.HOME, AppView.HISTORY, AppView.SAVED_DETAIL].includes(currentView);
  const isIdeasActive = currentView === AppView.IDEAS;
  const isGeneratorActive = [AppView.GENERATOR, AppView.RESULT].includes(currentView);
  const isToolsActive = [
      AppView.TOOLS, 
      AppView.BIBLE, 
      AppView.DICTIONARY, 
      AppView.DEVOTIONAL, 
      AppView.SERVICE_PROGRAM,
      AppView.PAYWALL
  ].includes(currentView);

  const renderButton = (view: AppView, label: string, icon: React.ReactNode, isActive: boolean) => {
      return (
        <button 
          onClick={() => setView(view)} 
          className={`group relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-bible-900' : 'text-gray-400 hover:text-bible-600'}`}
        >
            {/* Active Top Indicator */}
            {isActive && (
                <span className="absolute top-0 w-12 h-1 bg-bible-900 rounded-b-full shadow-sm animate-fade-in"></span>
            )}
            
            {/* Icon Container */}
            <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive 
                ? 'bg-bible-50 transform translate-y-1 shadow-inner' 
                : 'group-hover:bg-gray-50 group-hover:-translate-y-1'
            }`}>
                {icon}
            </div>

            {/* Label */}
            <span className={`text-[11px] font-bold tracking-wide mt-1 transition-all duration-300 ${
                isActive ? 'opacity-100 transform translate-y-0.5 font-extrabold' : 'opacity-70 group-hover:opacity-100'
            }`}>
                {label}
            </span>
        </button>
      );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[76px] bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.08)]">
      <div className="max-w-3xl mx-auto grid grid-cols-4 h-full">
        
        {renderButton(
            AppView.HOME, 
            "Início", 
            <Home size={26} strokeWidth={isHomeActive ? 2.5 : 2} />, 
            isHomeActive
        )}
        
        {renderButton(
            AppView.IDEAS, 
            "Ideias", 
            <Lightbulb size={26} strokeWidth={isIdeasActive ? 2.5 : 2} />, 
            isIdeasActive
        )}

        {renderButton(
            AppView.GENERATOR, 
            "Criar", 
            <PlusCircle size={26} strokeWidth={isGeneratorActive ? 2.5 : 2} />, 
            isGeneratorActive
        )}
        
        {renderButton(
            AppView.TOOLS, 
            "Ferramentas", 
            <Briefcase size={26} strokeWidth={isToolsActive ? 2.5 : 2} />, 
            isToolsActive
        )}

      </div>
    </nav>
  );
};