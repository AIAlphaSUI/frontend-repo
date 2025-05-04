'use client'
import { Loader } from '@react-three/drei'
import { Toaster } from 'sonner'
import Background from './components/Background'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import HowItWorks from './components/HowItWorks'
import TopAgents from './components/TopAgents'
import AboutUs from './components/AboutUs'
import Team from './components/Team'
import Socials from './components/Socials'
import './app.css' // Add this to ensure proper scrolling

export default function Home() {
  return (
    <div className="app-wrapper">
      <Background />
      <div className="content-wrapper">
        <Header />
        {/* <HeroSection /> */}
        <HowItWorks />
        <TopAgents />
        <AboutUs />
        <Team />
        <Socials />
      </div>
      <Toaster position='bottom-left' richColors />
      <Loader />
    </div>
  )
}