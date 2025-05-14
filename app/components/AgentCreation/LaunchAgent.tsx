"use client";

import React, { useState } from 'react';
import AIChat from './AIChat';
import './LaunchAgent.css';
import Background from '../Background';

const LaunchAgent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [backtestResults, setBacktestResults] = useState<any>(null);

  // Agent configuration state
  const [agentConfig, setAgentConfig] = useState({
    name: 'Alpha Momentum Agent',
    description: 'An AI-powered trading agent that uses momentum strategy to capture market trends.',
    type: 'Machine Learning/AI'
  });

  // Trading strategy state
  const [strategyConfig, setStrategyConfig] = useState({
    pairs: ['BTC/USDT', 'ETH/USDT'],
    allocationType: 'Equal Weighting',
    maxAllocation: 50,
    algorithm: 'Momentum',
    parameters: {
      lookbackPeriod: 14,
      rsiThresholdHigh: 70,
      rsiThresholdLow: 30,
      stopLoss: 8,
      trailingStop: true
    }
  });

  // Token economics state
  const [tokenConfig, setTokenConfig] = useState({
    symbol: 'ALPHA',
    initialSupply: 10000000,
    communityAllocation: 70,
    performanceFee: 20
  });

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const runBacktest = (config?: any) => {
    // Create mock backtest results
    setTimeout(() => {
      const mockResults = {
        totalReturns: 127.4,
        annualizedReturn: 23.8,
        sharpeRatio: 1.87,
        maxDrawdown: 28.4,
        winRate: 63.2,
        trades: 156,
        successfulTrades: 98,
        averageReturn: 1.2,
        volatility: 12.7,
        monthlyReturns: [3.2, -1.8, 5.7, 2.1, -4.3, 6.8, 2.5, 3.9, -2.1, 4.3, 1.9, -3.2],
        equityCurve: Array.from({ length: 24 }, (_, i) => ({
          date: `2024-${(i % 12) + 1}-01`,
          value: 10000 * Math.pow(1.02, i) * (1 + Math.sin(i) * 0.05)
        })),
        benchmarkComparison: Array.from({ length: 24 }, (_, i) => ({
          date: `2024-${(i % 12) + 1}-01`,
          strategy: 10000 * Math.pow(1.02, i) * (1 + Math.sin(i) * 0.05),
          benchmark: 10000 * Math.pow(1.01, i) * (1 + Math.cos(i) * 0.03)
        })),
        drawdownPeriods: [
          { start: '2024-03-15', end: '2024-04-28', depth: 28.4 },
          { start: '2024-08-03', end: '2024-08-29', depth: 15.7 },
          { start: '2024-11-12', end: '2024-12-18', depth: 18.9 }
        ]
      };
      
      setBacktestResults(mockResults);
    }, 3000);
  };

  return (
    <>
      <Background />
      <div className="launch-agent-container">
        <div className="launch-page-hero">
          <h1>Launch Your Trading Agent</h1>
          <div className="launch-hero-subtitle">
            Create a tokenized AI trading agent that can trade on your behalf and attract investors
          </div>
        </div>
        
        <div className="launch-progress-bar">
          <div className="progress-steps">
            <div className={`progress-step ${currentStep === 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Agent Details</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep === 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Strategy</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep === 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Backtest</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep === 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Token Economics</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep === 5 ? 'active' : ''}`}>
              <div className="step-number">5</div>
              <div className="step-label">Launch</div>
            </div>
          </div>
        </div>
        
        <div className="launch-agent-content centered">
          <AIChat 
            currentStep={currentStep} 
            nextStep={nextStep}
            prevStep={prevStep}
            agentConfig={agentConfig}
            setAgentConfig={setAgentConfig}
            strategyConfig={strategyConfig}
            setStrategyConfig={setStrategyConfig}
            tokenConfig={tokenConfig}
            setTokenConfig={setTokenConfig}
            backtestResults={backtestResults}
            runBacktest={runBacktest}
          />
        </div>
      </div>
    </>
  );
};

export default LaunchAgent;