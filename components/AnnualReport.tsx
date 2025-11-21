
import React from 'react';
import { PlayerState, RegionName, InvestmentType, HistoryEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend, Rectangle, LineChart, Line } from 'recharts';
import { Trophy, TrendingUp, Activity, Users, Signal, DollarSign, X, Map } from 'lucide-react';

interface AnnualReportProps {
  player: PlayerState;
  competitors: PlayerState[];
  previousPlayerState: PlayerState | null;
  year: number;
  analysis: string | null;
  history: HistoryEntry[];
  onClose: () => void;
}

const abbreviateRegion = (name: string) => {
  return name
    .replace('North', 'N.')
    .replace('South', 'S.')
    .replace('West', 'W.')
    .replace('Central', 'C.')
    .replace('East', 'E.')
    .replace('Sumatera', 'Sum')
    .replace('Kalimantan', 'Kal')
    .replace('Sulawesi & Papua', 'Sul-Pap')
    .replace('Bali & Nusa Tenggara', 'Bali-NT')
    .replace('Jakarta', 'JKT');
}

// Helper to derive a CX score per region since it's not explicitly stored
const calculateRegionCX = (networkQuality: number, investments: InvestmentType[]) => {
    const cxInvestments = investments.filter(t => t === InvestmentType.CUSTOMER_EXPERIENCE).length;
    const opsInvestments = investments.filter(t => t === InvestmentType.NETWORK_OPERATIONS).length;
    // Base score derived from network quality (60% weight) + investment boost
    let score = (networkQuality * 0.6) + (cxInvestments * 8) + (opsInvestments * 3);
    return Math.min(100, Math.max(10, score)); // Clamp between 10 and 100
};

