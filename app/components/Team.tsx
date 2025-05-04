import React, { useState } from 'react';
import './Team.css';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  }
}

const Team: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  
  const teamMembers: TeamMember[] = [
    {
      name: "Dr. Sophia Chen",
      role: "Founder & CEO",
      bio: "Former AI Research Lead at HKUST Crypto Lab. Ph.D. in Machine Learning with 10+ years in quantitative trading systems. Led breakthrough research in privacy-preserving ML for financial markets.",
      avatar: "👩‍🔬",
      social: {
        twitter: "https://twitter.com/drsophiachen",
        linkedin: "https://linkedin.com/in/sophiachen",
        github: "https://github.com/sophia-ai"
      }
    },
    {
      name: "Michael Zhang",
      role: "CTO",
      bio: "Ex-Google AI engineer specialized in reinforcement learning. Built algorithmic trading systems for tier-1 hedge funds. Pioneered adaptive market models that outperformed traditional strategies by 23%.",
      avatar: "👨‍💻",
      social: {
        twitter: "https://twitter.com/michaelzhangtech",
        linkedin: "https://linkedin.com/in/michaelzhang",
        github: "https://github.com/mzhang-ai"
      }
    },
    {
      name: "Lin Wei",
      role: "Head of Research",
      bio: "Former quant at JPMorgan with expertise in statistical arbitrage. Ph.D. in Financial Engineering from HKUST. Published author on predictive modeling for crypto markets.",
      avatar: "🧠",
      social: {
        twitter: "https://twitter.com/linweitrading",
        linkedin: "https://linkedin.com/in/linwei",
        github: "https://github.com/lin-quant"
      }
    },
    {
      name: "Raj Patel",
      role: "Blockchain Lead",
      bio: "Smart contract expert who led development at three successful DeFi projects. Early SUI contributor and Move language specialist. Created breakthrough on-chain execution mechanisms.",
      avatar: "⛓️",
      social: {
        twitter: "https://twitter.com/rajpatel_web3",
        linkedin: "https://linkedin.com/in/rajpatel",
        github: "https://github.com/raj-move"
      }
    },
    {
      name: "Emma Johnson",
      role: "Product Lead",
      bio: "Former Product Director at Coinbase. Specializes in making complex financial products accessible to mainstream users. Built products used by over 2 million crypto traders.",
      avatar: "🚀",
      social: {
        twitter: "https://twitter.com/emmaj_product",
        linkedin: "https://linkedin.com/in/emmajohnson",
        github: "https://github.com/emma-product"
      }
    },
    {
      name: "Dr. Kenji Tanaka",
      role: "AI Research",
      bio: "Specialist in natural language processing for financial sentiment analysis. Ph.D. from Tokyo University. Previously led quant research teams at major Asian trading firms.",
      avatar: "🤖",
      social: {
        twitter: "https://twitter.com/drkenjitanaka",
        linkedin: "https://linkedin.com/in/kenjitanaka",
        github: "https://github.com/kenji-ai"
      }
    },
    {
      name: "Sarah Goldman",
      role: "Trading Strategies",
      bio: "15 years in institutional trading. Developed proprietary strategies that generated $140M+ in profit. Expert in options trading and volatility modeling for crypto markets.",
      avatar: "📊",
      social: {
        twitter: "https://twitter.com/sarahgtrading",
        linkedin: "https://linkedin.com/in/sarahgoldman",
        github: "https://github.com/sarah-quant"
      }
    },
    {
      name: "Alex Novak",
      role: "Security Officer",
      bio: "Cybersecurity expert with background in cryptography. Led security audits for 20+ DeFi protocols. Specializes in encryption systems for protecting proprietary trading algorithms.",
      avatar: "🔒",
      social: {
        twitter: "https://twitter.com/alexnovaksec",
        linkedin: "https://linkedin.com/in/alexnovak",
        github: "https://github.com/alex-security"
      }
    },
    {
      name: "Maya Rodriguez",
      role: "Community Lead",
      bio: "Community building expert who grew three crypto projects from zero to 100K+ members. Specializes in educational content that makes complex trading concepts accessible.",
      avatar: "🌐",
      social: {
        twitter: "https://twitter.com/mayacommunity",
        linkedin: "https://linkedin.com/in/mayarodriguez",
        github: "https://github.com/maya-community"
      }
    },
    {
      name: "Tom Li",
      role: "Tokenomics Architect",
      bio: "Economics Ph.D. with expertise in mechanism design. Developed innovative token models for several top-50 crypto projects. Former economics researcher at HKUST Crypto Lab.",
      avatar: "💰",
      social: {
        twitter: "https://twitter.com/tomli_crypto",
        linkedin: "https://linkedin.com/in/tomli",
        github: "https://github.com/tom-tokenomics"
      }
    }
  ];
  
  const handleCardClick = (index: number) => {
    setActiveCard(activeCard === index ? null : index);
  };
  
  return (
    <div className="team-container" id="team">
      <h2 className="section-title">Meet Our Team</h2>
      <p className="team-intro">
        Backed by HKUST Crypto Lab, our team brings together world-class expertise in AI, 
        quantitative trading, blockchain technology, and product development.
      </p>
      
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div 
            key={index}
            className={`team-card ${activeCard === index ? 'active' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="member-avatar">{member.avatar}</div>
            <div className="member-info">
              <h3>{member.name}</h3>
              <div className="member-role">{member.role}</div>
              <div className="member-bio">{member.bio}</div>
              
              <div className="social-links">
                {member.social.twitter && (
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                    Twitter
                  </a>
                )}
                {member.social.linkedin && (
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    LinkedIn
                  </a>
                )}
                {member.social.github && (
                  <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="social-link">
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="team-footer">
        <div className="backed-by">
          <span className="backed-label">Backed by</span>
          <span className="institution">HKUST Crypto Lab</span>
        </div>
        
        <a href="/careers" className="join-team-link">
          Join Our Team <span className="join-arrow">→</span>
        </a>
      </div>
    </div>
  );
};

export default Team;