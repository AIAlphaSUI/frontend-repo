'use client'
import React from 'react'
import AgentsMarket from '../components/agentspage/AgentsMarket'
import Background from '../components/Background'
import Header from '../components/Header'

export default function AgentsPage() {
  return (
    <div className="app-wrapper">
      <Background />
      <div className="content-wrapper">
        <Header />
        <AgentsMarket />
      </div>
    </div>
  )
}