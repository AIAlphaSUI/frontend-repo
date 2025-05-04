import React, { useRef } from 'react';
import './TopAgents.css';

const TopAgents: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="top-agents-container">
      <h2 className="section-title">Top Performing Agents</h2>
      
      <div className="agents-scroll-container" ref={scrollContainerRef}>
        <div className="agent-card">
          <div className="agent-header">
            <div className="agent-icon">🤖</div>
            <div className="agent-info">
              <h3>ThetaTrader</h3>
              <p>by quant_master</p>
            </div>
            <div className="agent-type ml-ai">ML/AI</div>
          </div>
          
          <div className="agent-metrics">
            <div className="metric-row">
              <span>Market Cap</span>
              <span className="metric-period">24h</span>
              <span className="metric-period">7d</span>
            </div>
            
            <div className="metric-row values">
              <span>$3.2M</span>
              <span className="positive">+5.8%</span>
              <span className="positive">+12.4%</span>
            </div>
          </div>
          
          <div className="agent-chart green"></div>
          
          <div className="portfolio-section">
            <h4>Portfolio</h4>
            <div className="portfolio-assets">
              <div className="asset"><span className="asset-icon btc">₿</span> BTC 45%</div>
              <div className="asset"><span className="asset-icon eth">Ξ</span> ETH 30%</div>
              <div className="asset"><span className="asset-icon sol">◎</span> SOL 25%</div>
            </div>
          </div>
          
          <button className="buy-token-btn">Buy Token</button>
        </div>

        <div className="agent-card">
          <div className="agent-header">
            <div className="agent-icon">🧠</div>
            <div className="agent-info">
              <h3>DeltaForce</h3>
              <p>by crypto_whisperer</p>
            </div>
            <div className="agent-type quant">QUANT</div>
          </div>
          
          <div className="agent-metrics">
            <div className="metric-row">
              <span>Market Cap</span>
              <span className="metric-period">24h</span>
              <span className="metric-period">7d</span>
            </div>
            
            <div className="metric-row values">
              <span>$2.7M</span>
              <span className="positive">+3.2%</span>
              <span className="positive">+9.8%</span>
            </div>
          </div>
          
          <div className="agent-chart blue"></div>
          
          <div className="portfolio-section">
            <h4>Portfolio</h4>
            <div className="portfolio-assets">
              <div className="asset"><span className="asset-icon eth">Ξ</span> ETH 50%</div>
              <div className="asset"><span className="asset-icon link">⛓️</span> LINK 25%</div>
              <div className="asset"><span className="asset-icon aave">🔄</span> AAVE 25%</div>
            </div>
          </div>
          
          <button className="buy-token-btn">Buy Token</button>
        </div>

        <div className="agent-card">
          <div className="agent-header">
            <div className="agent-icon">🚀</div>
            <div className="agent-info">
              <h3>OmegaBot</h3>
              <p>by hkust_research</p>
            </div>
            <div className="agent-type hybrid">HYBRID</div>
          </div>
          
          <div className="agent-metrics">
            <div className="metric-row">
              <span>Market Cap</span>
              <span className="metric-period">24h</span>
              <span className="metric-period">7d</span>
            </div>
            
            <div className="metric-row values">
              <span>$4.5M</span>
              <span className="negative">-1.2%</span>
              <span className="positive">+15.7%</span>
            </div>
          </div>
          
          <div className="agent-chart orange"></div>
          
          <div className="portfolio-section">
            <h4>Portfolio</h4>
            <div className="portfolio-assets">
              <div className="asset"><span className="asset-icon btc">₿</span> BTC 35%</div>
              <div className="asset"><span className="asset-icon eth">Ξ</span> ETH 35%</div>
              <div className="asset"><span className="asset-icon usdc">💵</span> USDC 30%</div>
            </div>
          </div>
          
          <button className="buy-token-btn">Buy Token</button>
        </div>
        
        <div className="agent-card">
          <div className="agent-header">
            <div className="agent-icon">🔍</div>
            <div className="agent-info">
              <h3>AlphaSeeker</h3>
              <p>by ai_specialist</p>
            </div>
            <div className="agent-type ml-ai">ML/AI</div>
          </div>
          
          <div className="agent-metrics">
            <div className="metric-row">
              <span>Market Cap</span>
              <span className="metric-period">24h</span>
              <span className="metric-period">7d</span>
            </div>
            
            <div className="metric-row values">
              <span>$5.1M</span>
              <span className="positive">+2.4%</span>
              <span className="positive">+18.6%</span>
            </div>
          </div>
          
          <div className="agent-chart purple"></div>
          
          <div className="portfolio-section">
            <h4>Portfolio</h4>
            <div className="portfolio-assets">
              <div className="asset"><span className="asset-icon btc">₿</span> BTC 20%</div>
              <div className="asset"><span className="asset-icon eth">Ξ</span> ETH 40%</div>
              <div className="asset"><span className="asset-icon sui">🔷</span> SUI 40%</div>
            </div>
          </div>
          
          <button className="buy-token-btn">Buy Token</button>
        </div>
        
        <div className="agent-card">
          <div className="agent-header">
            <div className="agent-icon">📊</div>
            <div className="agent-info">
              <h3>GammaGuru</h3>
              <p>by trading_pro</p>
            </div>
            <div className="agent-type quant">QUANT</div>
          </div>
          
          <div className="agent-metrics">
            <div className="metric-row">
              <span>Market Cap</span>
              <span className="metric-period">24h</span>
              <span className="metric-period">7d</span>
            </div>
            
            <div className="metric-row values">
              <span>$2.9M</span>
              <span className="positive">+4.7%</span>
              <span className="positive">+11.3%</span>
            </div>
          </div>
          
          <div className="agent-chart cyan"></div>
          
          <div className="portfolio-section">
            <h4>Portfolio</h4>
            <div className="portfolio-assets">
              <div className="asset"><span className="asset-icon dot">•</span> DOT 30%</div>
              <div className="asset"><span className="asset-icon matic">⬡</span> MATIC 30%</div>
              <div className="asset"><span className="asset-icon avax">🔺</span> AVAX 40%</div>
            </div>
          </div>
          
          <button className="buy-token-btn">Buy Token</button>
        </div>
      </div>
      
      <div className="scroll-indicator">
        <div className="scroll-dot active"></div>
        <div className="scroll-dot"></div>
        <div className="scroll-dot"></div>
        <div className="scroll-dot"></div>
      </div>
    </div>
  );
};

export default TopAgents;