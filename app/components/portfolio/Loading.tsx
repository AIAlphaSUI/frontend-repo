import React from 'react'
import './Loading.css'

interface LoadingProps {
  message?: string
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
      </div>
      <div className="loading-message">{message}</div>
    </div>
  )
}

export default Loading