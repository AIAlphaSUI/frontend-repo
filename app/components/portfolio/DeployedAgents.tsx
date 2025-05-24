import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './DeployedAgents.css';

interface AgentToken {
  _id: string;
  module_name: string;
  token_name: string;
  token_symbol: string;
  token_symbol_lower: string;
  decimals: number;
  description: string;
  initial_amount: number;
  transfer_address: string;
  url: string;
  token_account_address: string;
  token_account_public_key: string;
  profit_taking_period_hours: number;
  profit_taking_percentage: number;
  deployment_result: {
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
  package_id: string;
  treasury_cap_id: string;
  token_config_id: string;
  transaction_id: string;
  timestamp: string;
}

interface DeployedAgentsProps {
  walletAddress?: string;
}

const DeployedAgents: React.FC<DeployedAgentsProps> = ({ walletAddress }) => {
  const [agents, setAgents] = useState<AgentToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch deployed agent tokens
  const fetchDeployedAgents = async () => {
    if (!walletAddress) {
      setAgents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/token-deployments?address=${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setAgents(data.data);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching deployed agents:', error);
      toast.error('Failed to load your deployed agent tokens');
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployedAgents();
  }, [walletAddress]);

  // Format large numbers
  const formatTokenAmount = (amount: number, decimals: number): string => {
    const formattedAmount = amount / Math.pow(10, decimals);
    return formattedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="deployed-agents">
      <div className="agents-header">
        <h2>Your Deployed Agent Tokens</h2>
        <button className="refresh-button" onClick={fetchDeployedAgents} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading agent tokens...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="no-agents">
          <p>No deployed agent tokens found. You can create a new agent token from the Agent Creation page.</p>
          <a href="/agentcreation" className="create-agent-link">Create Agent Token</a>
        </div>
      ) : (
        <div className="agents-container">
          {agents.map((agent) => (
            <div key={agent._id} className="agent-card">
              <div className="agent-header">
                <div className="agent-icon">
                  <span>{agent.token_symbol.charAt(0)}</span>
                </div>
                <div className="agent-info">
                  <h3>{agent.token_name}</h3>
                  <div className="agent-symbol">{agent.token_symbol}</div>
                </div>
                <div className="agent-package-badge" title="Agent Package ID">
                  <span className="badge-icon">📦</span>
                  <span className="badge-text">{`${agent.package_id.substring(0, 6)}...${agent.package_id.substring(agent.package_id.length - 4)}`}</span>
                </div>
              </div>

              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Initial Supply</span>
                  <span className="detail-value">
                    {formatTokenAmount(agent.initial_amount, agent.decimals)} {agent.token_symbol}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Decimals</span>
                  <span className="detail-value">{agent.decimals}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Profit Taking Period</span>
                  <span className="detail-value">{agent.profit_taking_period_hours} hours</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Profit Percentage</span>
                  <span className="detail-value">{agent.profit_taking_percentage}%</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Deployed On</span>
                  <span className="detail-value">{formatDate(agent.timestamp)}</span>
                </div>
              </div>

              <div className="agent-description">
                <p>{agent.description}</p>
              </div>

              <div className="agent-actions">
                <a 
                  href={`https://suiscan.xyz/mainnet/tx/${agent.transaction_id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-explorer-link"
                >
                  View on Explorer
                </a>
                
                <a 
                  href="/agentcreation?step=2" 
                  className="manage-agent-link"
                >
                  Manage Agent
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeployedAgents;