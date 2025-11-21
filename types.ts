
export enum TelcoName {
  TELKOMSEL = 'Telkomsel',
  IOH = 'Indosat Ooredoo Hutchison',
  XL_SMARTFREN = 'XL Axiata - Smartfren'
}

export enum RegionName {
  NORTH_SUMATERA = 'North Sumatera',
  SOUTH_SUMATERA = 'South Sumatera',
  JAKARTA = 'Jakarta',
  WEST_JAVA = 'West Java',
  CENTRAL_JAVA = 'Central Java',
  EAST_JAVA = 'East Java',
  BALI = 'Bali & Nusa Tenggara',
  KALIMANTAN = 'Kalimantan',
  SULAWESI = 'Sulawesi & Papua'
}

export enum InvestmentType {
  NETWORK_EXPANSION_4G = 'Network Expansion (4G)',
  NETWORK_OPTIMIZATION_5G = '5G Optimization',
  CUSTOMER_EXPERIENCE = 'Customer Experience (CX)',
  NETWORK_OPERATIONS = 'Network Ops Automation',
  MARKETING_CAMPAIGN = 'Marketing Campaign',
  B2B_INITIATIVE = 'B2B Enterprise Solutions'
}

export interface Investment {
  type: InvestmentType;
  cost: number; // In Billions IDR
  capexImpact: number; // % of cost
  opexImpact: number; // % of cost
  returns: {
    nps?: number;
    networkQuality?: number; // 0-100
    subscriberGrowth?: number; // %
    revenueGrowth?: number; // %
    churnReduction?: number; // %
    profit?: number;
  };
  description: string;
}

export interface RegionState {
  name: RegionName;
  lat: number;
  lng: number;
  marketSize: number; // Total potential subs
  networkCoverage: number; // 0-100
  marketShare: number; // 0-100%
  competitorShare: number;
  investments: InvestmentType[];
}

export interface Financials {
  revenue: number; // Billions IDR
  capex: number;
  opex: number;
  profit: number;
  subscribers: number; // In Millions
  churnRate: number; // %
}

export interface PlayerState {
  name: TelcoName;
  color: string;
  budget: number; // Remaining Cash
  financials: Financials;
  nps: number; // -100 to 100
  networkQuality: number; // 0-100
  regions: Record<RegionName, RegionState>;
}

export interface HistoryEntry {
  year: number;
  playerRevenue: number;
  playerSubscribers: number;
  playerNetworkQuality: number;
  playerNPS: number;
  competitorAvgRevenue: number;
  competitorAvgSubscribers: number;
  competitorAvgNetworkQuality: number;
  competitorAvgNPS: number;
}

export interface GameState {
  year: number; // Starts at 2024
  turnPhase: 'PLANNING' | 'RESULTS';
  player: PlayerState;
  competitors: PlayerState[]; // AI Opponents
  turnLog: string[];
  lastYearAnalysis: string | null;
  marketEvent: string | null;
  history: HistoryEntry[];
}
