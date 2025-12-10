import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRightCircle, LogOut, LayoutDashboard, Star, 
  List, DollarSign, Users, TrendingUp, MessageCircle, Send, 
  Copy, UserCheck, Smartphone, Search, Clock, RefreshCw, AlertCircle,
  Settings, Palette, Type, Mail, Inbox, Check, Trash2
} from 'lucide-react';
import { 
  getAdminStats, 
  getSalesHistory, 
  generateClientKey, 
  recordSale, 
  activatePremium,
  revokePremium,
  getSubscriptionState,
  SaleRecord,
  getAppTheme,
  saveAppTheme,
  getAnalyticsData,
  getFeedbackMessages,
  markFeedbackRead,
  deleteFeedbackMessage
} from '../services/subscriptionService';
import { AppTheme, DailyStats, UserFeedback } from '../types';

interface AdminDashboardProps {
  onExit: () => void;
  onGoToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit, onGoToApp }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'history' | 'settings' | 'inbox'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [isSelfPremium, setIsSelfPremium] = useState(false);
  const [analytics, setAnalytics] = useState<DailyStats[]>([]);
  const [messages, setMessages] = useState<UserFeedback[]>([]);
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(getAppTheme());

  // Generator State
  const [clientPhone, setClientPhone] = useState('');
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [adminDuration, setAdminDuration] = useState(30);
  const [generatedKey, setGeneratedKey] = useState('');

  // Auto-refresh interval
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => setNow(Date.now()), 60000); 
    return () => clearInterval(interval);
  }, [activeTab]);

  const refreshData = () => {
    setStats(getAdminStats());
    setHistory(getSalesHistory());
    setIsSelfPremium(getSubscriptionState().isPremium);
    setAnalytics(getAnalyticsData());
    setMessages(getFeedbackMessages());
    setCurrentTheme(getAppTheme());
  };

  const handleGenerateKey = () => {
      const key = generateClientKey(clientPhone, targetDeviceId, adminDuration);
      setGeneratedKey(key);
      recordSale(clientPhone, targetDeviceId, adminDuration, key);
      refreshData();
  };

  const handleAdminSelfActivation = () => {
      activatePremium('PAPTECH2025', '924052039');
      setIsSelfPremium(true);
      alert("Acesso Vitalício Ativado neste dispositivo!");
      refreshData();
  };

  const handleRevokeAccess = () => {
      revokePremium();
      setIsSelfPremium(false);
      alert("Acesso revogado.");
      refreshData();
  };

  const handleSaveTheme = () => {
      saveAppTheme(currentTheme);
      alert("Tema atualizado! As mudanças aparecerão ao reiniciar o App.");
  };

  const handleMarkRead = (id: string) => {
      markFeedbackRead(id);
      refreshData();
  };

  const handleDeleteMessage = (id: string) => {
      if(window.confirm("Tem certeza que deseja apagar esta mensagem permanentemente?")) {
          deleteFeedbackMessage(id);
          refreshData();
      }
  };

  // Helper para calcular tempo restante
  const getExpirationStatus = (sale: SaleRecord) => {
    const days = sale.durationDays || (sale.planName.includes('Semanal') ? 7 : 30);
    const expiryDate = sale.date + (days * 24 * 60 * 60 * 1000);
    const diff = expiryDate - now;

    if (diff <= 0) {
        return { label: 'Expirado', color: 'text-red-500', bg: 'bg-red-500/10', active: false };
    }

    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let label = `${daysLeft}d ${hoursLeft}h`;
    let color = 'text-emerald-400';
    let bg = 'bg-emerald-500/10';

    if (daysLeft <= 3) {
        color = 'text-orange-400';
        bg = 'bg-orange-500/10';
        label += ' (Acabando)';
    }

    return { label, color, bg, active: true };
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden fixed inset-0 z-50">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="flex items-center space-x-3">
            <div className="bg-gold-500 p-2 rounded-lg text-black">
                <ShieldCheck size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold leading-none">Admin Console</h2>
                <p className="text-gray-400 text-[10px] font-mono mt-1">PAPTECH BACKEND v5.0</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onGoToApp}
                className="flex items-center text-xs font-bold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors border border-emerald-500/30"
            >
                Abrir App <ArrowRightCircle size={14} className="ml-2" />
            </button>
            <button 
                onClick={onExit}
                className="p-2 rounded-lg bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-400 transition-colors"
                title="Sair"
            >
                <LogOut size={20} />
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-4 hidden md:block">
            <div className="space-y-2">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
                    { id: 'generator', icon: Star, label: 'Gerar Acessos' },
                    { id: 'history', icon: List, label: 'Histórico de Vendas' },
                    { id: 'inbox', icon: Inbox, label: 'Mensagens / Feedback' },
                    { id: 'settings', icon: Settings, label: 'Personalização' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' 
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <tab.icon size={18} className="mr-3" />
                        {tab.label}
                        {tab.id === 'inbox' && messages.some(m => !m.read) && (
                            <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-500 font-bold uppercase mb-4 px-2">Gestão deste Aparelho</p>
                {!isSelfPremium ? (
                    <button 
                        onClick={handleAdminSelfActivation}
                        className="flex items-center w-full px-4 py-3 rounded-xl bg-gray-700/50 hover:bg-emerald-900/30 text-emerald-400 text-xs font-bold border border-dashed border-gray-600 hover:border-emerald-500 transition-all"
                    >
                        <UserCheck size={16} className="mr-3" /> Liberar Acesso Local
                    </button>
                ) : (
                    <div className="px-4 py-3 bg-emerald-900/20 rounded-xl border border-emerald-500/30 text-center">
                        <p className="text-emerald-400 text-xs font-bold mb-2">Acesso Total Ativo</p>
                        <button onClick={handleRevokeAccess} className="text-[10px] text-red-400 hover:underline">Revogar</button>
                    </div>
                )}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-900 p-6">
            
            {/* Mobile Nav Tabs */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
                    { id: 'generator', icon: Star, label: 'Gerar' },
                    { id: 'history', icon: List, label: 'Vendas' },
                    { id: 'inbox', icon: Inbox, label: 'Msgs' },
                    { id: 'settings', icon: Settings, label: 'Config' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-gold-500 text-black' 
                            : 'bg-gray-800 text-gray-400'
                        }`}
                    >
                        <tab.icon size={14} className="mr-2" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content: Dashboard */}
            {activeTab === 'dashboard' && stats && (
                <div className="space-y-6 animate-fade-in">
                    <h1 className="text-2xl font-bold text-white mb-6">Resumo Financeiro & Analítico</h1>
                    
                    {/* Financial Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={80} /></div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Receita Total</p>
                            <h3 className="text-3xl font-mono font-bold text-emerald-400">
                                {stats.totalRevenue.toLocaleString('pt-AO')} Kz
                            </h3>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Users size={80} /></div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Vendas Totais</p>
                            <h3 className="text-3xl font-mono font-bold text-white">
                                {stats.totalKeys}
                            </h3>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={80} /></div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Sermões Gerados (Hoje)</p>
                            <h3 className="text-3xl font-bold text-gold-400">
                                {analytics.find(d => d.date === new Date().toISOString().split('T')[0])?.sermonsGenerated || 0}
                            </h3>
                        </div>
                    </div>

                    {/* Analytics Table */}
                    <div className="mt-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                            <TrendingUp size={18} className="mr-2 text-blue-400" /> Atividade Diária
                        </h2>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-900/50 uppercase text-xs font-bold text-gray-500">
                                    <tr>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Visitantes Únicos</th>
                                        <th className="p-4">Sermões Criados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {analytics.slice(0, 10).map((day, idx) => (
                                        <tr key={idx} className="hover:bg-gray-750">
                                            <td className="p-4 font-mono text-white">{day.date}</td>
                                            <td className="p-4">
                                                <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs font-bold">{day.visits}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-xs font-bold">{day.sermonsGenerated}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {analytics.length === 0 && (
                                        <tr><td colSpan={3} className="p-4 text-center">Sem dados recentes.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick View Active Users */}
                    <div className="mt-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Clock size={18} className="mr-2 text-emerald-400" /> Assinaturas Ativas Agora
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.filter(sale => getExpirationStatus(sale).active).slice(0, 6).map(sale => {
                                const status = getExpirationStatus(sale);
                                return (
                                    <div key={sale.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white font-mono">{sale.phoneNumber}</p>
                                            <p className="text-xs text-gray-400">ID: {sale.deviceId || '?'}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${status.color} ${status.bg}`}>
                                            {status.label}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Content: Generator */}
            {activeTab === 'generator' && (
                <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                        {/* ... (Existing Generator Code) ... */}
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-gold-500/10 rounded-xl mr-4">
                                <Star className="text-gold-500" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Gerar Nova Chave</h2>
                                <p className="text-gray-400 text-sm">Crie uma chave de acesso vinculada a um dispositivo único.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <div>
                                <label className="block text-xs font-bold mb-2 text-gray-400 uppercase">Telefone do Cliente</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3.5 text-gray-500" size={16} />
                                    <input 
                                        type="text" 
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        placeholder="923 000 000"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-600 text-white focus:border-gold-500 outline-none font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 text-gold-500 uppercase">ID do App (Device ID)</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3.5 text-gold-500" size={16} />
                                    <input 
                                        type="text" 
                                        value={targetDeviceId}
                                        onChange={(e) => setTargetDeviceId(e.target.value.toUpperCase())}
                                        placeholder="Ex: X7K9P2"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gold-600 text-white focus:border-gold-500 outline-none font-mono uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold mb-2 text-gray-400 uppercase">Plano Selecionado</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setAdminDuration(7)}
                                    className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${adminDuration === 7 ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-gray-700 bg-gray-900 text-gray-500 hover:border-gray-600'}`}
                                >
                                    Semanal (7 Dias)
                                </button>
                                <button 
                                    onClick={() => setAdminDuration(30)}
                                    className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${adminDuration === 30 ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-gray-700 bg-gray-900 text-gray-500 hover:border-gray-600'}`}
                                >
                                    Mensal (30 Dias)
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerateKey}
                            disabled={!clientPhone || !targetDeviceId}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex justify-center items-center"
                        >
                            <ShieldCheck size={20} className="mr-2" /> Gerar Chave Segura
                        </button>
                    </div>
                    {generatedKey && (
                        <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-2xl animate-slide-up text-center border-4 border-emerald-500 relative">
                             {/* ... (Existing Success Key Code) ... */}
                             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                Sucesso
                            </div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-2">Chave de Ativação</p>
                            <div className="text-4xl font-mono font-black tracking-widest mb-6 text-emerald-700 break-all select-all">
                                {generatedKey}
                            </div>
                            <button 
                                onClick={() => {
                                    const msg = `Sua chave para o plano ${adminDuration} dias é: *${generatedKey}*\n\nEsta chave só funciona no seu aparelho (ID: ${targetDeviceId}).`;
                                    navigator.clipboard.writeText(msg);
                                    alert("Mensagem copiada!");
                                }}
                                className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center transition-colors"
                            >
                                <Copy size={18} className="mr-2" /> Copiar Mensagem para Cliente
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Content: Inbox (Feedback) */}
            {activeTab === 'inbox' && (
                <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">Mensagens de Usuários</h2>
                    
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center p-12 bg-gray-800 rounded-2xl border border-gray-700 text-gray-500">
                                <Inbox size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Nenhuma mensagem recebida ainda.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`p-6 rounded-2xl border transition-all ${msg.read ? 'bg-gray-800 border-gray-700 opacity-70' : 'bg-gray-800 border-gold-500 shadow-lg shadow-gold-500/10'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                msg.type === 'suggestion' ? 'bg-blue-900/50 text-blue-300' :
                                                msg.type === 'complaint' ? 'bg-red-900/50 text-red-300' : 'bg-gray-700 text-gray-300'
                                            }`}>
                                                {msg.type === 'suggestion' ? 'Sugestão' : msg.type === 'complaint' ? 'Reclamação' : 'Outro'}
                                            </span>
                                            <span className="text-xs text-gray-500">{new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {!msg.read && (
                                                <button onClick={() => handleMarkRead(msg.id)} className="text-xs flex items-center text-emerald-400 hover:text-emerald-300">
                                                    <Check size={14} className="mr-1" /> Marcar lida
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteMessage(msg.id)} className="text-xs flex items-center text-red-400 hover:text-red-300" title="Excluir">
                                                <Trash2 size={14} className="mr-1" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 text-sm leading-relaxed mb-4">{msg.message}</p>
                                    {msg.contact && (
                                        <div className="flex items-center text-xs text-gray-500 border-t border-gray-700 pt-3">
                                            <Smartphone size={14} className="mr-2" /> Contato: {msg.contact}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Content: Settings */}
            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-6">Personalização do App</h2>
                    
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-8">
                        
                        {/* Cor Principal */}
                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-400 uppercase mb-4">
                                <Palette size={16} className="mr-2" /> Cor Principal (Tema)
                            </label>
                            <div className="grid grid-cols-4 gap-4">
                                {['#1e3a8a', '#be185d', '#059669', '#7c3aed'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setCurrentTheme(prev => ({ ...prev, primaryColor: color }))}
                                        className={`h-12 rounded-xl transition-all ${
                                            currentTheme.primaryColor === color 
                                            ? 'ring-4 ring-white ring-opacity-50 scale-105' 
                                            : 'hover:scale-105 opacity-80'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Fonte */}
                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-400 uppercase mb-4">
                                <Type size={16} className="mr-2" /> Estilo de Fonte
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {['Inter', 'Merriweather', 'Roboto'].map((font) => (
                                    <button
                                        key={font}
                                        onClick={() => setCurrentTheme(prev => ({ ...prev, fontFamily: font as any }))}
                                        className={`p-4 rounded-xl border text-sm font-bold transition-all ${
                                            currentTheme.fontFamily === font 
                                            ? 'bg-gold-500 text-black border-gold-500' 
                                            : 'bg-gray-900 text-gray-400 border-gray-700'
                                        }`}
                                        style={{ fontFamily: font }}
                                    >
                                        Aa - {font}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tamanho da Fonte */}
                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-400 uppercase mb-4">
                                <Settings size={16} className="mr-2" /> Tamanho do Texto
                            </label>
                            <div className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
                                <span className="text-xs text-gray-500">Pequeno</span>
                                <input 
                                    type="range" 
                                    min="0.9" 
                                    max="1.2" 
                                    step="0.05"
                                    value={currentTheme.fontSizeScale}
                                    onChange={(e) => setCurrentTheme(prev => ({ ...prev, fontSizeScale: parseFloat(e.target.value) }))}
                                    className="w-full mx-4 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                />
                                <span className="text-lg font-bold text-white">Grande</span>
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-2">Escala Atual: {Math.round(currentTheme.fontSizeScale * 100)}%</p>
                        </div>

                        <button 
                            onClick={handleSaveTheme}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                        >
                            Salvar Alterações
                        </button>

                    </div>
                </div>
            )}

            {/* Content: History */}
            {activeTab === 'history' && (
                <div className="space-y-4 animate-fade-in">
                    {/* ... (Existing History Table) ... */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Histórico de Transações</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-600" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-900/50 uppercase text-xs font-bold text-gray-500">
                                    <tr>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">ID Dispositivo</th>
                                        <th className="p-4">Plano</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Chave</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {history.map((sale) => {
                                        const status = getExpirationStatus(sale);
                                        return (
                                        <tr key={sale.id} className="hover:bg-gray-750 transition-colors">
                                            <td className="p-4 whitespace-nowrap text-xs">
                                                {new Date(sale.date).toLocaleDateString()}
                                                <div className="text-[10px] opacity-50">{new Date(sale.date).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-white flex items-center gap-2">
                                                    {sale.phoneNumber}
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-gold-500">{sale.deviceId || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    sale.planName.includes('Mensal') ? 'bg-purple-900/50 text-purple-200 border border-purple-500/30' : 
                                                    'bg-gray-700 text-gray-300'
                                                }`}>
                                                    {sale.planName}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center w-fit px-2 py-1 rounded text-[10px] font-bold uppercase ${status.color} ${status.bg}`}>
                                                    <Clock size={10} className="mr-1.5" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-xs truncate max-w-[100px] opacity-70" title={sale.key}>{sale.key}</td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};