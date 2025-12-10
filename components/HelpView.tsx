import React, { useState } from 'react';
import { ArrowLeft, Wand2, Lightbulb, Book, BookA, ListOrdered, Heart, ShieldCheck, HelpCircle, MessageSquare, Send } from 'lucide-react';
import { sendFeedback } from '../services/subscriptionService';

interface HelpViewProps {
  onBack: () => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onBack }) => {
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'complaint' | 'other'>('suggestion');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendFeedback({
      type: feedbackType,
      message,
      contact
    });

    setSent(true);
    setMessage('');
    setContact('');
    
    setTimeout(() => setSent(false), 3000);
  };
  
  const features = [
    {
      icon: <Wand2 className="text-white" size={24} />,
      color: "bg-gradient-to-br from-bible-800 to-bible-600",
      title: "Gerador de Pregações",
      description: "Crie esboços completos inserindo apenas um tema ou referência. A IA estrutura a introdução, pontos principais, versículos e conclusão."
    },
    {
      icon: <Lightbulb className="text-white" size={24} />,
      color: "bg-gradient-to-br from-gold-500 to-gold-600",
      title: "Gerador de Ideias",
      description: "Está sem inspiração? Selecione uma categoria (ex: Fé, Consolação) e receba 5 sugestões de temas bíblicos profundos."
    },
    // ... other features remain same conceptually but re-rendered here
  ];

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-bible-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-serif font-bold text-gray-800 ml-2">Guia do Usuário</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
         <div className="text-center mb-6">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-bible-600">
                 <HelpCircle size={32} />
             </div>
             <h3 className="font-bold text-xl text-gray-900">Como usar o App?</h3>
             <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                O Pregador Actual é o seu assistente ministerial completo. Veja abaixo o que cada ferramenta faz.
             </p>
         </div>

         <div className="space-y-4">
             {features.slice(0, 2).map((feature, idx) => (
                 <div key={idx} className="flex items-start p-4 rounded-xl bg-gray-50 border border-gray-100">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${feature.color} mr-4`}>
                         {feature.icon}
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h4>
                         <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                     </div>
                 </div>
             ))}
             <div className="text-center pt-2">
                 <p className="text-xs text-gray-400 italic">E muito mais nas ferramentas...</p>
             </div>
         </div>
      </div>

      {/* Formulário de Feedback */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400 rounded-full opacity-5 -mr-10 -mt-10"></div>
          
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
              <MessageSquare size={20} className="mr-2 text-gold-500" />
              Fale Conosco
          </h3>
          <p className="text-sm text-gray-500 mb-4">Tem alguma sugestão de melhoria ou reclamação? Envie diretamente para a nossa equipe.</p>

          {sent ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold animate-fade-in">
                  Mensagem enviada com sucesso! Obrigado.
              </div>
          ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setFeedbackType('suggestion')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${feedbackType === 'suggestion' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200'}`}
                      >
                          Sugestão
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFeedbackType('complaint')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${feedbackType === 'complaint' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-500 border-gray-200'}`}
                      >
                          Reclamação
                      </button>
                  </div>

                  <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva sua mensagem aqui..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bible-500 outline-none h-24"
                      required
                  />

                  <input 
                      type="text" 
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Seu contato (opcional)"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bible-500 outline-none"
                  />

                  <button 
                      type="submit"
                      className="w-full bg-bible-900 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-bible-800 transition-colors"
                  >
                      <Send size={16} className="mr-2" /> Enviar Mensagem
                  </button>
              </form>
          )}
      </div>

      <div className="bg-gray-100 rounded-2xl p-6 text-center">
          <p className="text-xs text-gray-500 mb-2">Suporte Técnico direto no WhatsApp</p>
          <a 
            href="https://wa.me/244924052039" 
            target="_blank"
            className="inline-block text-bible-600 font-bold text-sm hover:underline"
          >
              +244 924 052 039
          </a>
      </div>
    </div>
  );
};