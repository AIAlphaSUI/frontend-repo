import React, { useState } from 'react';
import './LaunchSummary.css';

interface LaunchSummaryProps {
  agentConfig: {
    name: string;
    description: string;
    type: string;
  };
  tokenConfig: {
    symbol: string;
    initialSupply: number;
    communityAllocation: number;
    performanceFee: number;
  };
  strategyConfig: {
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
  };
  backtestResults: any;
  prevStep: () => void;
}

const LaunchSummary: React.FC<LaunchSummaryProps> = ({
  agentConfig,
  tokenConfig,
  strategyConfig,
  backtestResults,
  prevStep
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');

  const handleLaunch = () => {
    setIsLaunching(true);
    setDeploymentStatus('Connecting to wallet...');
    
    // Simulate deployment process
    setTimeout(() => {
      setDeploymentStatus('Deploying agent smart contract...');
      setTimeout(() => {
        setDeploymentStatus('Initializing strategy encryption...');
        setTimeout(() => {
          setDeploymentStatus('Minting tokens...');
          setTimeout(() => {
            setDeploymentStatus('Setting up profit sharing mechanics...');
            setTimeout(() => {
              setDeploymentStatus('Deployment complete!');
              setIsLaunching(false);
              setIsLaunched(true);
            }, 1500);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  if (isLaunched) {
    return (
      <div className="launch-success">
        <div className="success-icon">🚀</div>
        <h2>Congratulations! Your Agent Is Live</h2>
        <p>Your AI trading agent has been successfully deployed and can now be accessed by investors.</p>
        
        <div className="agent-details-card">
          <div className="agent-card-header">
            <h3>{agentConfig.name}</h3>
            <span className="agent-live-tag">LIVE</span>
          </div>
          <div className="agent-card-body">
            <div className="agent-info-item">
              <span className="label">Agent Type:</span>
              <span className="value">{agentConfig.type}</span>
            </div>
            <div className="agent-info-item">
              <span className="label">Strategy:</span>
              <span className="value">{strategyConfig.algorithm}</span>
            </div>
            <div className="agent-info-item">
              <span className="label">Trading Pairs:</span>
              <span className="value">{strategyConfig.pairs.join(', ')}</span>
            </div>
            <div className="agent-info-item">
              <span className="label">Token Symbol:</span>
              <span className="value">{tokenConfig.symbol}</span>
            </div>
          </div>
        </div>
        
        <div className="next-steps">
          <h3>Next Steps</h3>
          <div className="next-steps-grid">
            <div className="next-step-card">
              <div className="step-icon">📊</div>
              <h4>Monitor Performance</h4>
              <p>Track your agent's trading activity and profits in real-time</p>
              <button className="next-step-button">Go to Dashboard</button>
            </div>
            <div className="next-step-card">
              <div className="step-icon">💼</div>
              <h4>Attract Investors</h4>
              <p>Share your agent with potential investors to grow your fund</p>
              <button className="next-step-button">Create Campaign</button>
            </div>
            <div className="next-step-card">
              <div className="step-icon">⚙️</div>
              <h4>Fine-tune Strategy</h4>
              <p>Optimize your trading strategy based on real market performance</p>
              <button className="next-step-button">Adjust Parameters</button>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="create-new-button">Create Another Agent</button>
          <button className="dashboard-button">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="launch-summary-container">
      <h2 className="summary-title">Review & Launch</h2>
      
      {isLaunching ? (
        <div className="deployment-in-progress">
          <div className="deployment-animation">
            <div className="deployment-spinner"></div>
          </div>
          <h3>Deploying Your Trading Agent</h3>
          <div className="deployment-status">{deploymentStatus}</div>
          <div className="deployment-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
          <p className="deployment-note">Please keep this tab open until deployment is complete...</p>
        </div>
      ) : (
        <>
          <div className="summary-sections">
            <div className="summary-section">
              <h3>Agent Details</h3>
              <div className="summary-details">
                <div className="summary-item">
                  <span className="item-label">Name</span>
                  <span className="item-value">{agentConfig.name || 'N/A'}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Type</span>
                  <span className="item-value">{agentConfig.type}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Description</span>
                  <span className="item-value description">{agentConfig.description || 'No description provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="summary-section">
              <h3>Trading Strategy</h3>
              <div className="summary-details">
                <div className="summary-item">
                  <span className="item-label">Algorithm</span>
                  <span className="item-value">{strategyConfig.algorithm}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Trading Pairs</span>
                  <span className="item-value">{strategyConfig.pairs.join(', ')}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Allocation Type</span>
                  <span className="item-value">{strategyConfig.allocationType}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Risk Management</span>
                  <span className="item-value">
                    {strategyConfig.parameters.stopLoss}% stop loss
                    {strategyConfig.parameters.trailingStop ? ' (trailing)' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="summary-section">
              <h3>Backtest Results</h3>
              <div className="summary-details">
                {backtestResults ? (
                  <>
                    <div className="summary-item">
                      <span className="item-label">Total Return</span>
                      <span className="item-value positive">+{backtestResults.totalReturns.toFixed(1)}%</span>
                    </div>
                    <div className="summary-item">
                      <span className="item-label">Sharpe Ratio</span>
                      <span className="item-value">{backtestResults.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="item-label">Max Drawdown</span>
                      <span className="item-value negative">-{backtestResults.maxDrawdown.toFixed(1)}%</span>
                    </div>
                    <div className="summary-item">
                      <span className="item-label">Win Rate</span>
                      <span className="item-value">{backtestResults.winRate.toFixed(1)}%</span>
                    </div>
                  </>
                ) : (
                  <span className="no-backtest">No backtest results available</span>
                )}
              </div>
            </div>
            
            <div className="summary-section">
              <h3>Token Economics</h3>
              <div className="summary-details">
                <div className="summary-item">
                  <span className="item-label">Token Symbol</span>
                  <span className="item-value">{tokenConfig.symbol || 'N/A'}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Initial Supply</span>
                  <span className="item-value">{tokenConfig.initialSupply.toLocaleString()} tokens</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Community Allocation</span>
                  <span className="item-value">{tokenConfig.communityAllocation}%</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Performance Fee</span>
                  <span className="item-value">{tokenConfig.performanceFee}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="launch-requirements">
            <h3>Launch Requirements</h3>
            <div className="requirements-list">
              <div className="requirement-item fulfilled">
                <div className="requirement-check">✓</div>
                <div className="requirement-text">Agent configuration complete</div>
              </div>
              <div className="requirement-item fulfilled">
                <div className="requirement-check">✓</div>
                <div className="requirement-text">Strategy parameters defined</div>
              </div>
              <div className={`requirement-item ${backtestResults ? 'fulfilled' : 'unfulfilled'}`}>
                <div className="requirement-check">{backtestResults ? '✓' : '!'}</div>
                <div className="requirement-text">Backtest performed</div>
              </div>
              <div className="requirement-item fulfilled">
                <div className="requirement-check">✓</div>
                <div className="requirement-text">Token economics configured</div>
              </div>
              <div className="requirement-item unfulfilled">
                <div className="requirement-check">!</div>
                <div className="requirement-text">Wallet connection required</div>
              </div>
            </div>
          </div>
          
          <div className="summary-actions">
            <button type="button" className="back-button" onClick={prevStep}>
              Back
            </button>
            <button 
              className="launch-button"
              onClick={handleLaunch}
              disabled={isLaunching || !backtestResults || !tokenConfig.symbol}
            >
              Launch Agent & Create Token
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LaunchSummary;