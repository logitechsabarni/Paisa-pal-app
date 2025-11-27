"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFinance } from "@/contexts/finance-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { User, Mail, Wallet, Trophy, TrendingUp, Calendar, CheckCircle2, Lock } from "lucide-react"

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { income, setIncome, expenses, goals, achievements } = useFinance()
  const [editingIncome, setEditingIncome] = useState(false)
  const [newIncome, setNewIncome] = useState(income.toString())

  const handleSaveIncome = () => {
    const parsedIncome = Number.parseFloat(newIncome)
    if (!isNaN(parsedIncome) && parsedIncome >= 0) {
      setIncome(parsedIncome)
      setEditingIncome(false)
    }
  }

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt)
  const achievementProgress = (unlockedAchievements.length / achievements.length) * 100

  // Calculate member since
  const memberSince = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view achievements</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member since {memberSince}
              </p>

              <div className="w-full mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{expenses.length}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{goals.length}</p>
                    <p className="text-xs text-muted-foreground">Goals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{unlockedAchievements.length}</p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-6 bg-transparent" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income Setting */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Monthly Income
              </CardTitle>
              <CardDescription>Set your monthly income to get accurate budget insights</CardDescription>
            </CardHeader>
            <CardContent>
              {editingIncome ? (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="income" className="sr-only">
                      Monthly Income
                    </Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="Enter your monthly income"
                      value={newIncome}
                      onChange={(e) => setNewIncome(e.target.value)}
                      min="0"
                    />
                  </div>
                  <Button onClick={handleSaveIncome}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingIncome(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {income > 0 ? `₹${income.toLocaleString()}` : "Not set"}
                    </p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <Button
                    onClick={() => {
                      setNewIncome(income.toString())
                      setEditingIncome(true)
                    }}
                  >
                    {income > 0 ? "Update" : "Set Income"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-foreground">₹{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold text-success">₹{totalSaved.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                  <p className="text-2xl font-bold text-foreground">{goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                Achievements
              </CardTitle>
              <CardDescription>
                {unlockedAchievements.length} of {achievements.length} badges unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={achievementProgress} className="h-2 mb-6" />

              <div className="grid sm:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const isUnlocked = !!achievement.unlockedAt
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        isUnlocked ? "bg-success/10 border-success/20" : "bg-muted/50 border-border opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            isUnlocked ? "bg-success/20" : "bg-muted"
                          }`}
                        >
                          {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                            {isUnlocked && <CheckCircle2 className="w-4 h-4 text-success" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {isUnlocked && achievement.unlockedAt && (
                            <p className="text-xs text-success mt-1">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
