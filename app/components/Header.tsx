import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './Header.css'
import StarryButton from './StarryButton'
import { getAdapter } from '../misc/adapter'
import { WalletAccount } from '@mysten/wallet-standard'

const Header: React.FC = () => {
  const [userAccount, setUserAccount] = useState<WalletAccount | undefined>()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
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
  }, [])
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])
  
  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'DAO', path: '/dao' },
    { name: 'Agents Market', path: '/agents' },
    { name: 'Portfolio', path: '/portfolio' },
  ]
  
  return (
    <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-area">
          <Link href="/" className="logo-link">
            <div className="logo-wrapper">
              <img src="/logo.png" alt="AI AlphaSui" className="logo-img" />
            </div>
          </Link>
        </div>
        
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link 
                  href={item.path} 
                  className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="wallet-area">
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
        </div>
      </div>
      <div className="header-glow"></div>
    </header>
  )
}

export default Header