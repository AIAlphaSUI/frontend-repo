'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAdapter } from '../../misc/adapter';
import './AnalyticsPage.css';

// Mock data for the AI Analytics page
const mockData = {
  newsReports: [
    {
      id: 1,
      headline: "TRADER A MAKES INSANE PROFIT TODAY $1000000 USD!",
      summary: "Whales having a DUMP DAY?!?!",
      date: "2025-05-20",
      priority: "high",
      details: {
        traderAddress: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
        traderName: "Trader A",
        profitDetails: "Made $1M in 24 hours trading SUI/USDC pairs with leveraged positions",
        relatedTokens: ["SUI", "USDC", "ETH"],
        transactions: [
          { hash: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", value: "$450,000", type: "Swap" },
          { hash: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", value: "$550,000", type: "Leveraged Position" }
        ]
      }
    },
    {
      id: 2,
      headline: "SUI token moving sideways, accumulation phase detected",
      summary: "Long-term holders increasing positions steadily",
      date: "2025-05-20",
      priority: "medium",
      details: {
        analysis: "On-chain data shows 14% increase in wallet addresses holding >10K SUI",
        priceRange: "$2.90 - $3.15 over the past 72 hours",
        volumeProfile: "Decreasing sell volume (-24%) with stable buy pressure",
        whalesAccumulating: [
          { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", amount: "2.3M SUI" },
          { address: "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb", amount: "1.7M SUI" }
        ],
        prediction: "Potential breakout in 3-5 days based on historical accumulation patterns"
      }
    }
  ],
  whales: [
    {
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      token: "SUI",
      holdings: 12500000,
      valueUSD: 37500000,
      recentActivity: "Accumulating",
      lastTransaction: "2025-05-19",
      txCount: 127,
      avgPosition: "$295,000",
      percentChange: 14.2,
      trend: "up"
    },
    {
      address: "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
      token: "USDC",
      holdings: 42000000,
      valueUSD: 42000000,
      recentActivity: "Selling",
      lastTransaction: "2025-05-20",
      txCount: 94,
      avgPosition: "$446,000",
      percentChange: -8.5,
      trend: "down"
    }
  ],
  topTraders: [
    {
      address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
      profitUSD: 845000,
      profitPercentage: 32.4,
      timeframe: "day",
      strategy: "DCA + Momentum",
      tokens: ["SUI", "ETH", "SOL"],
      winRate: "78%",
      avgTrade: "$108,000",
      streak: 7
    },
    {
      address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
      profitUSD: 612500,
      profitPercentage: 28.9,
      timeframe: "day",
      strategy: "Grid Trading",
      tokens: ["BTC", "SUI", "ARB"],
      winRate: "65%",
      avgTrade: "$94,000",
      streak: 4
    }
  ],
  tokenBubbles: {
    "SUI": [
      { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", holdings: 12500000, percentage: 12.5 },
      { address: "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb", holdings: 8700000, percentage: 8.7 },
      { address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", holdings: 5400000, percentage: 5.4 },
      { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", holdings: 4200000, percentage: 4.2 },
      { address: "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B", holdings: 3800000, percentage: 3.8 }
    ],
    "USDC": [
      { address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", holdings: 42000000, percentage: 4.2 },
      { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", holdings: 36500000, percentage: 3.65 },
      { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", holdings: 28000000, percentage: 2.8 },
      { address: "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb", holdings: 22000000, percentage: 2.2 },
      { address: "0xF1E2D3C4B5A6E7D8C9F0E1D2C3B4A5F6E7D8C9F0", holdings: 18000000, percentage: 1.8 }
    ]
  },
  aiResponses: [
    {
      question: "What's the market sentiment today?",
      answer: "Market sentiment is cautiously bullish with 62% of tokens showing positive momentum. SUI has particularly strong on-chain metrics with increasing whale accumulation.",
      chart: "/mock-market-sentiment-chart.png"
    },
    {
      question: "Show me the top performing tokens this week",
      answer: "Here are the top performers this week: SUI (+24.3%), BLUR (+18.7%), and ARB (+12.5%). All have shown significant whale accumulation and increased DEX volumes.",
      chart: "/mock-top-tokens-chart.png"
    }
  ]
};

const tutorialSteps = [
  {
    title: "Welcome to AI Analytics",
    content: "This dashboard provides real-time on-chain data, AI insights, and trading tools to help you make informed decisions.",
    icon: "🔍"
  },
  {
    title: "Agent SUI Reports",
    content: "Breaking news and market insights. Click on any report to see detailed analysis and supporting data.",
    target: ".ai-reports-section",
    icon: "📰"
  },
  {
    title: "Whale Tracker",
    content: "Monitor large holders and their movements. Click any row for details and use the 'Copy Trade' button to replicate their strategies.",
    target: ".whale-tracker",
    icon: "🐋"
  },
  {
    title: "Top Traders",
    content: "See who's making the most profit and what tokens they're trading. Copy their strategy with one click.",
    target: ".top-traders",
    icon: "📈"
  },
  {
    title: "Bubble Maps",
    content: "Visualize token distribution among top holders. Larger bubbles represent larger holdings.",
    target: ".bubble-maps",
    icon: "⭕"
  },
  {
    title: "AI Researcher",
    content: "Ask any question about the crypto market and get AI-powered insights based on our proprietary data.",
    target: ".ai-researcher-section",
    icon: "🤖"
  },
  {
    title: "Notifications",
    content: "Connect your wallet and set up real-time alerts for market movements and opportunities.",
    target: ".notification-area",
    icon: "🔔"
  }
];

const AnalyticsPage = () => {
  const [userAccount, setUserAccount] = useState(null);
  const [selectedToken, setSelectedToken] = useState("SUI");
  const [sortBy, setSortBy] = useState("valueUSD");
  const [timeframe, setTimeframe] = useState("day");
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [expandedReports, setExpandedReports] = useState({});
  const [selectedRow, setSelectedRow] = useState({ section: null, index: null });
  const [sectionsVisible, setSectionsVisible] = useState({
    reports: true,
    whales: true,
    traders: true,
    bubbles: true,
    aiResearcher: true
  });
  const [telegramId, setTelegramId] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  
  const chatEndRef = useRef(null);
  const router = useRouter();

  // Check if user has seen the tutorial before
  useEffect(() => {
    const hasTutorialBeenShown = localStorage.getItem('analyticsPageTutorialShown');
    if (hasTutorialBeenShown === 'true') {
      setShowTutorial(false);
    } else {
      setShowTutorial(true);
    }
  }, []);

  // Check if user is connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const adapter = await getAdapter();
        if (await adapter.canEagerConnect()) {
          await adapter.connect();
          const accounts = await adapter.getAccounts();
          if (accounts[0]) {
            setUserAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Connection error:", error);
      }
    };
    
    checkConnection();
    
    // Simulated data loading for visual effect
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  // Scroll to tutorial target element
  useEffect(() => {
    if (showTutorial && tutorialSteps[currentTutorialStep]?.target) {
      const targetElement = document.querySelector(tutorialSteps[currentTutorialStep].target);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [currentTutorialStep, showTutorial]);

  // Scroll to bottom of chat when history updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const completeTutorial = () => {
    localStorage.setItem('analyticsPageTutorialShown', 'true');
    setShowTutorial(false);
  };

  const nextTutorialStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevTutorialStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(prev => prev - 1);
    }
  };

  const toggleReportExpansion = (reportId) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  const toggleSectionVisibility = (section) => {
    setSectionsVisible(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRowSelect = (section, index) => {
    if (selectedRow.section === section && selectedRow.index === index) {
      // Deselect if clicking the same row
      setSelectedRow({ section: null, index: null });
    } else {
      setSelectedRow({ section, index });
    }
  };

  const handleCopyTrade = (trader) => {
    if (!userAccount) {
      alert("Please connect your wallet to copy trade");
      return;
    }
    // Navigate to agent creation with trader parameters
    router.push(`/agentcreation?strategy=${trader.strategy}&copy=true`);
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    if (!telegramId.trim()) return;
    
    // Simulate API call to register notification
    console.log(`Registering notifications for ${telegramId}`);
    
    // Redirect to Telegram bot
    window.open(`https://t.me/alphaSuiNotificationsBot?start=${encodeURIComponent(telegramId)}`, '_blank');
    setShowNotificationModal(false);
    
    // In a real application, you would send this to your backend
    alert(`Notifications setup! Please follow the instructions in Telegram.`);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    
    // Add user question to chat
    setChatHistory([...chatHistory, { 
      type: 'question', 
      content: chatQuery 
    }]);
    
    // Simulate typing indicator
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        type: 'typing'
      }]);
    }, 300);
    
    // Find a mock response or generate default
    const matchingResponse = mockData.aiResponses.find(r => 
      r.question.toLowerCase().includes(chatQuery.toLowerCase())
    );
    
    setTimeout(() => {
      // Remove typing indicator
      setChatHistory(prev => prev.filter(msg => msg.type !== 'typing'));
      
      if (matchingResponse) {
        setChatHistory(prev => [...prev, { 
          type: 'answer', 
          content: matchingResponse.answer,
          chart: matchingResponse.chart
        }]);
      } else {
        setChatHistory(prev => [...prev, { 
          type: 'answer', 
          content: "I've analyzed the data and found no significant patterns matching your query. Would you like me to look at a specific token or timeframe instead?",
          chart: null
        }]);
      }
      setChatQuery("");
    }, 1500);
  };

  return (
    <div className="analytics-page">
      {isLoading && (
        <div className="page-loading-overlay">
          <div className="loading-pulse"></div>
          <div className="loading-text">Loading Analytics...</div>
        </div>
      )}

      {/* Interactive Tutorial Overlay */}
      {showTutorial && !isLoading && (
        <div className="tutorial-overlay">
          <div className="tutorial-card">
            <div className="tutorial-header">
              <span className="tutorial-icon">{tutorialSteps[currentTutorialStep].icon}</span>
              <h3>{tutorialSteps[currentTutorialStep].title}</h3>
              <button className="tutorial-close" onClick={completeTutorial}>×</button>
            </div>
            <div className="tutorial-content">
              {tutorialSteps[currentTutorialStep].content}
            </div>
            <div className="tutorial-footer">
              <div className="tutorial-progress">
                {tutorialSteps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`progress-dot ${idx === currentTutorialStep ? 'active' : ''}`}
                    onClick={() => setCurrentTutorialStep(idx)}
                  />
                ))}
              </div>
              <div className="tutorial-actions">
                {currentTutorialStep > 0 && (
                  <button className="tutorial-btn prev" onClick={prevTutorialStep}>Previous</button>
                )}
                {currentTutorialStep < tutorialSteps.length - 1 ? (
                  <button className="tutorial-btn next" onClick={nextTutorialStep}>Next</button>
                ) : (
                  <button className="tutorial-btn finish" onClick={completeTutorial}>Got it!</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="analytics-header">
        <h1>AI AlphaSui Analytics</h1>
        <div className="notification-area">
          <p className="notification-banner">
            Buy 1 USD or more of our token to start getting notified! Type your telegram or email to start
          </p>
          <button 
            className={`notification-button ${!userAccount ? 'disabled' : ''}`}
            onClick={() => userAccount && setShowNotificationModal(true)}
            disabled={!userAccount}
          >
            GET NOTIFIED
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay">
          <div className="notification-modal">
            <h3>Set Up Notifications</h3>
            <p>Enter your Telegram ID to receive real-time analytics notifications</p>
            <form onSubmit={handleNotificationSubmit}>
              <input
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="@your_telegram_handle"
                className="telegram-input"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowNotificationModal(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Connect to Telegram
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI News Reports */}
      <section className="ai-reports-section">
        <div className="section-header-row">
          <h2>Agent SUI Reports</h2>
          <button 
            className="toggle-section-button" 
            onClick={() => toggleSectionVisibility('reports')}
          >
            {sectionsVisible.reports ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {sectionsVisible.reports && (
          <div className="report-container">
            {mockData.newsReports.map(report => (
              <div key={report.id} className={`report-card priority-${report.priority}`}>
                <div 
                  className="report-header"
                  onClick={() => toggleReportExpansion(report.id)}
                >
                  <div className="report-headline">{report.headline}</div>
                  <div className="report-summary">{report.summary}</div>
                  <div className="expand-icon">
                    {expandedReports[report.id] ? '▼' : '►'}
                  </div>
                </div>
                
                {expandedReports[report.id] && (
                  <div className="report-details">
                    {report.id === 1 ? (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Trader:</span>
                          <span className="detail-value">{report.details.traderName} ({report.details.traderAddress.substring(0, 6)}...{report.details.traderAddress.substring(report.details.traderAddress.length - 4)})</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Profit Details:</span>
                          <span className="detail-value">{report.details.profitDetails}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Related Tokens:</span>
                          <span className="detail-value">
                            {report.details.relatedTokens.map((token, i) => (
                              <span key={i} className="token-badge">{token}</span>
                            ))}
                          </span>
                        </div>
                        <h4>Key Transactions</h4>
                        <div className="transactions-table">
                          <div className="tx-header">
                            <div className="tx-cell">Transaction Hash</div>
                            <div className="tx-cell">Value</div>
                            <div className="tx-cell">Type</div>
                          </div>
                          {report.details.transactions.map((tx, idx) => (
                            <div key={idx} className="tx-row">
                              <div className="tx-cell">{`${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`}</div>
                              <div className="tx-cell">{tx.value}</div>
                              <div className="tx-cell">{tx.type}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Analysis:</span>
                          <span className="detail-value">{report.details.analysis}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Price Range:</span>
                          <span className="detail-value">{report.details.priceRange}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Volume Profile:</span>
                          <span className="detail-value">{report.details.volumeProfile}</span>
                        </div>
                        <h4>Whales Accumulating</h4>
                        <div className="transactions-table">
                          <div className="tx-header">
                            <div className="tx-cell">Address</div>
                            <div className="tx-cell">Amount</div>
                          </div>
                          {report.details.whalesAccumulating.map((whale, idx) => (
                            <div key={idx} className="tx-row">
                              <div className="tx-cell">{`${whale.address.substring(0, 6)}...${whale.address.substring(whale.address.length - 4)}`}</div>
                              <div className="tx-cell">{whale.amount}</div>
                            </div>
                          ))}
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Prediction:</span>
                          <span className="detail-value prediction">{report.details.prediction}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Analytics Sections - REARRANGED as requested */}
      <div className="analytics-grid">
        {/* Whale Tracker - Now first */}
        <section className="analytics-section whale-tracker">
          <div className="section-header-row">
            <h2>Whales</h2>
            <button 
              className="toggle-section-button" 
              onClick={() => toggleSectionVisibility('whales')}
            >
              {sectionsVisible.whales ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {sectionsVisible.whales && (
            <div className="section-content">
              <div className="filter-controls">
                <select 
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="token-select"
                >
                  <option value="SUI">SUI</option>
                  <option value="USDC">USDC</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="valueUSD">By Value (USD)</option>
                  <option value="holdings">By Holdings</option>
                </select>
              </div>

              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Holdings</th>
                        <th>USD Value</th>
                        <th>Activity</th>
                        <th>Change</th>
                        <th>Last TX</th>
                        <th>TX Count</th>
                        <th>Avg Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockData.whales
                        .filter(whale => selectedToken === "ALL" || whale.token === selectedToken)
                        .sort((a, b) => b[sortBy] - a[sortBy])
                        .map((whale, index) => (
                          <tr 
                            key={index} 
                            className={selectedRow.section === 'whales' && selectedRow.index === index ? 'selected' : ''}
                            onClick={() => handleRowSelect('whales', index)}
                          >
                            <td className="address">{`${whale.address.substring(0, 6)}...${whale.address.substring(whale.address.length - 4)}`}</td>
                            <td>{whale.holdings.toLocaleString()} {whale.token}</td>
                            <td className="value">${whale.valueUSD.toLocaleString()}</td>
                            <td className={`activity ${whale.recentActivity.toLowerCase()}`}>{whale.recentActivity}</td>
                            <td className={`change ${whale.trend}`}>{whale.percentChange > 0 ? '+' : ''}{whale.percentChange}%</td>
                            <td>{whale.lastTransaction}</td>
                            <td>{whale.txCount}</td>
                            <td>{whale.avgPosition}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <button 
                className={`copy-trade-button ${!userAccount ? 'disabled' : ''}`}
                onClick={() => userAccount && router.push('/agentcreation?strategy=whale_follower')}
                disabled={!userAccount}
              >
                <span className="btn-icon">👥</span> COPY TRADE <span className="btn-icon">🚀</span>
              </button>
            </div>
          )}
        </section>

        {/* Top Traders - Now second */}
        <section className="analytics-section top-traders">
          <div className="section-header-row">
            <h2>Top Traders</h2>
            <button 
              className="toggle-section-button" 
              onClick={() => toggleSectionVisibility('traders')}
            >
              {sectionsVisible.traders ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {sectionsVisible.traders && (
            <div className="section-content">
              <div className="filter-controls">
                <div className="time-toggle">
                  <button 
                    className={timeframe === "day" ? "active" : ""}
                    onClick={() => setTimeframe("day")}
                  >
                    Today
                  </button>
                  <button 
                    className={timeframe === "week" ? "active" : ""}
                    onClick={() => setTimeframe("week")}
                  >
                    This Week
                  </button>
                </div>
              </div>

              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Trader</th>
                        <th>Profit</th>
                        <th>%</th>
                        <th>Strategy</th>
                        <th>Tokens</th>
                        <th>Win Rate</th>
                        <th>Win Streak</th>
                        <th>Avg Trade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockData.topTraders
                        .filter(trader => trader.timeframe === timeframe)
                        .map((trader, index) => (
                          <tr 
                            key={index} 
                            className={selectedRow.section === 'traders' && selectedRow.index === index ? 'selected' : ''}
                            onClick={() => handleRowSelect('traders', index)}
                          >
                            <td className="address">{`${trader.address.substring(0, 6)}...${trader.address.substring(trader.address.length - 4)}`}</td>
                            <td className="profit-usd">${trader.profitUSD.toLocaleString()}</td>
                            <td className="profit">+{trader.profitPercentage}%</td>
                            <td>{trader.strategy}</td>
                            <td>
                              {trader.tokens.map((token, i) => (
                                <span key={i} className="token-badge small">{token}</span>
                              ))}
                            </td>
                            <td>{trader.winRate}</td>
                            <td className="streak">{trader.streak}🔥</td>
                            <td>{trader.avgTrade}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <button 
                className={`copy-trade-button ${!userAccount ? 'disabled' : ''}`}
                onClick={() => userAccount && handleCopyTrade(mockData.topTraders[0])}
                disabled={!userAccount}
              >
                <span className="btn-icon">📊</span> COPY TRADE <span className="btn-icon">💰</span>
              </button>
            </div>
          )}
        </section>

        {/* Bubble Maps - Now third */}
        <section className="analytics-section bubble-maps">
          <div className="section-header-row">
            <h2>Bubble Maps By Token</h2>
            <button 
              className="toggle-section-button" 
              onClick={() => toggleSectionVisibility('bubbles')}
            >
              {sectionsVisible.bubbles ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {sectionsVisible.bubbles && (
            <div className="section-content">
              <div className="filter-controls">
                <select 
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="token-select"
                >
                  <option value="SUI">SUI</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>

              <div className="bubble-visualization">
                {mockData.tokenBubbles[selectedToken].map((holder, index) => (
                  <div 
                    key={index} 
                    className={`bubble ${selectedRow.section === 'bubbles' && selectedRow.index === index ? 'selected' : ''}`}
                    style={{ 
                      width: `${Math.max(holder.percentage * 3, 5)}%`, 
                      height: `${Math.max(holder.percentage * 3, 5)}%`,
                      backgroundColor: `hsl(${220 + index * 30}, 70%, 60%)`,
                      opacity: 0.7 + (index * 0.1)
                    }}
                    onClick={() => handleRowSelect('bubbles', index)}
                  >
                    <span className="bubble-address">{`${holder.address.substring(0, 6)}...`}</span>
                    <span className="bubble-holdings">{holder.holdings.toLocaleString()} {selectedToken}</span>
                    <span className="bubble-percentage">{holder.percentage}%</span>
                  </div>
                ))}
                <div className="bubble-legend">
                  <div>Bubble size represents % of total supply</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* AI Researcher Chat */}
      <section className="ai-researcher-section">
        <div className="section-header-row">
          <h2>AI Alpha SUI Researcher</h2>
          <button 
            className="toggle-section-button" 
            onClick={() => toggleSectionVisibility('aiResearcher')}
          >
            {sectionsVisible.aiResearcher ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {sectionsVisible.aiResearcher && (
          <div className="researcher-container">
            <div className="chat-area">
              <div className="chat-messages">
                {chatHistory.length === 0 ? (
                  <div className="chat-placeholder">
                    <div className="chart-placeholder">
                      <div className="pie-chart animated">
                        <div className="pie-segment" style={{transform: 'rotate(0deg) skew(40deg)'}}></div>
                        <div className="pie-segment" style={{transform: 'rotate(40deg) skew(30deg)'}}></div>
                        <div className="pie-segment" style={{transform: 'rotate(70deg) skew(60deg)'}}></div>
                        <div className="pie-segment" style={{transform: 'rotate(130deg) skew(120deg)'}}></div>
                        <div className="pie-segment" style={{transform: 'rotate(250deg) skew(110deg)'}}></div>
                      </div>
                    </div>
                    <div className="chat-intro">
                      <h3>Ask Questions and AI will use our proprietary data to answer</h3>
                      <p>Try questions like:</p>
                      <ul>
                        <li>"What's the market sentiment today?"</li>
                        <li>"Show me the top performing tokens this week"</li>
                        <li>"Which whales are accumulating SUI?"</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((message, index) => (
                    message.type === 'typing' ? (
                      <div key={`typing-${index}`} className="chat-message answer typing">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    ) : (
                      <div key={index} className={`chat-message ${message.type}`}>
                        {message.type === 'answer' && message.chart && (
                          <div className="message-chart">
                            <img src={message.chart} alt="Analysis Chart" />
                          </div>
                        )}
                        <div className="message-content">{message.content}</div>
                      </div>
                    )
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="chat-input">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Ask a question about market data..."
                  className="chat-input-field"
                />
                <button type="submit" className="chat-submit">Ask AI</button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPage;