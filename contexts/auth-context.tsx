"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("paisapal_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get stored users
      const users = JSON.parse(localStorage.getItem("paisapal_users") || "[]")
      const foundUser = users.find(
        (u: { email: string; password: string }) => u.email === email && u.password === password,
      )

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
        }
        setUser(userData)
        localStorage.setItem("paisapal_user", JSON.stringify(userData))
        return true
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get stored users
      const users = JSON.parse(localStorage.getItem("paisapal_users") || "[]")

      // Check if email already exists
      if (users.some((u: { email: string }) => u.email === email)) {
        return false
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
      }

      users.push(newUser)
      localStorage.setItem("paisapal_users", JSON.stringify(users))

      const userData: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      }
      setUser(userData)
      localStorage.setItem("paisapal_user", JSON.stringify(userData))
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("paisapal_user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
