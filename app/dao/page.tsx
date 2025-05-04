'use client'
import React from 'react'
import DAOPage from '../components/dao/DAOPage'
import Background from '../components/Background'
import Header from '../components/Header'

export default function DAO() {
  return (
    <div className="app-wrapper">
      <Background />
      <div className="content-wrapper">
        <Header />
        <DAOPage />
      </div>
    </div>
  )
}