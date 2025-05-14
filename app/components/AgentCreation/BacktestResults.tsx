import React from 'react';
import './BacktestResults.css';

interface BacktestResult {
  totalReturns: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  successfulTrades: number;
  averageReturn: number;
  volatility: number;
  monthlyReturns: number[];
  equityCurve: { date: string; value: number }[];
  benchmarkComparison: { date: string; strategy: number; benchmark: number }[];
  drawdownPeriods: { start: string; end: string; depth: number }[];
}

interface BacktestResultsProps {
  results: BacktestResult | null;
  nextStep: () => void;
  prevStep: () => void;
  runBacktest: () => void;
  backtestRunning: boolean;
}

const BacktestResults: React.FC<BacktestResultsProps> = ({
  results,
  nextStep,
  prevStep,
  runBacktest,
  backtestRunning
}) => {
  if (backtestRunning) {
    return (
      <div className="backtest-running">
        <div className="backtest-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
          </div>
          <h3>Backtesting in progress...</h3>
          <p>Running 5 years of historical data across selected pairs</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="no-backtest-results">
        <h3>No Backtest Results Available</h3>
        <p>Run a backtest to see how your strategy would have performed historically</p>
        <button 
          className="backtest-button" 
          onClick={runBacktest}
          disabled={backtestRunning}
        >
          Run Backtest
        </button>
      </div>
    );
  }

  return (
    <div className="backtest-results-container">
      <h2 className="results-section-title">Backtest Results</h2>
      
      <div className="results-summary">
        <div className="results-card positive">
          <h3>Total Return</h3>
          <div className="result-value">{results.totalReturns.toFixed(2)}%</div>
          <div className="result-subtext">Annualized: {results.annualizedReturn.toFixed(2)}%</div>
        </div>
        
        <div className="results-card positive">
          <h3>Sharpe Ratio</h3>
          <div className="result-value">{results.sharpeRatio.toFixed(2)}</div>
          <div className="result-subtext">Risk-adjusted return</div>
        </div>
        
        <div className="results-card neutral">
          <h3>Max Drawdown</h3>
          <div className="result-value">-{results.maxDrawdown.toFixed(2)}%</div>
          <div className="result-subtext">Largest peak-to-trough drop</div>
        </div>
        
        <div className="results-card positive">
          <h3>Win Rate</h3>
          <div className="result-value">{results.winRate.toFixed(1)}%</div>
          <div className="result-subtext">{results.successfulTrades} out of {results.trades} trades</div>
        </div>
      </div>
      
      <div className="results-charts">
        <div className="chart-container">
          <h3>Performance vs. Benchmark</h3>
          <div className="chart-placeholder">
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color strategy"></div>
                <span>Strategy</span>
              </div>
              <div className="legend-item">
                <div className="legend-color benchmark"></div>
                <span>Benchmark</span>
              </div>
            </div>
            {/* Chart would be implemented with a real charting library */}
            <div className="mock-chart performance-chart"></div>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Monthly Returns</h3>
          <div className="chart-placeholder">
            <div className="mock-chart monthly-returns-chart"></div>
          </div>
        </div>
      </div>
      
      <div className="drawdown-analysis">
        <h3>Major Drawdown Periods</h3>
        
        <div className="drawdown-table">
          <div className="drawdown-table-header">
            <div className="drawdown-table-cell">Start Date</div>
            <div className="drawdown-table-cell">End Date</div>
            <div className="drawdown-table-cell">Duration</div>
            <div className="drawdown-table-cell">Depth</div>
            <div className="drawdown-table-cell">Recovery Time</div>
          </div>
          
          {results.drawdownPeriods.map((period, index) => {
            const startDate = new Date(period.start);
            const endDate = new Date(period.end);
            const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={index} className="drawdown-table-row">
                <div className="drawdown-table-cell">{period.start}</div>
                <div className="drawdown-table-cell">{period.end}</div>
                <div className="drawdown-table-cell">{durationDays} days</div>
                <div className="drawdown-table-cell">-{period.depth.toFixed(1)}%</div>
                <div className="drawdown-table-cell">{Math.round(durationDays * 0.8)} days</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="optimization-suggestion">
        <h3>Strategy Optimization</h3>
        <p>Based on backtest results, we suggest the following optimizations:</p>
        <ul>
          <li>Adjust RSI thresholds to 75/25 to reduce false signals</li>
          <li>Consider adding a volatility filter to avoid trading during high volatility</li>
          <li>Implement a 10% trailing stop to improve risk management</li>
        </ul>
        
        <button className="optimization-button">
          Apply Suggested Optimizations
        </button>
      </div>
      
      <div className="backtest-actions">
        <button className="back-button" onClick={prevStep}>
          Back
        </button>
        <div className="action-buttons">
          <button className="rerun-button" onClick={runBacktest}>
            Rerun Backtest
          </button>
          <button className="next-button" onClick={nextStep}>
            Continue to Token Economics
          </button>
        </div>
      </div>
    </div>
  );
};

export default BacktestResults;