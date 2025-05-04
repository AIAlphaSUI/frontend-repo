import React, { useState } from 'react'
import './PortfolioHoldings.css'

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

interface PortfolioHoldingsProps {
  agentTokens: AgentToken[]
}

const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({ agentTokens }) => {
  const [sortKey, setSortKey] = useState<keyof AgentToken>('value')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  const handleSort = (key: keyof AgentToken) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }
  
  const sortedTokens = [...agentTokens].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortKey] > b[sortKey] ? 1 : -1
    } else {
      return a[sortKey] < b[sortKey] ? 1 : -1
    }
  })
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value)
  }
  
  return (
    <div className="portfolio-holdings">
      <div className="holdings-header">
        <h2>Your Agent Token Holdings</h2>
      </div>
      
      <div className="holdings-table">
        <div className="holdings-table-header">
          <div className="th agent-info">Agent</div>
          <div 
            className={`th price ${sortKey === 'price' ? 'sorted ' + sortDirection : ''}`}
            onClick={() => handleSort('price')}
          >
            Price
            <span className="sort-arrow"></span>
          </div>
          <div 
            className={`th change ${sortKey === 'change24h' ? 'sorted ' + sortDirection : ''}`}
            onClick={() => handleSort('change24h')}
          >
            24h Change
            <span className="sort-arrow"></span>
          </div>
          <div 
            className={`th amount ${sortKey === 'amount' ? 'sorted ' + sortDirection : ''}`}
            onClick={() => handleSort('amount')}
          >
            Amount
            <span className="sort-arrow"></span>
          </div>
          <div 
            className={`th value ${sortKey === 'value' ? 'sorted ' + sortDirection : ''}`}
            onClick={() => handleSort('value')}
          >
            Value
            <span className="sort-arrow"></span>
          </div>
          <div className="th actions">Actions</div>
        </div>
        
        <div className="holdings-table-body">
          {sortedTokens.map((token) => (
            <div key={token.id} className="token-row">
              <div className="td agent-info">
                <div className="agent-logo">
                  <img 
                    src={token.logoUrl || `/agents/default.png`}
                    alt={token.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/agents/default.png'
                    }}
                  />
                </div>
                <div className="agent-details">
                  <div className="agent-name">{token.name}</div>
                  <div className="agent-metadata">
                    <span className="agent-symbol">{token.symbol}</span>
                    <span className={`agent-type ${token.type}`}>{token.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="td price">{formatCurrency(token.price)}</div>
              
              <div className={`td change ${token.change24h >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-icon">
                  {token.change24h >= 0 ? '▲' : '▼'}
                </span>
                {Math.abs(token.change24h).toFixed(2)}%
              </div>
              
              <div className="td amount">{formatNumber(token.amount)}</div>
              
              <div className="td value">{formatCurrency(token.value)}</div>
              
              <div className="td actions">
                <button className="action-btn buy">Buy</button>
                <button className="action-btn sell">Sell</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PortfolioHoldings