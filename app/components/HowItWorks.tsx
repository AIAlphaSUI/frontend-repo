import React, { useState, useEffect, useRef } from 'react';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
  const [activeJourney, setActiveJourney] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeConversation, setActiveConversation] = useState(0);
  const journeysRef = useRef<HTMLDivElement>(null);
  const platformFlowRef = useRef<HTMLDivElement>(null);
  
  const conversations = [
    // Conversation 1: Momentum Strategy
    [
      { role: 'user', content: 'Create a momentum strategy for ETH and BTC', time: '10:42 AM' },
      { role: 'agent', content: 'I can help with that! Would you like a low, medium, or high risk momentum strategy?', time: '10:42 AM' },
      { role: 'user', content: 'Low risk with strong protection', time: '10:43 AM' },
      { role: 'agent', content: 'Perfect. I\'ll create a conservative momentum strategy with: 1) 14-day RSI crossover signals, 2) 8% trailing stop-loss, 3) 70/30 BTC-ETH allocation, and 4) max drawdown protection of 15%. Should I implement this?', time: '10:43 AM' },
      { role: 'user', content: 'Yes, and add dollar cost averaging', time: '10:44 AM' },
      { role: 'agent', content: 'Strategy configured! Added weekly DCA during downtrends when RSI < 40. This will help accumulate positions at better prices while maintaining your risk parameters. Your agent is ready to deploy.', time: '10:45 AM' }
    ],
    // Conversation 2: Copy Trading
    [
      { role: 'user', content: 'Can I copy trade a specific whale?', time: '2:15 PM' },
      { role: 'agent', content: 'Absolutely! Which wallet address would you like to track?', time: '2:15 PM' },
      { role: 'user', content: '0x7a3b...e45f, but only copy trades above $50k', time: '2:16 PM' },
      { role: 'agent', content: 'Tracking whale address 0x7a3b...e45f. I\'ll only mirror positions above $50k threshold. Would you like to apply any risk limiters to this copy strategy?', time: '2:16 PM' },
      { role: 'user', content: 'Yes, limit to 20% of my portfolio per trade', time: '2:17 PM' },
      { role: 'agent', content: 'Configured! Now tracking whale with 20% allocation cap per position. I\'ll also implement a 12-hour delay to avoid front-running penalties, and verify each trade against market liquidity conditions.', time: '2:18 PM' }
    ],
    // Conversation 3: Portfolio Strategy
    [
      { role: 'user', content: 'Build me a defensive crypto portfolio for the bear market', time: '5:03 PM' },
      { role: 'agent', content: 'I recommend a defensive allocation with stablecoin yield strategies. Whats your time horizon and risk tolerance?', time: '5:03 PM' },
      { role: 'user', content: '6 months, very conservative', time: '5:04 PM' },
      { role: 'agent', content: 'For a 6-month conservative strategy, I suggest: 60% USDC in yield protocols (8-10% APY), 20% BTC with grid trading during volatility, 10% hedged ETH positions, and 10% liquid staking. Expected volatility: low. Estimated yield: 7-12% annually.', time: '5:05 PM' },
      { role: 'user', content: 'Could you add some gold exposure too?', time: '5:06 PM' },
      { role: 'agent', content: 'Updated! Added 5% allocation to PAXG (gold-backed token) from the stablecoin portion. This provides inflation protection while maintaining low correlation to crypto assets. Your defensive portfolio is ready.', time: '5:07 PM' }
    ]
  ];

  // Handle visibility animation for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, { threshold: 0.2 });

    if (journeysRef.current) {
      observer.observe(journeysRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate through journeys
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveJourney(prev => {
        if (prev === null) return 0;
        return (prev + 1) % 3;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  // Auto-rotate through conversations
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConversation(prev => (prev + 1) % conversations.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const handleJourneyClick = (index: number) => {
    setActiveJourney(index);
  };
  
  const handleDemoClick = () => {
    const demoSection = document.querySelector('.subsection-title');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Hero Section with Title and Tech Explanation */}
      <div className="ai-hero-container">
        <div className="ai-hero-content">
          <h1 className="hero-slogan">AI Trading <span className="reimagined">REIMAGINED</span></h1>
          
          <div className="hero-features">
            <div className="hero-feature">
              <div className="feature-icon">🤖</div>
              <span>AI-Powered Trading</span>
            </div>
            <div className="hero-feature">
              <div className="feature-icon">🔒</div>
              <span>Strategy Encryption</span>
            </div>
            <div className="hero-feature">
              <div className="feature-icon">💰</div>
              <span>Profit Sharing</span>
            </div>
            <div className="hero-feature">
              <div className="feature-icon">📈</div>
              <span>Performance Tracking</span>
            </div>
          </div>
          
          <div className="hero-buttons">
            <button className="primary-hero-btn">Launch App</button>
            <button className="secondary-hero-btn" onClick={handleDemoClick}>Watch Demo</button>
          </div>
        </div>
        
        <div className="ai-hero-visual">
          <div className="chat-interface">
            <div className="chat-header">
              <div className="window-buttons">
                <span className="window-button red"></span>
                <span className="window-button yellow"></span>
                <span className="window-button green"></span>
              </div>
              <div className="agent-info">
                <div className="agent-avatar">
                  <span className="agent-icon">🤖</span>
                </div>
                <div className="agent-details">
                  <div className="agent-name">AI Alpha Agent</div>
                  <div className="agent-status">
                    <span className="status-dot"></span>
                    <span>Trading Ready</span>
                  </div>
                </div>
              </div>
              <div className="chat-tabs">
                <div className={`chat-tab ${activeConversation === 0 ? 'active' : ''}`} 
                     onClick={() => setActiveConversation(0)}>
                  Momentum
                </div>
                <div className={`chat-tab ${activeConversation === 1 ? 'active' : ''}`}
                     onClick={() => setActiveConversation(1)}>
                  Copy Trade
                </div>
                <div className={`chat-tab ${activeConversation === 2 ? 'active' : ''}`}
                     onClick={() => setActiveConversation(2)}>
                  Portfolio
                </div>
              </div>
            </div>
            
            <div className="chat-messages">
              <div className="conversation-context">
                <span className="context-label">
                  {activeConversation === 0 && "Momentum Strategy Configuration"}
                  {activeConversation === 1 && "Whale Copy Trading Setup"}
                  {activeConversation === 2 && "Bear Market Portfolio Construction"}
                </span>
              </div>
              
              {conversations[activeConversation].map((message, index) => (
                <div key={index} className={`message ${message.role}`} style={{animationDelay: `${index * 0.3}s`}}>
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">{message.time}</div>
                </div>
              ))}

              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            
            <div className="chat-input">
              <div className="input-suggestion">Try: "Create a mean-reversion strategy for SOL"</div>
              <div className="input-container">
                <input type="text" placeholder="Describe your trading strategy..." />
                <button className="send-button">
                  <span>➤</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="chat-glow"></div>
        </div>
      </div>
      
      {/* Tech Overview Section */}
      <div className="tech-overview-section">
        <h2 className="tech-section-title">Revolutionary Financial Technology</h2>
        
        <div className="tech-cards-container">
          <div className="tech-card">
            <div className="tech-card-icon">💬</div>
            <h3>Language-Powered Trading</h3>
            <p>Define complex algorithmic trading strategies using plain language. Our LLM translates your instructions into high-performance trading code.</p>
          </div>
          
          <div className="tech-card">
            <div className="tech-card-icon">🔐</div>
            <h3>Strategy Encryption</h3>
            <p>Keep your edge with on-chain strategy encryption. Your methods stay private while PnL is transparently verified on the blockchain.</p>
          </div>
          
          <div className="tech-card">
            <div className="tech-card-icon">🔄</div>
            <h3>Tokenized Profit Sharing</h3>
            <p>Every AI Agent issues tokens representing profit-sharing rights. Investors earn from performance while traders access more capital.</p>
          </div>
        </div>
      </div>
      
      {/* How It Works - User Journey Section with proper padding to avoid header overlap */}
      <div className="how-it-works-container">
        <div className="glow-orb left"></div>
        <div className="glow-orb right"></div>
        
        <h2 className="section-title">User Journeys</h2>
        
        <div className="journeys-container" ref={journeysRef}>
          <div 
            className={`journey-card ${activeJourney === 0 ? 'active' : ''}`}
            onClick={() => handleJourneyClick(0)}
          >
            <div className="card-glow"></div>
            <div className="journey-icon trader">
              <div className="pulse-ring"></div>
            </div>
            <h3>For Traders</h3>
            <div className="journey-steps">
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Deploy AI trading agents</p>
              </div>
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Use encryption to protect strategies</p>
              </div>
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Earn from performance fees</p>
              </div>
              <div className="journey-step detail-step">
                <p>When you launch an AI Agent, you receive tokens representing profit-sharing rights. As your Agent performs well, investors buy in, and your tokens appreciate in value.</p>
              </div>
            </div>
            <div className="card-shine"></div>
          </div>

          <div 
            className={`journey-card ${activeJourney === 1 ? 'active' : ''}`}
            onClick={() => handleJourneyClick(1)}
          >
            <div className="card-glow"></div>
            <div className="journey-icon casual">
              <div className="pulse-ring"></div>
            </div>
            <h3>For Non-Coders</h3>
            <div className="journey-steps">
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Describe strategies in plain language</p>
              </div>
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>AI translates ideas to code</p>
              </div>
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Automate trading without technical skills</p>
              </div>
              <div className="journey-step detail-step">
                <p>Simply explain what you want your strategy to do: "Buy ETH when RSI is below 30 and set a stop loss at 3%." Our AI handles the implementation for you.</p>
              </div>
            </div>
            <div className="card-shine"></div>
          </div>
              
          <div 
            className={`journey-card ${activeJourney === 2 ? 'active' : ''}`}
            onClick={() => handleJourneyClick(2)}
          >
            <div className="card-glow"></div>
            <div className="journey-icon investor">
              <div className="pulse-ring"></div>
            </div>
            <h3>For Investors</h3>
            <div className="journey-steps">
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Browse AI agents by performance</p>
              </div>
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Invest in promising strategies</p>
              </div>
              <div className="journey-step">
                <span className="step-dot"></span>
                <p>Earn returns from agent profits</p>
              </div>
              <div className="journey-step detail-step">
                <p>Filter agents by PnL, risk profile, and portfolio composition. By purchasing an Agent's tokens, you receive a share of its trading profits while potentially benefiting from token price appreciation.</p>
              </div>
            </div>
            <div className="card-shine"></div>
          </div>
        </div>
        
        <div className={`platform-flow ${isVisible ? 'visible' : ''}`} ref={platformFlowRef}>
          <div className="flow-path"></div>
          <div className="flow-step">
            <div className="flow-number">1</div>
            <p>Choose Role</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-number">2</div>
            <p>Connect Wallet</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-number">3</div>
            <p>Deploy or Invest</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-number">4</div>
            <p>Earn Profits</p>
          </div>
        </div>
        
        <div className="floating-particles"></div>
      </div>
    </>
  );
};

export default HowItWorks;