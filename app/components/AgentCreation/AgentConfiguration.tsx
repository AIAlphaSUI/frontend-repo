import React from 'react';
import './AgentConfiguration.css';

interface AgentConfigProps {
  agentConfig: {
    name: string;
    description: string;
    type: string;
  };
  setAgentConfig: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    type: string;
  }>>;
  nextStep: () => void;
}

const AgentConfiguration: React.FC<AgentConfigProps> = ({ 
  agentConfig, 
  setAgentConfig, 
  nextStep 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAgentConfig({
      ...agentConfig,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="agent-config-container">
      <h2 className="config-section-title">Agent Details</h2>
      
      <form onSubmit={handleSubmit} className="agent-form">
        <div className="form-group">
          <label htmlFor="agent-name">Agent Name</label>
          <input
            id="agent-name"
            type="text"
            name="name"
            value={agentConfig.name}
            onChange={handleChange}
            placeholder="Enter a name for your agent"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="agent-description">Description</label>
          <textarea
            id="agent-description"
            name="description"
            value={agentConfig.description}
            onChange={handleChange}
            placeholder="Describe your agent's trading strategy and approach"
            rows={4}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="agent-type">Agent Type</label>
          <select
            id="agent-type"
            name="type"
            value={agentConfig.type}
            onChange={handleChange}
            required
          >
            <option value="Machine Learning/AI">Machine Learning/AI</option>
            <option value="Rules-Based">Rules-Based</option>
            <option value="Statistical Arbitrage">Statistical Arbitrage</option>
            <option value="Quantitative">Quantitative</option>
            <option value="Technical Analysis">Technical Analysis</option>
          </select>
        </div>
        
        <div className="config-actions">
          <button type="submit" className="next-button">
            Continue to Strategy Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentConfiguration;