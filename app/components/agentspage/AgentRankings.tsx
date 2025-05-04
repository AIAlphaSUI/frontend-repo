import React from 'react'
import { Agent } from './AgentsMarket'
import './AgentRankings.css'

interface AgentRankingsProps {
  agents: Agent[]
  isLoading: boolean
}

const AgentRankings: React.FC<AgentRankingsProps> = ({ agents, isLoading }) => {
  const [currentPage, setCurrentPage] = React.useState(1)
  const agentsPerPage = 5
  
  // Calculate pagination
  const indexOfLastAgent = currentPage * agentsPerPage
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage
  const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent)
  const totalPages = Math.ceil(agents.length / agentsPerPage)
  
  const goToPage = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <div className="agent-rankings">
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading agent data...</p>
        </div>
      ) : (
        <>
          <div className="agents-table">
            <div className="agents-table-header">
              <div className="th rank">#</div>
              <div className="th agent">Agent</div>
              <div className="th price">Price</div>
              <div className="th change">24h %</div>
              <div className="th change">7d %</div>
              <div className="th market-cap">Market Cap</div>
              <div className="th volume">Volume (24h)</div>
              <div className="th roi">ROI</div>
              <div className="th holders">Holders</div>
              <div className="th actions">Actions</div>
            </div>
            
            <div className="agents-table-body">
              {currentAgents.map((agent, index) => (
                <div key={agent.id} className="agent-row">
                  <div className="td rank">{indexOfFirstAgent + index + 1}</div>
                  <div className="td agent">
                    <div className="agent-info">
                      <div className="agent-avatar">
                        <div className="avatar-placeholder"></div>
                      </div>
                      <div className="agent-name-container">
                        <div className="agent-name">{agent.name}</div>
                        <div className={`agent-type ${agent.type.toLowerCase().replace('/', '-')}`}>
                          {agent.type}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="td price">${agent.price.toFixed(2)}</div>
                  <div className={`td change ${agent.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(1)}%
                  </div>
                  <div className={`td change ${agent.change7d >= 0 ? 'positive' : 'negative'}`}>
                    {agent.change7d >= 0 ? '+' : ''}{agent.change7d.toFixed(1)}%
                  </div>
                  <div className="td market-cap">${agent.marketCap}</div>
                  <div className="td volume">${agent.volume}</div>
                  <div className="td roi positive">+{agent.roi.toFixed(1)}%</div>
                  <div className="td holders">{agent.holders.toLocaleString()}</div>
                  <div className="td actions">
                    <button className="action-button view">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button className="action-button buy">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        <path d="M12 8v8"></path>
                        <path d="M8 12h8"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pagination">
            <button 
              className="pagination-button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="pagination-button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default AgentRankings