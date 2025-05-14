import React, { useState } from 'react';
import './AgentStrategy.css';

interface StrategyConfig {
  pairs: string[];
  allocationType: string;
  maxAllocation: number;
  algorithm: string;
  parameters: {
    lookbackPeriod: number;
    rsiThresholdHigh: number;
    rsiThresholdLow: number;
    stopLoss: number;
    trailingStop: boolean;
  };
}

interface AgentStrategyProps {
  strategyConfig: StrategyConfig;
  setStrategyConfig: React.Dispatch<React.SetStateAction<StrategyConfig>>;
  nextStep: () => void;
  prevStep: () => void;
  runBacktest: () => void;
  backtestRunning: boolean;
}

const AgentStrategy: React.FC<AgentStrategyProps> = ({
  strategyConfig,
  setStrategyConfig,
  nextStep,
  prevStep,
  runBacktest,
  backtestRunning
}) => {
  const [newPair, setNewPair] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStrategyConfig({
      ...strategyConfig,
      [name]: name === 'maxAllocation' ? Number(value) : value
    });
  };

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setStrategyConfig({
      ...strategyConfig,
      parameters: {
        ...strategyConfig.parameters,
        [name]: type === 'checkbox' ? checked : Number(value)
      }
    });
  };

  const handleAddPair = () => {
    if (newPair && !strategyConfig.pairs.includes(newPair)) {
      setStrategyConfig({
        ...strategyConfig,
        pairs: [...strategyConfig.pairs, newPair]
      });
      setNewPair('');
    }
  };

  const handleRemovePair = (pairToRemove: string) => {
    setStrategyConfig({
      ...strategyConfig,
      pairs: strategyConfig.pairs.filter(pair => pair !== pairToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runBacktest();
    nextStep();
  };

  return (
    <div className="strategy-config-container">
      <h2 className="config-section-title">Trading Configuration</h2>
      
      <div className="strategy-tabs">
        <div className="strategy-tab active">Assets & Pairs</div>
        <div className="strategy-tab">Algorithm</div>
        <div className="strategy-tab">Parameters</div>
      </div>
      
      <form onSubmit={handleSubmit} className="strategy-form">
        <div className="form-section">
          <h3>Selected Trading Pairs</h3>
          
          <div className="trading-pairs-list">
            {strategyConfig.pairs.map((pair, index) => (
              <div key={index} className="trading-pair-item">
                <div className="pair-icon">
                  {pair.split('/')[0].charAt(0)}{pair.split('/')[1].charAt(0)}
                </div>
                <span>{pair}</span>
                <button 
                  type="button" 
                  className="remove-pair"
                  onClick={() => handleRemovePair(pair)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <div className="add-trading-pair">
            <input
              type="text"
              value={newPair}
              onChange={(e) => setNewPair(e.target.value)}
              placeholder="Add trading pair (e.g. SOL/USDT)"
            />
            <button type="button" onClick={handleAddPair} className="add-pair-button">
              + Add Trading Pair
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="allocationType">Allocation Strategy</label>
            <select
              id="allocationType"
              name="allocationType"
              value={strategyConfig.allocationType}
              onChange={handleChange}
            >
              <option value="Equal Weighting">Equal Weighting</option>
              <option value="Market Cap Weighted">Market Cap Weighted</option>
              <option value="Volatility Weighted">Volatility Weighted</option>
              <option value="Custom Allocation">Custom Allocation</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="maxAllocation">Maximum Allocation per Asset</label>
            <div className="input-with-suffix">
              <input
                id="maxAllocation"
                type="number"
                name="maxAllocation"
                value={strategyConfig.maxAllocation}
                onChange={handleChange}
                min="1"
                max="100"
              />
              <span className="input-suffix">%</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Algorithm Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="algorithm">Trading Algorithm</label>
            <select
              id="algorithm"
              name="algorithm"
              value={strategyConfig.algorithm}
              onChange={handleChange}
            >
              <option value="Momentum">Momentum</option>
              <option value="Mean Reversion">Mean Reversion</option>
              <option value="Breakout">Breakout</option>
              <option value="Dollar Cost Averaging">Dollar Cost Averaging</option>
            </select>
          </div>
          
          {strategyConfig.algorithm === "Momentum" && (
            <div className="algorithm-parameters">
              <div className="form-group">
                <label htmlFor="lookbackPeriod">Lookback Period (Days)</label>
                <input
                  id="lookbackPeriod"
                  type="number"
                  name="lookbackPeriod"
                  value={strategyConfig.parameters.lookbackPeriod}
                  onChange={handleParameterChange}
                  min="1"
                  max="200"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="rsiThresholdHigh">RSI Overbought Threshold</label>
                <div className="input-with-suffix">
                  <input
                    id="rsiThresholdHigh"
                    type="number"
                    name="rsiThresholdHigh"
                    value={strategyConfig.parameters.rsiThresholdHigh}
                    onChange={handleParameterChange}
                    min="51"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="rsiThresholdLow">RSI Oversold Threshold</label>
                <div className="input-with-suffix">
                  <input
                    id="rsiThresholdLow"
                    type="number"
                    name="rsiThresholdLow"
                    value={strategyConfig.parameters.rsiThresholdLow}
                    onChange={handleParameterChange}
                    min="1"
                    max="49"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="stopLoss">Stop Loss</label>
                <div className="input-with-suffix">
                  <input
                    id="stopLoss"
                    type="number"
                    name="stopLoss"
                    value={strategyConfig.parameters.stopLoss}
                    onChange={handleParameterChange}
                    min="1"
                    max="100"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>
              
              <div className="form-group checkbox">
                <label htmlFor="trailingStop">
                  <input
                    id="trailingStop"
                    type="checkbox"
                    name="trailingStop"
                    checked={strategyConfig.parameters.trailingStop}
                    onChange={handleParameterChange}
                  />
                  <span>Use Trailing Stop</span>
                </label>
              </div>
            </div>
          )}
          
          <div className="backtest-button-container">
            <button 
              type="button" 
              className="backtest-button" 
              onClick={runBacktest}
              disabled={backtestRunning}
            >
              {backtestRunning ? 'Running...' : 'Run Backtest'}
            </button>
          </div>
        </div>
        
        <div className="strategy-actions">
          <button type="button" className="back-button" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="next-button">
            Continue to Backtest Results
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentStrategy;