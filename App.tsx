import React, { useState, useEffect, useCallback } from 'react';
import { fetchVTIPrice } from './services/geminiService';
import { StockData, FetchStatus } from './types';
import { InfoCard } from './components/InfoCard';
import { Disclaimer } from './components/Disclaimer';
import { 
  RefreshCw, 
  TrendingUp, 
  DollarSign,
  Coins,
  PieChart, 
  ExternalLink,
  Loader2,
  ArrowRightLeft
} from 'lucide-react';

const App: React.FC = () => {
  const [shares, setShares] = useState<string>('10'); // String to handle empty input
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setStatus(FetchStatus.LOADING);
    setErrorMessage(null);
    try {
      const data = await fetchVTIPrice();
      setStockData(data);
      setStatus(FetchStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(FetchStatus.ERROR);
      setErrorMessage("データの取得に失敗しました。もう一度お試しください。");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits and one decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setShares(val);
    }
  };

  const parsedShares = parseFloat(shares) || 0;
  const currentPrice = stockData?.price || 0;
  const exchangeRate = stockData?.exchangeRate || 0;
  
  const totalValueUSD = parsedShares * currentPrice;
  const totalValueJPY = totalValueUSD * exchangeRate;

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatJPY = (val: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0, 
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <TrendingUp size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">VTI 評価額計算</h1>
          </div>
          
          <button
            onClick={loadData}
            disabled={status === FetchStatus.LOADING}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${status === FetchStatus.LOADING 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800 active:transform active:scale-95'
              }`}
          >
            {status === FetchStatus.LOADING ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            {status === FetchStatus.LOADING ? '更新中...' : '最新価格に更新'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error State */}
        {status === FetchStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Price Card */}
          <InfoCard title="現在の価格情報">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">VTI 株価 (USD)</p>
                    <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-1">
                      {status === FetchStatus.LOADING && !stockData ? (
                        <div className="h-9 w-24 bg-slate-200 animate-pulse rounded"></div>
                      ) : (
                        formatUSD(currentPrice)
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">為替レート (USD/JPY)</p>
                    <div className="text-xl font-semibold text-slate-700 flex items-center justify-end gap-1">
                      <ArrowRightLeft size={16} className="text-slate-400" />
                      {status === FetchStatus.LOADING && !stockData ? (
                        <div className="h-7 w-16 bg-slate-200 animate-pulse rounded"></div>
                      ) : (
                        `¥${exchangeRate?.toFixed(2)}`
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 flex items-center gap-1">
                   {stockData ? `最終更新: ${stockData.lastUpdated.toLocaleTimeString('ja-JP')}` : 'データ待機中...'}
                </div>
              </div>
              
              {/* Context Summary */}
              {stockData?.summary && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {stockData.summary.replace(/^PRICE:.*$/m, '').replace(/^RATE:.*$/m, '').replace(/^SUMMARY:/m, '').trim()}
                  </p>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Calculator Input */}
          <InfoCard title="保有状況">
             <div className="flex flex-col h-full justify-center">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  保有株数
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <PieChart className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="shares"
                    id="shares"
                    className="block w-full rounded-lg border-slate-300 pl-10 pr-12 focus:border-emerald-500 focus:ring-emerald-500 py-4 text-2xl font-semibold text-slate-900 shadow-sm border"
                    placeholder="0"
                    value={shares}
                    onChange={handleShareChange}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">株</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  現在保有しているVTIの総株数を入力してください。自動的に円換算で評価額を計算します。
                </p>
             </div>
          </InfoCard>
        </div>

        {/* Total Value Big Display */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-slate-300 font-medium mb-2 uppercase tracking-wider text-sm">推定評価額 (円換算)</h2>
              <div className="text-5xl sm:text-6xl font-bold tracking-tight flex items-center mb-2">
                {formatJPY(totalValueJPY)}
              </div>
              <div className="text-lg text-slate-400 font-mono">
                {formatUSD(totalValueUSD)} (USD)
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 min-w-[220px] w-full md:w-auto">
               <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-emerald-500/20 rounded-full">
                    <Coins className="text-emerald-400 w-5 h-5" />
                 </div>
                 <span className="text-sm text-slate-300 font-medium">計算内訳</span>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm border-b border-white/10 pb-1">
                   <span className="text-slate-400">株数:</span>
                   <span className="font-mono text-white">{parsedShares} 株</span>
                 </div>
                 <div className="flex justify-between text-sm border-b border-white/10 pb-1">
                   <span className="text-slate-400">株価:</span>
                   <span className="font-mono text-white">{formatUSD(currentPrice)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">レート:</span>
                   <span className="font-mono text-white">¥{exchangeRate?.toFixed(2)}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sources Section */}
        {stockData && stockData.sources.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
              <ExternalLink size={14} />
              情報ソース
            </h3>
            <div className="flex flex-wrap gap-2">
              {stockData.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                >
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}

        <Disclaimer />
      </main>
    </div>
  );
};

export default App;