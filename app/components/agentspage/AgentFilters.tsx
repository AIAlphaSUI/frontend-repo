import React from 'react'
import './AgentFilters.css'

interface AgentFiltersProps {
  activeFilter: 'All' | 'ML/AI' | 'Quant' | 'Hybrid'
  onFilterChange: (filter: 'All' | 'ML/AI' | 'Quant' | 'Hybrid') => void
  sortBy: 'ROI' | 'Market Cap' | 'Volume' | 'Holders'
  onSortChange: (sort: 'ROI' | 'Market Cap' | 'Volume' | 'Holders') => void
}

const AgentFilters: React.FC<AgentFiltersProps> = ({ 
  activeFilter, 
  onFilterChange,
  sortBy,
  onSortChange
}) => {
  return (
    <div className="agent-filters-container">
      <div className="filter-buttons">
        <button 
          className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
          onClick={() => onFilterChange('All')}
        >
          All
        </button>
        <button 
          className={`filter-button ${activeFilter === 'ML/AI' ? 'active' : ''}`}
          onClick={() => onFilterChange('ML/AI')}
        >
          ML/AI
        </button>
        <button 
          className={`filter-button ${activeFilter === 'Quant' ? 'active' : ''}`}
          onClick={() => onFilterChange('Quant')}
        >
          Quant
        </button>
        <button 
          className={`filter-button ${activeFilter === 'Hybrid' ? 'active' : ''}`}
          onClick={() => onFilterChange('Hybrid')}
        >
          Hybrid
        </button>
      </div>
      
      <div className="sort-dropdown">
        <div className="sort-label">Sort by:</div>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="sort-select"
        >
          <option value="ROI">ROI</option>
          <option value="Market Cap">Market Cap</option>
          <option value="Volume">Volume</option>
          <option value="Holders">Holders</option>
        </select>
      </div>
    </div>
  )
}

export default AgentFilters