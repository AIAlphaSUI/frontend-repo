import React, { useEffect, useState } from 'react'
import './MemberList.css'

interface Member {
  address: string
  joinedAt: number
  addedBy: string
  daoId: string
}

interface MemberListProps {
  daoId: string
  packageId: string
}

const MemberList: React.FC<MemberListProps> = ({ daoId, packageId }) => {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch member events from the blockchain
        const response = await fetch('https://fullnode.testnet.sui.io:443', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_queryEvents",
            params: [
              {
                MoveEventType: `${packageId}::dao::MemberAddedEvent`
              },
              null,
              50, // Increased limit to get more members
              false
            ]
          })
        })

        const data = await response.json()
        
        if (!data.result?.data) {
          setError("Failed to fetch members from the blockchain")
          setMembers([])
          return
        }
        
        // Filter events for this specific DAO
        const daoMembers = data.result.data
          .filter((event: any) => event.parsedJson.dao_id === daoId)
          .map((event: any) => ({
            address: event.parsedJson.member,
            joinedAt: parseInt(event.parsedJson.timestamp),
            addedBy: event.parsedJson.added_by,
            daoId: event.parsedJson.dao_id
          }));

        console.log(`Found ${daoMembers.length} members for DAO ${daoId}`)
        
        // Remove duplicates (in case a member was added multiple times)
        const uniqueMembers = daoMembers.reduce((acc: Member[], current: Member) => {
          const x = acc.find(item => item.address === current.address);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        // Sort members by join date (newest first)
        uniqueMembers.sort((a, b) => b.joinedAt - a.joinedAt);
        
        setMembers(uniqueMembers)
      } catch (error) {
        console.error("Error fetching members:", error)
        setError(`Failed to load members: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (daoId && packageId) {
      fetchMembers()
    }
  }, [daoId, packageId])

  const filteredMembers = members.filter(member => 
    member.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to format timestamp
  const formatDate = (timestamp: number) => {
    // Convert to milliseconds if needed
    const date = new Date(timestamp < 1000000000000 ? timestamp * 1000 : timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper function to shorten address
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  return (
    <div className="members-container">
      <div className="members-header">
        <h2>Members ({members.length})</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading members from blockchain...</p>
          </div>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-state">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="refresh-button"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="empty-container">
          <div className="empty-state">
            <p>No members found</p>
          </div>
        </div>
      ) : (
        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Joined</th>
                <th>Added By</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.address}>
                  <td className="address-cell">
                    <div className="address-wrapper">
                      <div className="address-icon"></div>
                      <div className="address-text" title={member.address}>
                        {shortenAddress(member.address)}
                      </div>
                      <button 
                        className="copy-btn" 
                        onClick={() => {
                          navigator.clipboard.writeText(member.address);
                          alert("Address copied!");
                        }}
                        title="Copy address"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td title={new Date(member.joinedAt).toString()}>
                    {formatDate(member.joinedAt)}
                  </td>
                  <td className="address-cell">
                    <div className="address-wrapper">
                      <div className="address-text" title={member.addedBy}>
                        {shortenAddress(member.addedBy)}
                      </div>
                      <button 
                        className="copy-btn" 
                        onClick={() => {
                          navigator.clipboard.writeText(member.addedBy);
                          alert("Address copied!");
                        }}
                        title="Copy address"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="member-actions">
                      <a 
                        href={`https://suiscan.xyz/testnet/address/${member.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-explorer-btn"
                        title="View on explorer"
                      >
                        🔍 Explorer
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MemberList