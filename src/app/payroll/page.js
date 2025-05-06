'use client'
import HeroHeader from '@/components/HeroHeader'
import DistributeUI from '@/components/payroll/payroll'
import React from 'react'

const Page = () => {
  return (
    <div className="min-h-screen md:p-8 pt-4">
    <HeroHeader />
    <DistributeUI />
    </div>
  )
}

export default Page