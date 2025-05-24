'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAdapter } from '../../misc/adapter';
import './AnalyticsPage.css';

// Define interfaces based on FastAPI models
interface Holder {
  address: string;
  amount: number;
  percentage: number;
}

interface Token {
  coinType: string;
  coinName: string;
  coinSymbol: string;
  supply: number;
  supplyInUsd: number;
  topHolders: Holder[];
  totalHeldByTopHolders: number;
  percentageHeldByTopHolders: number;
}

interface ConcentratedToken {
  symbol: string;
  name: string;
  topHolderPercentage: number;
  topHolderAddress: string;
}

// Updated Trader interface to match the API response
interface Trader {
  network: string;
  address: string;
  pnl: number;
  volume: number;
  trade_count: number;
  roi?: number; // Optional since it might not be in the response
}

interface TopTradersResponse {
  period: string;
  sort_by: string;
  sort_type: string;
  count: number;
  traders: Trader[];
  timestamp: string;
  statistics?: {
    avg_pnl: number;
    avg_roi: number;
    max_pnl: number;
    max_roi: number;
    min_pnl: number;
    min_roi: number;
  };
}

const tutorialSteps = [
  {
    title: "Welcome to SUI Analytics",
    content: "This dashboard provides real-time on-chain data, trading information, and concentration analysis to help you make informed decisions.",
    icon: "🔍"
  },
  {
    title: "Top Traders",
    content: "See who's making the most profit and what tokens they're trading. Copy their wallet address with one click.",
    target: ".top-traders",
    icon: "📈"
  },
  {
    title: "Whale Tracker",
    content: "Monitor large holders and their movements. Click any row for details and copy wallet addresses.",
    target: ".whale-tracker",
    icon: "🐋"
  },
  {
    title: "Bubble Maps",
    content: "Visualize token distribution among top holders. Larger bubbles represent larger holdings.",
    target: ".bubble-maps",
    icon: "⭕"
  },
  {
    title: "Concentration Analysis",
    content: "Identify tokens with high concentration of holdings, which may indicate potential risks or opportunities.",
    target: ".concentration-section",
    icon: "📊"
  },
  {
    title: "Notifications",
    content: "Connect your wallet and set up real-time alerts for market movements and opportunities.",
    target: ".notification-area",
    icon: "🔔"
  }
];

const API_BASE_URL = 'http://localhost:8003'; // Update with your actual API URL

const AnalyticsPage = () => {
  const [userAccount, setUserAccount] = useState(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenSymbols, setTokenSymbols] = useState<string[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [selectedTokenData, setSelectedTokenData] = useState<Token | null>(null);
  const [sortBy, setSortBy] = useState("supplyInUsd");
  const [sortOrder, setSortOrder] = useState("desc");
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [tradingPeriod, setTradingPeriod] = useState<string>("1W");
  const [tradingSortBy, setTradingSortBy] = useState<string>("PnL");
  const [concentratedTokens, setConcentratedTokens] = useState<ConcentratedToken[]>([]);
  const [concentrationThreshold, setConcentrationThreshold] = useState<number>(50);
  const [telegramId, setTelegramId] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [selectedRow, setSelectedRow] = useState({ section: null, index: null });
  const [sectionsVisible, setSectionsVisible] = useState({
    concentration: true,
    whales: true,
    traders: true,
    bubbles: true,
  });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showCopyTradeModal, setShowCopyTradeModal] = useState(false);
  const [selectedTraderAddress, setSelectedTraderAddress] = useState<string | null>(null);
  
  // Pagination states
  const [traderPage, setTraderPage] = useState(1);
  const [holderPage, setHolderPage] = useState(1);
  const [concentrationPage, setConcentrationPage] = useState(1);
  const itemsPerPage = 5;
  
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
  }, []);

  // Load token symbols
  useEffect(() => {
    const fetchTokenSymbols = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/tokens`);
        if (!response.ok) {
          throw new Error('Failed to fetch token symbols');
        }
        const symbols = await response.json();
        setTokenSymbols(symbols);
        if (symbols.length > 0) {
          setSelectedToken(symbols[0]);
        }
      } catch (error) {
        console.error('Error fetching token symbols:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokenSymbols();
  }, []);

  // Load tokens details
  useEffect(() => {
    const fetchTokensData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/tokens/details?sort_by=${sortBy}&order=${sortOrder}`);
        if (!response.ok) {
          throw new Error('Failed to fetch token details');
        }
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching token details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokensData();
  }, [sortBy, sortOrder]);

  // Load selected token data
  useEffect(() => {
    const fetchSelectedTokenData = async () => {
      if (!selectedToken) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/token/${selectedToken}`);
        if (!response.ok) {
          if (response.status === 404) {
            setSelectedTokenData(null);
            return;
          }
          throw new Error('Failed to fetch token data');
        }
        const data = await response.json();
        setSelectedTokenData(data);
        // Reset holder pagination when token changes
        setHolderPage(1);
      } catch (error) {
        console.error('Error fetching selected token data:', error);
        setSelectedTokenData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSelectedTokenData();
  }, [selectedToken]);

  // Load top traders
  useEffect(() => {
    const fetchTopTraders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/top_traders?period=${tradingPeriod}&sort_by=${tradingSortBy}&sort_type=desc&limit=20`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch top traders');
        }
        const data: TopTradersResponse = await response.json();
        setTopTraders(data.traders);
        // Reset trader pagination when filters change
        setTraderPage(1);
      } catch (error) {
        console.error('Error fetching top traders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopTraders();
  }, [tradingPeriod, tradingSortBy]);

  // Load concentration data
  useEffect(() => {
    const fetchConcentrationData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/concentration?threshold=${concentrationThreshold}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch concentration data');
        }
        const data = await response.json();
        setConcentratedTokens(data);
        // Reset concentration pagination when threshold changes
        setConcentrationPage(1);
      } catch (error) {
        console.error('Error fetching concentration data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConcentrationData();
  }, [concentrationThreshold]);

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


  useEffect(() => {
    if (selectedTokenData && sectionsVisible.bubbles) {
      // Use setTimeout to ensure DOM elements are rendered before accessing them
      setTimeout(() => {
        initializeBubbleChart();
      }, 100);
    }
  }, [selectedTokenData, sectionsVisible.bubbles]);
  
  // Add the initializeBubbleChart function here
  const initializeBubbleChart = () => {
    const bubbles = document.querySelectorAll('.bubble');
    if (!bubbles.length) return;
    
    const percentages = Array.from(bubbles).map(bubble => {
      const percentageText = bubble.querySelector('.bubble-percentage')?.innerText || '0%';
      return parseFloat(percentageText.replace('%', ''));
    });
    
    // Find min and max percentages
    const minPercentage = Math.min(...percentages);
    const maxPercentage = Math.max(...percentages);
    const range = maxPercentage - minPercentage;
    
    // Set size of each bubble proportionally
    bubbles.forEach((bubble, index) => {
      const percentage = percentages[index];
      
      // Calculate size between 40px and 140px based on percentage value
      const sizeFactor = range > 0 ? (percentage - minPercentage) / range : 0.5;
      const size = Math.max(40, 40 + sizeFactor * 100);
      
      // Apply size and store it as a CSS variable for font scaling
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.setProperty('--size', size);
      
      // Categorize for color coding
      if (sizeFactor > 0.66) {
        bubble.setAttribute('data-percentage', 'high');
      } else if (sizeFactor > 0.33) {
        bubble.setAttribute('data-percentage', 'medium');
      } else {
        bubble.setAttribute('data-percentage', 'low');
      }
    });
  };
  

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(text);
        setTimeout(() => {
          setCopySuccess(null);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
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

  const showCopyTradePrompt = (address: string) => {
    setSelectedTraderAddress(address);
    setShowCopyTradeModal(true);
  };

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return 'N/A';
    
    // For large numbers, use abbreviations
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    
    return num.toFixed(decimals);
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Calculate pagination for each table
  const paginatedTraders = topTraders.slice(
    (traderPage - 1) * itemsPerPage,
    traderPage * itemsPerPage
  );

  const paginatedHolders = selectedTokenData?.topHolders.slice(
    (holderPage - 1) * itemsPerPage,
    holderPage * itemsPerPage
  ) || [];

  const paginatedConcentratedTokens = concentratedTokens.slice(
    (concentrationPage - 1) * itemsPerPage,
    concentrationPage * itemsPerPage
  );

  // Pagination controls
  const renderPagination = (currentPage, totalItems, setPage, section) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination">
        <button 
          className="pagination-button"
          disabled={currentPage === 1} 
          onClick={() => setPage(1)}
        >
          &laquo;
        </button>
        <button 
          className="pagination-button"
          disabled={currentPage === 1} 
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
        >
          &lsaquo;
        </button>
        <span className="pagination-info">
          {currentPage} / {totalPages}
        </span>
        <button 
          className="pagination-button"
          disabled={currentPage === totalPages} 
          onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
        >
          &rsaquo;
        </button>
        <button 
          className="pagination-button"
          disabled={currentPage === totalPages} 
          onClick={() => setPage(totalPages)}
        >
          &raquo;
        </button>
      </div>
    );
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
        <h1>SUI Analytics Dashboard</h1>
        <div className="notification-area">
          <p className="notification-banner">
            Get real-time token concentration and whale movement alerts!
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

      {/* Copy Trade Modal */}
      {showCopyTradeModal && (
        <div className="modal-overlay">
          <div className="copy-trade-modal">
            <h3>Copy Trading</h3>
            <p>Automated copy trading is coming soon!</p>
            <p>You will be able to automatically copy trades from {shortenAddress(selectedTraderAddress)}</p>
            <div className="coming-soon-label">
              <span className="pulse-dot"></span>
              Coming Soon
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => setShowCopyTradeModal(false)} 
                className="close-button"
              >
                Close
              </button>
              <button 
                type="button" 
                className="remind-button"
                onClick={() => {
                  setShowCopyTradeModal(false);
                  alert("We'll notify you when copy trading launches!");
                }}
              >
                Remind Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Indicator */}
      {copySuccess && (
        <div className="copy-success-indicator">
          <span>✓ Copied: {shortenAddress(copySuccess)}</span>
        </div>
      )}

      {/* Interactive Analytics Sections */}
      <div className="analytics-grid">
        {/* Top Traders - First */}
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
                    className={tradingPeriod === "1D" ? "active" : ""}
                    onClick={() => setTradingPeriod("1D")}
                  >
                    Today
                  </button>
                  <button 
                    className={tradingPeriod === "1W" ? "active" : ""}
                    onClick={() => setTradingPeriod("1W")}
                  >
                    This Week
                  </button>
                  <button 
                    className={tradingPeriod === "1M" ? "active" : ""}
                    onClick={() => setTradingPeriod("1M")}
                  >
                    This Month
                  </button>
                </div>
                <div className="sort-toggle">
                  <button 
                    className={tradingSortBy === "PnL" ? "active" : ""}
                    onClick={() => setTradingSortBy("PnL")}
                  >
                    By PnL
                  </button>
                  <button 
                    className={tradingSortBy === "ROI" ? "active" : ""}
                    onClick={() => setTradingSortBy("ROI")}
                  >
                    By ROI
                  </button>
                </div>
              </div>

              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>PnL (USD)</th>
                        <th>Volume (USD)</th>
                        <th>TX Count</th>
                        <th>Network</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTraders.map((trader, index) => (
                        <tr 
                          key={index} 
                          className={selectedRow.section === 'traders' && selectedRow.index === index ? 'selected' : ''}
                          onClick={() => handleRowSelect('traders', index)}
                        >
                          <td className="address">
                            {shortenAddress(trader.address)}
                            <button 
                              className="copy-button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(trader.address);
                              }}
                            >
                              📋
                            </button>
                          </td>
                          <td className="profit-usd">${formatNumber(trader.pnl)}</td>
                          <td>${formatNumber(trader.volume)}</td>
                          <td>{trader.trade_count}</td>
                          <td>{trader.network}</td>
                          <td className="actions-cell">
                            <button 
                              className="action-button copy-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(trader.address);
                              }}
                            >
                              Copy Address
                            </button>
                            <button 
                              className="action-button copy-trade-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                showCopyTradePrompt(trader.address);
                              }}
                            >
                              Copy Trade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(traderPage, topTraders.length, setTraderPage, 'traders')}
              </div>
            </div>
          )}
        </section>

        {/* Whale Tracker - Second */}
        <section className="analytics-section whale-tracker">
          <div className="section-header-row">
            <h2>Token Holders</h2>
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
                  {tokenSymbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              <div className="token-info">
                {selectedTokenData && (
                  <div className="token-stats">
                    <div className="stat-item">
                      <span className="stat-label">Name:</span>
                      <span className="stat-value">{selectedTokenData.coinName}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Supply:</span>
                      <span className="stat-value">{formatNumber(selectedTokenData.supply)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">USD Value:</span>
                      <span className="stat-value">${formatNumber(selectedTokenData.supplyInUsd)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">% Held by Top Holders:</span>
                      <span className="stat-value">{formatNumber(selectedTokenData.percentageHeldByTopHolders)}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                        <th>Est. USD Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHolders.map((holder, index) => {
                        const usdValue = selectedTokenData ? 
                          holder.amount * (selectedTokenData.supplyInUsd / selectedTokenData.supply) : 0;
                        return (
                          <tr 
                            key={index} 
                            className={selectedRow.section === 'whales' && selectedRow.index === index ? 'selected' : ''}
                            onClick={() => handleRowSelect('whales', index)}
                          >
                            <td className="address">
                              {shortenAddress(holder.address)}
                              <button 
                                className="copy-button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(holder.address);
                                }}
                              >
                                📋
                              </button>
                            </td>
                            <td>{formatNumber(holder.amount)}</td>
                            <td>{formatNumber(holder.percentage)}%</td>
                            <td>${formatNumber(usdValue)}</td>
                            <td>
                              <button 
                                className="action-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(holder.address);
                                }}
                              >
                                Copy Address
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedTokenData && renderPagination(
                  holderPage, 
                  selectedTokenData.topHolders.length, 
                  setHolderPage, 
                  'whales'
                )}
              </div>
            </div>
          )}
        </section>

        {/* Bubble Maps - Third */}
        <section className="analytics-section bubble-maps">
          <div className="section-header-row">
            <h2>Concentration Visualization</h2>
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
                  {tokenSymbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              {selectedTokenData && (
              <div className="bubble-visualization">
                {selectedTokenData.topHolders.map((holder, index) => (
                  <div 
                    key={index} 
                    className={`bubble ${selectedRow.section === 'bubbles' && selectedRow.index === index ? 'selected' : ''}`}
                    data-address={holder.address}
                  >
                    <span className="bubble-percentage">{formatNumber(holder.percentage)}%</span>
                    <div 
                      className="bubble-copy" 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(holder.address);
                      }}
                    />
                  </div>
                ))}
                <div className="bubble-legend">
                  <div className="legend-item">
                    <span className="legend-color high"></span>
                    <span>High concentration</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color medium"></span>
                    <span>Medium concentration</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color low"></span>
                    <span>Low concentration</span>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}
        </section>

        {/* Concentration Analysis - Fourth */}
        <section className="analytics-section concentration-section">
          <div className="section-header-row">
            <h2>Concentration Analysis</h2>
            <button 
              className="toggle-section-button" 
              onClick={() => toggleSectionVisibility('concentration')}
            >
              {sectionsVisible.concentration ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {sectionsVisible.concentration && (
            <div className="section-content">
              <div className="filter-controls">
                <div className="threshold-slider">
                  <label>Concentration Threshold: {concentrationThreshold}%</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    value={concentrationThreshold} 
                    onChange={(e) => setConcentrationThreshold(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>

              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Top Holder %</th>
                        <th>Top Holder Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedConcentratedTokens.map((token, index) => (
                        <tr 
                          key={index} 
                          className={selectedRow.section === 'concentration' && selectedRow.index === index ? 'selected' : ''}
                          onClick={() => handleRowSelect('concentration', index)}
                        >
                          <td>{token.symbol}</td>
                          <td>{token.name}</td>
                          <td className="percentage-cell">{formatNumber(token.topHolderPercentage)}%</td>
                          <td className="address">
                            {shortenAddress(token.topHolderAddress)}
                            <button 
                              className="copy-button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(token.topHolderAddress);
                              }}
                            >
                              📋
                            </button>
                          </td>
                          <td>
                            <button 
                              className="action-button"
                              onClick={() => setSelectedToken(token.symbol)}
                            >
                              View Token
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(
                  concentrationPage, 
                  concentratedTokens.length, 
                  setConcentrationPage, 
                  'concentration'
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalyticsPage;