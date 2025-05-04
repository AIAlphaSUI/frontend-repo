'use client'
import React, { useState, useEffect } from 'react'
import AgentMarketHero from './AgentMarketHero'
import AgentMarketStats from './AgentMarketStats'
import AgentFilters from './AgentFilters'
import AgentRankings from './AgentRankings'
import MarketCharts from './MarketCharts'
import './AgentsMarket.css'

const AgentsMarket: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'All' | 'ML/AI' | 'Quant' | 'Hybrid'>('All')
  const [sortBy, setSortBy] = useState<'ROI' | 'Market Cap' | 'Volume' | 'Holders'>('ROI')
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: '2.47T',
    totalVolume: '94.8B',
    btcDominance: '45.2%',
    fearGreedIndex: '72 - Greed'
  })

  useEffect(() => {
    const fetchAgentData = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, this would be an API call to your blockchain or backend
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockAgents: Agent[] = [
          {
            id: '1',
            name: 'OG TRADER',
            avatar: '/agents/og-trader.png',
            type: 'ML/AI',
            price: 2.78,
            change24h: 3.2,
            change7d: 15.7,
            marketCap: '2.78M',
            volume: '456K',
            roi: 142.8,
            holders: 1247,
            description: 'Advanced machine learning trading bot with a focus on trend identification and momentum strategies.'
          },
          {
            id: '2',
            name: 'DeltaForce',
            avatar: '/agents/deltaforce.png',
            type: 'Quant',
            price: 3.45,
            change24h: 1.8,
            change7d: 9.3,
            marketCap: '2.7M',
            volume: '320K',
            roi: 87.5,
            holders: 984,
            description: 'Quantitative trading agent specializing in statistical arbitrage and pairs trading.'
          },
          {
            id: '3',
            name: 'OmegaBot',
            avatar: '/agents/omegabot.png',
            type: 'Hybrid',
            price: 4.56,
            change24h: -1.2,
            change7d: 12.4,
            marketCap: '4.5M',
            volume: '512K',
            roi: 104.3,
            holders: 1123,
            description: 'Hybrid agent combining ML pattern recognition with traditional quant strategies for optimized performance.'
          },
          {
            id: '4',
            name: 'ThetaTrader',
            avatar: '/agents/thetatrader.png',
            type: 'ML/AI',
            price: 3.21,
            change24h: 5.8,
            change7d: 12.4,
            marketCap: '3.2M',
            volume: '387K',
            roi: 75.2,
            holders: 932,
            description: 'AI-powered options trading specialist with a focus on volatility prediction.'
          },
          {
            id: '5',
            name: 'QuantumEdge',
            avatar: '/agents/quantumedge.png',
            type: 'Quant',
            price: 1.98,
            change24h: 2.1,
            change7d: 5.6,
            marketCap: '1.5M',
            volume: '210K',
            roi: 62.7,
            holders: 785,
            description: 'High-frequency trading bot utilizing advanced mathematical models and statistical analysis.'
          },
          {
            id: '6',
            name: 'NexusMind',
            avatar: '/agents/nexusmind.png',
            type: 'ML/AI',
            price: 2.34,
            change24h: -0.8,
            change7d: 7.2,
            marketCap: '1.9M',
            volume: '275K',
            roi: 58.3,
            holders: 824,
            description: 'Deep learning model with natural language processing for sentiment-based trading strategies.'
          },
          {
            id: '7',
            name: 'NeuroSend',
            avatar: '/agents/neurosend.png',
            type: 'Hybrid',
            price: 1.45,
            change24h: 4.3,
            change7d: 8.7,
            marketCap: '1.2M',
            volume: '156K',
            roi: 64.1,
            holders: 521,
            description: 'Neural network system combined with technical analysis for multi-timeframe trading signals.'
          }
        ]
        
        setAgents(mockAgents)
      } catch (error) {
        console.error("Error fetching agent data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAgentData()
  }, [])

  // Filter agents based on active filter
  const filteredAgents = activeFilter === 'All' 
    ? agents 
    : agents.filter(agent => agent.type === activeFilter)

  // Sort agents based on sort criteria
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'ROI':
        return b.roi - a.roi
      case 'Market Cap':
        return parseFloat(b.marketCap.slice(0, -1)) - parseFloat(a.marketCap.slice(0, -1))
      case 'Volume':
        return parseFloat(b.volume.slice(0, -1)) - parseFloat(a.volume.slice(0, -1))
      case 'Holders':
        return b.holders - a.holders
      default:
        return 0
    }
  })

  return (
    <div className="agents-market-container">
      <AgentMarketHero />
      <AgentMarketStats stats={marketStats} />
      
      <div className="agent-rankings-wrapper">
        <h2 className="section-title">Crypto Agent Rankings</h2>
        <div className="agents-content">
          <div className="filter-sort-container">
            <AgentFilters 
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
          
          <AgentRankings 
            agents={sortedAgents}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <div className="market-analysis-wrapper">
        <h2 className="section-title">Market Analysis</h2>
        <MarketCharts />
      </div>
    </div>
  )
}

// Types
export interface Agent {
  id: string
  name: string
  avatar: string
  type: 'ML/AI' | 'Quant' | 'Hybrid'
  price: number
  change24h: number
  change7d: number
  marketCap: string
  volume: string
  roi: number
  holders: number
  description: string
}

export default AgentsMarket