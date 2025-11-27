"use client"

import { useAuth } from "@/contexts/auth-context"
import type { PageType } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { Home, Receipt, BarChart3, Target, MessageSquare, User, LogOut, Wallet, Menu, X } from "lucide-react"
import { useState } from "react"

interface NavbarProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "home" as PageType, label: "Home", icon: Home },
    { id: "expenses" as PageType, label: "Expenses", icon: Receipt },
    { id: "analytics" as PageType, label: "Analytics", icon: BarChart3 },
    { id: "goals" as PageType, label: "Goals", icon: Target },
    { id: "chatbot" as PageType, label: "AI Chat", icon: MessageSquare },
    { id: "profile" as PageType, label: "Profile", icon: User },
  ]

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PaisaPal</span>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Hi, {user?.name?.split(" ")[0]}</span>
              <Button variant="outline" size="sm" onClick={logout} className="gap-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">PaisaPal</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-card border-b border-border p-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => {
                  onNavigate(item.id)
                  setMobileMenuOpen(false)
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
            <hr className="my-2 border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hi, {user?.name?.split(" ")[0]}</span>
              <Button variant="outline" size="sm" onClick={logout} className="gap-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile top navbar */}
      <div className="md:hidden h-14" />
    </>
  )
}
