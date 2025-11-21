import React from 'react';
import { PlayerState } from '../types';
import { TrendingUp, Users, Signal, Activity, DollarSign } from 'lucide-react';

interface DashboardProps {
  player: PlayerState;
  year: number;
}

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; subtext?: string; color?: string }> = ({ label, value, icon, subtext, color = "text-blue-400" }) => (
  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between shadow-lg">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</span>
      <div className={`p-2 rounded-full bg-slate-900 ${color}`}>{icon}</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ player, year }) => {
  const { financials, budget, nps, networkQuality } = player;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Telco Tycoon <span className="text-blue-500">Indonesia</span></h1>
          <p className="text-slate-400 text-sm">Year: <span className="text-white font-mono font-bold">{year}</span> | Turn Cycle: 12 Months</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }}></div>
           <span className="font-bold text-lg">{player.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
            label="Budget (Cash)" 
            value={`IDR ${budget.toLocaleString()} B`} 
            icon={<DollarSign size={18} />} 
            color="text-emerald-400"
            subtext="Available for Investment"
        />
        <StatCard 
            label="Revenue (YTD)" 
            value={`IDR ${financials.revenue.toLocaleString()} B`} 
            icon={<TrendingUp size={18} />} 
            color="text-blue-400"
            subtext={`Profit: ${financials.profit.toLocaleString()} B`}
        />
        <StatCard 
            label="Subscribers" 
            value={`${financials.subscribers.toFixed(1)} M`} 
            icon={<Users size={18} />} 
            color="text-purple-400"
            subtext={`Churn: ${financials.churnRate}%`}
        />
        <StatCard 
            label="Network Quality" 
            value={`${networkQuality.toFixed(1)} / 100`} 
            icon={<Signal size={18} />} 
            color="text-cyan-400"
        />
        <StatCard 
            label="NPS" 
            value={`${nps.toFixed(1)}`} 
            icon={<Activity size={18} />} 
            color={nps > 40 ? "text-green-400" : "text-yellow-400"}
        />
      </div>
    </div>
  );
};

export default Dashboard;
