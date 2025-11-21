
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, TelcoName, RegionName, InvestmentType, PlayerState, RegionState, HistoryEntry } from './types';
import { INVESTMENTS, INITIAL_PLAYER_STATE, INITIAL_REGIONS } from './constants';
import { generateMarketEvent, generateAnnualReportAnalysis } from './services/geminiService';
import { simulateCompetitorTurn } from './services/aiOpponentService';
import MapBoard from './components/MapBoard';
import Dashboard from './components/Dashboard';
import ControlPanel from './components/ControlPanel';
import AnnualReport from './components/AnnualReport';
import { AlertCircle, PlayCircle, ChevronUp } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    year: 2024,
    turnPhase: 'PLANNING',
    player: { ...INITIAL_PLAYER_STATE[TelcoName.TELKOMSEL], regions: INITIAL_REGIONS }, // Placeholder init
    competitors: [], 
    turnLog: ["Game initialized. Welcome to the Indonesian Telco Market."],
    lastYearAnalysis: null,
    marketEvent: null,
    history: []
  });
  
  const [previousPlayerState, setPreviousPlayerState] = useState<PlayerState | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionName | null>(null);
  const [pendingInvestments, setPendingInvestments] = useState<{ region: RegionName, type: InvestmentType }[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isEventExpanded, setIsEventExpanded] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (gameStarted && gameState.turnPhase === 'PLANNING') {
      // Trigger start of turn event
      const fetchEvent = async () => {
        const event = await generateMarketEvent(gameState.year);
        setGameState(prev => ({ ...prev, marketEvent: event }));
      };
      fetchEvent();
    }
  }, [gameState.year, gameStarted]);

  // --- Handlers ---
  const handleStartGame = (selectedTelco: TelcoName) => {
    // Initialize Player
    const playerState: PlayerState = {
      ...INITIAL_PLAYER_STATE[selectedTelco],
      regions: JSON.parse(JSON.stringify(INITIAL_REGIONS)) // Deep copy regions
    };

    // Initialize Competitors
    const otherTelcos = Object.values(TelcoName).filter(name => name !== selectedTelco);
    const competitors = otherTelcos.map(name => ({
      ...INITIAL_PLAYER_STATE[name],
      regions: JSON.parse(JSON.stringify(INITIAL_REGIONS)) // Competitors need their own region state
    }));

    // Initialize History with previous year data (simulated start point)
    const initialCompAvgRev = competitors.reduce((acc, c) => acc + c.financials.revenue, 0) / competitors.length;
    const initialCompAvgSubs = competitors.reduce((acc, c) => acc + c.financials.subscribers, 0) / competitors.length;
    const initialCompAvgQual = competitors.reduce((acc, c) => acc + c.networkQuality, 0) / competitors.length;
    const initialCompAvgNps = competitors.reduce((acc, c) => acc + c.nps, 0) / competitors.length;

    const initialHistory: HistoryEntry = {
        year: 2023,
        playerRevenue: playerState.financials.revenue,
        playerSubscribers: playerState.financials.subscribers,
        playerNetworkQuality: playerState.networkQuality,
        playerNPS: playerState.nps,
        competitorAvgRevenue: initialCompAvgRev,
        competitorAvgSubscribers: initialCompAvgSubs,
        competitorAvgNetworkQuality: initialCompAvgQual,
        competitorAvgNPS: initialCompAvgNps
    };

    setGameState({
      year: 2024,
      turnPhase: 'PLANNING',
      player: playerState,
      competitors: competitors,
      turnLog: [`Starting tenure as CEO of ${selectedTelco}.`],
      lastYearAnalysis: null,
      marketEvent: null,
      history: [initialHistory]
    });
    setGameStarted(true);
  };

  const handleRegionSelect = useCallback((region: RegionName) => {
    setSelectedRegion(region);
  }, []);

  const handleInvest = (type: InvestmentType) => {
    if (!selectedRegion) return;
    setPendingInvestments([...pendingInvestments, { region: selectedRegion, type }]);
    setGameState(prev => ({
        ...prev,
        turnLog: [...prev.turnLog, `Drafted investment: ${type} in ${selectedRegion}`]
    }));
  };

  const handleRemoveInvest = (type: InvestmentType) => {
    if (!selectedRegion) return;
    // Remove the last added investment of this type for this region (LIFO)
    const index = pendingInvestments.map(p => p.region === selectedRegion && p.type === type).lastIndexOf(true);
    
    if (index !== -1) {
        const newPending = [...pendingInvestments];
        newPending.splice(index, 1);
        setPendingInvestments(newPending);
        setGameState(prev => ({
            ...prev,
            turnLog: [...prev.turnLog, `Removed investment: ${type} from ${selectedRegion}`]
        }));
    }
  };

  const calculateTurnResults = async () => {
    setLoadingAnalysis(true);
    
    // --- 1. Player Turn Processing ---
    const currentPlayer: PlayerState = JSON.parse(JSON.stringify(gameState.player));
    const investments = [...pendingInvestments];
    
    setPreviousPlayerState(JSON.parse(JSON.stringify(gameState.player)));

    let totalCapex = 0;
    let totalOpex = 0;
    const newRegions = currentPlayer.regions;

    // Apply Network Decay (Simulating infrastructure aging)
    // If no investment is made, quality drops by 2.5 points per year
    Object.values(newRegions).forEach((region: RegionState) => {
        region.networkCoverage = Math.max(0, region.networkCoverage - 2.5);
    });

    investments.forEach(inv => {
        const data = INVESTMENTS[inv.type];
        const region = newRegions[inv.region];

        totalCapex += data.cost * data.capexImpact;
        totalOpex += data.cost * data.opexImpact;
        currentPlayer.budget -= data.cost;

        // Adjusted: Removed divisor to ensure investments provide positive net gain against decay
        if (data.returns.networkQuality) region.networkCoverage = Math.min(100, region.networkCoverage + data.returns.networkQuality);
        if (data.returns.subscriberGrowth) region.marketShare = Math.min(100, region.marketShare + (data.returns.subscriberGrowth / 3));
        region.investments.push(inv.type);
    });

    let avgCoverage = (Object.values(newRegions) as RegionState[]).reduce((acc, r) => acc + r.networkCoverage, 0) / 9;
    currentPlayer.networkQuality = avgCoverage;
    
    const marketRandomness = 0.95 + Math.random() * 0.1;

    const npsBoost = investments.reduce((acc, inv) => acc + (INVESTMENTS[inv.type].returns.nps || 0), 0);
    currentPlayer.nps = Math.min(100, Math.max(-100, currentPlayer.nps + npsBoost - 2));

    const subGrowth = investments.reduce((acc, inv) => acc + (INVESTMENTS[inv.type].returns.subscriberGrowth || 0), 0);
    const organicGrowth = 1.02;
    currentPlayer.financials.subscribers = currentPlayer.financials.subscribers * organicGrowth * (1 + subGrowth/100) * (1 - currentPlayer.financials.churnRate/100);

    const revGrowth = investments.reduce((acc, inv) => acc + (INVESTMENTS[inv.type].returns.revenueGrowth || 0), 0);
    const newRevenue = currentPlayer.financials.revenue * marketRandomness * (1 + revGrowth/100);
    
    const baseOpex = newRevenue * 0.6; 
    const finalOpex = baseOpex + totalOpex;

    currentPlayer.financials.revenue = newRevenue;
    currentPlayer.financials.capex = totalCapex;
    currentPlayer.financials.opex = finalOpex;
    currentPlayer.financials.profit = newRevenue - finalOpex - totalCapex;
    
    if (currentPlayer.financials.profit > 0) {
        currentPlayer.budget += currentPlayer.financials.profit;
    }

    // --- 2. AI Competitor Processing ---
    const updatedCompetitors = gameState.competitors.map(comp => {
        const { newState } = simulateCompetitorTurn(comp);
        return newState;
    });

    // --- 3. Update History ---
    const compAvgRev = updatedCompetitors.reduce((acc, c) => acc + c.financials.revenue, 0) / updatedCompetitors.length;
    const compAvgSubs = updatedCompetitors.reduce((acc, c) => acc + c.financials.subscribers, 0) / updatedCompetitors.length;
    const compAvgQual = updatedCompetitors.reduce((acc, c) => acc + c.networkQuality, 0) / updatedCompetitors.length;
    const compAvgNps = updatedCompetitors.reduce((acc, c) => acc + c.nps, 0) / updatedCompetitors.length;

    const newHistoryEntry: HistoryEntry = {
        year: gameState.year,
        playerRevenue: currentPlayer.financials.revenue,
        playerSubscribers: currentPlayer.financials.subscribers,
        playerNetworkQuality: currentPlayer.networkQuality,
        playerNPS: currentPlayer.nps,
        competitorAvgRevenue: compAvgRev,
        competitorAvgSubscribers: compAvgSubs,
        competitorAvgNetworkQuality: compAvgQual,
        competitorAvgNPS: compAvgNps
    };
    const updatedHistory = [...gameState.history, newHistoryEntry];

    // --- 4. AI Analysis ---
    const analysis = await generateAnnualReportAnalysis(currentPlayer, updatedCompetitors, gameState.year, investments);

    // --- 5. Set State ---
    setGameState(prev => ({
        ...prev,
        player: { ...currentPlayer, regions: newRegions },
        competitors: updatedCompetitors,
        turnPhase: 'RESULTS',
        lastYearAnalysis: analysis,
        history: updatedHistory
    }));

    setLoadingAnalysis(false);
  };

  const handleNextTurn = () => {
    setPendingInvestments([]);
    setSelectedRegion(null);
    setGameState(prev => ({
        ...prev,
        year: prev.year + 1,
        turnPhase: 'PLANNING',
        turnLog: []
    }));
  };

  // --- Render ---

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Telco Tycoon <span className="text-blue-500 block">Indonesia</span>
                </h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Take control of a major telecommunications giant. Deploy 5G networks, 
                    manage CAPEX strategies, and battle for market share against aggressive AI competitors.
                    Will you dominate the archipelago?
                </p>
                <div className="space-y-2">
                   <p className="text-slate-500 text-sm uppercase font-bold tracking-wider mb-2">Choose your Operator:</p>
                   {Object.values(TelcoName).map(name => (
                       <button 
                        key={name}
                        onClick={() => handleStartGame(name)}
                        className="w-full text-left p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all flex items-center justify-between group"
                       >
                           <span className="font-semibold text-slate-200">{name}</span>
                           <PlayCircle className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                       </button>
                   ))}
                </div>
            </div>
            <div className="md:w-1/2 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center relative">
                <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
                <div className="absolute bottom-0 left-0 p-8">
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-2">STRATEGY SIMULATION</div>
                    <h3 className="text-2xl font-bold text-white">Network Coverage: 98%</h3>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6 font-sans">
      <Dashboard player={gameState.player} year={gameState.year} />

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)]">
        
        {/* Left: Map */}
        <div className="lg:w-2/3 h-[50vh] lg:h-full flex flex-col relative">
             {/* Market ticker overlay */}
            <div 
                onClick={() => setIsEventExpanded(!isEventExpanded)}
                className={`absolute top-0 left-4 z-[400] bg-slate-900/95 backdrop-blur border border-blue-500/30 px-3 py-2 rounded-b-lg flex items-start gap-3 text-blue-200 text-xs shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-400/50 group ${isEventExpanded ? 'max-w-[80%] md:max-w-[60%] z-[600]' : 'max-w-[250px] hover:max-w-[300px]'}`}
                title={isEventExpanded ? "Click to collapse" : "Click to read full market event"}
            >
                <AlertCircle size={16} className={`flex-shrink-0 ${isEventExpanded ? 'mt-0.5 text-blue-400' : ''}`} />
                <div className="flex-1 overflow-hidden">
                    <span className={`font-mono block ${isEventExpanded ? 'whitespace-normal leading-relaxed' : 'truncate'}`}>
                        {gameState.marketEvent || "Connecting to market feed..."}
                    </span>
                    {!isEventExpanded && (
                        <span className="text-[10px] text-blue-500/50 mt-0.5 hidden group-hover:block animate-pulse">
                            Click to read more
                        </span>
                    )}
                </div>
                {isEventExpanded && <ChevronUp size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />}
            </div>
            
            <MapBoard 
                playerRegionState={gameState.player.regions} 
                onSelectRegion={handleRegionSelect}
                selectedRegion={selectedRegion}
                playerColor={gameState.player.color}
            />
        </div>

        {/* Right: Controls */}
        <div className="lg:w-1/3 h-auto flex flex-col">
            <ControlPanel 
                selectedRegion={selectedRegion}
                budget={gameState.player.budget}
                onInvest={handleInvest}
                onRemoveInvest={handleRemoveInvest}
                onEndTurn={calculateTurnResults}
                pendingInvestments={pendingInvestments}
            />
        </div>
      </div>

      {/* Modals */}
      {(gameState.turnPhase === 'RESULTS' || loadingAnalysis) && (
        <AnnualReport 
            player={gameState.player}
            competitors={gameState.competitors}
            previousPlayerState={previousPlayerState}
            year={gameState.year}
            history={gameState.history}
            analysis={loadingAnalysis ? "Generating Board Report & Competitive Analysis..." : gameState.lastYearAnalysis}
            onClose={handleNextTurn}
        />
      )}
    </div>
  );
};

export default App;
