// Canonical fund data types

export interface TaxLot {
  lot_id: string;
  purchase_date: string;
  shares: number;
  cost_basis_per_share: number;
  is_long_term: boolean;
}

export interface FundHolding {
  ticker: string;
  name: string;
  nav: number;
  shares: number;
  current_value: number;
  asset_class: string;
  target_pct: number;
  current_pct: number;
  lots: TaxLot[];
}

export interface Account {
  account_id: string;
  account_type: string;
  account_name: string;
  masked_number: string;
  balance: number;
  is_brokerage: boolean;
  can_sell: boolean;
  holdings?: FundHolding[];
}

export interface Portfolio {
  investor_name: string;
  total_value: number;
  as_of_date: string;
  as_of_time: string;
  accounts: Account[];
}

// API response types

export interface LotDetail {
  lot_id: string;
  purchase_date: string;
  shares_sold: number;
  cost_basis_per_share: number;
  proceeds_per_share: number;
  gain_loss: number;
  is_long_term: boolean;
  term: "ST" | "LT";
}

export interface WaitAndSaveLot {
  fund: string;
  lot_date: string;
  converts_lt: string;
  days_until_lt: number;
  tax_now: number;
  tax_if_wait: number;
  savings: number;
}

export interface FundRecommendation {
  ticker: string;
  name: string;
  recommended_sell: number;
  method: string;
  current_value: number;
  st_gain_loss: number;
  lt_gain_loss: number;
  est_tax: number;
  rationale: string;
  lots: LotDetail[];
  rebalancing_impact: string;
}

export interface SellRecommendation {
  recommendation_id: string;
  account_id: string;
  withdrawal_amount: number;
  funds: FundRecommendation[];
  total_sale: number;
  st_gains: number;
  lt_gains: number;
  losses_harvested: number;
  net_taxable_gain: number;
  federal_tax: number;
  state_tax: number;
  total_tax: number;
  effective_rate: number;
  wait_and_save: WaitAndSaveLot[];
}

export interface PerFundScenario {
  ticker: string;
  name: string;
  sell_amount: number;
  st_gain_loss: number;
  lt_gain_loss: number;
  est_tax: number;
  shares_sold: number;
  lots: LotDetail[];
}

export interface PortfolioDrift {
  asset_class: string;
  before_pct: number;
  after_pct: number;
  target_pct: number;
  diff_pct: number;
}

export interface ScenarioTaxImpact {
  total_sale: number;
  st_gains: number;
  lt_gains: number;
  losses_harvested: number;
  net_taxable_gain: number;
  federal_tax: number;
  state_tax: number;
  total_tax: number;
  effective_rate: number;
  per_fund_breakdown: PerFundScenario[];
  portfolio_drift_after: PortfolioDrift[];
}

// UI state types

export type ViewMode = "table" | "cards";

export interface ScenarioData {
  id: string;
  name: string;
  amounts: Record<string, number>;
  result: ScenarioTaxImpact | null;
  source?: "recommendation" | "manual";
}

// Raw string amounts used in form inputs (before parsing)
export type RawAmounts = Record<string, string>;
