import React from 'react'
import './DAOHeader.css'

interface DAOHeaderProps {
  name: string
  description: string
}

const DAOHeader: React.FC<DAOHeaderProps> = ({ name, description }) => {
  return (
    <div className="dao-header">
      <div className="dao-logo">
        <div className="dao-icon">
          <span className="dao-icon-inner">DAO</span>
        </div>
      </div>
      <div className="dao-info">
        <h1>{name}</h1>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default DAOHeader