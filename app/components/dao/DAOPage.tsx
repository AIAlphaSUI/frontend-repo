'use client'
import React, { useState, useEffect } from 'react'
import { getAdapter } from '../../misc/adapter'
import DAOHeader from './DAOHeader'
import DAOStats from './DAOStats'
import ProposalForm from './ProposalForm'
import { WalletAccount } from '@mysten/wallet-standard'
import { toast } from 'sonner'
import './DAOPage.css'

// DAO Information
const DAO_DETAILS = {
  id: "0x6788794b5349880caba8bbecdbdf78a7ef274a14c7a57c5b262f43a1fe246f9b",
  packageId: "0xd330193f38414dcdb20fe729c8a9cc107d9232453c021f8b3620201335292ec4",
  name: "AI AlphaSUI DAO",
  description: "A decentralized governance system for the AI AlphaSUI platform."
}

const DAOPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'create'>('proposals')
  const [userAccount, setUserAccount] = useState<WalletAccount | undefined>()
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        const adapter = await getAdapter()
        if (await adapter.canEagerConnect()) {
          await adapter.connect()
          const account = await adapter.getAccounts()
          if (account[0]) {
            setUserAccount(account[0])
            // Here you would check if the user is a DAO member
            // Call your contract to check membership
            checkMembership(account[0].address)
          }
        }
      } catch (error) {
        console.error("Connection error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const checkMembership = async (address: string) => {
    // Placeholder for checking membership
    // In a real implementation, you'd query the blockchain
    try {
      // This would be replaced with actual contract call
      // For now, let's simulate a member check
      const mockMemberAddresses = [
        "0x5635a39dfd0b9e2302453695497b1979fa1af481a0fbfed9d0dd5a99accb2fc0",
        // Add more addresses as needed for testing
      ]
      setIsMember(mockMemberAddresses.includes(address))
    } catch (error) {
      console.error("Error checking membership:", error)
      setIsMember(false)
    }
  }

  const requestMembership = async () => {
    if (!userAccount) {
      toast.error("Please connect your wallet first")
      return
    }

    toast.promise(
      async () => {
        // This would be implemented to call the blockchain
        // Simulate request processing
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsMember(true) // For demo purposes
        return true
      },
      {
        loading: "Requesting DAO membership...",
        success: "Membership request submitted! You are now a member.",
        error: "Failed to request membership. Please try again."
      }
    )
  }

  return (
    <div className="dao-container">
      <DAOHeader 
        name={DAO_DETAILS.name} 
        description={DAO_DETAILS.description} 
      />
      
      <DAOStats 
        daoId={DAO_DETAILS.id}
        isMember={isMember} 
        requestMembership={requestMembership}
        account={userAccount}
      />
      
      <div className="dao-tabs">
        <button 
          className={`tab-button ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          Proposals
        </button>

        {isMember && (
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Proposal
          </button>
        )}
      </div>
      
      <div className="tab-content">
        {activeTab === 'proposals' && (
          <ProposalForm 
            userAccount={userAccount} 
            isMember={isMember}
            daoId={DAO_DETAILS.id}
            packageId={DAO_DETAILS.packageId}
          />
        )}
        
        
        {activeTab === 'create' && isMember && (
          <ProposalForm 
            userAccount={userAccount}
            daoId={DAO_DETAILS.id}
            packageId={DAO_DETAILS.packageId}
          />
        )}
      </div>
    </div>
  )
}

export default DAOPage