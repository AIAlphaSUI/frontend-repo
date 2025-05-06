import React, { useState, useEffect } from 'react'
import { WalletAccount } from '@mysten/wallet-standard'
import { getAdapter } from '../../misc/adapter'
import ActionStarryButton from '../ActionStarryButton'
import { TransactionBlock } from '@mysten/sui.js/transactions'
import { toast } from 'sonner'
import './DAOStats.css'
import ProposalCreateModal from './ProposalCreateModal'

interface DAOStatsProps {
  daoId: string
  isMember: boolean
  requestMembership: () => Promise<void>
  account?: WalletAccount
}

const DAOStats: React.FC<DAOStatsProps> = ({ 
  daoId, 
  isMember: propIsMember, 
  requestMembership,
  account 
}) => {
  // Using real data from the blockchain response
  const [stats, setStats] = useState({
    memberCount: null as null | number,
    activeProposals: null as null | number,
    executedProposals: null as null | number,
    votingPeriod: null as null | string,
    majorityThreshold: null as null | string
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [memberAddresses, setMemberAddresses] = useState<string[]>([])
  const [isMember, setIsMember] = useState(propIsMember)
  const [error, setError] = useState<string | null>(null)
  const [memberCapId, setMemberCapId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(err => toast.error("Failed to copy: " + err))
  }

  // Helper function to shorten addresses for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  useEffect(() => {
    // Check if the account address is in the member list
    if (account && memberAddresses.length > 0) {
      const accountIsMember = memberAddresses.includes(account.address)
      setIsMember(accountIsMember)
    }
  }, [account, memberAddresses])

  useEffect(() => {
    const fetchDAOStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch DAO state from blockchain
        const response = await fetch('https://fullnode.mainnet.sui.io:443', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "sui_getObject",
            params: [
              daoId,
              {
                showType: true,
                showOwner: true,
                showPreviousTransaction: true,
                showDisplay: false,
                showContent: true,
                showBcs: false,
                showStorageRebate: true
              }
            ]
          })
        })
        
        const data = await response.json()
        
        if (data.result && data.result.data && data.result.data.content) {
          const daoState = data.result.data.content.fields
          
          // Store member addresses for display
          const members = daoState.members?.fields?.contents || []
          setMemberAddresses(members)
          
          // If account is connected, check if they are a member
          if (account) {
            setIsMember(members.includes(account.address))
          }
          
          // Use the ProposalCreatedEvent query approach to get proposal counts 
          let activeProposalCount = 0;
          let executedProposalCount = 0;
          
          try {
            // Get all proposals for this DAO by querying events
            const eventsResponse = await fetch('https://fullnode.mainnet.sui.io:443', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "suix_queryEvents",
                params: [
                  {
                    MoveEventType: `0xa5624847b0b4ed0ace977e773bd120987b617c5bbed83a095d818a8a3f363be4::dao::ProposalCreatedEvent`
                  },
                  null,
                  50, // Query up to 50 proposals
                  false
                ]
              })
            });
            
            const eventsData = await eventsResponse.json();
            
            if (eventsData.result?.data) {
              // Filter events for this specific DAO
              const daoProposalEvents = eventsData.result.data.filter(
                (event: any) => event.parsedJson.dao_id === daoId
              );
              
              console.log(`Found ${daoProposalEvents.length} proposal events for DAO ${daoId}`);
              
              // Get proposal IDs from events
              const proposalIds = daoProposalEvents.map((event: any) => event.parsedJson.proposal_id);
              
              // Fetch detailed proposal data for counting active vs executed
              await Promise.all(
                proposalIds.map(async (proposalId: string) => {
                  try {
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
                            showContent: true
                          }
                        ]
                      })
                    });
                    
                    const data = await response.json();
                    
                    if (data.result?.data?.content?.fields) {
                      const proposalData = data.result.data.content.fields;
                      
                      // Count active vs executed
                      if (proposalData.is_executed) {
                        executedProposalCount++;
                      } else if (!proposalData.is_closed) {
                        const expiresAt = parseInt(proposalData.expires_at);
                        // Convert to milliseconds if needed
                        const expiryTimestamp = expiresAt < 1000000000000 ? expiresAt * 1000 : expiresAt;
                        
                        // Check if it's expired
                        if (expiryTimestamp > Date.now()) {
                          activeProposalCount++;
                        }
                      }
                    }
                  } catch (err) {
                    console.error(`Error fetching proposal ${proposalId}:`, err);
                  }
                })
              );
            }
          } catch (err) {
            console.error("Error counting proposals:", err);
          }
          
          // Convert voting period from seconds to days
          const voteDurationSeconds = parseInt(daoState.vote_duration) || 604800
          const voteDurationDays = (voteDurationSeconds / 86400).toFixed(1)
          
          // Get majority threshold
          const majorityThreshold = daoState.majority_threshold || "50"
          
          // Set the stats from blockchain data
          setStats({
            memberCount: parseInt(daoState.member_count) || memberAddresses.length,
            activeProposals: activeProposalCount,
            executedProposals: executedProposalCount,
            votingPeriod: `${voteDurationDays} days`,
            majorityThreshold: `${majorityThreshold}%`
          })
          
          // Fetch member cap ID if the user is a member
          if (account && members.includes(account.address)) {
            fetchMemberCap(account.address)
          }
        } else {
          setError("Failed to fetch DAO data")
        }
      } catch (error) {
        console.error("Error fetching DAO stats:", error)
        setError("Error connecting to blockchain")
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchMemberCap = async (address: string) => {
      try {
        const memberCapResponse = await fetch('https://fullnode.mainnet.sui.io:443', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getOwnedObjects",
            params: [
              address,
              {
                filter: {
                  MatchAll: [
                    {
                      StructType: "0xa5624847b0b4ed0ace977e773bd120987b617c5bbed83a095d818a8a3f363be4::dao::MemberCap"
                    },
                    {
                      AddressOwner: address
                    }
                  ]
                },
                options: {
                  showType: true,
                  showOwner: true,
                  showPreviousTransaction: true,
                  showContent: true
                }
              }
            ]
          })
        })
        
        const memberCapData = await memberCapResponse.json()
        
        if (memberCapData.result && 
            memberCapData.result.data && 
            memberCapData.result.data.length > 0 &&
            memberCapData.result.data[0].data &&
            memberCapData.result.data[0].data.objectId) {
          setMemberCapId(memberCapData.result.data[0].data.objectId)
        }
      } catch (error) {
        console.error("Error fetching member cap:", error)
      }
    }
    
    fetchDAOStats()
  }, [daoId, account])

  const handleCreateProposal = async () => {
    if (!account) {
      toast.error("Please connect your wallet first")
      return
    }
    
    if (!isMember) {
      toast.error("You must be a member to create proposals")
      return
    }
    
    if (!memberCapId) {
      toast.error("No member capability found for your account")
      return
    }
    
    // Open the proposal creation modal
    setShowCreateModal(true)
  }
  
  const handleProposalCreated = (proposalId: string) => {
    // After creating a proposal, refresh the DAO stats
    window.location.reload()
  }

  return (
    <div className="dao-stats">
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading DAO stats...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="refresh-button">
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-value">{stats.memberCount !== null ? stats.memberCount : 'N/A'}</div>
              <div className="stat-label">Members</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.activeProposals !== null ? stats.activeProposals : 'N/A'}</div>
              <div className="stat-label">Active Proposals</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.executedProposals !== null ? stats.executedProposals : 'N/A'}</div>
              <div className="stat-label">Executed Proposals</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.votingPeriod !== null ? stats.votingPeriod : 'N/A'}</div>
              <div className="stat-label">Voting Period</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.majorityThreshold !== null ? stats.majorityThreshold : 'N/A'}</div>
              <div className="stat-label">Majority Threshold</div>
            </div>
          </div>
          
          <div className="dao-actions">
            {isMember ? (
              <div className="member-actions">
                <div className="membership-status member">
                  <span className="status-icon">✓</span>
                  Member
                </div>
                <ActionStarryButton onClick={handleCreateProposal} name="Create Proposal" />
              </div>
            ) : (
              <div className="guest-actions">
                <div className="membership-status">Not a Member</div>
                {/* <ActionStarryButton onClick={requestMembership} name="Request Membership" /> */}
              </div>
            )}
          </div>
        </>
      )}

      {!isLoading && !error && (
        <div className="member-list-container">
          <h3>Current Members</h3>
          
          <div className="member-table-container">
            <table className="member-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberAddresses.length > 0 ? (
                  memberAddresses.map((address, index) => (
                    <tr key={index} className={account && address === account.address ? "current-user" : ""}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="table-address">
                          <span className="member-icon">👤</span>
                          <code>{shortenAddress(address)}</code>
                        </div>
                      </td>
                      <td>
                        {account && address === account.address && (
                          <span className="you-badge">You</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="action-button copy-button" 
                          onClick={() => copyToClipboard(address)}
                          title="Copy address"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="no-members">No members found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="dao-id">
            DAO ID: 
            <div className="address-with-copy">
              <code>{shortenAddress(daoId)}</code>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(daoId)}
                title="Copy DAO ID"
              >
                📋
              </button>
            </div>
            <button 
              className="action-button view-full-button" 
              onClick={() => {
                const fullIdElement = document.createElement('div');
                fullIdElement.classList.add('full-id-display');
                fullIdElement.innerHTML = `
                  <div class="full-id-content">
                    <h3>Full DAO ID</h3>
                    <code>${daoId}</code>
                    <button class="copy-full-btn" onclick="navigator.clipboard.writeText('${daoId}')">Copy</button>
                    <button class="close-full-btn">Close</button>
                  </div>
                `;
                document.body.appendChild(fullIdElement);
                document.querySelector('.close-full-btn')?.addEventListener('click', () => {
                  document.body.removeChild(fullIdElement);
                });
                document.querySelector('.copy-full-btn')?.addEventListener('click', () => {
                  toast.success("Copied to clipboard");
                });
              }}
            >
              View Full ID
            </button>
          </div>
        </div>
      )}
      
      {showCreateModal && (
        <ProposalCreateModal
          onClose={() => setShowCreateModal(false)}
          onProposalCreated={handleProposalCreated}
          packageId="0xa5624847b0b4ed0ace977e773bd120987b617c5bbed83a095d818a8a3f363be4"
          daoId={daoId}
          memberCapId={memberCapId}
          account={account}
        />
      )}
    </div>
  )
}

export default DAOStats