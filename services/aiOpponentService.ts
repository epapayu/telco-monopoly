
import { PlayerState, InvestmentType, RegionName, RegionState } from "../types";
import { INVESTMENTS, INITIAL_REGIONS } from "../constants";

const REGION_KEYS = Object.values(RegionName);
const INVESTMENT_KEYS = Object.values(InvestmentType);

/**
 * Simulates a turn for a single AI competitor.
 * 1. Decides budget allocation based on current cash.
 * 2. Selects random but weighted investments.
 * 3. Updates financials and regional stats.
 */
export const simulateCompetitorTurn = (competitor: PlayerState): { newState: PlayerState, actions: string[] } => {
    const newState: PlayerState = JSON.parse(JSON.stringify(competitor)); // Deep clone
    const actions: string[] = [];
    
    // NEW: Apply Network Decay (Simulating infrastructure aging)
    Object.values(newState.regions).forEach((region: RegionState) => {
        region.networkCoverage = Math.max(0, region.networkCoverage - 2.5);
    });
    
    // AI Strategy: Spend between 40% to 80% of budget depending on current network quality
    const aggressiveFactor = newState.networkQuality < 70 ? 0.8 : 0.4;
    const spendBudget = newState.budget * aggressiveFactor;
    
    let currentSpend = 0;
    const investmentsMade: InvestmentType[] = [];

    // Try to invest until budget allocation is met
    // Limit to 5 moves max to prevent infinite loops in edge cases
    for (let i = 0; i < 5; i++) {
        if (currentSpend >= spendBudget) break;

        // Pick a random investment type
        const randomInvIndex = Math.floor(Math.random() * INVESTMENT_KEYS.length);
        const invType = INVESTMENT_KEYS[randomInvIndex];
        const invData = INVESTMENTS[invType];

        if (newState.budget - currentSpend >= invData.cost) {
            investmentsMade.push(invType);
            currentSpend += invData.cost;
            
            // Pick a random region to apply it to
            const randomRegionIndex = Math.floor(Math.random() * REGION_KEYS.length);
            const regionName = REGION_KEYS[randomRegionIndex];
            
            // Apply regional effects
            const region = newState.regions[regionName];
            applyInvestmentToRegion(region, invType);
            actions.push(`${competitor.name} invested in ${invType} (${regionName})`);
        }
    }

    // Calculate Financials
    let totalCapex = 0;
    let totalOpex = 0;
    let subGrowthTotal = 0;
    let revenueGrowthTotal = 0;
    let npsGrowthTotal = 0;

    investmentsMade.forEach(type => {
        const data = INVESTMENTS[type];
        totalCapex += data.cost * data.capexImpact;
        totalOpex += data.cost * data.opexImpact;
        
        subGrowthTotal += (data.returns.subscriberGrowth || 0);
        revenueGrowthTotal += (data.returns.revenueGrowth || 0);
        npsGrowthTotal += (data.returns.nps || 0);
    });

    // Update Global Stats
    newState.budget -= currentSpend;
    
    // Organic Growth + Investment Impact
    const marketRandomness = 0.95 + Math.random() * 0.1; // +/- 5%

    newState.nps = Math.min(100, Math.max(-100, newState.nps + npsGrowthTotal - 1)); // -1 natural decay
    
    const subGrowth = (1.02) * (1 + subGrowthTotal / 100); // 2% organic
    newState.financials.subscribers = newState.financials.subscribers * subGrowth * (1 - newState.financials.churnRate / 100);
    
    const newRevenue = newState.financials.revenue * marketRandomness * (1 + revenueGrowthTotal / 100);
    
    // Opex Logic
    const baseOpex = newRevenue * 0.6;
    const finalOpex = baseOpex + totalOpex;

    newState.financials.revenue = newRevenue;
    newState.financials.capex = totalCapex;
    newState.financials.opex = finalOpex;
    newState.financials.profit = newRevenue - finalOpex - totalCapex;

    // Recalculate Network Quality Average
    const avgCoverage = (Object.values(newState.regions) as RegionState[]).reduce((acc, r) => acc + r.networkCoverage, 0) / 9;
    newState.networkQuality = avgCoverage;

    // Add profit to budget for next year
    if (newState.financials.profit > 0) {
        newState.budget += newState.financials.profit;
    }

    return { newState, actions };
};

const applyInvestmentToRegion = (region: RegionState, type: InvestmentType) => {
    const data = INVESTMENTS[type];
    if (data.returns.networkQuality) {
        // Adjusted: Removed divisor to ensure investments provide positive net gain against decay
        region.networkCoverage = Math.min(100, region.networkCoverage + data.returns.networkQuality);
    }
    if (data.returns.subscriberGrowth) {
        region.marketShare = Math.min(100, region.marketShare + (data.returns.subscriberGrowth / 3));
    }
    region.investments.push(type);
};
