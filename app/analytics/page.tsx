'use client'
import React from 'react'
import AnalyticsPage from '../components/AnalyticsPage/AnalyticsPage'
import Background from '../components/Background'
import Header from '../components/Header'

export default function Analytics() {
  return (
    <div className="app-wrapper">
      <Background />
      <div className="content-wrapper">
        <Header />
        <AnalyticsPage />
      </div>
    </div>
  )
}