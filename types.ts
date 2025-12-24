export interface GroundingSource {
  title: string;
  uri: string;
}

export interface StockData {
  price: number | null;
  exchangeRate: number | null;
  summary: string;
  sources: GroundingSource[];
  lastUpdated: Date;
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}