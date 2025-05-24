import React, { useState, useEffect } from 'react';
import { WalletAccount } from '@mysten/wallet-standard';
import { toast } from 'sonner';
import './AgentConfiguration.css';

interface TokenDeployment {
  _id: string;
  module_name: string;
  token_name: string;
  token_symbol: string;
  description: string;
  package_id: string;
  transaction_id: string;
  decimals: number;
  url: string;
  profit_taking_period_hours: number;
  profit_taking_percentage: number;
  initial_amount: number;
  transfer_address: string;
  token_account_address?: string;
  token_account_public_key?: string;
  deployment_result?: {
    name: string;
    symbol: string;
    description: string;
    PackageID: string;
    owner: string;
    decimals: number;
    transactionData: string;
    url: string;
    date: string;
  };
}

interface AgentConfigProps {
  agentConfig: any;
  setAgentConfig: (config: any) => void;
  nextStep: () => void;
  userAccount: WalletAccount;
  existingAgents?: TokenDeployment[];
  isLoading?: boolean;
  onDeploy: (agentData: any) => Promise<any>;
}

const AgentConfiguration: React.FC<AgentConfigProps> = ({ 
  agentConfig, 
  setAgentConfig, 
  nextStep,
  userAccount,
  existingAgents = [],
  isLoading = false,
  onDeploy
}) => {
  const [deploymentMode, setDeploymentMode] = useState<'existing' | 'new'>('new');
  const [deploying, setDeploying] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [deploymentSuccess, setDeploymentSuccess] = useState<boolean | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  useEffect(() => {
    if (existingAgents.length > 0) {
      setDeploymentMode('existing');
      setSelectedAgentId(existingAgents[0]._id);
      
      // Auto-select the first agent
      handleAgentSelect(existingAgents[0]._id);
    }
  }, [existingAgents]);

  // Update transfer address when user account changes
  useEffect(() => {
    if (userAccount?.address) {
      setAgentConfig(prev => ({
        ...prev,
        transfer_address: userAccount.address
      }));
    }
  }, [userAccount, setAgentConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAgentConfig({
      ...agentConfig,
      [name]: name === 'initial_amount' || name === 'decimals' || 
              name === 'profit_taking_period_hours' || name === 'profit_taking_percentage' 
              ? Number(value) : value
    });
  };

  const handleAgentSelect = (agentId: string) => {
    const selectedAgent = existingAgents.find(agent => agent._id === agentId);
    if (selectedAgent) {
      setSelectedAgentId(agentId);
      setAgentConfig(selectedAgent);
    }
  };

  const handleDeployToken = async () => {
    if (!userAccount?.address) {
      toast.error("Wallet address not available");
      return;
    }
    
    try {
      setDeploying(true);
      setDeploymentError(null);
      
      // Prepare deployment data
      const deployData = {
        module_name: agentConfig.module_name || agentConfig.token_name.replace(/\s+/g, ''),
        token_name: agentConfig.token_name,
        token_symbol: agentConfig.token_symbol,
        decimals: agentConfig.decimals,
        description: agentConfig.description,
        initial_amount: agentConfig.initial_amount,
        transfer_address: userAccount.address,
        url: agentConfig.url,
        profit_taking_period_hours: agentConfig.profit_taking_period_hours,
        profit_taking_percentage: agentConfig.profit_taking_percentage
      };
      
      // Call the deployment function passed from the parent
      const deployedData = await onDeploy(deployData);
      
      // Update with deployed data
      setAgentConfig({
        ...agentConfig,
        ...deployedData,
        _id: deployedData.mongodb_id || deployedData._id
      });
      setDeploymentSuccess(true);
      
      // Continue to next step after a short delay
      setTimeout(() => {
        setAgentConfig(deployedData);
        nextStep();
      }, 3000);
    } catch (error: any) {
      console.error('Error deploying token:', error);
      setDeploymentError(error.message || 'An error occurred during deployment');
      setDeploymentSuccess(false);
    } finally {
      setDeploying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deploymentMode === 'existing') {
      // Continue with selected agent
      nextStep();
    } else {
      // Deploy new agent token
      handleDeployToken();
    }
  };

  if (isLoading) {
    return (
      <div className="agent-config-container">
        {showBanner && (
          <div className="beta-banner">
            <div className="banner-content">
              <span role="img" aria-label="rocket" className="banner-icon">🚀</span>
              <p><strong>Limited Time Beta Offer:</strong> Gas fees for Agent Token deployment are FREE! Deploy now before this offer ends.</p>
              <button className="banner-close" onClick={() => setShowBanner(false)}>×</button>
            </div>
          </div>
        )}
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading your existing agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-config-container">
      {showBanner && (
        <div className="beta-banner">
          <div className="banner-content">
            <span role="img" aria-label="rocket" className="banner-icon">🚀</span>
            <p><strong>Limited Time Beta Offer:</strong> Gas fees for Agent Token deployment are FREE! Deploy now before this offer ends.</p>
            <button className="banner-close" onClick={() => setShowBanner(false)}>×</button>
          </div>
        </div>
      )}
      
      <div className="wallet-connection-info">
        <div className="wallet-label">Connected:</div>
        <div className="wallet-address">
          {userAccount?.address.slice(0, 8)}...{userAccount?.address.slice(-6)}
        </div>
      </div>
      
      <h2 className="config-section-title">Agent Token</h2>
      <p className="config-description">
        Before using AI agents for trading, you need to create or select an Agent Token. 
        This token represents your trading agent on the blockchain and allows for profit sharing.
      </p>
      
      {existingAgents.length > 0 && (
        <div className="deployment-selection">
          <h3>Choose Option</h3>
          <div className="deployment-options">
            <button 
              type="button" 
              className={`option-btn ${deploymentMode === 'existing' ? 'selected' : ''}`}
              onClick={() => setDeploymentMode('existing')}
            >
              Use Existing Agent Token
            </button>
            <button 
              type="button" 
              className={`option-btn ${deploymentMode === 'new' ? 'selected' : ''}`}
              onClick={() => setDeploymentMode('new')}
            >
              Create New Agent Token
            </button>
          </div>
        </div>
      )}
      
      {deploymentMode === 'existing' && existingAgents.length > 0 && (
        <div className="existing-tokens">
          <div className="form-group">
            <label htmlFor="existing-token">Select Existing Agent Token</label>
            <select
              id="existing-token"
              value={selectedAgentId}
              onChange={(e) => handleAgentSelect(e.target.value)}
              required
            >
              {existingAgents.map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.token_name} ({agent.token_symbol})
                </option>
              ))}
            </select>
          </div>
          
          {selectedAgentId && (
            <div className="token-details">
              <h4>Selected Agent Details</h4>
              <div className="token-details-grid">
                <div className="token-detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{agentConfig.token_name}</span>
                </div>
                <div className="token-detail-item">
                  <span className="detail-label">Symbol:</span>
                  <span className="detail-value">{agentConfig.token_symbol}</span>
                </div>
                <div className="token-detail-item">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{agentConfig.description}</span>
                </div>
                <div className="token-detail-item">
                  <span className="detail-label">Package ID:</span>
                  <span className="detail-value">{agentConfig.package_id}</span>
                </div>
                <div className="token-detail-item">
                  <span className="detail-label">Profit Taking:</span>
                  <span className="detail-value">{agentConfig.profit_taking_percentage}% every {agentConfig.profit_taking_period_hours} hours</span>
                </div>
                <div className="token-detail-item token-detail-links">
                  <a 
                    href={`https://suiscan.xyz/mainnet/tx/${agentConfig.transaction_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <div className="config-actions">
            <button 
              className="continue-button" 
              onClick={nextStep}
              disabled={!selectedAgentId}
            >
              Continue with Selected Agent
            </button>
          </div>
        </div>
      )}
      
      {deploymentMode === 'new' && (
        <div className="new-token-form">
          {deploymentSuccess === true ? (
            <div className="deployment-success">
              <div className="success-icon">✓</div>
              <h3>Agent Token Deployed Successfully!</h3>
              <p>Your agent token has been created on the blockchain.</p>
              <div className="token-details">
                <div className="token-detail-item">
                  <span className="detail-label">Token Name:</span>
                  <span className="detail-value">{agentConfig.token_name}</span>
                </div>
                <div className="token-detail-item">
                  <span className="detail-label">Token Symbol:</span>
                  <span className="detail-value">{agentConfig.token_symbol}</span>
                </div>
                <div className="token-detail-item">
                  <span className="detail-label">Package ID:</span>
                  <span className="detail-value">{agentConfig.package_id}</span>
                </div>
                <div className="token-detail-item token-detail-links">
                  <a 
                    href={`https://suiscan.xyz/mainnet/tx/${agentConfig.transaction_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
              <p className="proceeding-text">Proceeding to AI Agent configuration...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="agent-form">
              <div className="form-group">
                <label htmlFor="token-name">Agent Token Name</label>
                <input
                  id="token-name"
                  type="text"
                  name="token_name"
                  value={agentConfig.token_name}
                  onChange={handleChange}
                  placeholder="e.g. Alpha Momentum Agent"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="token-symbol">Token Symbol</label>
                <input
                  id="token-symbol"
                  type="text"
                  name="token_symbol"
                  value={agentConfig.token_symbol}
                  onChange={handleChange}
                  placeholder="3-5 letter symbol (e.g. AMA)"
                  maxLength={5}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={agentConfig.description}
                  onChange={handleChange}
                  placeholder="Describe what your AI agent will do..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="advanced-toggle">
                <button 
                  type="button" 
                  className="toggle-button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </button>
              </div>
              
              {showAdvanced && (
                <div className="advanced-options">
                  <div className="form-group">
                    <label htmlFor="module-name">Module Name (No spaces)</label>
                    <input
                      id="module-name"
                      type="text"
                      name="module_name"
                      value={agentConfig.module_name}
                      onChange={handleChange}
                      placeholder="AlphaMomentumAgent"
                      pattern="^[a-zA-Z0-9_]+$"
                    />
                    <small>Only letters, numbers, and underscores allowed</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="decimals">Token Decimals</label>
                    <input
                      id="decimals"
                      type="number"
                      name="decimals"
                      value={agentConfig.decimals}
                      onChange={handleChange}
                      min={0}
                      max={18}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="initial-amount">Initial Token Amount</label>
                    <input
                      id="initial-amount"
                      type="number"
                      name="initial_amount"
                      value={agentConfig.initial_amount}
                      onChange={handleChange}
                      min={1}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="url">Token Icon URL</label>
                    <input
                      id="url"
                      type="url"
                      name="url"
                      value={agentConfig.url}
                      onChange={handleChange}
                      placeholder="https://example.com/token-icon.png"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group half-width">
                      <label htmlFor="profit-period">Profit Taking Period (hours)</label>
                      <input
                        id="profit-period"
                        type="number"
                        name="profit_taking_period_hours"
                        value={agentConfig.profit_taking_period_hours}
                        onChange={handleChange}
                        min={1}
                      />
                    </div>
                    
                    <div className="form-group half-width">
                      <label htmlFor="profit-percentage">Profit Taking Percentage</label>
                      <input
                        id="profit-percentage"
                        type="number"
                        name="profit_taking_percentage"
                        value={agentConfig.profit_taking_percentage}
                        onChange={handleChange}
                        min={1}
                        max={50}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {deploymentError && (
                <div className="deployment-error">
                  <p>{deploymentError}</p>
                </div>
              )}
              
              <div className="config-actions">
                <button 
                  type="submit" 
                  className="deploy-button" 
                  disabled={deploying}
                >
                  {deploying ? 
                    <>
                      <div className="button-loader"></div> 
                      <span>Deploying...</span>
                    </> : 
                    'Deploy Agent Token'
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentConfiguration;