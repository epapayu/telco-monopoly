import { Investment, InvestmentType, RegionName, TelcoName, PlayerState, RegionState } from './types';

export const INITIAL_BUDGET = 15000; // 15 Trillion IDR (Simplified)

export const REGION_COORDINATES: Record<RegionName, { lat: number; lng: number }> = {
  [RegionName.NORTH_SUMATERA]: { lat: 2.115, lng: 99.545 },
  [RegionName.SOUTH_SUMATERA]: { lat: -3.319, lng: 103.914 },
  [RegionName.JAKARTA]: { lat: -6.208, lng: 106.845 },
  [RegionName.WEST_JAVA]: { lat: -6.917, lng: 107.619 },
  [RegionName.CENTRAL_JAVA]: { lat: -7.151, lng: 110.140 },
  [RegionName.EAST_JAVA]: { lat: -7.536, lng: 112.238 },
  [RegionName.BALI]: { lat: -8.409, lng: 115.188 },
  [RegionName.KALIMANTAN]: { lat: -1.681, lng: 113.382 },
  [RegionName.SULAWESI]: { lat: -2.5, lng: 119.5 },
};

export const INVESTMENTS: Record<InvestmentType, Investment> = {
  [InvestmentType.NETWORK_EXPANSION_4G]: {
    type: InvestmentType.NETWORK_EXPANSION_4G,
    cost: 2000,
    capexImpact: 0.9,
    opexImpact: 0.1,
    returns: { networkQuality: 5, subscriberGrowth: 4, revenueGrowth: 3 },
    description: "Expand LTE coverage to rural areas to acquire new subscribers."
  },
  [InvestmentType.NETWORK_OPTIMIZATION_5G]: {
    type: InvestmentType.NETWORK_OPTIMIZATION_5G,
    cost: 3500,
    capexImpact: 0.8,
    opexImpact: 0.2,
    returns: { networkQuality: 10, revenueGrowth: 5, nps: 2 },
    description: "Deploy 5G Massive MIMO in high-density urban areas."
  },
  [InvestmentType.CUSTOMER_EXPERIENCE]: {
    type: InvestmentType.CUSTOMER_EXPERIENCE,
    cost: 800,
    capexImpact: 0.3,
    opexImpact: 0.7,
    returns: { nps: 8, churnReduction: 2 },
    description: "Upgrade call centers and digital apps for better UX."
  },
  [InvestmentType.NETWORK_OPERATIONS]: {
    type: InvestmentType.NETWORK_OPERATIONS,
    cost: 1200,
    capexImpact: 0.4,
    opexImpact: 0.6,
    returns: { networkQuality: 3, profit: 2 }, // Profit via efficiency
    description: "Implement AI-driven network operations to reduce outages."
  },
  [InvestmentType.MARKETING_CAMPAIGN]: {
    type: InvestmentType.MARKETING_CAMPAIGN,
    cost: 1500,
    capexImpact: 0.0,
    opexImpact: 1.0,
    returns: { subscriberGrowth: 6, revenueGrowth: 2 },
    description: "Nationwide aggressive marketing campaign."
  },
  [InvestmentType.B2B_INITIATIVE]: {
    type: InvestmentType.B2B_INITIATIVE,
    cost: 1000,
    capexImpact: 0.2,
    opexImpact: 0.8,
    returns: { revenueGrowth: 6, nps: 1 },
    description: "Enterprise solutions for mining and manufacturing."
  }
};

export const INITIAL_PLAYER_STATE: Record<TelcoName, Omit<PlayerState, 'regions'>> = {
  [TelcoName.TELKOMSEL]: {
    name: TelcoName.TELKOMSEL,
    color: '#ef4444', // Red
    budget: 25000,
    nps: 45,
    networkQuality: 85,
    financials: { revenue: 90000, capex: 0, opex: 0, profit: 0, subscribers: 160, churnRate: 2.5 }
  },
  [TelcoName.IOH]: {
    name: TelcoName.IOH,
    color: '#eab308', // Yellow
    budget: 18000,
    nps: 35,
    networkQuality: 75,
    financials: { revenue: 50000, capex: 0, opex: 0, profit: 0, subscribers: 100, churnRate: 3.0 }
  },
  [TelcoName.XL_SMARTFREN]: {
    name: TelcoName.XL_SMARTFREN,
    color: '#3b82f6', // Blue
    budget: 15000,
    nps: 40,
    networkQuality: 78,
    financials: { revenue: 40000, capex: 0, opex: 0, profit: 0, subscribers: 85, churnRate: 2.8 }
  }
};

export const INITIAL_REGIONS: Record<RegionName, RegionState> = Object.values(RegionName).reduce((acc, name) => {
  acc[name] = {
    name,
    ...REGION_COORDINATES[name],
    marketSize: 100, // Placeholder index
    networkCoverage: 60,
    marketShare: 20,
    competitorShare: 70,
    investments: [] // Initialize investments array
  };
  return acc;
}, {} as Record<RegionName, RegionState>);
