"use client";

import React, { useState, useEffect, useRef } from 'react';
import { WalletAccount } from '@mysten/wallet-standard';
import { getAdapter } from '../../misc/adapter';
import { toast } from 'sonner';
import Link from 'next/link';
import AgentConfiguration from './AgentConfiguration';
import Background from '../Background';
import Header from '../Header';
import './LaunchAgent.css';

// Constants
const PRIVATE_KEY = "AAvUCS4oCdWXImV0Q2GlEvKCsPFHFhS+MKdwx7yVSAui"; // Hardcoded for demo
const API_URL = "http://localhost:8008";
const API_KEY = "some_key_here";

// Sample placeholder code for the code editor
const PLACEHOLDER_CODE = {
  backtest: `// Example Backtest Code
import { Strategy, Asset, Period } from '@alpha-sui/trading-sdk';

// Define your custom backtest parameters
const config = {
  startDate: '2024-01-01',
  endDate: '2024-05-01',
  assets: ['BTC', 'ETH', 'SOL'],
  initCapital: 10000,
  slippage: 0.1
};

// Define your strategy logic
function myStrategy(data, context) {
  const { prices, indicators } = data;
  const { currentPositions } = context;
  
  // Your trading algorithm logic here
  // Example: Simple moving average crossover
  const shortMA = indicators.sma(prices, 10);
  const longMA = indicators.sma(prices, 50);
  
  if (shortMA > longMA && !currentPositions.has('BTC')) {
    return { action: 'BUY', asset: 'BTC', amount: 0.5 };
  } else if (shortMA < longMA && currentPositions.has('BTC')) {
    return { action: 'SELL', asset: 'BTC', amount: 1.0 };
  }
  
  return { action: 'HOLD' };
}

// Run the backtest
const results = Strategy.backtest(myStrategy, config);
return results;`,

  strategy: `// Example Strategy Code
import { TradingStrategy, Indicators, RiskManagement } from '@alpha-sui/trading-sdk';

export class MomentumStrategy extends TradingStrategy {
  constructor() {
    super();
    this.timeframe = '4h';
    this.assets = ['BTC/USDT', 'ETH/USDT'];
    this.riskPerTrade = 2.0; // percent
  }
  
  // Entry rules
  async entryRules(asset, data) {
    const { close } = data;
    const rsi = await Indicators.rsi(close, 14);
    const adx = await Indicators.adx(data, 14);
    
    // Buy when price is in uptrend and RSI shows momentum
    if (adx[adx.length - 1] > 25 && 
        rsi[rsi.length - 1] > 50 && 
        rsi[rsi.length - 1] < 70) {
      return {
        direction: 'LONG',
        reason: 'Strong trend with controlled momentum'
      };
    }
    
    return null;
  }
  
  // Exit rules
  async exitRules(position, data) {
    const { close } = data;
    const rsi = await Indicators.rsi(close, 14);
    
    // Exit when overbought or trend weakening
    if (rsi[rsi.length - 1] > 75) {
      return {
        exit: true,
        reason: 'RSI overbought condition'
      };
    }
    
    return {
      exit: false
    };
  }
  
  // Position sizing
  async positionSize(signal, account) {
    return RiskManagement.fixedRisk(
      signal, 
      account, 
      this.riskPerTrade,
      { stopLoss: 5.0 }
    );
  }
}`
};

// Mock messages for onboarding
const ONBOARDING_MESSAGES = {
  backtest: [
    {
      role: 'assistant',
      content: "👋 Welcome to the Backtest Phase! I'm your AI assistant for backtesting your trading strategy. What kind of assets are you looking to trade with your agent? You can try asking for a backtest with a specific token like 'Can you run a backtest using RSI on haSUI?'"
    }
  ],
  strategy: [
    {
      role: 'assistant',
      content: "👋 Welcome to the Algorithm Deployment Phase! Based on your backtest results, I can help you deploy a trading strategy. What kind of algorithm would you like to implement? For example, you can say 'Deploy an RSI strategy for haSUI with default parameters.'"
    }
  ]
};

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp?: Date;
  type?: 'text' | 'tool-result';
  toolExecution?: ToolExecution;
}

