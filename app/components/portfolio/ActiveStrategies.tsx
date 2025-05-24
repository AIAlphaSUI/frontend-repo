import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './ActiveStrategies.css';

interface Trade {
  trade_id: string;
  strategy_id: string;
  action: 'BUY' | 'SELL';
  coin_symbol: string;
  price: number;
  amount: number;
  value: number;
  timestamp: string;
  pnl?: number;
  pnl_pct?: number;
}

interface Strategy {
  strategy_id: string;
  strategy_name: string;
  strategy_params: Record<string, any>;
  coin_symbol: string;
  initial_capital: number;
  current_capital: number;
  position: number;
  entry_price: number;
  shares: number;
  pnl: number;
  pnl_pct: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  total_pnl: number;
  total_pnl_pct: number;
  num_trades: number;
  start_time: string;
  last_update: string;
  status: string;
  last_price_data?: {
    address: string;
    close: number;
    high: number;
    low: number;
    open: number;
    timestamp: number;
    volume: number;
    currency: string;
  };
  is_active?: boolean;
  real_time_status?: {
    position: number;
    current_capital: number;
    pnl: number;
    pnl_pct: number;
    last_signal?: {
      signal: string;
      price: number;
      momentum?: number;
      rsi?: number;
    };
    last_update: string;
  };
  trades?: Trade[];
  expanded?: boolean;
}

interface ActiveStrategiesProps {
  walletAddress?: string;
}

const ActiveStrategies: React.FC<ActiveStrategiesProps> = ({ walletAddress }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'stopped'>('all');
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number | string) => {
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleString();
  };

  // Generate mock trades for strategies
  const generateMockTrades = (strategy: Strategy): Trade[] => {
    const trades: Trade[] = [];
    const numTrades = strategy.num_trades > 0 ? strategy.num_trades : Math.floor(Math.random() * 5) + 1;
    
    // Calculate starting timestamp (a few days ago)
    const startTime = new Date(strategy.start_time).getTime();
    const endTime = new Date(strategy.last_update).getTime();
    
    for (let i = 0; i < numTrades; i++) {
      // Generate a timestamp between start and end times
      const tradeTime = new Date(startTime + Math.random() * (endTime - startTime));
      
      // For simplicity, alternate between buys and sells
      const action = i % 2 === 0 ? 'BUY' : 'SELL';
      
      // Generate a price around the current price
      const basePrice = strategy.last_price_data ? strategy.last_price_data.close : 
        (strategy.entry_price || (strategy.coin_symbol === 'haSUI' ? 4.0 : 0.00000003));
      
      // Price variation of ±3%
      const priceVariation = basePrice * (0.97 + Math.random() * 0.06);
      const price = Number(priceVariation.toFixed(basePrice < 0.01 ? 12 : 6));
      
      // Amount based on position size
      const amount = action === 'BUY' ? 
        strategy.initial_capital / price * (Math.random() * 0.3 + 0.7) : 
        (strategy.shares || strategy.initial_capital / price * 0.9);
      
      // Calculate value
      const value = price * amount;
      
      // For SELL trades, calculate PNL
      const pnl = action === 'SELL' ? value - (strategy.entry_price * amount) : undefined;
      const pnl_pct = pnl ? pnl / (strategy.entry_price * amount) : undefined;
      
      trades.push({
        trade_id: `trade-${strategy.strategy_id}-${i}`,
        strategy_id: strategy.strategy_id,
        action,
        coin_symbol: strategy.coin_symbol,
        price,
        amount,
        value,
        timestamp: tradeTime.toISOString(),
        ...(pnl !== undefined && { pnl, pnl_pct }),
      });
    }
    
    // Sort trades by timestamp
    return trades.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // Fetch strategies
  const fetchStrategies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/strategy/list', {
        headers: {
          'accept': 'application/json',
          'X-API-Key': 'trading_service_secret_key'
        }
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Generate mock trades for each strategy
      const strategiesWithTrades = data.strategies.map((strat: Strategy) => ({
        ...strat,
        trades: generateMockTrades(strat),
        expanded: false
      }));
      
      setStrategies(strategiesWithTrades);
      applyFilter(filter, strategiesWithTrades);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast.error('Failed to load trading strategies');
      
      // Generate mock strategies for demo purposes
      const mockStrategies = generateMockStrategies();
      setStrategies(mockStrategies);
      applyFilter(filter, mockStrategies);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate mock strategies for demo purposes
  const generateMockStrategies = (): Strategy[] => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    const mockStrategies = [
      {
        strategy_id: "mock-1",
        strategy_name: "RSI",
        strategy_params: {
          rsi_period: 7,
          oversold: 40,
          overbought: 60
        },
        coin_symbol: "haSUI",
        initial_capital: 500,
        current_capital: 480,
        position_size_pct: 1,
        stop_loss_pct: 0.03,
        take_profit_pct: 0.05,
        position: 1,
        entry_price: 3.95,
        shares: 121.52,
        pnl: 0,
        pnl_pct: 0,
        unrealized_pnl: -20,
        unrealized_pnl_pct: -0.04,
        total_pnl: -20,
        total_pnl_pct: -0.04,
        num_trades: 2,
        start_time: twoDaysAgo.toISOString(),
        last_update: now.toISOString(),
        status: "ACTIVE",
        last_price_data: {
          address: "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
          close: 3.90,
          high: 3.95,
          low: 3.85,
          open: 3.88,
          type: "15m",
          timestamp: Math.floor(now.getTime() / 1000),
          volume: 250.5,
          currency: "usd"
        },
        is_active: true,
        real_time_status: {
          position: 1,
          current_capital: 480,
          pnl: -20,
          pnl_pct: -0.04,
          last_signal: {
            signal: "BUY",
            price: 3.95,
            rsi: 35
          },
          last_update: now.toISOString()
        }
      },
      {
        strategy_id: "mock-2",
        strategy_name: "Momentum",
        strategy_params: {
          lookback_period: 5,
          momentum_threshold: 0.005
        },
        coin_symbol: "BLUB",
        initial_capital: 500,
        current_capital: 520,
        position_size_pct: 1,
        stop_loss_pct: 0.03,
        take_profit_pct: 0.05,
        position: 0,
        entry_price: 0,
        shares: 0,
        pnl: 20,
        pnl_pct: 0.04,
        unrealized_pnl: 0,
        unrealized_pnl_pct: 0,
        total_pnl: 20,
        total_pnl_pct: 0.04,
        num_trades: 3,
        start_time: oneDayAgo.toISOString(),
        last_update: now.toISOString(),
        status: "ACTIVE",
        last_price_data: {
          address: "0xfa7ac3951fdca92c5200d468d31a365eb03b2be9936fde615e69f0c1274ad3a0::BLUB::BLUB",
          close: 3.31e-8,
          high: 3.35e-8,
          low: 3.28e-8,
          open: 3.30e-8,
          type: "15m",
          timestamp: Math.floor(now.getTime() / 1000),
          volume: 675064045.69,
          currency: "usd"
        },
        is_active: true,
        real_time_status: {
          position: 0,
          current_capital: 520,
          pnl: 20,
          pnl_pct: 0.04,
          last_signal: {
            signal: "SELL",
            price: 3.35e-8,
            momentum: -0.005
          },
          last_update: now.toISOString()
        }
      },
      {
        strategy_id: "mock-3",
        strategy_name: "MACD",
        strategy_params: {
          fast_period: 12,
          slow_period: 26,
          signal_period: 9
        },
        coin_symbol: "SUI",
        initial_capital: 500,
        current_capital: 480,
        position_size_pct: 1,
        stop_loss_pct: 0.02,
        take_profit_pct: 0.04,
        position: 0,
        entry_price: 0,
        shares: 0,
        pnl: -20,
        pnl_pct: -0.04,
        unrealized_pnl: 0,
        unrealized_pnl_pct: 0,
        total_pnl: -20,
        total_pnl_pct: -0.04,
        num_trades: 4,
        start_time: twoDaysAgo.toISOString(),
        last_update: oneDayAgo.toISOString(),
        status: "STOPPED",
        last_price_data: {
          address: "0x2::sui::SUI",
          close: 1.25,
          high: 1.28,
          low: 1.22,
          open: 1.23,
          type: "15m",
          timestamp: Math.floor(oneDayAgo.getTime() / 1000),
          volume: 15250000,
          currency: "usd"
        }
      }
    ];
    
    // Generate mock trades
    return mockStrategies.map(strat => ({
      ...strat,
      trades: generateMockTrades(strat),
      expanded: false
    }));
  };

  // Apply filter to strategies
  const applyFilter = (filterType: 'all' | 'active' | 'stopped', strategiesList: Strategy[] = strategies) => {
    setFilter(filterType);
    
    if (filterType === 'all') {
      setFilteredStrategies(strategiesList);
    } else if (filterType === 'active') {
      setFilteredStrategies(strategiesList.filter(s => s.status === 'ACTIVE' || s.is_active));
    } else {
      setFilteredStrategies(strategiesList.filter(s => s.status === 'STOPPED' && !s.is_active));
    }
  };

  // Toggle strategy expanded state
  const toggleStrategyExpanded = (strategyId: string) => {
    setStrategies(prevStrategies => 
      prevStrategies.map(s => 
        s.strategy_id === strategyId ? { ...s, expanded: !s.expanded } : s
      )
    );
    
    setFilteredStrategies(prevFiltered => 
      prevFiltered.map(s => 
        s.strategy_id === strategyId ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

  // Stop a strategy
  const stopStrategy = async (strategyId: string) => {
    setIsProcessing(prev => ({ ...prev, [strategyId]: true }));
    try {
      const response = await fetch(`http://localhost:8001/api/strategy/${strategyId}/stop`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-API-Key': 'trading_service_secret_key'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to stop strategy: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success(`Successfully stopped ${result.strategy} strategy`);
      
      // Update strategies list
      fetchStrategies();
    } catch (error) {
      console.error('Error stopping strategy:', error);
      toast.error('Failed to stop strategy');
      
      // For demo, update the UI to show the strategy as stopped
      setStrategies(prevStrategies => 
        prevStrategies.map(s => 
          s.strategy_id === strategyId ? 
            { ...s, status: 'STOPPED', is_active: false } : s
        )
      );
      
      setFilteredStrategies(prevFiltered => 
        prevFiltered.map(s => 
          s.strategy_id === strategyId ? 
            { ...s, status: 'STOPPED', is_active: false } : s
        )
      );
    } finally {
      setIsProcessing(prev => ({ ...prev, [strategyId]: false }));
    }
  };

  // Fetch strategies when component mounts or wallet address changes
  useEffect(() => {
    fetchStrategies();
    
    // Set up interval to refresh strategies
    const interval = setInterval(fetchStrategies, 60000); // Refresh every minute
    
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [walletAddress]);

  // Calculate strategy profitability status
  const getStatusClass = (pnlPercent: number): string => {
    if (pnlPercent >= 5) return 'high-profit';
    if (pnlPercent > 0) return 'profit';
    if (pnlPercent < -5) return 'high-loss';
    return 'loss';
  };

  return (
    <div className="active-strategies">
      <div className="strategies-header">
        <h2>Your Trading Strategies</h2>
        <div className="strategies-controls">
          <div className="filter-controls">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => applyFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-button ${filter === 'active' ? 'active' : ''}`}
              onClick={() => applyFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-button ${filter === 'stopped' ? 'active' : ''}`}
              onClick={() => applyFilter('stopped')}
            >
              Stopped
            </button>
          </div>
          <button className="refresh-button" onClick={fetchStrategies} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading strategies...</p>
        </div>
      ) : filteredStrategies.length === 0 ? (
        <div className="no-strategies">
          <p>No {filter !== 'all' ? filter : ''} trading strategies found. You can create a strategy from the Agent Creation page.</p>
          <a href="/agentcreation" className="create-strategy-link">Create Trading Strategy</a>
        </div>
      ) : (
        <div className="strategies-container">
          {filteredStrategies.map((strategy) => (
            <div 
              key={strategy.strategy_id} 
              className={`strategy-card ${strategy.status.toLowerCase()} ${strategy.expanded ? 'expanded' : ''} ${getStatusClass(strategy.total_pnl_pct * 100)}`}
            >
              <div className="strategy-header">
                <div className="strategy-coin">
                  <div className="coin-icon">{strategy.coin_symbol.charAt(0)}</div>
                  <h3>{strategy.coin_symbol}</h3>
                </div>
                <div className={`strategy-status ${strategy.status.toLowerCase()}`}>
                  {strategy.status}
                </div>
              </div>
              
              <div className="strategy-metrics">
                <div className="metric">
                  <span className="metric-label">Strategy Type</span>
                  <span className="metric-value strategy-type">{strategy.strategy_name}</span>
                </div>
                
                <div className="metrics-row">
                  <div className="metric">
                    <span className="metric-label">Initial Capital</span>
                    <span className="metric-value">{formatCurrency(strategy.initial_capital)}</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Current Capital</span>
                    <span className="metric-value">{formatCurrency(strategy.current_capital)}</span>
                  </div>
                </div>
                
                <div className="metrics-row">
                  <div className="metric">
                    <span className="metric-label">Total P&L</span>
                    <span className={`metric-value ${strategy.total_pnl >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(strategy.total_pnl)}
                    </span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Return</span>
                    <span className={`metric-value ${strategy.total_pnl_pct >= 0 ? 'positive' : 'negative'}`}>
                      {strategy.total_pnl_pct >= 0 ? '+' : ''}{(strategy.total_pnl_pct * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="metrics-row">
                  <div className="metric">
                    <span className="metric-label">Completed Trades</span>
                    <span className="metric-value">{strategy.num_trades}</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Current Position</span>
                    <span className="metric-value position-status">
                      {strategy.position === 1 ? (
                        <>
                          <span className="position-indicator long"></span>
                          LONG
                        </>
                      ) : (
                        <>
                          <span className="position-indicator none"></span>
                          NO POSITION
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                {strategy.position === 1 && (
                  <div className="position-details">
                    <div className="metrics-row">
                      <div className="metric">
                        <span className="metric-label">Entry Price</span>
                        <span className="metric-value">{formatCurrency(strategy.entry_price)}</span>
                      </div>
                      
                      <div className="metric">
                        <span className="metric-label">Current Price</span>
                        <span className="metric-value">
                          {strategy.last_price_data ? 
                            formatCurrency(strategy.last_price_data.close) : 
                            'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="metrics-row">
                      <div className="metric">
                        <span className="metric-label">Holdings</span>
                        <span className="metric-value">{strategy.shares.toFixed(4)} {strategy.coin_symbol}</span>
                      </div>
                      
                      <div className="metric">
                        <span className="metric-label">Unrealized P&L</span>
                        <span className={`metric-value ${strategy.unrealized_pnl >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(strategy.unrealized_pnl)} 
                          ({strategy.unrealized_pnl_pct >= 0 ? '+' : ''}
                          {(strategy.unrealized_pnl_pct * 100).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {strategy.last_price_data && (
                  <div className="last-update">
                    Last updated: {formatTimestamp(strategy.last_price_data.timestamp)}
                  </div>
                )}
              </div>
              
              <div className="strategy-params">
                <h4>Strategy Parameters</h4>
                <div className="params-grid">
                  {Object.entries(strategy.strategy_params).map(([key, value]) => (
                    <div key={key} className="param-item">
                      <span className="param-name">
                        {key.replace(/_/g, ' ').replace(/rsi/i, 'RSI')}
                      </span>
                      <span className="param-value">{value}</span>
                    </div>
                  ))}
                  
                  <div className="param-item">
                    <span className="param-name">Stop Loss</span>
                    <span className="param-value">{(strategy.stop_loss_pct * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="param-item">
                    <span className="param-name">Take Profit</span>
                    <span className="param-value">{(strategy.take_profit_pct * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Trade History Section */}
              {strategy.trades && strategy.trades.length > 0 && (
                <div className="trade-history-section">
                  <div 
                    className="trade-history-header"
                    onClick={() => toggleStrategyExpanded(strategy.strategy_id)}
                  >
                    <h4>Trade History</h4>
                    <span className={`expand-icon ${strategy.expanded ? 'expanded' : ''}`}>
                      {strategy.expanded ? '▲' : '▼'}
                    </span>
                  </div>
                  
                  {strategy.expanded && (
                    <div className="trade-history-content">
                      <div className="trade-table-header">
                        <div className="trade-col date">Date</div>
                        <div className="trade-col action">Action</div>
                        <div className="trade-col price">Price</div>
                        <div className="trade-col amount">Amount</div>
                        <div className="trade-col value">Value</div>
                        <div className="trade-col pnl">P&L</div>
                      </div>
                      
                      <div className="trade-table-body">
                        {strategy.trades.map((trade, idx) => (
                          <div key={trade.trade_id} className={`trade-row ${trade.action.toLowerCase()}`}>
                            <div className="trade-col date">{formatTimestamp(trade.timestamp)}</div>
                            <div className="trade-col action">
                              <span className={`action-badge ${trade.action.toLowerCase()}`}>
                                {trade.action}
                              </span>
                            </div>
                            <div className="trade-col price">
                              {trade.price < 0.01 ? trade.price.toFixed(12) : formatCurrency(trade.price)}
                            </div>
                            <div className="trade-col amount">{trade.amount.toFixed(4)}</div>
                            <div className="trade-col value">{formatCurrency(trade.value)}</div>
                            <div className="trade-col pnl">
                              {trade.pnl !== undefined ? (
                                <span className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                                  {formatCurrency(trade.pnl)} 
                                  ({trade.pnl_pct !== undefined ? (
                                    <>
                                      {trade.pnl_pct >= 0 ? '+' : ''}
                                      {(trade.pnl_pct * 100).toFixed(2)}%
                                    </>
                                  ) : '-'})
                                </span>
                              ) : '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {strategy.status === 'ACTIVE' && (
                <div className="strategy-actions">
                  <button 
                    className="stop-strategy-btn" 
                    onClick={() => stopStrategy(strategy.strategy_id)}
                    disabled={isProcessing[strategy.strategy_id]}
                  >
                    {isProcessing[strategy.strategy_id] ? (
                      <>
                        <div className="button-spinner"></div>
                        <span>Stopping...</span>
                      </>
                    ) : (
                      <>
                        <span className="stop-icon">■</span>
                        <span>Stop Strategy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveStrategies;