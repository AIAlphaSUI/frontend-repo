import React, { useEffect, useState } from 'react'
import { WalletAccount } from '@mysten/wallet-standard'
import { getAdapter } from '../../misc/adapter'
import { TransactionBlock } from '@mysten/sui.js/transactions'
import { toast } from 'sonner'
import './ProposalForm.css'
import ProposalCreateModal from './ProposalCreateModal'

interface Proposal {
  id: string
  title: string
  description: string
  creator: string
  type: 'General' | 'Add Member' | 'Remove Member' | 'Config Update'
  status: 'active' | 'passed' | 'failed' | 'executed'
  votesFor: number
  votesAgainst: number
  expiresAt: number
  createdAt: number
  daoId: string
  targetAddress?: string
  configKey?: string
  configValue?: string
  hasVoted?: boolean
  voteDirection?: boolean
  voters: { address: string, voteFor: boolean }[]
}

interface ProposalFormProps {
  userAccount?: WalletAccount
  isMember: boolean
  daoId: string
  packageId: string
}

const ProposalForm: React.FC<ProposalFormProps> = ({ 
  userAccount, 
  isMember,
  daoId,
  packageId
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [memberCapId, setMemberCapId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [canVote, setCanVote] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [realIsMember, setRealIsMember] = useState<boolean>(isMember);


  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(err => toast.error("Failed to copy: " + err))
  }

  // Helper function to shorten address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Add effect to force update canVote when isMember changes
  useEffect(() => {
    if (realIsMember) {
      setCanVote(true);
    }
  }, [realIsMember]);

  // Add effect to refresh data when wallet connects
  useEffect(() => {
    if (userAccount) {
      // When user account changes, trigger a refresh
      const timer = setTimeout(() => {
        refreshData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [userAccount?.address]);

  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      // Fetch member cap
      if (userAccount) {
        await fetchMemberCap();
      }
      
      // Fetch proposals
      await fetchProposals();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchMemberCap = async () => {
    if (!userAccount) {
      setMemberCapId(null);
      setCanVote(false);
      return;
    }
    
    // Set canVote based on isMember first
    if (realIsMember) {
      setCanVote(true);
    }
    
    try {
      console.log(`Fetching member cap for user ${userAccount.address}, realIsMember: ${realIsMember}`);
      
      const memberCapResponse = await fetch('https://fullnode.mainnet.sui.io:443', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "suix_getOwnedObjects",
          params: [
            userAccount.address,
            {
              filter: {
                MatchAll: [
                  { StructType: `${packageId}::dao::MemberCap` },
                  { AddressOwner: userAccount.address }
                ]
              },
              options: {
                showType: true,
                showOwner: true,
                showContent: true
              }
            }
          ]
        })
      });
      
      const memberCapData = await memberCapResponse.json();
      console.log("Member cap response:", memberCapData);
      
      if (memberCapData.result?.data?.length > 0) {
        const capId = memberCapData.result.data[0].data.objectId;
        setMemberCapId(capId);
        setCanVote(true);
        setRealIsMember(true); // <-- Update our local member status
        console.log("Found member cap:", capId, "realIsMember:", realIsMember);
        
        // update isMember to true if user has a member cap
        

      } else {
        console.log("No member cap found, but user realIsMember status is:", realIsMember);
        setMemberCapId(null);
        // Keep canVote true if user is member (for UI), but they'll need cap to actually vote
      }
    } catch (error) {
      console.error("Error fetching member cap:", error);
      setMemberCapId(null);
      // Don't change canVote here - keep it based on isMember status
    }
  };

  const fetchProposals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use suix_queryEvents to get proposal events
      console.log("Fetching proposal events for package:", packageId);
      const eventsResponse = await fetch('https://fullnode.mainnet.sui.io:443', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "suix_queryEvents",
          params: [
            {
              MoveEventType: `${packageId}::dao::ProposalCreatedEvent`
            },
            null,
            10, // Limit to 10 proposals
            false
          ]
        })
      });
      
      const eventsData = await eventsResponse.json();
      console.log("Proposal events response:", eventsData);
      
      if (!eventsData.result?.data || eventsData.result.data.length === 0) {
        console.log("No proposal events found");
        setError("No proposals found for this DAO");
        setIsLoading(false);
        return;
      }

      // Filter events for this specific DAO
      const daoProposalEvents = eventsData.result.data.filter(
        (event: any) => event.parsedJson.dao_id === daoId
      );
      
      console.log(`Found ${daoProposalEvents.length} proposal events for DAO ${daoId}`);
      
      if (daoProposalEvents.length === 0) {
        setError("No proposals found for this specific DAO");
        setIsLoading(false);
        return;
      }
      
      // Get proposal IDs from events
      const proposalIds = daoProposalEvents.map((event: any) => event.parsedJson.proposal_id);
      console.log("Proposal IDs:", proposalIds);
      
      // Fetch detailed proposal data
      const fetchedProposals = await Promise.all(
        proposalIds.map(async (proposalId: string) => {
          try {
            console.log(`Fetching proposal ${proposalId}`);
            const response = await fetch('https://fullnode.mainnet.sui.io:443', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "sui_getObject",
                params: [
                  proposalId,
                  {
                    showType: true,
                    showOwner: true,
                    showContent: true
                  }
                ]
              })
            });
            
            const data = await response.json();
            
            if (!data.result?.data?.content?.fields) {
              console.error(`Invalid response for proposal ${proposalId}:`, data);
              return null;
            }
            
            const proposalData = data.result.data.content.fields;
            console.log(`Proposal ${proposalId} data:`, proposalData);
            
            // Determine proposal type
            let proposalType: 'General' | 'Add Member' | 'Remove Member' | 'Config Update' = 'General';
            if (proposalData.proposal_type === 1 || proposalData.proposal_type === '1') {
              proposalType = 'Add Member';
            } else if (proposalData.proposal_type === 2 || proposalData.proposal_type === '2') {
              proposalType = 'Remove Member';
            } else if (proposalData.config_key) {
              proposalType = 'Config Update';
            }
            
            // Extract voter data
            const voterEntries = proposalData.voters?.fields?.contents || [];
            const voters = voterEntries.map((entry: any) => ({
              address: entry.fields.key,
              voteFor: entry.fields.value
            }));
            
            // Check if the current user has voted
            const userVote = userAccount ? voters.find(v => v.address === userAccount.address) : undefined;
            
            // Parse timestamps properly - ensure they're in milliseconds
            let createdAt = parseInt(proposalData.created_at);
            let expiresAt = parseInt(proposalData.expires_at);
            
            // Convert from seconds to milliseconds if needed
            if (createdAt < 1000000000000) createdAt *= 1000;
            if (expiresAt < 1000000000000) expiresAt *= 1000;
            
            // Determine status
            let status: 'active' | 'passed' | 'failed' | 'executed' = 'active';
            if (proposalData.is_executed) {
              status = 'executed';
            } else if (proposalData.is_closed) {
              status = proposalData.passed ? 'passed' : 'failed';
            } else if (expiresAt < Date.now()) {
              status = 'failed'; // Expired but not closed
            }
            
            // Build the proposal object
            return {
              id: proposalId,
              title: proposalData.title || "Untitled Proposal",
              description: proposalData.description || "",
              creator: proposalData.creator || "",
              type: proposalType,
              status: status,
              votesFor: parseInt(proposalData.votes_for) || 0,
              votesAgainst: parseInt(proposalData.votes_against) || 0,
              expiresAt,
              createdAt,
              daoId: proposalData.dao_id || daoId,
              targetAddress: proposalData.target_address,
              configKey: proposalData.config_key,
              configValue: proposalData.config_value,
              hasVoted: !!userVote,
              voteDirection: userVote ? userVote.voteFor : undefined,
              voters
            };
          } catch (error) {
            console.error(`Error fetching proposal ${proposalId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out nulls and sort by creation date (newest first)
      const validProposals = fetchedProposals.filter(p => p !== null) as Proposal[];
      validProposals.sort((a, b) => b.createdAt - a.createdAt);
      
      if (validProposals.length === 0) {
        setError("Failed to retrieve proposal details");
      } else {
        setProposals(validProposals);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setError(`Error connecting to blockchain: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial loading of data
  useEffect(() => {
    fetchMemberCap();
  }, [userAccount, packageId, isMember]);

  useEffect(() => {
    fetchProposals();
  }, [daoId, packageId, userAccount]);

  const submitVote = async (proposalId: string, voteFor: boolean) => {
    if (!userAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!memberCapId) {
      toast.error("No member capability found for your account");
      return;
    }

    setIsSubmittingVote(true);
    
    try {
      const adapter = await getAdapter();
      const transactionBlock = new TransactionBlock();
      
      // Call the vote function in the dao module
      transactionBlock.moveCall({
        target: `${packageId}::dao::vote`,
        arguments: [
          transactionBlock.object(memberCapId),
          transactionBlock.object(daoId),
          transactionBlock.object(proposalId),
          transactionBlock.pure.bool(voteFor),
          transactionBlock.object("0x6"),
        ],
      });
      
      console.log("Submitting vote transaction", {
        memberCapId,
        daoId,
        proposalId,
        voteFor
      });
      
      const txid = await adapter.signAndExecuteTransactionBlock({
        transactionBlock: transactionBlock,
        chain: 'sui:mainnet',
        account: userAccount,
      });
      
      console.log("Vote transaction completed:", txid);
      toast.success('Vote submitted!', {
        action: {
          label: 'View Transaction',
          onClick: () => {
            window.open(`https://suiscan.xyz/mainnet/tx/${txid.digest}`, '_blank');
          },
        },
      });
      
      // Update local state to reflect vote
      setProposals(prevProposals => 
        prevProposals.map(proposal => 
          proposal.id === proposalId
            ? { 
                ...proposal, 
                votesFor: voteFor ? proposal.votesFor + 1 : proposal.votesFor,
                votesAgainst: !voteFor ? proposal.votesAgainst + 1 : proposal.votesAgainst,
                hasVoted: true,
                voteDirection: voteFor,
                voters: [
                  ...proposal.voters,
                  {
                    address: userAccount.address,
                    voteFor: voteFor
                  }
                ]
              }
            : proposal
        )
      );
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error(`Failed to submit vote: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleCreateProposal = () => {
    if (!memberCapId) {
      toast.error("You need a member capability to create proposals");
      return;
    }
    setShowCreateModal(true);
  };

  const handleProposalCreated = (newProposalId: string) => {
    window.location.reload();
  };

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    if (filter === 'active') return proposal.status === 'active';
    if (filter === 'closed') return ['passed', 'failed', 'executed'].includes(proposal.status);
    return true;
  });
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="proposals-container">
      <div className="proposals-header">
        <h2>Proposals</h2>
        <div className="header-actions">
          <div className="filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`} 
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-btn ${filter === 'closed' ? 'active' : ''}`} 
              onClick={() => setFilter('closed')}
            >
              Closed
            </button>
          </div>
          
          <div className="action-buttons">
            <button
              className="refresh-button"
              onClick={refreshData}
              disabled={isRefreshing}
              title="Refresh proposals"
            >
              {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
            </button>
            
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading proposals from blockchain...</p>
          </div>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-state">
            <p>{error}</p>
            <button 
              onClick={() => refreshData()} 
              className="refresh-button"
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="empty-container">
          <div className="empty-state">
            <p>No proposals found</p>
            {realIsMember && userAccount && memberCapId && (
              <button 
                className="create-proposal-btn-centered"
                onClick={handleCreateProposal}
              >
                Create Your First Proposal
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="proposals-list">
          {filteredProposals.map(proposal => (
            <div key={proposal.id} className={`proposal-card ${proposal.status}`}>
              <div className="proposal-header">
                <div className="proposal-title-row">
                  <h3>{proposal.title}</h3>
                  <div className={`proposal-status ${proposal.status}`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </div>
                </div>
                <div className="proposal-type">{proposal.type}</div>
              </div>
              
              <p className="proposal-description">{proposal.description}</p>
              
              {proposal.type === 'Config Update' && proposal.configKey && (
                <div className="proposal-config">
                  <div className="config-update">
                    <span className="config-label">Setting:</span>
                    <code>{proposal.configKey}</code>
                  </div>
                  <div className="config-update">
                    <span className="config-label">New Value:</span>
                    <code>{proposal.configValue}</code>
                  </div>
                </div>
              )}
              
              {proposal.type === 'Add Member' && proposal.targetAddress && (
                <div className="proposal-target">
                  <span className="target-label">New Member Address:</span>
                  <div className="address-with-copy">
                    <code>{shortenAddress(proposal.targetAddress)}</code>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(proposal.targetAddress || '')}
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              
              {proposal.type === 'Remove Member' && proposal.targetAddress && (
                <div className="proposal-target">
                  <span className="target-label">Member to Remove:</span>
                  <div className="address-with-copy">
                    <code>{shortenAddress(proposal.targetAddress)}</code>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(proposal.targetAddress || '')}
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              
              <div className="proposal-details">
                <div className="votes-container">
                  <div className="votes">
                    <div className="votes-label">For</div>
                    <div className="votes-bar">
                      <div 
                        className="votes-fill for" 
                        style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="votes-count">{proposal.votesFor}</div>
                  </div>
                  <div className="votes">
                    <div className="votes-label">Against</div>
                    <div className="votes-bar">
                      <div 
                        className="votes-fill against" 
                        style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="votes-count">{proposal.votesAgainst}</div>
                  </div>
                </div>
                
                {proposal.hasVoted && userAccount && (
                  <div className="user-vote">
                    <div className={`vote-badge ${proposal.voteDirection ? 'voted-for' : 'voted-against'}`}>
                      You voted {proposal.voteDirection ? 'For' : 'Against'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="proposal-voters">
                <div className="voters-label">Voters:</div>
                <div className="voters-list">
                  {proposal.voters.length > 0 ? (
                    proposal.voters.map((voter, idx) => (
                      <div 
                        key={idx} 
                        className={`voter ${voter.voteFor ? 'voted-for' : 'voted-against'}`}
                        title={`${voter.address} voted ${voter.voteFor ? 'For' : 'Against'}`}
                      >
                        <span className="voter-icon">
                          {voter.voteFor ? '✓' : '✗'}
                        </span>
                        <div className="address-with-copy">
                          <span className="voter-address">{shortenAddress(voter.address)}</span>
                          <button 
                            className="copy-btn" 
                            onClick={() => copyToClipboard(voter.address)}
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                        {userAccount && voter.address === userAccount.address && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-voters">No votes yet</div>
                  )}
                </div>
              </div>

              <div className="proposal-meta">
                <div>
                  <span className="meta-label">Creator:</span>
                  <div className="address-with-copy">
                    <span className="meta-value">{shortenAddress(proposal.creator)}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(proposal.creator)}
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">
                    {formatDate(proposal.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="meta-label">
                    {proposal.status === 'active' ? 'Expires:' : 'Closed:'}
                  </span>
                  <span className="meta-value">
                    {proposal.status === 'active' 
                      ? `${formatTimeLeft(proposal.expiresAt - Date.now())} (${formatDate(proposal.expiresAt)})`
                      : formatDate(proposal.expiresAt)}
                  </span>
                </div>
              </div>

              {proposal.status === 'active' && realIsMember && userAccount && !proposal.hasVoted && (
                <div className="voting-actions-container">
                  {memberCapId ? (
                    <div className="voting-actions">
                      <button 
                        className="vote-button for" 
                        onClick={() => submitVote(proposal.id, true)}
                        disabled={isSubmittingVote}
                      >
                        {isSubmittingVote ? 'Submitting...' : 'Vote For'}
                      </button>
                      <button 
                        className="vote-button against" 
                        onClick={() => submitVote(proposal.id, false)}
                        disabled={isSubmittingVote}
                      >
                        {isSubmittingVote ? 'Submitting...' : 'Vote Against'}
                      </button>
                    </div>
                  ) : (
                    <div className="voting-notice">
                      You're a member but need a member capability to vote
                    </div>
                  )}
                </div>
              )}
              
              {proposal.status === 'active' && !proposal.hasVoted && (
                !userAccount ? (
                  <div className="voting-notice centered-notice">
                    Connect your wallet to vote on this proposal
                  </div>
                ) : !realIsMember && (
                  <div className="voting-notice centered-notice">
                    You must be a member to vote on this proposal
                  </div>
                )
              )}
              
              <div className="proposal-id">
                ID: 
                <div className="address-with-copy">
                  <code>{shortenAddress(proposal.id)}</code>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(proposal.id)}
                    title="Copy ID"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <ProposalCreateModal
          onClose={() => setShowCreateModal(false)}
          onProposalCreated={handleProposalCreated}
          packageId={packageId}
          daoId={daoId}
          memberCapId={memberCapId}
          account={userAccount}
        />
      )}
    </div>
  );
};

// Helper function to format time left
function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Expired";
  
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else {
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  }
}

export default ProposalForm;