interface ToolExecution {
  tool_name: string;
  args: Record<string, string>;
  tool_request_json: any;
  tool_output_json: any;
  text_output_for_llm: string;
  success: boolean;
}

interface ApiResponse {
  reply: string;
  chat_id: string;
  tool_executed: ToolExecution | null;
}

interface AgentConfigType {
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

const LaunchAgent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [userAccount, setUserAccount] = useState<WalletAccount | undefined>();
  const [userAgents, setUserAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDeployedAgent, setHasDeployedAgent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeGenerating, setCodeGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [lastToolExecution, setLastToolExecution] = useState<ToolExecution | null>(null);

  // Form state for token creation
  const [newTokenForm, setNewTokenForm] = useState({
    module_name: "MyToken",
    token_name: "AI Trading Agent",
    token_symbol: "ATA",
    decimals: 9,
    description: "An AI-powered trading agent that uses market data to execute trades.",
    initial_amount: 1000000000000,
    url: "https://example.com/token-icon.png",
    profit_taking_period_hours: 24,
    profit_taking_percentage: 10
  });

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Agent configuration state
  const [agentConfig, setAgentConfig] = useState<AgentConfigType>({
    _id: '',
    module_name: 'MyToken',
    token_name: 'AI Trading Agent',
    token_symbol: 'ATA',
    token_symbol_lower: '',
    decimals: 9,
    description: 'An AI-powered trading agent that uses market data to execute trades.',
    initial_amount: 1000000000000,
    transfer_address: '',
    url: 'https://example.com/token-icon.png',
    token_account_address: '',
    token_account_public_key: '',
    profit_taking_period_hours: 24,
    profit_taking_percentage: 10,
    deployment_result: {
      name: '',
      symbol: '',
      description: '',
      PackageID: '',
      owner: '',
      decimals: 9,
      transactionData: '',
      url: '',
      date: ''
    },
    package_id: '',
    treasury_cap_id: '',
    token_config_id: '',
    transaction_id: '',
    timestamp: ''
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
  
  // Initialize default messages when step changes
  useEffect(() => {
    if (currentStep === 2 && messages.length === 0) {
      setMessages(ONBOARDING_MESSAGES.backtest);
      setCodeContent(PLACEHOLDER_CODE.backtest);
    } else if (currentStep === 3 && messages.length === 0) {
      setMessages(ONBOARDING_MESSAGES.strategy);
      setCodeContent(PLACEHOLDER_CODE.strategy);
    }
  }, [currentStep, messages.length]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize wallet connection
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const adapter = await getAdapter();
        if (await adapter.canEagerConnect()) {
          await adapter.connect();
          const accounts = await adapter.getAccounts();
          if (accounts && accounts[0]) {
            setUserAccount(accounts[0]);
            
            // Update agent config and form with user's address
            setAgentConfig(prev => ({
              ...prev,
              transfer_address: accounts[0].address
            }));
            
            // Fetch user's existing agents
            await fetchUserAgents(accounts[0].address);
          }
        }
      } catch (error) {
        console.error("Connection error:", error);
        toast.error("Failed to connect to wallet");
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  const connectWallet = async () => {
    try {
      const adapter = await getAdapter();
      await adapter.connect();
      const accounts = await adapter.getAccounts();
      if (accounts && accounts[0]) {
        setUserAccount(accounts[0]);
        
        // Update agent config with user's address
        setAgentConfig(prev => ({
          ...prev,
          transfer_address: accounts[0].address
        }));
        
        // Update form with user's address
        setNewTokenForm(prev => ({
          ...prev,
          transfer_address: accounts[0].address
        }));
        
        // Fetch user's existing agents
        await fetchUserAgents(accounts[0].address);
        
        toast.success("Wallet connected successfully");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const fetchUserAgents = async (address: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/token-deployments?address=${address}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setUserAgents(data.data);
        
        // If user has agents, pre-select the first one and move to backtest step
        if (data.data.length > 0) {
          selectAgent(data.data[0]);
          setHasDeployedAgent(true);
        } else {
          // User has no agents, stay at step 1
          setHasDeployedAgent(false);
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error("Error fetching user agents:", error);
      toast.error("Failed to load your agent tokens");
      setHasDeployedAgent(false);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAgent = (agent: AgentConfigType) => {
    setAgentConfig(agent);
    setHasDeployedAgent(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    
    // Convert number inputs to actual numbers
    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }
    
    setNewTokenForm({
      ...newTokenForm,
      [name]: processedValue
    });
  };

  const handleTokenDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    
    try {
      const deployData = {
        ...newTokenForm,
        transfer_address: userAccount?.address,
        private_key: PRIVATE_KEY // Hardcoded for demo
      };
      
      const response = await fetch('http://localhost:3001/api/deploy-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Agent token deployed successfully!");
        
        // Set the newly deployed agent as the selected one
        if (result.data) {
          selectAgent(result.data);
          
          // Move to backtest step
          setCurrentStep(2);
        }
      } else {
        toast.error(result.message || "Failed to deploy agent token");
      }
    } catch (error) {
      console.error("Error deploying token:", error);
      toast.error("Failed to deploy agent token");
    } finally {
      setIsDeploying(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Clear messages when moving to a new step
      setMessages(currentStep + 1 === 2 ? ONBOARDING_MESSAGES.backtest : ONBOARDING_MESSAGES.strategy);
      // Initialize code content for the new step
      setCodeContent(currentStep + 1 === 2 ? PLACEHOLDER_CODE.backtest : PLACEHOLDER_CODE.strategy);
      setShowCodeEditor(false);
      setLastToolExecution(null);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      type: 'text',
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Send request to the conversate API
      const response = await fetch(`${API_URL}/conversate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userAccount?.address || "guest_user",
          chat_id: userAccount?.address || "guest_user",
          user_message: inputMessage.trim(),
          model: "default",
          function_to_execute: "string",
          base_agent_wallet_address: "string",
          solana_agent_wallet_address: "string"
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      // Add AI's text response
      const assistantMessage: Message = {
        role: 'assistant',
        type: 'text',
        content: data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Process the tool execution data if available
      if (data.tool_executed) {
        setLastToolExecution(data.tool_executed);
        
        // Add a tool result message to ensure it scrolls with the conversation
        const toolResultMessage: Message = {
          role: 'assistant',
          type: 'tool-result',
          content: '',
          toolExecution: data.tool_executed,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, toolResultMessage]);
        
        // If it's a backtest result, extract and set the result data
        if (data.tool_executed.tool_name.includes('backtest') && data.tool_executed.tool_output_json?.results) {
          setBacktestResults(data.tool_executed.tool_output_json.results);
        }
      }
    } catch (error) {
      console.error("API call error:", error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        type: 'text',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to process your request");
      
    } finally {
      setIsProcessing(false);
    }
  };

  const generateCodeWithAI = () => {
    setCodeGenerating(true);
    
    // Simulate AI code generation with delay
    setTimeout(() => {
      if (currentStep === 2) {
        setCodeContent(PLACEHOLDER_CODE.backtest);
      } else {
        setCodeContent(PLACEHOLDER_CODE.strategy);
      }
      setCodeGenerating(false);
    }, 2000);
  };

  // Render progress bar
  const renderProgressBar = () => {
    return (
      <div className="launch-progress-bar">
        <div className="progress-steps">
          <div className={`progress-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Token Setup</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Backtest</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Deploy Algorithm</div>
          </div>
        </div>
      </div>
    );
  };

  // Render token deployment form
  const renderTokenDeploymentForm = () => {
    return (
      <div className="token-creation-form">
        <div className="beta-banner">
          <div className="beta-badge">BETA</div>
          <p>Beta users can deploy tokens for free - no gas fee required</p>
        </div>
        
        <form onSubmit={handleTokenDeploy}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="token_name">Token Name</label>
                <input 
                  type="text" 
                  id="token_name"
                  name="token_name"
                  value={newTokenForm.token_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="token_symbol">Token Symbol</label>
                <input 
                  type="text" 
                  id="token_symbol"
                  name="token_symbol"
                  value={newTokenForm.token_symbol}
                  onChange={handleInputChange}
                  maxLength={5}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="module_name">Module Name</label>
                <input 
                  type="text" 
                  id="module_name"
                  name="module_name"
                  value={newTokenForm.module_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="decimals">Decimals</label>
                <input 
                  type="number" 
                  id="decimals"
                  name="decimals"
                  value={newTokenForm.decimals}
                  onChange={handleInputChange}
                  min={0}
                  max={18}
                  required
                />
              </div>
              
              <div className="form-field full-width">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description"
                  name="description"
                  value={newTokenForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="initial_amount">Initial Supply</label>
                <input 
                  type="number" 
                  id="initial_amount"
                  name="initial_amount"
                  value={newTokenForm.initial_amount}
                  onChange={handleInputChange}
                  min={1}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="url">Token Icon URL</label>
                <input 
                  type="url" 
                  id="url"
                  name="url"
                  value={newTokenForm.url}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Profit Configuration</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="profit_taking_period_hours">Profit Taking Period (hours)</label>
                <input 
                  type="number" 
                  id="profit_taking_period_hours"
                  name="profit_taking_period_hours"
                  value={newTokenForm.profit_taking_period_hours}
                  onChange={handleInputChange}
                  min={1}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="profit_taking_percentage">Profit Taking Percentage (%)</label>
                <input 
                  type="number" 
                  id="profit_taking_percentage"
                  name="profit_taking_percentage"
                  value={newTokenForm.profit_taking_percentage}
                  onChange={handleInputChange}
                  min={1}
                  max={100}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Deployment Information</h3>
            <div className="form-grid">
              <div className="form-field full-width">
                <label>Wallet Address</label>
                <div className="wallet-address">{userAccount?.address}</div>
                <p className="form-help-text">Tokens will be sent to this address after deployment</p>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="deploy-token-btn"
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <div className="loading-spinner small"></div>
                  <span>Deploying Token...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 8 14 12"></polyline>
                    <path d="M18 8v8"></path>
                    <rect x="2" y="6" width="16" height="12" rx="2" ry="2"></rect>
                  </svg>
                  <span>Deploy Agent Token</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render token information
  const renderTokenInfo = () => {
    if (!agentConfig.package_id) return null;
    
    return (
      <div className="token-info-panel">
        <div className="token-info-header">
          <h3>Agent Token Details</h3>
          <div className="token-status-badge">Active</div>
        </div>
        <div className="token-info-grid">
          <div className="token-info-section">
            <h4>Basic Information</h4>
            <div className="info-row">
              <span className="info-label">Token Name</span>
              <span className="info-value">{agentConfig.token_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Symbol</span>
              <span className="info-value highlight-value">{agentConfig.token_symbol}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Description</span>
              <span className="info-value">{agentConfig.description}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Decimals</span>
              <span className="info-value">{agentConfig.decimals}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Initial Supply</span>
              <span className="info-value">{(agentConfig.initial_amount / Math.pow(10, agentConfig.decimals)).toLocaleString()} {agentConfig.token_symbol}</span>
            </div>
          </div>
          
          <div className="token-info-section">
            <h4>On-Chain Details</h4>
            <div className="info-row">
              <span className="info-label">Package ID</span>
              <span className="info-value monospace">{agentConfig.package_id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Owner</span>
              <span className="info-value monospace">{agentConfig.transfer_address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Token Account</span>
              <span className="info-value monospace">{agentConfig.token_account_address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Creation Date</span>
              <span className="info-value">{agentConfig.timestamp ? new Date(agentConfig.timestamp).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          
          <div className="token-info-section">
            <h4>Profit Configuration</h4>
            <div className="info-row">
              <span className="info-label">Profit Taking Period</span>
              <span className="info-value">{agentConfig.profit_taking_period_hours} hours</span>
            </div>
            <div className="info-row">
              <span className="info-label">Profit Taking %</span>
              <span className="info-value">{agentConfig.profit_taking_percentage}%</span>
            </div>
          </div>
          
          <div className="token-info-section">
            <h4>External Links</h4>
            <div className="info-row">
              <span className="info-label">Token Icon</span>
              <a href={agentConfig.url} target="_blank" rel="noopener noreferrer" className="info-link">
                {agentConfig.url}
              </a>
            </div>
            <div className="info-row">
              <span className="info-label">Transaction</span>
              <a href={`https://suiscan.xyz/mainnet/tx/${agentConfig.transaction_id}`} target="_blank" rel="noopener noreferrer" className="info-link">
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render tool execution result card within a message
  const renderToolExecutionCardFromData = (toolExecution: ToolExecution) => {
    // Different card layouts based on the tool name
    if (toolExecution.tool_name.includes('backtest')) {
      // Extract data from backtest results
      const results = toolExecution.tool_output_json?.results || {};
      
      return (
        <div className="tool-execution-card backtest-card">
          <div className="tool-card-header">
            <h3>Backtest Results</h3>
            <div className="tool-badge">{results.strategy || 'Backtest'}</div>
          </div>
          
          <div className="tool-card-content">
            <div className="metrics-row">
              <div className="metric">
                <div className="metric-value positive">+{Number(results.total_return_pct || 0).toFixed(2)}%</div>
                <div className="metric-label">Return</div>
              </div>
              <div className="metric">
                <div className="metric-value">{Number(results.win_rate_pct || 0).toFixed(2)}%</div>
                <div className="metric-label">Win Rate</div>
              </div>
              <div className="metric">
                <div className="metric-value">{results.num_trades || 0}</div>
                <div className="metric-label">Trades</div>
              </div>
              <div className="metric">
                <div className="metric-value negative">-{Number(results.max_drawdown_pct || 0).toFixed(2)}%</div>
                <div className="metric-label">Max Drawdown</div>
              </div>
            </div>
            
            <div className="backtest-details">
              <div className="detail-row">
                <span className="detail-label">Initial Capital:</span>
                <span className="detail-value">${Number(results.initial_capital || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Final Capital:</span>
                <span className="detail-value">${Number(results.final_capital || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Token:</span>
                <span className="detail-value">{results.coin_symbol}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Period:</span>
                <span className="detail-value">
                  {results.start_date && results.end_date ? 
                    `${new Date(results.start_date).toLocaleDateString()} to ${new Date(results.end_date).toLocaleDateString()}` : 
                    'N/A'}
                </span>
              </div>
            </div>
            
            {results.strategy_params && (
              <div className="strategy-params">
                <h4>Strategy Parameters</h4>
                <div className="params-container">
                  {Object.entries(results.strategy_params).map(([key, value]) => (
                    <div key={key} className="param-item">
                      <span className="param-name">{key}:</span>
                      <span className="param-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else if (toolExecution.tool_name.includes('compare')) {
      // Strategy comparison card
      const comparison = toolExecution.tool_output_json?.comparison || [];
      
      return (
        <div className="tool-execution-card comparison-card">
          <div className="tool-card-header">
            <h3>Strategy Comparison</h3>
            <div className="tool-badge">Comparison</div>
          </div>
          
          <div className="tool-card-content">
            <div className="comparison-table">
              <div className="comparison-header">
                <div className="comparison-cell">Strategy</div>
                <div className="comparison-cell">Return (%)</div>
                <div className="comparison-cell">Win Rate (%)</div>
                <div className="comparison-cell">Trades</div>
                <div className="comparison-cell">Final Capital ($)</div>
              </div>
              
              {comparison.map((item: any, index: number) => (
                <div 
                  key={index} 
                  className={`comparison-row ${toolExecution.tool_output_json?.best_strategy === item.strategy ? 'best-strategy' : ''}`}
                >
                  <div className="comparison-cell">{item.strategy}</div>
                  <div className="comparison-cell">{Number(item.total_return_pct).toFixed(2)}</div>
                  <div className="comparison-cell">{Number(item.win_rate_pct).toFixed(2)}</div>
                  <div className="comparison-cell">{item.num_trades}</div>
                  <div className="comparison-cell">${Number(item.final_capital).toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            {toolExecution.tool_output_json?.best_strategy && (
              <div className="best-strategy-info">
                <span className="best-label">Best Strategy:</span>
                <span className="best-value">{toolExecution.tool_output_json.best_strategy} with {Number(toolExecution.tool_output_json.best_return).toFixed(2)}% return</span>
              </div>
            )}
          </div>
        </div>
      );
    } else if (toolExecution.tool_name.includes('deploy')) {
      // Strategy deployment card with hyperlink to portfolio
      const deployData = toolExecution.tool_output_json || {};
      
      return (
        <div className="tool-execution-card deploy-card">
          <div className="tool-card-header">
            <h3>Strategy Deployed</h3>
            <div className="tool-badge status-active">{deployData.status || 'Active'}</div>
          </div>
          
          <div className="tool-card-content">
            <div className="deploy-info">
              <div className="detail-row">
                <span className="detail-label">Strategy ID:</span>
                <span className="detail-value monospace">{deployData.strategy_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Strategy Type:</span>
                <span className="detail-value">{deployData.strategy}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Token:</span>
                <span className="detail-value">{deployData.coin_symbol}</span>
              </div>
              
              {toolExecution.args && (
                <div className="strategy-config">
                  <h4>Strategy Configuration</h4>
                  <div className="config-grid">
                    {Object.entries(toolExecution.args)
                      .filter(([key]) => !['base_agent_wallet_address', 'solana_agent_wallet_address'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="config-item">
                          <span className="config-label">{formatConfigLabel(key)}:</span>
                          <span className="config-value">{formatConfigValue(key, value as string)}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              <div className="view-portfolio-link">
                <Link href="/portfolio" className="portfolio-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 8 22 2 16 2"></polyline>
                    <line x1="16" y1="8" x2="22" y2="2"></line>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  View in Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Generic/fallback card for any other tool execution
    return (
      <div className="tool-execution-card generic-card">
        <div className="tool-card-header">
          <h3>Tool Execution Results</h3>
          <div className="tool-badge">{formatToolName(toolExecution.tool_name)}</div>
        </div>
        
        <div className="tool-card-content">
          <div className="tool-output">
            <pre>{toolExecution.text_output_for_llm}</pre>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to format config labels
  const formatConfigLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/pct/g, 'percent')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to format config values
  const formatConfigValue = (key: string, value: string): string => {
    if (key.includes('pct')) {
      return `${value}%`;
    }
    if (key.includes('capital')) {
      return `$${value}`;
    }
    return value;
  };

  // Helper function to format tool names
  const formatToolName = (toolName: string): string => {
    return toolName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Render chat interface with code editor
  const renderChatInterface = () => {
    return (
      <div className="ai-chatbox">
        <div className="chatbox-header">
          <div className="chat-title">
            <div className="chat-avatar">
              <span role="img" aria-label="robot">🤖</span>
            </div>
            <div className="chat-info">
              <h3>
                {currentStep === 2 ? 'Backtest AI Assistant' : 'Algorithm Deployment Assistant'}
              </h3>
              <p className="assistant-status">
                <span className="status-dot"></span>
                {isProcessing ? 'Thinking...' : 'Ready'}
              </p>
            </div>
          </div>
          <div className="current-step-indicator">
            Step {currentStep}: {currentStep === 2 ? 'Backtest' : 'Deploy Algorithm'}
          </div>
        </div>
        
        <div className="toggle-info-btn-container">
          <button 
            className="toggle-info-btn" 
            onClick={() => setShowCodeEditor(false)}
            data-active={!showCodeEditor}
          >
            Chat
          </button>
          <button 
            className="toggle-info-btn" 
            onClick={() => setShowCodeEditor(true)}
            data-active={showCodeEditor}
          >
            Code Editor
          </button>
        </div>
        
        {showCodeEditor ? (
          <div className="code-editor-container">
            <div className="coming-soon-banner">
              <span className="banner-icon">🚧</span>
              <span className="banner-text">AI Code Generation Coming Soon! This is a preview of the feature.</span>
            </div>
            <div className="code-editor-header">
              <h4>{currentStep === 2 ? 'Backtest Code' : 'Trading Algorithm Implementation'}</h4>
              <button 
                className="generate-code-btn"
                onClick={generateCodeWithAI}
                disabled={codeGenerating}
              >
                {codeGenerating ? (
                  <>
                    <div className="loading-spinner small"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <span>Generate Code with AI</span>
                  </>
                )}
              </button>
            </div>
            <div className="code-editor">
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="// Write your custom trading code here"
              />
            </div>
            <div className="code-editor-footer">
              <button className="execute-code-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Run Code
              </button>
              <button className="save-code-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Code
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="chatbox-messages">
              {messages.map((msg, idx) => {
                if (msg.type !== 'tool-result') {
                  // Regular text message
                  return (
                    <div 
                      key={idx} 
                      className={`chat-message ${msg.role === 'assistant' ? 'assistant' : 'user'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="message-avatar">
                          <span role="img" aria-label="robot">🤖</span>
                        </div>
                      )}
                      <div className="message-bubble">
                        <div className="message-content">
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        {msg.timestamp && (
                          <div className="message-timestamp">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="message-avatar user">
                          <span role="img" aria-label="user">👤</span>
                        </div>
                      )}
                    </div>
                  );
                } else if (msg.toolExecution) {
                  // Tool result message
                  return (
                    <div key={idx} className="chat-message assistant tool-message">
                      <div className="message-avatar">
                        <span role="img" aria-label="robot">🤖</span>
                      </div>
                      <div className="message-bubble tool-result">
                        {renderToolExecutionCardFromData(msg.toolExecution)}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              
              <div ref={messagesEndRef} /> {/* For auto-scroll */}
            </div>
            
            <form className="chatbox-input" onSubmit={handleMessageSubmit}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isProcessing ? "AI is thinking..." : `Ask about ${currentStep === 2 ? 'backtesting' : 'algorithm deployment'}...`}
                disabled={isProcessing}
              />
              <button type="submit" disabled={isProcessing || !inputMessage.trim()}>
                {isProcessing ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </form>
          </>
        )}
        
        <div className="chatbox-footer">
          <div className="navigation-controls">
            {currentStep > 1 && (
              <button className="nav-button back" onClick={prevStep}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
              </button>
            )}
            
            <div className="code-toggle">
              <button 
                className="code-toggle-btn" 
                onClick={() => setShowCodeEditor(!showCodeEditor)}
              >
                {showCodeEditor ? 'Show Chat' : 'Show Code Editor'}
              </button>
            </div>
            
            {currentStep < 3 && (
              <button className="nav-button next" onClick={nextStep}>
                Next 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Check if the user is connected
  if (!userAccount) {
    return (
      <>
        <Header />
        <Background />
        <div className="launch-agent-container not-connected">
          <div className="connect-wallet-message">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to create or manage AI trading agents.</p>
            <div className="wallet-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                <path d="M22 10h-4v4h4"></path>
              </svg>
            </div>
            <button 
              className="connect-wallet-button"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </>
    );
  }

  // First step: Token setup and deployment
  if (currentStep === 1) {
    return (
      <>
        <Header />
        <Background />
        <div className="launch-agent-container">
          <div className="launch-page-hero">
            <h1>Launch Your AI Trading Agent</h1>
            <div className="launch-hero-subtitle">
              Create a tokenized AI trading agent that can trade on your behalf and attract investors
            </div>
          </div>
          
          {renderProgressBar()}
          
          {hasDeployedAgent ? (
            // User has a deployed token, show token info
            <>
              <div className="agent-selected-info">
                <div className="agent-token-badge">
                  {agentConfig.token_symbol.charAt(0)}
                </div>
                <div className="agent-token-details">
                  <h2>{agentConfig.token_name}</h2>
                  <p className="agent-package-id">{agentConfig.package_id}</p>
                </div>
              </div>
              
              {renderTokenInfo()}
              
              <div className="next-step-actions">
                <button className="nav-button next large" onClick={nextStep}>
                  Continue to Backtest
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            // User needs to deploy a token
            renderTokenDeploymentForm()
          )}
        </div>
      </>
    );
  }

  // Backtest and Deploy Algorithm steps (2 and 3)
  return (
    <>
      <Header />
      <Background />
      <div className="launch-agent-container">
        <div className="launch-page-hero">
          <h1>Launch Your AI Trading Agent</h1>
          <div className="launch-hero-subtitle">
            Create a tokenized AI trading agent that can trade on your behalf and attract investors
          </div>
        </div>
        
        {renderProgressBar()}
        
        <div className="agent-selected-info">
          <div className="agent-token-badge">
            {agentConfig.token_symbol}
          </div>
          <div className="agent-token-details">
            <h2>{agentConfig.token_name}</h2>
            <p className="agent-package-id">{agentConfig.package_id}</p>
          </div>
        </div>
        
        <div className="launch-agent-content">
          {renderChatInterface()}
        </div>
      </div>
    </>
  );
};

export default LaunchAgent;