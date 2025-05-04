'use client'
import React from 'react'
import './AgentMarketHero.css'

const AgentMarketHero: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement search functionality
  }
  
  return (
    <div className="agent-market-hero">
      <h1 className="hero-title">Crypto Agent Market</h1>
      <p className="hero-subtitle">
        Explore the market performance of various crypto trading agents and discover the best performers in the ecosystem.
      </p>
      
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for agents by name or creator..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Search
          </button>
        </form>
        
        <div className="quick-filters">
          <span className="filter-label">Popular:</span>
          <div className="filter-tags">
            <button className="filter-tag">Top ROI</button>
            <button className="filter-tag">ML/AI</button>
            <button className="filter-tag">Low Risk</button>
            <button className="filter-tag">New Launches</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentMarketHero