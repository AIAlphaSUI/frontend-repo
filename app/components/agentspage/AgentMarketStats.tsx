import React from 'react'
import './AgentMarketStats.css'

interface AgentMarketStatsProps {
  stats: {
    totalMarketCap: string
    totalVolume: string
    btcDominance: string
    fearGreedIndex: string
  }
}

const AgentMarketStats: React.FC<AgentMarketStatsProps> = ({ stats }) => {
  return (
    <div className="market-stats-grid">
      <div className="stat-card">
        <div className="stat-icon global">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <div className="stat-info">
          <h4 className="stat-title">Total Market Cap</h4>
          <div className="stat-value">${stats.totalMarketCap}</div>
          <div className="stat-change positive">+3.2% ↑</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon volume">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div className="stat-info">
          <h4 className="stat-title">24h Volume</h4>
          <div className="stat-value">${stats.totalVolume}</div>
          <div className="stat-change positive">+12.7% ↑</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon btc">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 8h6"></path>
            <path d="M9 12h6"></path>
            <path d="M12 16h3"></path>
            <path d="M12 3v3"></path>
            <path d="M8 6h8l-4 14h-4z"></path>
          </svg>
        </div>
        <div className="stat-info">
          <h4 className="stat-title">BTC Dominance</h4>
          <div className="stat-value">{stats.btcDominance}</div>
          <div className="stat-change negative">-1.3% ↓</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon fear-greed">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          </svg>
        </div>
        <div className="stat-info">
          <h4 className="stat-title">Fear & Greed</h4>
          <div className="stat-value">{stats.fearGreedIndex}</div>
          <div className="stat-change positive">+5 ↑</div>
        </div>
      </div>
    </div>
  )
}

export default AgentMarketStats