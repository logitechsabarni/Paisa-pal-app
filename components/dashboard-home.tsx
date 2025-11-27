"use client"

import { useAuth } from "@/contexts/auth-context"
import { useFinance } from "@/contexts/finance-context"
import type { PageType } from "@/components/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, TrendingDown, Target, ArrowRight, PiggyBank, CheckCircle2, Brain } from "lucide-react"

interface DashboardHomeProps {
  onNavigate: (page: PageType) => void
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { user } = useAuth()
  const { expenses, goals, income, achievements } = useFinance()

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const thisMonthExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const totalSavingsProgress = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalSavingsTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt).length

  // Get recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Calculate category breakdown for this month
  const categoryBreakdown = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    .reduce(
      (acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const balance = income - thisMonthExpenses

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">
            {expenses.length === 0 ? "Get started by adding your first expense" : "Here's your financial overview"}
          </p>
        </div>
        <Button onClick={() => onNavigate("expenses")} className="gap-2">
          <Wallet className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-foreground">
                  {income > 0 ? `₹${income.toLocaleString()}` : "Not set"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month Spent</p>
                <p className="text-2xl font-bold text-foreground">₹{thisMonthExpenses.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}>
                  {income > 0 ? `₹${balance.toLocaleString()}` : "—"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings Goals</p>
                <p className="text-2xl font-bold text-foreground">
                  {goals.length > 0 ? `${goals.length} Active` : "None"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State or Content */}
      {expenses.length === 0 && goals.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <PiggyBank className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Financial Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your income, track expenses, set savings goals, and get personalized AI insights to improve your
              financial health.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => onNavigate("profile")} variant="outline">
                Set Your Income
              </Button>
              <Button onClick={() => onNavigate("expenses")}>Add First Expense</Button>
              <Button onClick={() => onNavigate("goals")} variant="secondary">
                Create Savings Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("expenses")} className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{expense.description || expense.category}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-destructive">-₹{expense.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </CardContent>
          </Card>

          {/* Savings Goals Progress */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Savings Goals</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("goals")} className="gap-1">
                Manage <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.slice(0, 3).map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{goal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                          </p>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No savings goals yet</p>
                  <Button onClick={() => onNavigate("goals")} size="sm">
                    Create Your First Goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights Quick Access */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">AI Financial Advisor</h3>
                <p className="text-muted-foreground">
                  Get personalized insights and recommendations based on your spending patterns
                </p>
              </div>
            </div>
            <Button onClick={() => onNavigate("chatbot")} className="gap-2">
              Chat with AI
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Preview */}
      {unlockedAchievements > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Achievements Unlocked: {unlockedAchievements}/{achievements.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {achievements
                .filter((a) => a.unlockedAt)
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-full">
                    <span>{achievement.icon}</span>
                    <span className="text-sm font-medium text-foreground">{achievement.title}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Food: "🍔",
    Travel: "✈️",
    Shopping: "🛒",
    Bills: "📄",
    Entertainment: "🎬",
    Health: "💊",
    Education: "📚",
    Others: "📦",
  }
  return icons[category] || "📦"
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
