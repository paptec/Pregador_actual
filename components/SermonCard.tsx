import React from 'react';
import { Sermon } from '../types';
import { Share2, Bookmark, ArrowLeft, Copy, Book, Printer } from 'lucide-react';

interface SermonCardProps {
  sermon: Sermon;
  onBack: () => void;
}

export const SermonCard: React.FC<SermonCardProps> = ({ sermon, onBack }) => {

  const handleCopy = () => {
    const text = `
${sermon.title.toUpperCase()}
Base: ${sermon.keyVerseReference}

${sermon.introduction}

${sermon.points.map((p, i) => `${i + 1}. ${p.title}\n${p.description}\n(Ref: ${p.scriptureReference})`).join('\n\n')}

CONCLUSÃO
${sermon.conclusion}
    `;
    navigator.clipboard.writeText(text);
    alert('Esboço copiado!');
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="animate-fade-in pb-20 print:pb-0 print:bg-white print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 font-medium hover:text-bible-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Voltar
        </button>
        <div className="flex space-x-2">
            <button 
                onClick={handlePrint}
                className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-bible-500"
                title="Imprimir"
            >
                <Printer size={20} />
            </button>
            <button 
                onClick={handleCopy}
                className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-bible-500"
                title="Copiar texto"
            >
                <Copy size={20} />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden print:shadow-none print:rounded-none">
        {/* Header - More Professional Styling */}
        <div className="bg-bible-900 p-8 text-white relative overflow-hidden print:bg-white print:text-black print:border-b-2 print:border-black print:p-0 print:mb-6">
          <div className="absolute top-0 right-0 opacity-5 transform translate-x-10 -translate-y-10 print:hidden">
             <Bookmark size={200} />
          </div>
          <div className="relative z-10 text-center sm:text-left">
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest text-gold-400 mb-4 border border-white/10 uppercase print:hidden">
              {sermon.theme}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-4">{sermon.title}</h1>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-6">
                 <div className="flex items-start bg-bible-800/50 p-4 rounded-xl border border-bible-700/50 max-w-xl print:bg-gray-100 print:border-gray-300 print:text-black">
                    <Book size={20} className="text-gold-400 mt-1 mr-3 flex-shrink-0 print:text-black" />
                    <div>
                        <p className="font-bold text-sm text-gold-400 mb-1 uppercase tracking-wide print:text-black">{sermon.keyVerseReference}</p>
                        <p className="text-base italic text-gray-200 font-serif leading-relaxed print:text-gray-800">"{sermon.keyVerse}"</p>
                    </div>
                 </div>
            </div>
          </div>
        </div>

        {/* Content - Manuscript Style */}
        <div className="p-8 space-y-10 print:p-0 print:mt-4">
          
          {/* Introduction */}
          <section className="print:mb-6">
            <h3 className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 print:text-black print:border-gray-300">
                <span className="bg-gray-100 px-2 py-1 rounded mr-2 text-gray-600 print:bg-transparent print:text-black">00</span> Introdução
            </h3>
            <p className="text-gray-800 text-lg leading-relaxed font-serif text-justify print:text-black">
                {sermon.introduction}
            </p>
          </section>

          {/* Points */}
          <section className="space-y-8 print:space-y-6">
            {sermon.points.map((point, index) => (
              <div key={index} className="relative group">
                <div className="flex items-baseline mb-3">
                     <span className="text-4xl font-black text-gray-100 mr-4 font-sans select-none group-hover:text-gold-100 transition-colors print:text-gray-300">
                         {index + 1}
                     </span>
                     <h4 className="text-xl font-bold text-bible-900 border-b-2 border-transparent group-hover:border-gold-400 transition-colors pb-1 print:text-black">
                         {point.title}
                     </h4>
                </div>
                
                <div className="pl-12 border-l-2 border-gray-100 ml-4 print:border-gray-300">
                    <p className="text-gray-700 text-lg mb-3 leading-relaxed font-serif text-justify print:text-black">
                        {point.description}
                    </p>
                    {point.scriptureReference && (
                    <div className="flex items-center text-sm text-bible-600 font-bold bg-bible-50 inline-block px-3 py-1.5 rounded-lg print:bg-transparent print:text-gray-600 print:p-0">
                        📖 {point.scriptureReference}
                    </div>
                    )}
                </div>
              </div>
            ))}
          </section>

          {/* Conclusion */}
          <section className="bg-gray-50 p-8 rounded-2xl border-l-4 border-gold-400 print:bg-transparent print:border-0 print:p-0 print:mt-8">
            <h3 className="text-xs font-bold text-gold-600 uppercase tracking-widest mb-4 print:text-black">
                Conclusão
            </h3>
            <p className="text-gray-900 text-lg leading-relaxed font-serif italic text-justify print:text-black">
                {sermon.conclusion}
            </p>
          </section>

        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center print:hidden">
            <p className="text-xs text-gray-400">Gerado com auxílio de IA • Pregador Actual</p>
        </div>
      </div>
      
       {/* Print Styles */}
       <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            .animate-fade-in, .animate-fade-in * {
                visibility: visible;
            }
            .animate-fade-in {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
                background: white;
            }
            .no-print, button {
                display: none !important;
            }
        }
      `}</style>
    </div>
  );
};