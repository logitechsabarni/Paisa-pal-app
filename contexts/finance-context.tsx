"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  userId: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  userId: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  userId: string
}

interface FinanceContextType {
  expenses: Expense[]
  goals: Goal[]
  achievements: Achievement[]
  income: number
  setIncome: (income: number) => void
  addExpense: (expense: Omit<Expense, "id" | "userId">) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  addGoal: (goal: Omit<Goal, "id" | "userId" | "currentAmount">) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  contributeToGoal: (id: string, amount: number) => void
  unlockAchievement: (achievementId: string) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const defaultAchievements: Omit<Achievement, "userId">[] = [
  { id: "first_expense", title: "First Step", description: "Added your first expense", icon: "🎯" },
  { id: "budget_master", title: "Budget Master", description: "Stayed within budget for a week", icon: "💰" },
  { id: "savings_starter", title: "Savings Starter", description: "Created your first savings goal", icon: "🌱" },
  { id: "goal_achieved", title: "Goal Crusher", description: "Completed a savings goal", icon: "🏆" },
  { id: "expense_tracker", title: "Tracker Pro", description: "Logged 10 expenses", icon: "📊" },
  { id: "consistent_saver", title: "Consistent Saver", description: "Saved for 7 consecutive days", icon: "⭐" },
]

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [income, setIncomeState] = useState<number>(0)

  useEffect(() => {
    if (user) {
      // Load user-specific data
      const savedExpenses = localStorage.getItem(`paisapal_expenses_${user.id}`)
      const savedGoals = localStorage.getItem(`paisapal_goals_${user.id}`)
      const savedAchievements = localStorage.getItem(`paisapal_achievements_${user.id}`)
      const savedIncome = localStorage.getItem(`paisapal_income_${user.id}`)

      if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
      else setExpenses([])

      if (savedGoals) setGoals(JSON.parse(savedGoals))
      else setGoals([])

      if (savedAchievements) setAchievements(JSON.parse(savedAchievements))
      else setAchievements(defaultAchievements.map((a) => ({ ...a, userId: user.id })))

      if (savedIncome) setIncomeState(JSON.parse(savedIncome))
      else setIncomeState(0)
    } else {
      setExpenses([])
      setGoals([])
      setAchievements([])
      setIncomeState(0)
    }
  }, [user])

  const saveExpenses = (newExpenses: Expense[]) => {
    if (user) {
      localStorage.setItem(`paisapal_expenses_${user.id}`, JSON.stringify(newExpenses))
    }
  }

  const saveGoals = (newGoals: Goal[]) => {
    if (user) {
      localStorage.setItem(`paisapal_goals_${user.id}`, JSON.stringify(newGoals))
    }
  }

  const saveAchievements = (newAchievements: Achievement[]) => {
    if (user) {
      localStorage.setItem(`paisapal_achievements_${user.id}`, JSON.stringify(newAchievements))
    }
  }

  const setIncome = (newIncome: number) => {
    setIncomeState(newIncome)
    if (user) {
      localStorage.setItem(`paisapal_income_${user.id}`, JSON.stringify(newIncome))
    }
  }

  const addExpense = (expense: Omit<Expense, "id" | "userId">) => {
    if (!user) return
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      userId: user.id,
    }
    const newExpenses = [...expenses, newExpense]
    setExpenses(newExpenses)
    saveExpenses(newExpenses)

    // Check for achievements
    if (newExpenses.length === 1) {
      unlockAchievement("first_expense")
    }
    if (newExpenses.length === 10) {
      unlockAchievement("expense_tracker")
    }
  }

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    const newExpenses = expenses.map((e) => (e.id === id ? { ...e, ...expense } : e))
    setExpenses(newExpenses)
    saveExpenses(newExpenses)
  }

  const deleteExpense = (id: string) => {
    const newExpenses = expenses.filter((e) => e.id !== id)
    setExpenses(newExpenses)
    saveExpenses(newExpenses)
  }

  const addGoal = (goal: Omit<Goal, "id" | "userId" | "currentAmount">) => {
    if (!user) return
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      userId: user.id,
      currentAmount: 0,
    }
    const newGoals = [...goals, newGoal]
    setGoals(newGoals)
    saveGoals(newGoals)

    if (newGoals.length === 1) {
      unlockAchievement("savings_starter")
    }
  }

  const updateGoal = (id: string, goal: Partial<Goal>) => {
    const newGoals = goals.map((g) => (g.id === id ? { ...g, ...goal } : g))
    setGoals(newGoals)
    saveGoals(newGoals)
  }

  const deleteGoal = (id: string) => {
    const newGoals = goals.filter((g) => g.id !== id)
    setGoals(newGoals)
    saveGoals(newGoals)
  }

  const contributeToGoal = (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return

    const newAmount = goal.currentAmount + amount
    updateGoal(id, { currentAmount: newAmount })

    if (newAmount >= goal.targetAmount) {
      unlockAchievement("goal_achieved")
    }
  }

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId)
    if (achievement && !achievement.unlockedAt) {
      const newAchievements = achievements.map((a) =>
        a.id === achievementId ? { ...a, unlockedAt: new Date().toISOString() } : a,
      )
      setAchievements(newAchievements)
      saveAchievements(newAchievements)
    }
  }

  return (
    <FinanceContext.Provider
      value={{
        expenses,
        goals,
        achievements,
        income,
        setIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        unlockAchievement,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
