"use client";

import React, { useState, useEffect } from 'react'
import { WalletAccount } from '@mysten/wallet-standard'
import { getAdapter } from '../misc/adapter'
import Header from '../components/Header'
import Background from '../components/Background'
import Loading from '../components/portfolio/Loading'
import PortfolioOverview from '../components/portfolio/PortfolioOverview'
import PortfolioHoldings from '../components/portfolio/PortfolioHoldings'
import PortfolioPerformance from '../components/portfolio/PortfolioPerformance'
import DeployedAgents from '../components/portfolio/DeployedAgents'
import ActiveStrategies from '../components/portfolio/ActiveStrategies'
import './portfolio.css'

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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | undefined>()
  const [agentTokens, setAgentTokens] = useState<AgentToken[]>([])
  const [portfolioValue, setPortfolioValue] = useState({
    total: 0,
    change24h: 0,
    changePercent24h: 0
  })

  useEffect(() => {
    const checkWalletConnection = async () => {
      setIsLoading(true)
      try {
        const adapter = await getAdapter()
        if (await adapter.canEagerConnect()) {
          try {
            await adapter.connect()
            const accounts = await adapter.getAccounts()
            if (accounts[0]) {
              setWalletAddress(accounts[0].address)
              setIsConnected(true)
              
              // In a real app, you would fetch the user's tokens from the blockchain here
              // For this example, we'll use mock data for a connected wallet
              fetchUserAgentTokens(accounts[0].address)
            } else {
              // Not connected, use sample data
              fetchSampleAgentTokens()
            }
          } catch (error) {
            console.error("Failed to connect wallet:", error)
            fetchSampleAgentTokens()
          }
        } else {
          // Wallet can't connect, use sample data
          fetchSampleAgentTokens()
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
        fetchSampleAgentTokens()
      } finally {
        setIsLoading(false)
      }
    }

    checkWalletConnection()
  }, [])

  // This would be replaced with real blockchain data in a production app
  const fetchUserAgentTokens = async (address: string) => {
    // Simulate API call to get user tokens
    setTimeout(() => {
      const userTokens: AgentToken[] = [
        {
          id: '0x1234567890abcdef1234567890abcdef1',
          name: 'Predictive Alpha',
          symbol: 'PALPHA',
          type: 'ml-ai',
          price: 2.83,
          change24h: 12.5,
          amount: 1250.5,
          value: 3538.91,
          logoUrl: '/agents/agent1.png',
        },
        {
          id: '0x1234567890abcdef1234567890abcdef2',
          name: 'QuarkTrade',
          symbol: 'QTR',
          type: 'quant',
          price: 8.91,
          change24h: -2.3,
          amount: 346.2,
          value: 3084.64,
          logoUrl: '/agents/agent2.png',
        },
        {
          id: '0x1234567890abcdef1234567890abcdef3',
          name: 'NeuralNet Predictor',
          symbol: 'NNP',
          type: 'ml-ai',
          price: 1.24,
          change24h: 5.7,
          amount: 2500,
          value: 3100,
          logoUrl: '/agents/agent3.png',
        },
        {
          id: '0x1234567890abcdef1234567890abcdef4',
          name: 'BlendBot Market',
          symbol: 'BBM',
          type: 'hybrid',
          price: 4.56,
          change24h: 22.8,
          amount: 1050,
          value: 4788,
          logoUrl: '/agents/agent4.png',
        },
        {
          id: '0x1234567890abcdef1234567890abcdef5',
          name: 'Quantum Price Model',
          symbol: 'QPM',
          type: 'quant',
          price: 5.28,
          change24h: -1.3,
          amount: 850,
          value: 4488,
          logoUrl: '/agents/agent5.png',
        }
      ]

      setAgentTokens(userTokens)

      // Calculate portfolio totals
      const totalValue = userTokens.reduce((sum, token) => sum + token.value, 0)
      const weighted24hChange = userTokens.reduce((sum, token) => {
        // Weight each token's contribution to the 24h change by its proportion of portfolio
        const weight = token.value / totalValue
        return sum + (token.change24h * weight)
      }, 0)
      
      setPortfolioValue({
        total: totalValue,
        change24h: totalValue * (weighted24hChange / 100),
        changePercent24h: weighted24hChange
      })
    }, 1000)
  }

  // Sample data for users who aren't connected
  const fetchSampleAgentTokens = () => {
    const sampleTokens: AgentToken[] = [
      {
        id: '0xsample1',
        name: 'Sample Alpha AI',
        symbol: 'SAMP',
        type: 'ml-ai',
        price: 3.75,
        change24h: 15.2,
        amount: 1000,
        value: 3750,
        logoUrl: '/agents/agent1.png',
      },
      {
        id: '0xsample2',
        name: 'Demo Quant',
        symbol: 'DEMO',
        type: 'quant',
        price: 6.50,
        change24h: -1.8,
        amount: 500,
        value: 3250,
        logoUrl: '/agents/agent2.png',
      },
      {
        id: '0xsample3',
        name: 'Example Hybrid',
        symbol: 'EXAM',
        type: 'hybrid',
        price: 2.25,
        change24h: 8.4,
        amount: 1500,
        value: 3375,
        logoUrl: '/agents/agent3.png',
      }
    ]

    setAgentTokens(sampleTokens)
    
    const totalValue = sampleTokens.reduce((sum, token) => sum + token.value, 0)
    const weighted24hChange = sampleTokens.reduce((sum, token) => {
      const weight = token.value / totalValue
      return sum + (token.change24h * weight)
    }, 0)
    
    setPortfolioValue({
      total: totalValue,
      change24h: totalValue * (weighted24hChange / 100),
      changePercent24h: weighted24hChange
    })
  }

  return (
    <div className="app-wrapper">
      <Background />
      <div className="content-wrapper">
        <Header />
        
        <div className="portfolio-container">
          {isLoading ? (
            <Loading message="Loading portfolio data..." />
          ) : (
            <>
              {!isConnected && (
                <div className="connect-wallet-notice">
                  <div className="connect-wallet-content">
                    <h2>Demo Mode - Sample Portfolio</h2>
                    <p>Connect your wallet to see your actual agent token holdings.</p>
                  </div>
                </div>
              )}
              
              <h1 className="portfolio-title">
                <span>Your</span> Portfolio
                {isConnected && walletAddress && (
                  <span className="wallet-address">
                    {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                  </span>
                )}
              </h1>
              
              <PortfolioOverview 
                portfolioValue={portfolioValue}
                agentCount={agentTokens.length} 
              />
              
              {/* Display deployed agent tokens from your wallet */}
              <DeployedAgents walletAddress={walletAddress} />
              
              {/* Display active trading strategies */}
              <ActiveStrategies walletAddress={walletAddress} />
              
              <div className="portfolio-grid">
                <div className="portfolio-main">
                  <PortfolioHoldings 
                    agentTokens={agentTokens} 
                  />
                </div>
                <div className="portfolio-side">
                  <PortfolioPerformance 
                    portfolioValue={portfolioValue} 
                    agentTokens={agentTokens} 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}