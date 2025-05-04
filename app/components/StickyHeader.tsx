/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { toast } from 'sonner'
import { getAdapter } from '../misc/adapter'
import ActionStarryButton from './ActionStarryButton'
import StarryButton from './StarryButton'
import { WalletAccount } from '@mysten/wallet-standard'
import { TransactionBlock } from '@mysten/sui.js/transactions'

const StickyHeader: React.FC = () => {
  const [userAccount, setUserAccount] = React.useState<WalletAccount | undefined>()
  useEffect(() => {
    const init = async () => {
      const adapter = await getAdapter()
      if (await adapter.canEagerConnect()) {
        try {
          await adapter.connect()
          const account = await adapter.getAccounts()
          if (account[0]) {
            setUserAccount(account[0])
          }
        } catch (error) {
          await adapter.disconnect().catch(() => {})
          console.log(error)
        }
      }
    }
    init()
    // Try eagerly connect
  }, [])
  return (
    <header className='fixed top-0 left-0 w-full bg-opacity-50  p-6 z-10'>
      <div className='flex items-center justify-between'>
        <div>
          {/* <Image
            style={{ width: '200px', cursor: 'pointer' }}
            src={NightlyLogo}
            alt='logo'
            onClick={() => {
              // redirect to nightly.app
              window.location.href = 'https://nightly.app'
            }}
          /> */}
        </div>
        <div className='flex flex-col space-y-4'>
          <StarryButton
            connected={userAccount?.address !== undefined}
            onConnect={async () => {
              const adapter = await getAdapter()
              try {
                await adapter.connect()
                const account = await adapter.getAccounts()
                if (account[0]) {
                  setUserAccount(account[0])
                }
              } catch (error) {
                // If error, disconnect ignore error
                await adapter.disconnect().catch(() => {})
              }
            }}
            onDisconnect={async () => {
              try {
                const adapter = await getAdapter()
                await adapter.disconnect()
                setUserAccount(undefined)
              } catch (error) {
                console.log(error)
              }
            }}
            publicKey={userAccount?.address}
          />
          {userAccount?.address && (
            <>
              {/* <ActionStarryButton
                onClick={async () => {
                  const signTransaction = async () => {
                    const adapter = await getAdapter()
                    const transactionBlock = new TransactionBlock()
                    const coin = transactionBlock.splitCoins(transactionBlock.gas, [
                      transactionBlock.pure(50_000_000),
                    ])
                    transactionBlock.transferObjects(
                      [coin],
                      transactionBlock.pure(
                        '0x5635a39dfd0b9e2302453695497b1979fa1af481a0fbfed9d0dd5a99accb2fc0'
                      )
                    )
                    const txid = await adapter.signAndExecuteTransactionBlock({
                      transactionBlock: transactionBlock as any,
                      chain: 'sui:testnet',
                      account: userAccount,
                    })
                    console.log(txid)
                    toast.success('Transaction send!', {
                      action: {
                        label: 'Show Transaction ',
                        onClick: () => {
                          // Open url in a new tab
                          window.open(`https://suiscan.xyz/testnet/tx/${txid.digest}`, '_blank')
                        },
                      },
                    })
                  }
                  toast.promise(signTransaction, {
                    loading: 'Signing Transaction...',
                    success: (_) => {
                      return `Transaction signed!`
                    },
                    error: 'Operation has been rejected!',
                  })
                }}
                name='Sign Transaction'
              ></ActionStarryButton> */}

            <ActionStarryButton
              onClick={async () => {
                const signTransaction = async () => {
                  const adapter = await getAdapter()
                  const transactionBlock = new TransactionBlock()
                  
                  // Package and object IDs
                  const PACKAGE_ID = "0xd330193f38414dcdb20fe729c8a9cc107d9232453c021f8b3620201335292ec4"
                  const DAO_ID = "0x6788794b5349880caba8bbecdbdf78a7ef274a14c7a57c5b262f43a1fe246f9b"
                  const MEMBER_CAP_ID = "0xddbd2a778729b15cef48e52c8afc646d22ba11f34f8c1b90fb1fc55f6999abbe"
                  const CLOCK_ID = "0x6"
                  // Replace with your actual proposal ID
                  const PROPOSAL_ID = "0x2525259231dcbc4d6eefa58db86091f4613f7f508a6ca50226e884c0e42487ae" // You need to provide the actual proposal ID here
                  
                  // Call the vote function in the dao module
                  transactionBlock.moveCall({
                    target: `${PACKAGE_ID}::dao::vote`,
                    arguments: [
                      transactionBlock.object(MEMBER_CAP_ID),
                      transactionBlock.object(DAO_ID),
                      transactionBlock.pure(PROPOSAL_ID),
                      transactionBlock.pure.bool(true), // Voting "true"
                      transactionBlock.object(CLOCK_ID),
                    ],
                  })
                  
                  const txid = await adapter.signAndExecuteTransactionBlock({
                    transactionBlock: transactionBlock,
                    chain: 'sui:testnet',
                    account: userAccount,
                  })
                  
                  console.log(txid)
                  toast.success('DAO Vote Submitted!', {
                    action: {
                      label: 'View Transaction',
                      onClick: () => {
                        window.open(`https://suiscan.xyz/testnet/tx/${txid.digest}`, '_blank')
                      },
                    },
                  })
                }
                
                toast.promise(signTransaction, {
                  loading: 'Submitting DAO vote...',
                  success: (_) => {
                    return `Vote successfully submitted!`
                  },
                  error: 'Vote transaction failed or rejected',
                })
              }}
              name='Submit DAO Vote'
            ></ActionStarryButton>

              <ActionStarryButton
                onClick={async () => {
                  const signMessage = async () => {
                    const adapter = await getAdapter()
                    await adapter.signPersonalMessage({
                      message: new TextEncoder().encode('I love Nightly 🦊'),
                      account: userAccount,
                    })
                  }
                  toast.promise(signMessage, {
                    loading: 'Signing message...',
                    success: (_) => {
                      return `Message signed!`
                    },
                    error: 'Operation has been rejected!',
                  })
                }}
                name='Sign Message'
              ></ActionStarryButton>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default StickyHeader
