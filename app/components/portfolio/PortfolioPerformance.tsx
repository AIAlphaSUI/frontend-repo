import React from 'react'
import './PortfolioPerformance.css'

interface AgentToken {
  id: string
  name: string
  symbol: string
  type: 'ml-ai' | 'quant' | 'hybrid'
  price: number
  change24h: number
  amount: number
  value: number
  logoUrl: string
}

interface PortfolioPerformanceProps {
  portfolioValue: {
    total: number
    change24h: number
    changePercent24h: number
  }
  agentTokens: AgentToken[]
}

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({ portfolioValue, agentTokens }) => {
  // Calculate distribution percentages
  const typeDistribution = agentTokens.reduce((acc: Record<string, number>, token) => {
    if (!acc[token.type]) {
      acc[token.type] = 0
    }
    acc[token.type] += token.value
    return acc
  }, {})
  
  // Convert to percentages
  const typePercentages = Object.entries(typeDistribution).map(([type, value]) => ({
    type,
    value,
    percentage: (value / portfolioValue.total) * 100
  }))
  
  // Calculate top performers
  const topPerformers = [...agentTokens]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3)
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  return (
    <div className="portfolio-performance">
      <div className="performance-card">
        <h3 className="card-title">Portfolio Distribution</h3>
        <div className="distribution-chart">
          <div className="chart-container">
            <div className="donut-chart">
              {typePercentages.map((item, index) => (
                <div 
                  key={item.type} 
                  className={`donut-segment ${item.type}`}
                  style={{ 
                    '--start': typePercentages
                      .slice(0, index)
                      .reduce((sum, i) => sum + i.percentage, 0),
                    '--extent': item.percentage
                  } as React.CSSProperties}
                ></div>
              ))}
              <div className="donut-hole"></div>
            </div>
          </div>
          
          <div className="distribution-legend">
            {typePercentages.map((item) => (
              <div key={item.type} className="legend-item">
                <div className={`legend-color ${item.type}`}></div>
                <div className="legend-label">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
                <div className="legend-value">{item.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="performance-card">
        <h3 className="card-title">Top Performers</h3>
        <div className="top-performers">
          {topPerformers.map((token) => (
            <div key={token.id} className="performer-item">
              <div className="performer-logo">
                <img 
                  src={token.logoUrl || `/agents/default.png`}
                  alt={token.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/agents/default.png'
                  }}
                />
              </div>
              <div className="performer-info">
                <div className="performer-name">{token.name}</div>
                <div className="performer-value">{formatCurrency(token.price)}</div>
              </div>
              <div className={`performer-change ${token.change24h >= 0 ? 'positive' : 'negative'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="performance-card">
        <h3 className="card-title">Recommended Actions</h3>
        <div className="recommended-actions">
          <div className="action-item">
            <div className="action-icon rebalance"></div>
            <div className="action-text">
              <h4>Rebalance Portfolio</h4>
              <p>Your ML/AI allocation is below target. Consider increasing exposure.</p>
            </div>
          </div>
          <div className="action-item">
            <div className="action-icon stake"></div>
            <div className="action-text">
              <h4>Stake Tokens</h4>
              <p>Earn up to 7.5% APY by staking your idle agent tokens.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioPerformance