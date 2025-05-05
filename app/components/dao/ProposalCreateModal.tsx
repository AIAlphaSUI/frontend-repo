import React, { useState } from 'react';
import { WalletAccount } from '@mysten/wallet-standard';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { getAdapter } from '../../misc/adapter';
import { toast } from 'sonner';
import './ProposalCreateModal.css';

interface ProposalCreateModalProps {
  onClose: () => void;
  onProposalCreated: (proposalId: string) => void;
  packageId: string;
  daoId: string;
  memberCapId: string | null;
  account?: WalletAccount;
}

type ProposalType = 'general' | 'addMember' | 'removeMember' | 'configUpdate';

const ProposalCreateModal: React.FC<ProposalCreateModalProps> = ({
  onClose,
  onProposalCreated,
  packageId,
  daoId,
  memberCapId,
  account
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState<ProposalType>('general');
  const [targetAddress, setTargetAddress] = useState('');
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !memberCapId) {
      toast.error('Missing account or member capability');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    if ((proposalType === 'addMember' || proposalType === 'removeMember') && !targetAddress.trim()) {
      toast.error('Target address is required');
      return;
    }

    if (proposalType === 'configUpdate' && (!configKey.trim() || !configValue.trim())) {
      toast.error('Config key and value are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const adapter = await getAdapter();
      const transactionBlock = new TransactionBlock();
      
      // Package and object IDs
      const PACKAGE_ID = packageId;
      const DAO_ID = daoId;
      const CLOCK_ID = "0x6";
      
      // Call the appropriate function based on proposal type
      switch (proposalType) {
        case 'general':
          transactionBlock.moveCall({
            target: `${PACKAGE_ID}::dao::create_proposal`,
            arguments: [
              transactionBlock.object(memberCapId),
              transactionBlock.object(DAO_ID),
              transactionBlock.pure.string(title),
              transactionBlock.pure.string(description),
              transactionBlock.object(CLOCK_ID),
            ],
          });
          break;
          
        case 'addMember':
          transactionBlock.moveCall({
            target: `${PACKAGE_ID}::dao::propose_add_member`,
            arguments: [
              transactionBlock.object(memberCapId),
              transactionBlock.object(DAO_ID),
              transactionBlock.pure.address(targetAddress),
              transactionBlock.pure.string(title),
              transactionBlock.pure.string(description),
              transactionBlock.object(CLOCK_ID),
            ],
          });
          break;
          
        case 'removeMember':
          transactionBlock.moveCall({
            target: `${PACKAGE_ID}::dao::propose_remove_member`,
            arguments: [
              transactionBlock.object(memberCapId),
              transactionBlock.object(DAO_ID),
              transactionBlock.pure.address(targetAddress),
              transactionBlock.pure.string(title),
              transactionBlock.pure.string(description),
              transactionBlock.object(CLOCK_ID),
            ],
          });
          break;
          
        case 'configUpdate':
          transactionBlock.moveCall({
            target: `${PACKAGE_ID}::dao::propose_config_update`,
            arguments: [
              transactionBlock.object(memberCapId),
              transactionBlock.object(DAO_ID),
              transactionBlock.pure.string(configKey),
              transactionBlock.pure.string(configValue),
              transactionBlock.pure.string(title),
              transactionBlock.pure.string(description),
              transactionBlock.object(CLOCK_ID),
            ],
          });
          break;
      }
      
      const txid = await adapter.signAndExecuteTransactionBlock({
        transactionBlock: transactionBlock,
        chain: 'sui:mainnet',
        account: account,
      });
      
      console.log('Transaction completed:', txid);
      toast.success('Proposal created successfully!', {
        action: {
          label: 'View Transaction',
          onClick: () => {
            window.open(`https://suiscan.xyz/mainnet/tx/${txid.digest}`, '_blank');
          },
        },
      });
      
      onProposalCreated(txid.digest);
      onClose();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="proposal-modal-overlay">
      <div className="proposal-modal">
        <div className="modal-header">
          <h2>Create New Proposal</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="proposalType">Proposal Type</label>
            <select 
              id="proposalType" 
              value={proposalType}
              onChange={(e) => setProposalType(e.target.value as ProposalType)}
            >
              <option value="general">General</option>
              <option value="addMember">Add Member</option>
              <option value="removeMember">Remove Member</option>
              <option value="configUpdate">Update Configuration</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proposal Title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of your proposal"
              required
              rows={4}
            />
          </div>
          
          {(proposalType === 'addMember' || proposalType === 'removeMember') && (
            <div className="form-group">
              <label htmlFor="targetAddress">Target Address</label>
              <input
                id="targetAddress"
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder={proposalType === 'addMember' ? 'Address to add' : 'Address to remove'}
                required
              />
            </div>
          )}
          
          {proposalType === 'configUpdate' && (
            <>
              <div className="form-group">
                <label htmlFor="configKey">Config Key</label>
                <input
                  id="configKey"
                  type="text"
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="e.g., vote_duration, majority_threshold"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="configValue">Config Value</label>
                <input
                  id="configValue"
                  type="text"
                  value={configValue}
                  onChange={(e) => setConfigValue(e.target.value)}
                  placeholder="e.g., 86400 (1 day in seconds)"
                  required
                />
              </div>
            </>
          )}
          
          <div className="form-group modal-ids">
            <div>
              <label>Package ID</label>
              <div className="id-display">{packageId}</div>
            </div>
            <div>  
              <label>DAO ID</label>
              <div className="id-display">{daoId}</div>
            </div>
            <div>
              <label>Member Cap ID</label>
              <div className="id-display">{memberCapId || 'Not found'}</div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting || !memberCapId}>
              {isSubmitting ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalCreateModal;