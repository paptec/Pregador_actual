import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { SermonForm } from './components/SermonForm';
import { SermonCard } from './components/SermonCard';
import { ThemeGenerator } from './components/ThemeGenerator';
import { ToolsMenu } from './components/ToolsMenu';
import { BibleReader } from './components/BibleReader';
import { SimpleResource } from './components/SimpleResource';
import { DailyDevotional } from './components/DailyDevotional'; 
import { ServiceProgramView } from './components/ServiceProgram'; 
import { Paywall } from './components/Paywall'; 
import { HelpView } from './components/HelpView'; 
import { AdminDashboard } from './components/AdminDashboard'; // New Component
import { generateSermon } from './services/geminiService';
import { 
    getSubscriptionState, 
    getDaysRemaining, 
    getMinutesRemaining, 
    trackDailyVisit, 
    trackSermonGeneration,
    getAppTheme 
} from './services/subscriptionService'; 
import { AppView, Sermon, SermonFormData, SuggestedTheme, SubscriptionState } from './types';
import { Plus, BookOpen, ChevronRight, Search, Lightbulb, Sparkles, Clock, Crown, Flame } from 'lucide-react';

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [loading, setLoading] = useState(false);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [history, setHistory] = useState<Sermon[]>([]);
  const [minutesLeft, setMinutesLeft] = useState(0);
  
  // Subscription State
  const [subscription, setSubscription] = useState<SubscriptionState>(() => getSubscriptionState());

  // State for filling the form from suggestion
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedReference, setSelectedReference] = useState<string>('');

  // Initial Load & Timer Logic
  useEffect(() => {
    // 1. Load History
    const saved = localStorage.getItem('sermonHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // 2. Track Visit (Analytics)
    trackDailyVisit();

    // 3. Apply Theme from Admin Settings
    const theme = getAppTheme();
    document.documentElement.style.setProperty('--font-primary', theme.fontFamily);
    
    // Check Subscription immediately just to update timers
    checkSubscriptionStatus();

    // Timer Interval: Checks every 10 seconds to update trial status or lock app
    const interval = setInterval(() => {
        checkSubscriptionStatus();
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  const checkSubscriptionStatus = () => {
    const subState = getSubscriptionState();
    setSubscription(subState);

    // Update minutes left for UI
    if (subState.isTrialActive) {
        const mins = getMinutesRemaining(subState.trialEndsAt);
        setMinutesLeft(mins);
        
        // If trial just expired (mins goes to 0 and logic updates), force paywall if on restricted view
        if (mins === 0 && !subState.isPremium) {
             const restrictedViews = [
                AppView.GENERATOR, AppView.IDEAS, AppView.TOOLS, 
                AppView.BIBLE, AppView.DICTIONARY, AppView.RESULT,
                AppView.DEVOTIONAL, AppView.SERVICE_PROGRAM,
                AppView.HISTORY, AppView.SAVED_DETAIL
            ];
            
            // Force verify current view against restrictions
            if (restrictedViews.includes(view)) {
                setView(AppView.PAYWALL);
            }
        }
    }
  };

  // Save history on update
  useEffect(() => {
    localStorage.setItem('sermonHistory', JSON.stringify(history));
  }, [history]);

  // Check access before changing view
  const checkAccessAndSetView = (targetView: AppView) => {
    const subState = getSubscriptionState(); // Refresh state
    setSubscription(subState);

    // Allowed views without payment: HOME only, HELP only
    // Restricted views: Everything else including HISTORY
    const restrictedViews = [
        AppView.GENERATOR, 
        AppView.IDEAS, 
        AppView.TOOLS, 
        AppView.BIBLE, 
        AppView.DICTIONARY,
        AppView.RESULT,
        AppView.DEVOTIONAL,
        AppView.SERVICE_PROGRAM,
        AppView.HISTORY // Histórico agora é restrito
    ];

    if (subState.isPremium || subState.isTrialActive) {
        setView(targetView);
    } else {
        if (restrictedViews.includes(targetView)) {
            setView(AppView.PAYWALL);
        } else {
            setView(targetView);
        }
    }
  };

  const handleGenerate = async (data: SermonFormData) => {
    // Double check before API call
    const subState = getSubscriptionState();
    if (!subState.isPremium && !subState.isTrialActive) {
        setView(AppView.PAYWALL);
        return;
    }

    setLoading(true);
    try {
      const generatedData = await generateSermon(data);
      
      const newSermon: Sermon = {
        ...generatedData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        theme: data.topic
      };

      setCurrentSermon(newSermon);
      setHistory(prev => [newSermon, ...prev]);
      
      // TRACK ANALYTICS
      trackSermonGeneration();

      setView(AppView.RESULT);
    } catch (error) {
      alert("Ocorreu um erro ao gerar o sermão. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseTheme = (theme: SuggestedTheme) => {
      setSelectedTheme(theme.title);
      setSelectedReference(theme.reference);
      checkAccessAndSetView(AppView.GENERATOR);
  };

  const handleHistorySelect = (sermon: Sermon) => {
    // Verificar assinatura antes de abrir o detalhe do sermão
    const subState = getSubscriptionState();
    if (!subState.isPremium && !subState.isTrialActive) {
        setView(AppView.PAYWALL);
        return;
    }

    setCurrentSermon(sermon);
    setView(AppView.SAVED_DETAIL);
  };

  const handleBack = () => {
    if (view === AppView.RESULT) checkAccessAndSetView(AppView.GENERATOR);
    else if (view === AppView.SAVED_DETAIL) checkAccessAndSetView(AppView.HISTORY);
    else if (view === AppView.PAYWALL) setView(AppView.HOME);
    else setView(AppView.HOME);
  };

  const handlePremiumSuccess = () => {
    const subState = getSubscriptionState();
    setSubscription(subState);
    setView(AppView.HOME);
    alert("Parabéns! Sua licença Premium foi ativada com sucesso.");
  };

  // INJECT DYNAMIC THEME STYLES
  const theme = getAppTheme();
  const themeStyles = {
      '--bible-900': theme.primaryColor, // Override base dark blue
      '--bible-800': theme.primaryColor, 
      fontFamily: theme.fontFamily,
      fontSize: `${theme.fontSizeScale * 100}%` // Scale base font size
  } as React.CSSProperties;

  // --- RENDER ADMIN BACKEND ---
  if (view === AppView.ADMIN) {
      return (
          <AdminDashboard 
            onExit={() => setView(AppView.HOME)} 
            onGoToApp={() => setView(AppView.HOME)}
          />
      );
  }

  // --- RENDER REGULAR APP ---
  return (
    <div 
        style={themeStyles}
        className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20 selection:bg-bible-100 print:bg-white print:pb-0 font-sans"
    >
      {/* Dynamic Style Injection for Tailwind overrides via CSS Variables logic simulation */}
      <style>{`
        :root {
            --font-sans: ${theme.fontFamily}, system-ui, sans-serif;
        }
        body {
            font-family: var(--font-sans);
        }
        .bg-bible-900 { background-color: ${theme.primaryColor} !important; }
        .text-bible-900 { color: ${theme.primaryColor} !important; }
        .border-bible-900 { border-color: ${theme.primaryColor} !important; }
        
        /* Adjust lighter shades slightly based on primary if possible, or keep static blues */
      `}</style>

      <div className="print:hidden"><Header /></div>

      <main className="max-w-3xl mx-auto px-4 pt-6 min-h-[calc(100vh-180px)] print:min-h-0 print:p-0 print:max-w-none">
        
        {/* Trial Status Banner */}
        {!subscription.isPremium && subscription.isTrialActive && (
             <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center justify-between animate-fade-in shadow-sm print:hidden">
                <div className="flex items-center text-orange-800 text-xs font-bold">
                    <Clock size={16} className="mr-2 text-orange-600 animate-pulse" />
                    <span>Modo Teste: <span className="text-lg">{minutesLeft}</span> min restantes</span>
                </div>
                <button 
                    onClick={() => setView(AppView.PAYWALL)}
                    className="text-[10px] bg-bible-900 text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider hover:bg-bible-800 transition-colors"
                >
                    Subscrever Agora
                </button>
             </div>
        )}

        {/* Trial Expired Banner (If on Home) */}
        {!subscription.isPremium && !subscription.isTrialActive && view === AppView.HOME && (
             <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between animate-fade-in print:hidden">
                <div className="flex items-center text-red-800 text-xs font-bold">
                    <Clock size={14} className="mr-2" />
                    <span>Tempo de teste esgotado.</span>
                </div>
                <button 
                    onClick={() => setView(AppView.PAYWALL)}
                    className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                    Ativar App
                </button>
             </div>
        )}

        {/* Premium Badge & CountDown */}
        {subscription.isPremium && view === AppView.HOME && (
             <div className="flex justify-between items-center mb-2 animate-fade-in px-1 print:hidden">
                <span className="text-xs text-gray-400 font-medium">
                    {subscription.premiumEndsAt === 0 
                        ? 'Acesso Vitalício' 
                        : `${getDaysRemaining(subscription.premiumEndsAt)} dias restantes (${subscription.planName || 'Plano Ativo'})`}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-gold-100 to-gold-50 text-gold-700 border border-gold-200">
                    <Crown size={12} className="mr-1" /> Premium
                </span>
             </div>
        )}

        {/* HOME VIEW */}
        {view === AppView.HOME && (
          <div className="animate-fade-in space-y-8">
            {/* Welcome Banner - Premium Look */}
            <div className="bg-gradient-to-br from-bible-900 via-bible-800 to-bible-900 rounded-2xl p-8 text-white shadow-xl shadow-bible-900/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:translate-x-10 transition-transform duration-1000"></div>
               <div className="relative z-10">
                 <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="text-gold-400" size={18} />
                    <span className="text-bible-200 text-xs font-bold tracking-wider uppercase">Assistente IA</span>
                 </div>
                 <h2 className="text-3xl font-serif font-bold mb-3 leading-tight">Olá, Pregador</h2>
                 <p className="text-bible-100 mb-8 max-w-sm text-sm leading-relaxed opacity-90">
                   Prepare sermões impactantes, consulte a teologia e organize suas mensagens com excelência.
                 </p>
                 <div className="flex gap-4">
                    <button 
                    onClick={() => { setSelectedTheme(''); setSelectedReference(''); checkAccessAndSetView(AppView.GENERATOR); }}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-gold-500/30 transition-all transform active:scale-95 flex items-center justify-center text-sm"
                    >
                        <Plus size={18} className="mr-2" />
                        Nova Pregação
                    </button>
                    <button 
                    onClick={() => checkAccessAndSetView(AppView.IDEAS)}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-3.5 rounded-xl font-semibold backdrop-blur-md border border-white/10 transition-all flex items-center justify-center"
                    title="Inspiração"
                    >
                        <Lightbulb size={22} />
                    </button>
                 </div>
               </div>
            </div>

            {/* Quick Actions / Categories Grid */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                 <h3 className="font-bold text-gray-800 text-lg">Acesso Rápido</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => checkAccessAndSetView(AppView.IDEAS)}
                   className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-gold-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-gold-50 rounded-full flex items-center justify-center text-gold-600 mb-3 group-hover:scale-110 transition-transform">
                        <Lightbulb size={24} />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">Gerar Ideias</span>
                    <span className="text-xs text-gray-500 mt-1">Inspiração para temas</span>
                 </button>
                 <button 
                   onClick={() => checkAccessAndSetView(AppView.TOOLS)}
                   className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-bible-200 transition-all group"
                 >
                    <div className="w-12 h-12 bg-bible-50 rounded-full flex items-center justify-center text-bible-600 mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen size={24} />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">Ferramentas</span>
                    <span className="text-xs text-gray-500 mt-1">Bíblia e Dicionário</span>
                 </button>
              </div>
            </div>

            {/* OBS (Substituindo Nota Pastoral) */}
            <div className="bg-white rounded-xl p-5 border-l-4 border-bible-600 shadow-sm flex items-start gap-4">
                <div className="bg-bible-50 p-2.5 rounded-full text-bible-800 flex-shrink-0">
                    <Flame size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">OBS</h4>
                    <p className="text-xs text-gray-600 leading-relaxed text-justify">
                        Esta ferramenta utiliza Inteligência Artificial para auxiliar na estruturação de ideias e pesquisa bíblica. 
                        <strong> Ela não substitui a oração, o jejum e a direção do Espírito Santo. </strong>
                        Utilize o conteúdo gerado com sabedoria, discernimento e sempre confira nas Escrituras.
                    </p>
                </div>
            </div>

            {/* Recent History Preview */}
            {history.length > 0 && (
              <div>
                 <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-bold text-gray-800 text-lg">Recentes</h3>
                    <button onClick={() => checkAccessAndSetView(AppView.HISTORY)} className="text-bible-600 text-xs font-bold uppercase tracking-wide hover:underline">Ver tudo</button>
                  </div>
                  <div className="space-y-3">
                    {history.slice(0, 3).map(sermon => (
                      <div 
                        key={sermon.id} 
                        onClick={() => handleHistorySelect(sermon)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 overflow-hidden">
                          <div className="h-12 w-12 bg-bible-900 rounded-xl flex items-center justify-center text-white flex-shrink-0 font-serif font-bold text-lg">
                             {sermon.theme.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 truncate text-sm mb-0.5">{sermon.title}</h4>
                            <div className="flex items-center text-xs text-gray-500">
                                <span className="truncate mr-2">{new Date(sermon.createdAt).toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                                <span className="text-bible-500 font-medium truncate">{sermon.keyVerseReference}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
              </div>
            )}
          </div>
        )}

        {/* PAYWALL VIEW */}
        {view === AppView.PAYWALL && (
            <Paywall 
                onSuccess={handlePremiumSuccess} 
                onAdminLogin={() => setView(AppView.ADMIN)}
            />
        )}
        
        {/* HELP VIEW */}
        {view === AppView.HELP && (
            <HelpView onBack={() => checkAccessAndSetView(AppView.TOOLS)} />
        )}

        {/* THEME GENERATOR VIEW */}
        {view === AppView.IDEAS && (
            <ThemeGenerator onSelectTheme={handleUseTheme} />
        )}

        {/* GENERATOR VIEW */}
        {view === AppView.GENERATOR && (
          <div className="animate-fade-in">
            <SermonForm 
              initialTopic={selectedTheme} 
              initialReference={selectedReference}
              onSubmit={handleGenerate} 
              isLoading={loading} 
            />
          </div>
        )}

        {/* TOOLS MENU */}
        {view === AppView.TOOLS && (
            <ToolsMenu onSelect={checkAccessAndSetView} />
        )}

        {/* BIBLE READER */}
        {view === AppView.BIBLE && (
            <BibleReader onBack={() => checkAccessAndSetView(AppView.TOOLS)} />
        )}

        {/* DICTIONARY (Ex-SimpleResource) */}
        {view === AppView.DICTIONARY && (
            <SimpleResource type="dictionary" onBack={() => checkAccessAndSetView(AppView.TOOLS)} />
        )}

        {/* DAILY DEVOTIONAL */}
        {view === AppView.DEVOTIONAL && (
            <DailyDevotional onBack={() => checkAccessAndSetView(AppView.TOOLS)} />
        )}

        {/* SERVICE PROGRAM GENERATOR */}
        {view === AppView.SERVICE_PROGRAM && (
            <ServiceProgramView onBack={() => checkAccessAndSetView(AppView.TOOLS)} />
        )}

        {/* RESULT / DETAIL VIEW */}
        {(view === AppView.RESULT || view === AppView.SAVED_DETAIL) && currentSermon && (
          <SermonCard 
            sermon={currentSermon} 
            onBack={handleBack} 
          />
        )}

        {/* HISTORY VIEW */}
        {view === AppView.HISTORY && (
          <div className="animate-fade-in pb-20">
             <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setView(AppView.HOME)}
                  className="mr-2 text-gray-500 hover:text-gray-800"
                >
                  <ChevronRight className="rotate-180" />
                </button>
                <h2 className="text-2xl font-serif font-bold text-gray-800 flex-1">Arquivo de Sermões</h2>
             </div>
             
             {history.length === 0 ? (
               <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                 <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                    <Search size={32} className="text-gray-300" />
                 </div>
                 <p className="text-gray-500 font-medium">Nenhuma pregação salva ainda.</p>
                 <button 
                  onClick={() => checkAccessAndSetView(AppView.GENERATOR)}
                  className="mt-4 text-bible-600 font-bold hover:underline"
                 >
                   Criar a primeira
                 </button>
               </div>
             ) : (
               <div className="space-y-4">
                 {history.map(sermon => (
                   <div 
                      key={sermon.id}
                      onClick={() => handleHistorySelect(sermon)}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-bible-200 transition-all cursor-pointer group"
                   >
                     <div className="flex justify-between items-start mb-3">
                       <span className="text-[10px] font-bold text-bible-700 bg-bible-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-bible-100">
                         {sermon.theme}
                       </span>
                       <span className="text-xs text-gray-400 font-medium">
                         {new Date(sermon.createdAt).toLocaleDateString()}
                       </span>
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-bible-700 transition-colors">
                       {sermon.title}
                     </h3>
                     <p className="text-sm text-gray-600 line-clamp-2 font-serif mb-4 leading-relaxed">
                       {sermon.introduction}
                     </p>
                     <div className="pt-4 border-t border-gray-50 flex items-center text-xs text-gray-500 font-medium">
                        <BookOpen size={14} className="mr-2 text-gold-500" />
                        Base: <span className="text-gray-700 ml-1">{sermon.keyVerseReference}</span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

      </main>
      
      {/* Footer Navigation (Hide when on Admin or Print) */}
      <div className="print:hidden">
        <Footer />
        <Navigation currentView={view} setView={(v) => {
            // Reset specific states when navigating via bottom bar
            if (v === AppView.GENERATOR) {
                setSelectedTheme('');
                setSelectedReference('');
            }
            checkAccessAndSetView(v);
        }} />
      </div>
    </div>
  );
}

export default App;