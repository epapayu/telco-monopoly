
import React, { useState } from 'react';
import { InvestmentType, RegionName, Investment } from '../types';
import { INVESTMENTS } from '../constants';
import { ShoppingCart, Zap, Radio, Smile, Cog, Megaphone, Briefcase, Minus, ChevronDown, ChevronUp } from 'lucide-react';

interface ControlPanelProps {
  selectedRegion: RegionName | null;
  budget: number;
  onInvest: (type: InvestmentType) => void;
  onRemoveInvest: (type: InvestmentType) => void;
  onEndTurn: () => void;
  pendingInvestments: { region: RegionName, type: InvestmentType }[];
}

const ICONS: Record<InvestmentType, React.ReactNode> = {
  [InvestmentType.NETWORK_EXPANSION_4G]: <Radio size={18} />,
  [InvestmentType.NETWORK_OPTIMIZATION_5G]: <Zap size={18} />,
  [InvestmentType.CUSTOMER_EXPERIENCE]: <Smile size={18} />,
  [InvestmentType.NETWORK_OPERATIONS]: <Cog size={18} />,
  [InvestmentType.MARKETING_CAMPAIGN]: <Megaphone size={18} />,
  [InvestmentType.B2B_INITIATIVE]: <Briefcase size={18} />,
};

const ControlPanel: React.FC<ControlPanelProps> = ({ selectedRegion, budget, onInvest, onRemoveInvest, onEndTurn, pendingInvestments }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Calculate total cost of pending investments for this turn
  const currentSpend = pendingInvestments.reduce((total, inv) => total + INVESTMENTS[inv.type].cost, 0);
  const remainingBudget = budget - currentSpend;

  const toggleExpand = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    setExpandedItems(prev => ({
        ...prev,
        [type]: !prev[type]
    }));
  };

  return (
    <div className="h-full bg-slate-800 rounded-xl border border-slate-700 flex flex-col p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Strategic Command</h2>
        <p className="text-sm text-slate-400">Select a region on the map to deploy resources.</p>
      </div>

      {selectedRegion ? (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-blue-400">{selectedRegion}</h3>
             <span className="text-xs px-2 py-1 bg-blue-900/30 rounded text-blue-300 border border-blue-800">Active Zone</span>
          </div>
          
          <div className="space-y-3">
            {Object.values(INVESTMENTS).map((inv: Investment) => {
              const canAfford = remainingBudget >= inv.cost;
              const count = pendingInvestments.filter(p => p.region === selectedRegion && p.type === inv.type).length;
              const isSelected = count > 0;
              const isExpanded = !!expandedItems[inv.type];

              return (
                <div
                  key={inv.type}
                  role="button"
                  onClick={() => canAfford ? onInvest(inv.type) : null}
                  className={`w-full text-left rounded-lg border transition-all duration-200 relative group select-none ${
                    canAfford 
                      ? 'hover:border-blue-500 hover:bg-slate-700/50 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  } ${isSelected ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800/50 border-slate-700'}`}
                >
                  <div className="p-3 flex justify-between items-start relative z-10">
                    <div className="flex items-start gap-3 flex-1 overflow-hidden">
                        <div className={`p-2 rounded-lg ${canAfford ? 'bg-slate-800 text-blue-400' : 'bg-slate-900 text-slate-600'} relative flex-shrink-0 mt-0.5`}>
                            {ICONS[inv.type]}
                            {count > 0 && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm border border-slate-900">
                                    {count}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-sm text-slate-200 truncate">{inv.type}</div>
                                <button 
                                    onClick={(e) => toggleExpand(e, inv.type)}
                                    className="p-0.5 text-slate-500 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                                >
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>
                            <div 
                                className={`text-xs text-slate-400 mt-1 hover:text-slate-200 transition-colors cursor-pointer ${isExpanded ? 'whitespace-normal' : 'truncate'}`}
                                onClick={(e) => toggleExpand(e, inv.type)}
                                title={isExpanded ? "Click to collapse" : "Click to read full description"}
                            >
                                {inv.description}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2 flex-shrink-0">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                            IDR {inv.cost.toLocaleString()} B
                        </div>
                        {count > 0 && (
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveInvest(inv.type);
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded text-xs transition-colors border border-red-500/20"
                             >
                                <Minus size={12} /> Remove
                             </button>
                        )}
                    </div>
                  </div>
                  
                  {/* Stats details - visible when expanded */}
                  <div className={`px-3 overflow-hidden transition-all duration-300 ease-in-out text-xs text-slate-300 grid grid-cols-2 gap-2 relative z-0 ${isExpanded ? 'max-h-48 pb-3 pt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                     {inv.returns.networkQuality && <span>+Net Quality: <span className="text-green-400">+{inv.returns.networkQuality}</span></span>}
                     {inv.returns.subscriberGrowth && <span>+Subscribers: <span className="text-green-400">+{inv.returns.subscriberGrowth}%</span></span>}
                     {inv.returns.revenueGrowth && <span>+Revenue: <span className="text-green-400">+{inv.returns.revenueGrowth}%</span></span>}
                     {inv.returns.nps && <span>+NPS: <span className="text-green-400">+{inv.returns.nps}</span></span>}
                     {inv.returns.churnReduction && <span>Churn: <span className="text-green-400">-{inv.returns.churnReduction}%</span></span>}
                     {inv.returns.profit && <span>Efficiency: <span className="text-green-400">+{inv.returns.profit}B</span></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/50">
          <ShoppingCart className="mb-3 opacity-50" size={48} />
          <p>No Region Selected</p>
          <p className="text-xs mt-2">Click on the map to view options</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex justify-between items-center mb-4 text-sm">
            <span className="text-slate-400">Projected Spend:</span>
            <span className="font-mono text-red-400 font-bold">- {currentSpend.toLocaleString()} B</span>
        </div>
        <div className="flex justify-between items-center mb-6 text-sm">
            <span className="text-slate-400">Remaining:</span>
            <span className={`font-mono font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {remainingBudget.toLocaleString()} B
            </span>
        </div>
        <button
          onClick={onEndTurn}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Zap fill="currentColor" size={20} />
          End Fiscal Year
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
