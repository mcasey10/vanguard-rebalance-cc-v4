import type { Portfolio, Account, FundHolding, TaxLot } from "./types";

// Canonical tax lot data
const VTSAX_LOTS: TaxLot[] = [
  {
    lot_id: "vtsax-lt-1",
    purchase_date: "2014-06-15",
    shares: 100,
    cost_basis_per_share: 48.20,
    is_long_term: true,
  },
  {
    lot_id: "vtsax-lt-2",
    purchase_date: "2016-11-30",
    shares: 80,
    cost_basis_per_share: 62.45,
    is_long_term: true,
  },
  {
    lot_id: "vtsax-lt-3",
    purchase_date: "2018-03-22",
    shares: 50,
    cost_basis_per_share: 84.10,
    is_long_term: true,
  },
  {
    lot_id: "vtsax-lt-4",
    purchase_date: "2019-06-01",
    shares: 23,
    cost_basis_per_share: 101.31,
    is_long_term: true,
  },
  {
    lot_id: "vtsax-st-1",
    purchase_date: "2025-06-01",
    shares: 2,
    cost_basis_per_share: 764.34,
    is_long_term: false,
  },
];

const VBTLX_LOTS: TaxLot[] = [
  {
    lot_id: "vbtlx-lt-1",
    purchase_date: "2022-03-15",
    shares: 1000,
    cost_basis_per_share: 135.10,
    is_long_term: true,
  },
  {
    lot_id: "vbtlx-lt-2",
    purchase_date: "2023-08-20",
    shares: 271,
    cost_basis_per_share: 108.50,
    is_long_term: true,
  },
];

const VFIAX_LOTS: TaxLot[] = [
  {
    lot_id: "vfiax-st-1",
    purchase_date: "2025-04-04",
    shares: 84,
    cost_basis_per_share: 490.00,
    is_long_term: false,
  },
  {
    lot_id: "vfiax-st-2",
    purchase_date: "2025-05-01",
    shares: 84,
    cost_basis_per_share: 510.00,
    is_long_term: false,
  },
];

const VIGAX_LOTS: TaxLot[] = [
  {
    lot_id: "vigax-lt-1",
    purchase_date: "2020-09-01",
    shares: 156,
    cost_basis_per_share: 130.00,
    is_long_term: true,
  },
];

const VXUS_LOTS: TaxLot[] = [
  {
    lot_id: "vxus-lt-1",
    purchase_date: "2021-11-15",
    shares: 292,
    cost_basis_per_share: 55.20,
    is_long_term: true,
  },
];

export const BROKERAGE_HOLDINGS: FundHolding[] = [
  {
    ticker: "VTSAX",
    name: "Vanguard Total Stock Market Index Fund",
    nav: 785.34,
    shares: 255,
    current_value: 200212.00,
    asset_class: "us_equity",
    target_pct: 40.0,
    current_pct: 34.4,
    lots: VTSAX_LOTS,
  },
  {
    ticker: "VBTLX",
    name: "Vanguard Total Bond Market Index Fund",
    nav: 92.85,
    shares: 1271,
    current_value: 117963.00,
    asset_class: "us_bond",
    target_pct: 30.0,
    current_pct: 20.3,
    lots: VBTLX_LOTS,
  },
  {
    ticker: "VFIAX",
    name: "Vanguard 500 Index Fund",
    nav: 519.37,
    shares: 168,
    current_value: 87254.00,
    asset_class: "us_equity",
    target_pct: 18.0,
    current_pct: 15.0,
    lots: VFIAX_LOTS,
  },
  {
    ticker: "VIGAX",
    name: "Vanguard Growth Index Fund",
    nav: 188.42,
    shares: 156,
    current_value: 29394.00,
    asset_class: "us_equity",
    target_pct: 7.0,
    current_pct: 5.1,
    lots: VIGAX_LOTS,
  },
  {
    ticker: "VXUS",
    name: "Vanguard Total International Stock Index Fund",
    nav: 63.48,
    shares: 292,
    current_value: 18536.00,
    asset_class: "intl_equity",
    target_pct: 2.0,
    current_pct: 3.2,
    lots: VXUS_LOTS,
  },
];

export const PORTFOLIO: Portfolio = {
  investor_name: "Michael",
  total_value: 580745.29,
  as_of_date: "March 13, 2026",
  as_of_time: "4:15 p.m. ET",
  accounts: [
    {
      account_id: "cash-plus-001",
      account_type: "cash_plus",
      account_name: "Cash Plus Account",
      masked_number: "72981482**",
      balance: 30011.01,
      is_brokerage: false,
      can_sell: false,
    },
    {
      account_id: "brokerage-001",
      account_type: "brokerage",
      account_name: "Brokerage Account",
      masked_number: "72981482*",
      balance: 453019.15,
      is_brokerage: true,
      can_sell: true,
      holdings: BROKERAGE_HOLDINGS,
    },
    {
      account_id: "ira-trad-001",
      account_type: "traditional_ira",
      account_name: "Traditional IRA Brokerage Account",
      masked_number: "72981482*",
      balance: 21665.38,
      is_brokerage: true,
      can_sell: false,
    },
    {
      account_id: "ira-roth-001",
      account_type: "roth_ira",
      account_name: "Roth IRA Brokerage Account",
      masked_number: "72981482*",
      balance: 68894.48,
      is_brokerage: true,
      can_sell: false,
    },
    {
      account_id: "529-001",
      account_type: "college_529",
      account_name: "Individual 529 College Savings Account",
      masked_number: "72981482*",
      balance: 17775.71,
      is_brokerage: false,
      can_sell: false,
    },
  ],
};

export const FUND_NAMES: Record<string, string> = {
  VTSAX: "Vanguard Total Stock Market Index Fund",
  VBTLX: "Vanguard Total Bond Market Index Fund",
  VFIAX: "Vanguard 500 Index Fund",
  VIGAX: "Vanguard Growth Index Fund",
  VXUS: "Vanguard Total International Stock Index Fund",
};

export const ASSET_CLASS_LABELS: Record<string, string> = {
  us_equity: "US Equity",
  us_bond: "US Bond",
  intl_equity: "Intl. Equity",
};
