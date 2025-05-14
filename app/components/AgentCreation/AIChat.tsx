import React, { useState, useEffect, useRef } from 'react';
import './AIChat.css';

interface Message {
  role: 'agent' | 'user';
  content: string;
  time: string;
  configType?: 'agentConfig' | 'strategyConfig' | 'tokenConfig' | 'backtest' | 'summary';
  suggestions?: string[];
}

interface AIChatProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  agentConfig: any;
  setAgentConfig: (config: any) => void;
  strategyConfig: any;
  setStrategyConfig: (config: any) => void;
  tokenConfig: any;
  setTokenConfig: (config: any) => void;
  backtestResults: any;
  runBacktest: (config?: any) => void;
}

const AIChat: React.FC<AIChatProps> = ({ 
  currentStep, 
  nextStep, 
  prevStep,
  agentConfig,
  setAgentConfig,
  strategyConfig,
  setStrategyConfig,
  tokenConfig, 
  setTokenConfig,
  backtestResults,
  runBacktest
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tempBacktestRunning, setTempBacktestRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [activeConfigType, setActiveConfigType] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Step-specific initial messages
  const stepMessages = {
    1: {
      content: "Hello! I'm your agent creation assistant. Let's set up your trading agent. I need some basic information to get started.",
      configType: 'agentConfig',
      suggestions: ["Show me configuration options"]
    },
    2: {
      content: "Now let's configure your trading strategy. What markets do you want to trade and what approach would you like to use?",
      configType: 'strategyConfig',
      suggestions: ["Show me strategy options"]
    },
    3: {
      content: "I'll run a backtest on your strategy. This will show how it would have performed historically.",
      configType: 'backtest',
      suggestions: ["Run standard backtest", "Test in bull market", "Test in bear market"]
    },
    4: {
      content: "Now let's set up your token economics. This determines how profits are shared with investors.",
      configType: 'tokenConfig',
      suggestions: ["Show token configuration"]
    },
    5: {
      content: "Let's review your agent before launching. Here's a summary of your configuration:",
      configType: 'summary',
      suggestions: ["Show summary", "Launch agent"]
    }
  };

  useEffect(() => {
    // Reset messages when step changes
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const initialMessage = stepMessages[currentStep as keyof typeof stepMessages];
    
    setMessages([{
      role: 'agent',
      content: initialMessage.content,
      time: currentTime,
      configType: initialMessage.configType,
      suggestions: initialMessage.suggestions
    }]);
    
    setActiveConfigType(initialMessage.configType);
    setIsTyping(false);
    setShowConfig(true);
  }, [currentStep]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Update UI when backtest results arrive
    if (tempBacktestRunning && backtestResults) {
      setTempBacktestRunning(false);
      
      // Add backtest results message
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "The backtest is complete! Here are the results of your trading strategy:",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        configType: 'backtest',
        suggestions: ["Continue to token economics", "Adjust strategy parameters"]
      }]);
      
      setActiveConfigType('backtest');
    }
  }, [backtestResults, tempBacktestRunning]);

  const handleSubmit = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    
    const messageText = typeof e === 'string' ? e : input;
    if (!messageText.trim()) return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: messageText,
      time: currentTime
    }]);
    
    setInput('');
    setIsTyping(true);
    
    // Simulate agent thinking and typing
    setTimeout(() => {
      let response = "";
      let suggestions: string[] = [];
      let configType = null;
      
      // Determine response based on current step and message
      switch(currentStep) {
        case 1:
          response = "Thanks! I've updated your agent details. Would you like to continue to the strategy configuration?";
          suggestions = ["Continue to trading strategy", "Edit agent details"];
          configType = 'agentConfig';
          break;
        case 2:
          response = "Great! I've configured your trading strategy with the parameters you provided. Would you like to run a backtest to see how it would perform?";
          suggestions = ["Run backtest", "Adjust strategy parameters"];
          configType = 'strategyConfig';
          break;
        case 3:
          if (messageText.toLowerCase().includes('backtest') || messageText.toLowerCase().includes('run')) {
            response = "I'll run a backtest with your current strategy configuration. This will take a moment...";
            setTempBacktestRunning(true);
            runBacktest();
            
            // Return early since we'll handle this after backtest completes
            setIsTyping(false);
            return;
          } else {
            response = "Would you like me to run a backtest of your current strategy configuration?";
            suggestions = ["Run standard backtest", "Adjust strategy parameters"];
            configType = 'backtest';
          }
          break;
        case 4:
          response = "I've set up your token economics as specified. You're allocating 70% to the community with a 20% performance fee. Ready to review your agent and launch?";
          suggestions = ["Review and launch", "Adjust token parameters"];
          configType = 'tokenConfig';
          break;
        case 5:
          response = "Your agent is configured and ready to launch! You can make any final adjustments now or proceed with the launch.";
          suggestions = ["Launch agent", "Make final adjustments"];
          configType = 'summary';
          break;
      }
      
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        configType: configType,
        suggestions: suggestions
      }]);
      
      setActiveConfigType(configType);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Continue to trading strategy' || 
        suggestion === 'Run backtest' || 
        suggestion === 'Continue to token economics' ||
        suggestion === 'Review and launch') {
      // Add a user message acknowledging the continuation
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        role: 'user',
        content: suggestion,
        time: currentTime
      }]);
      
      // Small delay before advancing
      setTimeout(() => nextStep(), 500);
    } else if (suggestion === 'Launch agent') {
      // Add a user message
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        role: 'user',
        content: suggestion,
        time: currentTime
      }]);
      
      // Show launch animation/completion message
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "🚀 Congratulations! Your agent has been successfully launched and is now live on the network. Investors can now participate in your strategy.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: ["View my agent dashboard", "Create another agent"]
        }]);
        setIsTyping(false);
        setActiveConfigType(null);
      }, 2000);
    } else if (suggestion === 'Run standard backtest') {
      setTempBacktestRunning(true);
      
      // Add a user message
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        role: 'user',
        content: "Run a standard backtest please",
        time: currentTime
      }]);
      
      // Add agent message about running backtest
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "Running backtest on your strategy. This will take a moment...",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      runBacktest();
    } else if (suggestion.startsWith('Show')) {
      // Handle "Show configuration" type suggestions
      const configType = suggestion.includes('strategy') ? 'strategyConfig' : 
                          suggestion.includes('token') ? 'tokenConfig' :
                          suggestion.includes('summary') ? 'summary' : 'agentConfig';
                          
      setActiveConfigType(configType);
      setShowConfig(true);
      
      // Add user message
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        role: 'user',
        content: suggestion,
        time: currentTime
      }]);
      
      // Add agent response
      const responses: {[key: string]: string} = {
        'agentConfig': "Here are your agent configuration options. You can update the name, description, and type of your trading agent.",
        'strategyConfig': "Here are your strategy configuration options. You can define which markets to trade and the parameters for your trading algorithm.",
        'tokenConfig': "Here are your token configuration options. You can set your token symbol, supply, and allocation percentages.",
        'summary': "Here's a summary of your agent configuration. Please review before launching.",
      };
      
      setMessages(prev => [...prev, {
        role: 'agent',
        content: responses[configType],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        configType: configType
      }]);
    } else {
      // Handle other suggestion clicks by sending them as messages
      handleSubmit(suggestion);
    }
  };

  const handleConfigToggle = () => {
    setShowConfig(!showConfig);
  };
  
  const handleAgentConfigUpdate = (configData: any) => {
    setAgentConfig({...configData});
    
    // Show confirmation message
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      role: 'agent',
      content: `Your agent details have been updated. Your agent is named "${configData.name}" and is a ${configData.type} type.`,
      time: currentTime,
      suggestions: ["Continue to trading strategy"]
    }]);
  };
  
  const handleStrategyConfigUpdate = (configData: any) => {
    setStrategyConfig({...configData});
    
    // Show confirmation message
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      role: 'agent',
      content: `Your ${configData.algorithm} trading strategy has been configured with ${configData.pairs.length} trading pairs.`,
      time: currentTime,
      suggestions: ["Run backtest"]
    }]);
  };
  
  const handleTokenConfigUpdate = (configData: any) => {
    setTokenConfig({...configData});
    
    // Show confirmation message
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      role: 'agent',
      content: `Your token economics have been set. ${configData.symbol} will have a total supply of ${configData.initialSupply.toLocaleString()} with ${configData.communityAllocation}% allocated to the community.`,
      time: currentTime,
      suggestions: ["Review and launch"]
    }]);
  };

  return (
    <div className="agent-chat-container">
      <div className={`agent-chat-main ${showConfig && activeConfigType ? 'with-config' : ''}`}>
        <div className="agent-chat-messages" ref={messagesContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.role === 'agent' && (
                <div className="agent-avatar">
                  <div className="avatar-icon">🤖</div>
                </div>
              )}
              <div className="message-bubble">
                <div className="message-content">{msg.content}</div>
                <div className="message-time">{msg.time}</div>
                
                {msg.suggestions && msg.suggestions.length > 0 && msg.configType && (
                  <div className="message-suggestion-config">
                    <div className="message-suggestions-group">
                      {msg.suggestions.filter(s => !s.startsWith('Show')).map((suggestion, idx) => (
                        <button 
                          key={idx}
                          className={`suggestion-button ${suggestion === 'Continue to trading strategy' || 
                                                        suggestion === 'Run backtest' ||
                                                        suggestion === 'Continue to token economics' ||
                                                        suggestion === 'Review and launch' ||
                                                        suggestion === 'Launch agent' ? 'primary' : ''}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    
                    {msg.suggestions.some(s => s.startsWith('Show')) && (
                      <button className="config-toggle" onClick={handleConfigToggle}>
                        <span className="config-toggle-icon">{showConfig ? '←' : '→'}</span>
                        {showConfig ? 'Hide Config' : 'Show Config'}
                      </button>
                    )}
                  </div>
                )}
                
                {msg.suggestions && msg.suggestions.length > 0 && !msg.configType && (
                  <div className="message-suggestions">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button 
                        key={idx}
                        className={`suggestion-button ${suggestion === 'Continue to trading strategy' || 
                                                      suggestion === 'Run backtest' ||
                                                      suggestion === 'Continue to token economics' ||
                                                      suggestion === 'Review and launch' ||
                                                      suggestion === 'Launch agent' ? 'primary' : ''}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message agent">
              <div className="agent-avatar">
                <div className="avatar-icon">🤖</div>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        <form className="agent-chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping || tempBacktestRunning}
          />
          <button type="submit" className="send-button" disabled={isTyping || tempBacktestRunning || !input.trim()}>
            <span>➤</span>
          </button>
        </form>
      </div>
      
      <div className={`agent-chat-config ${showConfig && activeConfigType ? 'visible' : ''}`}>
        {activeConfigType === 'agentConfig' && (
          <AgentConfigPanel 
            config={agentConfig} 
            onUpdate={handleAgentConfigUpdate} 
          />
        )}
        
        {activeConfigType === 'strategyConfig' && (
          <StrategyConfigPanel 
            config={strategyConfig} 
            onUpdate={handleStrategyConfigUpdate} 
          />
        )}
        
        {activeConfigType === 'tokenConfig' && (
          <TokenConfigPanel 
            config={tokenConfig} 
            onUpdate={handleTokenConfigUpdate} 
          />
        )}
        
        {activeConfigType === 'backtest' && backtestResults && (
          <BacktestResultsPanel results={backtestResults} />
        )}
        
        {activeConfigType === 'summary' && (
          <LaunchSummaryPanel 
            agentConfig={agentConfig}
            strategyConfig={strategyConfig}
            tokenConfig={tokenConfig}
            backtestResults={backtestResults}
            onLaunch={() => handleSuggestionClick('Launch agent')}
          />
        )}
      </div>
    </div>
  );
};

// Agent Configuration Panel
const AgentConfigPanel: React.FC<{config: any, onUpdate: (config: any) => void}> = ({config, onUpdate}) => {
  const [tempConfig, setTempConfig] = useState({...config});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(tempConfig);
  };
  
  return (
    <div className="config-form">
      <div className="config-header">
        <h3 className="config-title">Agent Details</h3>
      </div>
      
      <div className="config-form-content">
        <div className="config-form-field">
          <label htmlFor="agent-name">Agent Name</label>
          <input 
            type="text" 
            id="agent-name"
            value={tempConfig.name}
            onChange={(e) => setTempConfig({...tempConfig, name: e.target.value})}
            placeholder="e.g. Alpha Momentum Trader"
          />
        </div>
        
        <div className="config-form-field">
          <label htmlFor="agent-description">Description</label>
          <textarea
            id="agent-description"
            value={tempConfig.description}
            onChange={(e) => setTempConfig({...tempConfig, description: e.target.value})}
            placeholder="Describe what your agent does..."
            rows={4}
          />
        </div>
        
        <div className="config-form-field">
          <label htmlFor="agent-type">Agent Type</label>
          <select 
            id="agent-type"
            value={tempConfig.type}
            onChange={(e) => setTempConfig({...tempConfig, type: e.target.value})}
          >
            <option value="Machine Learning/AI">Machine Learning/AI</option>
            <option value="Technical Analysis">Technical Analysis</option>
            <option value="Statistical Arbitrage">Statistical Arbitrage</option>
            <option value="Market Making">Market Making</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>
      
      <div className="config-form-actions">
        <button className="config-form-submit" onClick={handleSubmit}>
          Save Agent Details
        </button>
      </div>
    </div>
  );
};

// Strategy Configuration Panel
const StrategyConfigPanel: React.FC<{config: any, onUpdate: (config: any) => void}> = ({config, onUpdate}) => {
  const [tempConfig, setTempConfig] = useState({...config});
  const [newPair, setNewPair] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(tempConfig);
  };
  
  const addPair = () => {
    if (newPair && !tempConfig.pairs.includes(newPair)) {
      setTempConfig({...tempConfig, pairs: [...tempConfig.pairs, newPair]});
      setNewPair('');
    }
  };
  
  const removePair = (pairToRemove: string) => {
    setTempConfig({
      ...tempConfig, 
      pairs: tempConfig.pairs.filter((p: string) => p !== pairToRemove)
    });
  };
  
  return (
    <div className="config-form">
      <div className="config-header">
        <h3 className="config-title">Trading Strategy</h3>
      </div>
      
      <div className="config-form-content">
        <div className="config-form-field">
          <label>Trading Pairs</label>
          <div className="trading-pairs">
            {tempConfig.pairs.map((pair: string, index: number) => (
              <div key={index} className="trading-pair">
                {pair}
                <button 
                  type="button" 
                  className="trading-pair-remove"
                  onClick={() => removePair(pair)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="add-pair">
            <input 
              type="text" 
              value={newPair}
              onChange={(e) => setNewPair(e.target.value)}
              placeholder="e.g. BTC/USDT"
            />
            <button 
              type="button"
              className="add-pair-button"
              onClick={addPair}
            >
              Add
            </button>
          </div>
        </div>
        
        <div className="config-form-field">
          <label htmlFor="algorithm">Trading Algorithm</label>
          <select 
            id="algorithm"
            value={tempConfig.algorithm}
            onChange={(e) => setTempConfig({...tempConfig, algorithm: e.target.value})}
          >
            <option value="Momentum">Momentum</option>
            <option value="Mean Reversion">Mean Reversion</option>
            <option value="Trend Following">Trend Following</option>
            <option value="Breakout">Breakout</option>
            <option value="Machine Learning">Machine Learning</option>
          </select>
        </div>
        
        <div className="config-form-field">
          <label htmlFor="max-allocation">Maximum Allocation per Asset (%)</label>
          <input 
            type="range" 
            min="10" 
            max="100"
            value={tempConfig.maxAllocation}
            onChange={(e) => setTempConfig({...tempConfig, maxAllocation: Number(e.target.value)})}
          />
          <div className="config-form-slider-value">
            <span>10%</span>
            <span>{tempConfig.maxAllocation}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      
      <div className="config-form-actions">
        <button className="config-form-submit" onClick={handleSubmit}>
          Save Strategy
        </button>
      </div>
    </div>
  );
};

// Token Configuration Panel
const TokenConfigPanel: React.FC<{config: any, onUpdate: (config: any) => void}> = ({config, onUpdate}) => {
  const [tempConfig, setTempConfig] = useState({...config});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(tempConfig);
  };
  
  return (
    <div className="config-form">
      <div className="config-header">
        <h3 className="config-title">Token Economics</h3>
      </div>
      
      <div className="config-form-content">
        <div className="config-form-field">
          <label htmlFor="token-symbol">Token Symbol</label>
          <input 
            type="text" 
            id="token-symbol"
            value={tempConfig.symbol}
            onChange={(e) => setTempConfig({...tempConfig, symbol: e.target.value})}
            placeholder="e.g. ALPHA"
          />
        </div>
        
        <div className="config-form-field">
          <label htmlFor="initial-supply">Initial Token Supply</label>
          <input 
            type="text" 
            id="initial-supply"
            value={tempConfig.initialSupply}
            onChange={(e) => setTempConfig({...tempConfig, initialSupply: Number(e.target.value.replace(/\D/g, ''))})}
            placeholder="10000000"
          />
        </div>
        
        <div className="config-form-field">
          <label htmlFor="community-allocation">Community Allocation (%)</label>
          <input 
            type="range" 
            min="30" 
            max="90"
            value={tempConfig.communityAllocation}
            onChange={(e) => setTempConfig({...tempConfig, communityAllocation: Number(e.target.value)})}
          />
          <div className="config-form-slider-value">
            <span>30%</span>
            <span>{tempConfig.communityAllocation}%</span>
            <span>90%</span>
          </div>
        </div>
        
        <div className="config-form-field">
          <label htmlFor="performance-fee">Performance Fee (%)</label>
          <input 
            type="range" 
            min="5" 
            max="50"
            value={tempConfig.performanceFee}
            onChange={(e) => setTempConfig({...tempConfig, performanceFee: Number(e.target.value)})}
          />
          <div className="config-form-slider-value">
            <span>5%</span>
            <span>{tempConfig.performanceFee}%</span>
            <span>50%</span>
          </div>
        </div>
      </div>
      
      <div className="config-form-actions">
        <button className="config-form-submit" onClick={handleSubmit}>
          Save Token Configuration
        </button>
      </div>
    </div>
  );
};

// Backtest Results Panel
const BacktestResultsPanel: React.FC<{results: any}> = ({results}) => {
  return (
    <div className="backtest-results">
      <div className="config-header">
        <h3 className="config-title">Backtest Results</h3>
      </div>
      
      <div className="backtest-results-content">
        <div className="result-card">
          <div className="result-card-title">Performance Summary</div>
          
          <div className="metric-row">
            <div className="metric-label">Total Returns</div>
            <div className="metric-value positive">+{results.totalReturns}%</div>
          </div>
          
          <div className="metric-row">
            <div className="metric-label">Annualized Return</div>
            <div className="metric-value positive">{results.annualizedReturn}%</div>
          </div>
          
          <div className="metric-row">
            <div className="metric-label">Sharpe Ratio</div>
            <div className="metric-value positive">{results.sharpeRatio}</div>
          </div>
          
          <div className="metric-row">
            <div className="metric-label">Max Drawdown</div>
            <div className="metric-value negative">-{results.maxDrawdown}%</div>
          </div>
          
          <div className="metric-row">
            <div className="metric-label">Win Rate</div>
            <div className="metric-value">{results.winRate}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-card-title">Trading Activity</div>
          
          <div className="metric-row">
            <div className="metric-label">Total Trades</div>
            <div className="metric-value">{results.trades}</div>
          </div>
          
          <div className="metric-row">
            <div className="metric-label">Successful Trades</div>
            <div className="metric-value">{results.successfulTrades}</div>
          </div>
          
          <div className="metric-row">
            <div className="metric-label">Average Return per Trade</div>
            <div className="metric-value positive">+{results.averageReturn}%</div>
          </div>
          
          <div className="metric-row">
            <div className="metric-label">Volatility</div>
            <div className="metric-value">{results.volatility}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Launch Summary Panel
const LaunchSummaryPanel: React.FC<{
  agentConfig: any, 
  strategyConfig: any, 
  tokenConfig: any, 
  backtestResults: any,
  onLaunch: () => void
}> = ({agentConfig, strategyConfig, tokenConfig, backtestResults, onLaunch}) => {
  return (
    <div className="backtest-results">
      <div className="config-header">
        <h3 className="config-title">Launch Summary</h3>
      </div>
      
      <div className="backtest-results-content">
        <div className="summary-info">
          <div className="summary-section">
            <div className="summary-section-title">Agent Details</div>
            <div className="summary-section-card">
              <div className="summary-item">
                <div className="summary-label">Name</div>
                <div className="summary-value">{agentConfig.name}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Type</div>
                <div className="summary-value">{agentConfig.type}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Description</div>
                <div className="summary-value">{agentConfig.description}</div>
              </div>
            </div>
          </div>
          
          <div className="summary-section">
            <div className="summary-section-title">Strategy</div>
            <div className="summary-section-card">
              <div className="summary-item">
                <div className="summary-label">Algorithm</div>
                <div className="summary-value">{strategyConfig.algorithm}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Trading Pairs</div>
                <div className="summary-value">{strategyConfig.pairs.join(', ')}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Max Allocation</div>
                <div className="summary-value">{strategyConfig.maxAllocation}%</div>
              </div>
            </div>
          </div>
          
          <div className="summary-section">
            <div className="summary-section-title">Token Economics</div>
            <div className="summary-section-card">
              <div className="summary-item">
                <div className="summary-label">Symbol</div>
                <div className="summary-value">{tokenConfig.symbol}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Initial Supply</div>
                <div className="summary-value">{tokenConfig.initialSupply.toLocaleString()}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Community Allocation</div>
                <div className="summary-value">{tokenConfig.communityAllocation}%</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Performance Fee</div>
                <div className="summary-value">{tokenConfig.performanceFee}%</div>
              </div>
            </div>
          </div>
          
          {backtestResults && (
            <div className="summary-section">
              <div className="summary-section-title">Backtest Results</div>
              <div className="summary-section-card">
                <div className="summary-item">
                  <div className="summary-label">Total Returns</div>
                  <div className="summary-value">+{backtestResults.totalReturns}%</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Sharpe Ratio</div>
                  <div className="summary-value">{backtestResults.sharpeRatio}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Max Drawdown</div>
                  <div className="summary-value">-{backtestResults.maxDrawdown}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="config-form-actions">
        <button className="launch-action" onClick={onLaunch}>
          Launch Agent
        </button>
      </div>
    </div>
  );
};

export default AIChat;