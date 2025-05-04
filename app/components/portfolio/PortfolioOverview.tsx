import React from 'react'
import './PortfolioOverview.css'

interface PortfolioOverviewProps {
  portfolioValue: {
    total: number
    change24h: number
    changePercent24h: number
  }
  agentCount: number
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolioValue, agentCount }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  return (
    <div className="portfolio-overview">
      <div className="overview-card total-value">
        <h3>Total Portfolio Value</h3>
        <div className="value-container">
          <div className="value">{formatCurrency(portfolioValue.total)}</div>
          <div className={`change ${portfolioValue.changePercent24h >= 0 ? 'positive' : 'negative'}`}>
            <span className="change-icon">
              {portfolioValue.changePercent24h >= 0 ? '▲' : '▼'}
            </span>
            {formatCurrency(Math.abs(portfolioValue.change24h))} ({Math.abs(portfolioValue.changePercent24h).toFixed(2)}%)
          </div>
        </div>
        <div className="subtitle">24h Change</div>
      </div>

      <div className="overview-card agents-count">
        <h3>Agent Tokens</h3>
        <div className="value-container">
          <div className="value">{agentCount}</div>
        </div>
        <div className="subtitle">Unique tokens</div>
      </div>
      
      <div className="overview-card portfolio-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-button buy">
            <span className="icon">+</span> Buy Agent Tokens
          </button>
          <button className="action-button swap">
            <span className="icon">↔</span> Swap Tokens
          </button>
        </div>
      </div>
    </div>
  )
}

export default PortfolioOverview