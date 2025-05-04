import React from 'react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1></h1>
        {/* <h1 className="hero-title">AI-Powered Crypto Trading Agents</h1> */}
        {/* <p className="hero-description">
          Launch your own AI trading agent or invest in top-performing agents on the platform
        </p> */}
        <div className="hero-buttons">
          <button className="cosmic-button primary">Launch Agent</button>
          <button className="cosmic-button secondary">Explore Agents</button>
        </div>
      </div>
      
      <div className="stats-container">
        <div className="stat-card">
          <h2>Total Agents</h2>
          <div className="stat-value">145</div>
          <div className="stat-change positive">+12% ↑</div>
        </div>
        <div className="stat-card">
          <h2>Total AUM</h2>
          <div className="stat-value">$15.7M</div>
          <div className="stat-change positive">+8.3% ↑</div>
        </div>
        <div className="stat-card">
          <h2>Weekly Trading Volume</h2>
          <div className="stat-value">$2.4M</div>
          <div className="stat-change positive">+5.1% ↑</div>
        </div>
        <div className="stat-card">
          <h2>Avg. Agent ROI</h2>
          <div className="stat-value">18.5%</div>
          <div className="stat-change negative">-2.3% ↓</div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;