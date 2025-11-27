"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFinance } from "@/contexts/finance-context"
import { Navbar } from "@/components/navbar"
import { DashboardHome } from "@/components/dashboard-home"
import { ExpenseTracker } from "@/components/expense-tracker"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { GoalsPage } from "@/components/goals-page"
import { AIChatbot } from "@/components/ai-chatbot"
import { ProfilePage } from "@/components/profile-page"

export type PageType = "home" | "expenses" | "analytics" | "goals" | "chatbot" | "profile"

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>("home")
  const { user } = useAuth()
  const { expenses, goals, income } = useFinance()

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <DashboardHome onNavigate={setCurrentPage} />
      case "expenses":
        return <ExpenseTracker />
      case "analytics":
        return <AnalyticsDashboard />
      case "goals":
        return <GoalsPage />
      case "chatbot":
        return <AIChatbot />
      case "profile":
        return <ProfilePage />
      default:
        return <DashboardHome onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">{renderPage()}</main>
    </div>
  )
}
