import React from 'react';
import './AboutUs.css';
import Link from 'next/link';

const AboutUs: React.FC = () => {
  return (
    <div className="about-us-container" id="about">
      <div className="glow-orb about-left"></div>
      <div className="glow-orb about-right"></div>
      
      <div className="about-content">
        <h2 className="section-title">About Our Vision</h2>
        
        <div className="about-grid">
          <div className="about-text">
            <p className="lead-text">AI Alpha SUI is revolutionizing crypto trading by democratizing access to sophisticated AI-powered trading strategies on the SUI blockchain.</p>
            
            <p>Founded by a team of researchers, traders, and AI specialists from HKUST Crypto Lab, we're building the bridge between advanced artificial intelligence and decentralized finance. Our platform enables anyone to create, deploy, or invest in AI trading agents without requiring deep technical expertise.</p>
            
            <p>We believe the future of finance is both decentralized and intelligent. By bringing these worlds together, we're creating a more accessible, transparent, and efficient trading ecosystem for everyone—from seasoned quants to everyday investors.</p>
            
            <div className="about-actions">
              <a href="/whitepaper.pdf" className="primary-button" target="_blank" rel="noopener noreferrer">
                <span className="button-icon">📄</span>
                Read Our Whitepaper
              </a>
              
              <a href="https://github.com/ai-alpha-sui" className="secondary-button" target="_blank" rel="noopener noreferrer">
                <span className="button-icon">⭐</span>
                Star on GitHub
              </a>
            </div>
          </div>
          
          <div className="about-stats">
            <div className="stat-card">
              <div className="stat-value">$28M+</div>
              <div className="stat-label">Trading Volume</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">8,500+</div>
              <div className="stat-label">Active Users</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">120+</div>
              <div className="stat-label">AI Agents</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">18%</div>
              <div className="stat-label">Avg. Monthly ROI</div>
            </div>
          </div>
        </div>
        
        <h3 className="subsection-title">Watch Our Platform in Action</h3>
        
        <div className="videos-container">
          <div className="videos-scroll">
            <div className="video-card">
              <div className="video-thumbnail">
                <div className="play-button">▶</div>
                <div className="video-duration">2:34</div>
              </div>
              <h4>Platform Overview</h4>
              <p>Quick introduction to AI Alpha SUI and how it works</p>
            </div>
            
            <div className="video-card">
              <div className="video-thumbnail">
                <div className="play-button">▶</div>
                <div className="video-duration">3:47</div>
              </div>
              <h4>Creating Your First Agent</h4>
              <p>Step-by-step guide to deploying a custom AI agent</p>
            </div>
            
            <div className="video-card">
              <div className="video-thumbnail">
                <div className="play-button">▶</div>
                <div className="video-duration">1:55</div>
              </div>
              <h4>Investment Strategies</h4>
              <p>How to build a diversified portfolio of AI agents</p>
            </div>
            
            <div className="video-card">
              <div className="video-thumbnail">
                <div className="play-button">▶</div>
                <div className="video-duration">4:22</div>
              </div>
              <h4>Advanced Features</h4>
              <p>Deep dive into strategy encryption and profit sharing</p>
            </div>
            
            <div className="video-card">
              <div className="video-thumbnail">
                <div className="play-button">▶</div>
                <div className="video-duration">2:18</div>
              </div>
              <h4>Tokenomics Explained</h4>
              <p>Understanding the AI Alpha SUI token ecosystem</p>
            </div>
          </div>
          
          <div className="scroll-fade left"></div>
          <div className="scroll-fade right"></div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;