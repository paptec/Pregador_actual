import React, { useState } from 'react';
import { generateServiceProgram } from '../services/geminiService';
import { ServiceProgram } from '../types';
import { ArrowLeft, Printer, Wand2, Calendar, Clock, User, List } from 'lucide-react';

interface ServiceProgramProps {
  onBack: () => void;
}

export const ServiceProgramView: React.FC<ServiceProgramProps> = ({ onBack }) => {
  const [program, setProgram] = useState<ServiceProgram | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [serviceType, setServiceType] = useState('Culto de Domingo');
  const [theme, setTheme] = useState('');
  const [duration, setDuration] = useState('2 Horas');
  const [segments, setSegments] = useState('');

  const handleGenerate = async () => {
    if (!theme) return;
    setLoading(true);
    try {
      const result = await generateServiceProgram(serviceType, theme, duration, segments);
      setProgram(result);
    } catch (error) {
      alert("Erro ao gerar programa.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in pb-20 print:pb-0 print:bg-white">
      
      {/* Navigation (Hidden on Print) */}
      <div className="flex items-center mb-6 print:hidden">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-purple-700 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-serif font-bold text-gray-800 ml-2">Programa de Culto</h2>
      </div>

      {!program ? (
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
                    <List size={32} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Gerador de Liturgia</h3>
                <p className="text-gray-500 text-sm mt-1">Organize o culto com uma ordem de serviço estruturada.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Culto</label>
                    <select 
                        value={serviceType} 
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        <option>Culto de Domingo</option>
                        <option>Estudo Bíblico</option>
                        <option>Culto de Jovens</option>
                        <option>Santa Ceia</option>
                        <option>Culto de Oração</option>
                        <option>Evangelismo</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tema Principal</label>
                    <input 
                        type="text" 
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="Ex: A Fidelidade de Deus"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duração Estimada</label>
                    <input 
                        type="text" 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ex: 2 horas, 90 min"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Segmentos Especiais (Opcional)</label>
                    <input 
                        type="text" 
                        value={segments}
                        onChange={(e) => setSegments(e.target.value)}
                        placeholder="Ex: Apresentação de crianças, Testemunho especial"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={loading || !theme}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 mt-4"
                >
                    {loading ? (
                        <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                         Gerando...
                        </>
                    ) : (
                        <>
                         <Wand2 size={18} className="mr-2" /> Gerar Programa
                        </>
                    )}
                </button>
            </div>
         </div>
      ) : (
          <div className="animate-slide-up">
              {/* Actions Toolbar */}
              <div className="flex gap-2 mb-6 print:hidden">
                  <button 
                    onClick={() => setProgram(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold text-sm hover:bg-gray-200"
                  >
                      Voltar
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center justify-center"
                  >
                      <Printer size={18} className="mr-2" /> Imprimir
                  </button>
              </div>

              {/* Printable Area */}
              <div id="print-area" className="bg-white p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-lg border-0 sm:border border-gray-200 print:shadow-none print:border-none print:p-0">
                  <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 uppercase tracking-wide">{program.title}</h1>
                      <div className="flex justify-center gap-6 text-sm font-medium text-gray-600 print:text-black">
                          <span className="flex items-center"><Calendar size={14} className="mr-1" /> {program.date}</span>
                          <span className="px-2">|</span>
                          <span className="uppercase tracking-widest">{program.theme}</span>
                      </div>
                  </div>

                  <div className="space-y-0">
                      {program.items.map((item, idx) => (
                          <div key={idx} className="flex border-b border-gray-100 py-4 last:border-0 break-inside-avoid">
                              <div className="w-24 flex-shrink-0 font-bold text-gray-900 font-mono text-lg pt-1">
                                  {item.time}
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-lg text-gray-800 uppercase tracking-tight mb-1">{item.activity}</h4>
                                  <p className="text-gray-600 text-sm leading-relaxed mb-1">{item.description}</p>
                                  {item.responsible && (
                                      <div className="flex items-center text-xs font-bold text-purple-700 print:text-gray-500 mt-2">
                                          <User size={12} className="mr-1" />
                                          {item.responsible}
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-200 pt-4 print:text-black">
                      Gerado pelo app Pregador Actual
                  </div>
              </div>
          </div>
      )}
      
      {/* Print Styles */}
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #print-area, #print-area * {
                visibility: visible;
            }
            #print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
            }
            .no-print {
                display: none;
            }
        }
      `}</style>
    </div>
  );
};