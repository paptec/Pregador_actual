import React, { useState, useEffect } from 'react';
import { 
  Lock, MessageCircle, Phone, ShieldCheck, Copy, 
  CreditCard, CheckCircle, Crown, Smartphone, AlertCircle
} from 'lucide-react';
import { SubscriptionState } from '../types';
import { 
  activatePremium, 
  isAdminCode, 
  getSubscriptionState,
  getDaysRemaining,
  getDeviceId
} from '../services/subscriptionService';

interface PaywallProps {
  onSuccess: () => void;
  onAdminLogin: () => void; // Callback para abrir o painel admin
}

export const Paywall: React.FC<PaywallProps> = ({ onSuccess, onAdminLogin }) => {
  // Client States
  const [phone, setPhone] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(30); // Default to Monthly
  const [currentSubState, setCurrentSubState] = useState<SubscriptionState | null>(null);
  
  // Carregar dados iniciais e estado da assinatura
  useEffect(() => {
    const sub = getSubscriptionState();
    setCurrentSubState(sub);
    setDeviceId(getDeviceId()); // Pega o ID único do aparelho
  }, []);

  const plans = [
    { days: 7, price: "1.500 Kz", label: "Semanal" },
    { days: 30, price: "5.000 Kz", label: "Mensal" }
  ];

  const handleActivation = () => {
    if (isAdminCode(code)) {
        onAdminLogin(); // Redireciona para o componente de Backend Real
        return;
    }

    if (!phone) {
        alert("Por favor, insira seu número de telefone para ativar.");
        return;
    }
    
    const success = activatePremium(code, phone);
    if (success) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  const iban = "0040 0000 28580345101 33";
  const handleCopyIBAN = () => {
      navigator.clipboard.writeText(iban);
      alert("IBAN copiado!");
  };

  const contactNumber = "244924052039";
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
      e.preventDefault(); 

      if (!phone || phone.length < 9) {
          alert("Por favor, digite seu número de telefone correto no passo 3 antes de enviar o comprovativo.");
          const phoneInput = document.getElementById('phone-input');
          if (phoneInput) phoneInput.focus();
          return;
      }

      let text = "";
      
      if (selectedPlan) {
          const plan = plans.find(p => p.days === selectedPlan);
          if (plan) {
              text = `Olá! Gostaria de subscrever ao Plano ${plan.label} (${plan.price}).\n\nMeu número: *${phone}*\nID do App: *${deviceId}*\n\nSegue o comprovativo de pagamento. Aguardo a minha chave.`;
          }
      } 
      
      if (!text) {
           text = `Olá! Gostaria de ativar o Pregador Actual. Meu número: *${phone}*, ID do App: *${deviceId}*`;
      }

      const link = `https://wa.me/${contactNumber}?text=${encodeURIComponent(text)}`;
      window.open(link, '_blank');
  };

  const handleCopyDeviceId = () => {
      navigator.clipboard.writeText(deviceId);
      alert("ID do App copiado!");
  }

  const isPremium = currentSubState?.isPremium;

  return (
    <div className="animate-fade-in pb-20 px-4 pt-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-lg mx-auto">
        
        {/* Header */}
        <div className="bg-bible-900 p-6 text-center text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
             {isPremium ? (
                 <CheckCircle className="text-emerald-400 mx-auto mb-2" size={32} />
             ) : (
                 <Lock className="text-gold-400 mx-auto mb-2" size={32} />
             )}
             <h2 className="text-2xl font-serif font-bold">{isPremium ? "Assinatura Ativa" : "Escolha seu Plano"}</h2>
             <p className="text-bible-100 text-sm">
                {isPremium ? "Você possui acesso completo." : "Acesso ilimitado a todas as ferramentas do pregador."}
             </p>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Se for PREMIUM, mostra Status. Se NÃO, mostra Planos */}
            {isPremium ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full text-emerald-600 mb-2">
                        <Crown size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status do Plano</p>
                        <h3 className="text-2xl font-bold text-emerald-700">{currentSubState?.planName || "Vitalício"}</h3>
                    </div>
                    <div className="text-sm text-gray-600">
                        {currentSubState?.premiumEndsAt === 0 
                            ? "Acesso Vitalício / Modo Deus" 
                            : `Expira em: ${getDaysRemaining(currentSubState?.premiumEndsAt || 0)} dias`
                        }
                    </div>
                </div>
            ) : (
                <>
                {/* 1. Seleção de Plano */}
                <div className="grid grid-cols-1 gap-3">
                    <p className="text-xs font-bold text-gray-500 uppercase">1. Selecione o período</p>
                    {plans.map((plan) => (
                        <div 
                            key={plan.days}
                            onClick={() => setSelectedPlan(plan.days)}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedPlan === plan.days ? 'border-gold-500 bg-gold-50' : 'border-gray-100 hover:border-gold-200'}`}
                        >
                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${selectedPlan === plan.days ? 'border-gold-500 bg-gold-500' : 'border-gray-300'}`}>
                                    {selectedPlan === plan.days && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{plan.label}</h3>
                                    <p className="text-xs text-gray-500">{plan.days} dias de acesso total</p>
                                </div>
                            </div>
                            <span className="font-bold text-bible-800 text-lg">{plan.price}</span>
                        </div>
                    ))}
                </div>

                {/* 2. Dados Bancários */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center relative mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center justify-center">
                        <CreditCard size={14} className="mr-1" /> 2. Faça a transferência
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <p className="font-mono font-bold text-lg text-gray-800 tracking-wider break-all">
                            {iban}
                        </p>
                        <button 
                            onClick={handleCopyIBAN}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gold-100 hover:text-gold-600 transition-colors"
                            title="Copiar IBAN"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">Banco BAI - Titular: PAPTECH</p>
                </div>

                {/* 3. Inserir Telefone (OBRIGATÓRIO) E DEVICE ID */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 relative mt-2">
                    <p className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center">
                        <Smartphone size={14} className="mr-1" /> 3. Seus Dados
                    </p>
                    
                    <div className="space-y-3">
                        <div>
                             <p className="text-[10px] text-blue-600 mb-1 font-bold uppercase">Seu Telefone</p>
                             <input
                                id="phone-input"
                                type="tel"
                                placeholder="Ex: 923123456"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-4 pr-3 py-3 bg-white border border-blue-300 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                        </div>

                        <div>
                            <p className="text-[10px] text-blue-600 mb-1 font-bold uppercase flex justify-between">
                                <span>ID do App (Automático)</span>
                                <span className="text-[9px] opacity-70">Necessário para ativação única</span>
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white border border-blue-300 rounded-xl py-2 px-4 flex items-center font-mono font-bold text-blue-900 tracking-widest text-lg select-all">
                                    {deviceId}
                                </div>
                                <button 
                                    onClick={handleCopyDeviceId}
                                    className="px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Botão WhatsApp (Call to Action Principal) */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">4. Envie o comprovativo</p>
                    <a 
                        href="#"
                        onClick={handleWhatsAppClick}
                        className={`flex flex-col items-center justify-center w-full py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 group ${
                            !phone ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                        }`}
                    >
                        <div className="flex items-center font-bold text-lg mb-0.5 text-white">
                            <MessageCircle className="mr-2 fill-current" size={24} />
                            Enviar no WhatsApp
                        </div>
                        <span className={`text-xs ${!phone ? 'text-gray-500' : 'text-emerald-100'} opacity-90 group-hover:opacity-100`}>
                            {!phone ? "Preencha o telefone acima primeiro" : "Envia dados + comprovativo"}
                        </span>
                    </a>
                </div>
                </>
            )}

            {/* Área de Ativação / Admin Code Entry */}
            <div className={`space-y-4 pt-6 border-t ${isPremium ? 'border-emerald-100' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-sm">
                        {isPremium ? "Área Administrativa" : "Tenho uma Chave"}
                    </h3>
                </div>
                
                {/* Se não for premium e o usuário ainda não digitou o telefone acima, mostra aqui também */}
                {!isPremium && !phone && (
                    <div className="flex items-center text-xs text-orange-500 bg-orange-50 p-2 rounded-lg">
                        <AlertCircle size={14} className="mr-1" />
                        <span>Preencha os dados no passo 3.</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder={isPremium ? "Código de Admin" : "Colar Chave de Ativação"}
                        value={code}
                        onChange={(e) => { setCode(e.target.value); setError(false); }}
                        className={`flex-1 p-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 tracking-wide font-mono ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-bible-500'}`}
                    />
                    <button
                        onClick={handleActivation}
                        disabled={!code}
                        className="bg-bible-900 text-white p-3 rounded-xl hover:bg-bible-800 disabled:opacity-50 transition-colors"
                    >
                        <ShieldCheck size={20} />
                    </button>
                </div>

                {error && (
                    <p className="text-red-500 text-xs text-center font-medium animate-pulse">Chave inválida. Verifique se o ID do App está correto.</p>
                )}
            </div>
            
             <div className="text-center pt-2">
                 <p className="text-[10px] text-gray-400">Suporte Técnico: 924052039</p>
             </div>

        </div>
      </div>
    </div>
  );
};