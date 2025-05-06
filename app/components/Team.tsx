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
      name: "Harsh",
      role: "Founder & Lead",
      bio: "Mad Scientist - Former AI Researcher, Co-Founder AgentBaseHound (2 mill + mc), Lead AI Engineer at multiple projects. 5+ years in AI (milli + Funding).",
      avatar: "🐉",
      social: {
        twitter: "https://twitter.com/drsophiachen",
        linkedin: "https://x.com/Harshcodedragon",
        github: "https://github.com/Harsh-Gill"
      }
    },
    {
      name: "Yatharth",
      role: "Crypto BD (Markets & Research)",
      bio: "Finance Bro, Crypto VC Analyst Experience, Crypto Portfolio Management, Web3 Enthusiast.",
      avatar: "💰",
      social: {
        twitter: "https://x.com/y_maheshwariii",
        linkedin: "https://www.linkedin.com/in/yatharth-maheshwari-694590218/",
        github: "/"
      }
    },
    {
      name: "Moon",
      role: "Crypto BD (Tokenomics & Launch)",
      bio: "Business Experience, Crypto Trading and Project Management experience.",
      avatar: "🌕",
      social: {
        twitter: "/",
        linkedin: "/",
        github: "/"
      }
    },
    {
      name: "Talha (طلحہ)",
      role: "Quant Developer",
      bio: "Experience in building quant trading algorithms for multiple markets. Formerly at multiple finance firms, specializing in building trading strategies.",
      avatar: "📈",
      social: {
        twitter: "/",
        linkedin: "https://www.linkedin.com/in/talha-hameed-khan-167714203/",
        github: "/"
      }
    },
    {
      name: "Hitesh",
      role: "Crypto BD (Blockchain & DeFi)",
      bio: "Experience as an investment analyst at both an incubated crypto fund and crypto VC. Passionate about Web3 and DeFi. ",
      avatar: "🚀",
      social: {
        twitter: "https://twitter.com/emmaj_product",
        linkedin: "https://linkedin.com/in/emmajohnson",
        github: "https://github.com/emma-product"
      }
    },
    {
      name: "Leo",
      role: "AI Developer",
      bio: "Tech Builder, Data Maniac, Machine Learning & AI Enthusiast, Crypto Lover",
      avatar: "🦾",
      social: {
        twitter: "/",
        linkedin: "https://www.linkedin.com/in/liren-zhang-245700326/",
        github: "https://github.com/leonidasiy/Projects"
      }
    },
    {
      name: "Batman",
      role: "Crypto & AI Developer",
      bio: "PolyMath - Coding Wizard, Experience in developing softwares relating AI, Machine learning and blockchain.",
      avatar: "🦇",
      social: {
        twitter: "/",
        linkedin: "https://www.linkedin.com/in/batman-aman/",
        github: "https://github.com/theBatm4n"
      }
    },
    {
      name: "Ryan",
      role: "Crypto BD (Trading & Exchanges)",
      bio: "Crypto Enthusiast, Airdrop Farmer and Memecoin Shiller.",
      avatar: "🐐",
      social: {
        twitter: "https://x.com/ryanhoyingho",
        linkedin: "https://www.linkedin.com/in/ryan-ying-ho-ho-912781351?trk=contact-info",
        github: "https://github.com/hryh"
      }
    },
    {
      name: "Kani Chen",
      role: "Advisor (HKUST Crypto Lab)",
      bio: "HKUST Professor and Program Director of Financial Mathematics.",
      avatar: "📊",
      social: {
        twitter: "/",
        linkedin: "/",
        github: "/"
      }
    },
    // {
    //   name: "Alex Novak",
    //   role: "Security Officer",
    //   bio: "Cybersecurity expert with background in cryptography. Led security audits for 20+ DeFi protocols. Specializes in encryption systems for protecting proprietary trading algorithms.",
    //   avatar: "🔒",
    //   social: {
    //     twitter: "https://twitter.com/alexnovaksec",
    //     linkedin: "https://linkedin.com/in/alexnovak",
    //     github: "https://github.com/alex-security"
    //   }
    // },
    // {
    //   name: "Maya Rodriguez",
    //   role: "Community Lead",
    //   bio: "Community building expert who grew three crypto projects from zero to 100K+ members. Specializes in educational content that makes complex trading concepts accessible.",
    //   avatar: "🌐",
    //   social: {
    //     twitter: "https://twitter.com/mayacommunity",
    //     linkedin: "https://linkedin.com/in/mayarodriguez",
    //     github: "https://github.com/maya-community"
    //   }
    // },
    // {
    //   name: "Tom Li",
    //   role: "Tokenomics Architect",
    //   bio: "Economics Ph.D. with expertise in mechanism design. Developed innovative token models for several top-50 crypto projects. Former economics researcher at HKUST Crypto Lab.",
    //   avatar: "💰",
    //   social: {
    //     twitter: "https://twitter.com/tomli_crypto",
    //     linkedin: "https://linkedin.com/in/tomli",
    //     github: "https://github.com/tom-tokenomics"
    //   }
    // }
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