const AnnualReport: React.FC<AnnualReportProps> = ({ player, competitors, previousPlayerState, year, analysis, history, onClose }) => {
  
  // --- Global KPI Calculations ---
  const prevFinancials = previousPlayerState?.financials || {
      revenue: player.financials.revenue * 0.9,
      profit: player.financials.profit * 0.9,
      subscribers: player.financials.subscribers * 0.95,
  };
  const prevNps = previousPlayerState?.nps || player.nps - 2;

  const revenueGrowth = ((player.financials.revenue - prevFinancials.revenue) / prevFinancials.revenue) * 100;
  const subGrowth = ((player.financials.subscribers - prevFinancials.subscribers) / prevFinancials.subscribers) * 100;
  const npsDiff = player.nps - prevNps;

  // --- Regional Data Preparation ---
  const regionalData = Object.values(player.regions).map(region => {
    const compAvgShare = competitors.reduce((sum, c) => sum + c.regions[region.name].marketShare, 0) / competitors.length;
    const compAvgQuality = competitors.reduce((sum, c) => sum + c.regions[region.name].networkCoverage, 0) / competitors.length;
    
    // Calculate Competitor Avg CX
    const compAvgCX = competitors.reduce((sum, c) => {
        return sum + calculateRegionCX(c.regions[region.name].networkCoverage, c.regions[region.name].investments);
    }, 0) / competitors.length;

    return {
        name: abbreviateRegion(region.name),
        fullName: region.name,
        myShare: region.marketShare,
        compShare: compAvgShare,
        myQuality: region.networkCoverage,
        compQuality: compAvgQuality,
        myCX: calculateRegionCX(region.networkCoverage, region.investments),
        compCX: compAvgCX
    };
  });

  // Sort leaderboard
  const leaderboard = [player, ...competitors].sort((a, b) => b.financials.profit - a.financials.profit);

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-[95vw] h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors z-50"
        >
            <X size={24} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-end shrink-0">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    Annual Report <span className="text-blue-500 font-mono">{year}</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">Fiscal Year Performance & Competitive Analysis</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Revenue</div>
                    <div className="text-xl font-bold text-white">IDR {player.financials.revenue.toLocaleString()} B</div>
                </div>
                <div className="text-right px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Net Profit</div>
                    <div className={`text-2xl font-mono font-bold ${player.financials.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {player.financials.profit > 0 ? '+' : ''}{player.financials.profit.toLocaleString()} B
                    </div>
                </div>
            </div>
        </div>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Top Row: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><DollarSign size={20} /></div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${revenueGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% YoY
                        </span>
                    </div>
                    <div className="text-slate-400 text-xs uppercase font-bold">Revenue</div>
                    <div className="text-2xl font-bold text-white">{player.financials.revenue.toLocaleString()} B</div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Users size={20} /></div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${subGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {subGrowth >= 0 ? '+' : ''}{subGrowth.toFixed(1)}% YoY
                        </span>
                    </div>
                    <div className="text-slate-400 text-xs uppercase font-bold">Subscribers</div>
                    <div className="text-2xl font-bold text-white">{player.financials.subscribers.toFixed(1)} M</div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Signal size={20} /></div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                           Target: 90.0
                        </span>
                    </div>
                    <div className="text-slate-400 text-xs uppercase font-bold">Avg Network Quality</div>
                    <div className="text-2xl font-bold text-white">{player.networkQuality.toFixed(1)} / 100</div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Activity size={20} /></div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${npsDiff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                             {npsDiff >= 0 ? '+' : ''}{npsDiff.toFixed(1)} pts
                        </span>
                    </div>
                    <div className="text-slate-400 text-xs uppercase font-bold">Net Promoter Score</div>
                    <div className="text-2xl font-bold text-white">{player.nps.toFixed(1)}</div>
                </div>
            </div>

            {/* Middle Row: Regional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[350px]">
                {/* Chart 1: Market Share */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2">
                            <Map size={16} className="text-blue-400" /> Regional Market Share
                        </h3>
                        <div className="flex items-center gap-3 text-[10px]">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-sm"></div> You</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-500 rounded-sm"></div> Avg Comp</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionalData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', fontSize: '12px' }}
                                />
                                <Bar dataKey="myShare" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Your Share (%)" />
                                <Bar dataKey="compShare" fill="#64748b" radius={[2, 2, 0, 0]} name="Comp Avg (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Network Quality */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2">
                            <Signal size={16} className="text-cyan-400" /> Network Quality
                        </h3>
                         <div className="flex items-center gap-3 text-[10px]">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-sm"></div> You</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-500 rounded-sm"></div> Avg Comp</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionalData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', fontSize: '12px' }}
                                />
                                <Bar dataKey="myQuality" fill="#06b6d4" radius={[2, 2, 0, 0]} name="Your Quality" />
                                <Bar dataKey="compQuality" fill="#64748b" radius={[2, 2, 0, 0]} name="Comp Avg" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 3: CX Score */}
                 <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2">
                            <Activity size={16} className="text-green-400" /> Customer Experience (Est.)
                        </h3>
                         <div className="flex items-center gap-3 text-[10px]">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> You</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-500 rounded-sm"></div> Avg Comp</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionalData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', fontSize: '12px' }}
                                />
                                <Bar dataKey="myCX" fill="#22c55e" radius={[2, 2, 0, 0]} name="Your CX Score" />
                                <Bar dataKey="compCX" fill="#64748b" radius={[2, 2, 0, 0]} name="Comp Avg" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* NEW: Multi-Year Performance Trends */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-400" /> Multi-Year Performance Trends
                    </h3>
                    <div className="flex items-center gap-3 text-[10px]">
                        <div className="flex items-center gap-1"><div className="w-3 h-1 bg-blue-500"></div> You</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-1 bg-slate-500 border-b border-dashed border-slate-500"></div> Avg Comp</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Chart 1: Revenue */}
                    <div className="h-48 bg-slate-900/30 rounded-lg p-2 border border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 text-center">Revenue</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} interval="preserveStartEnd" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="playerRevenue" stroke="#3b82f6" strokeWidth={2} dot={{r:2}} name="You" />
                                <Line type="monotone" dataKey="competitorAvgRevenue" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Comp" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Chart 2: Subscribers */}
                    <div className="h-48 bg-slate-900/30 rounded-lg p-2 border border-slate-800">
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 text-center">Total Subscribers</p>
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} interval="preserveStartEnd" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="playerSubscribers" stroke="#a855f7" strokeWidth={2} dot={{r:2}} name="You" />
                                <Line type="monotone" dataKey="competitorAvgSubscribers" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Comp" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Chart 3: Quality */}
                    <div className="h-48 bg-slate-900/30 rounded-lg p-2 border border-slate-800">
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 text-center">Avg Network Quality</p>
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} interval="preserveStartEnd" />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="playerNetworkQuality" stroke="#06b6d4" strokeWidth={2} dot={{r:2}} name="You" />
                                <Line type="monotone" dataKey="competitorAvgNetworkQuality" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Comp" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                     {/* Chart 4: NPS */}
                     <div className="h-48 bg-slate-900/30 rounded-lg p-2 border border-slate-800">
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 text-center">Net Promoter Score</p>
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} interval="preserveStartEnd" />
                                <ReferenceLine y={0} stroke="#475569" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="playerNPS" stroke="#22c55e" strokeWidth={2} dot={{r:2}} name="You" />
                                <Line type="monotone" dataKey="competitorAvgNPS" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Comp" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Leaderboard & Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Leaderboard */}
                <div className="lg:col-span-5 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                     <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={18} /> Leaderboard
                        </h3>
                    </div>
                    <div className="p-0 flex-1">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-700/50 bg-slate-900/30">
                                    <th className="py-2 pl-4 font-medium">Rank</th>
                                    <th className="py-2 font-medium">Operator</th>
                                    <th className="py-2 text-right pr-4 font-medium">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {leaderboard.map((p, index) => {
                                    const isPlayer = p.name === player.name;
                                    return (
                                        <tr key={p.name} className={`${isPlayer ? 'bg-blue-500/10' : ''}`}>
                                            <td className="py-3 pl-4 font-mono text-slate-400">#{index + 1}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                                                    <span className={`font-bold ${isPlayer ? 'text-white' : 'text-slate-300'}`}>{p.name}</span>
                                                </div>
                                            </td>
                                            <td className={`py-3 text-right pr-4 font-mono font-bold ${p.financials.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {p.financials.profit.toLocaleString()} B
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analysis */}
                <div className="lg:col-span-7 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                        <span>🤖</span> Strategic Analysis
                    </h3>
                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 italic leading-relaxed text-lg">
                            "{analysis || "Processing market data..."}"
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end shrink-0">
            <button 
                onClick={onClose}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
                Start Next Fiscal Year <TrendingUp size={18} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default AnnualReport;
