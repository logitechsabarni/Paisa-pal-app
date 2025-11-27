"use client"

import type React from "react"

import { useState } from "react"
import { useFinance, type Goal } from "@/contexts/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Trash2, X, Target, Calendar, TrendingUp, Coins } from "lucide-react"

export function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showContribute, setShowContribute] = useState<string | null>(null)
  const [contributeAmount, setContributeAmount] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")

  const resetForm = () => {
    setName("")
    setTargetAmount("")
    setDeadline("")
    setEditingGoal(null)
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !targetAmount || !deadline) return

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name,
        targetAmount: Number.parseFloat(targetAmount),
        deadline,
      })
    } else {
      addGoal({
        name,
        targetAmount: Number.parseFloat(targetAmount),
        deadline,
      })
    }

    resetForm()
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setName(goal.name)
    setTargetAmount(goal.targetAmount.toString())
    setDeadline(goal.deadline)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(id)
    }
  }

  const handleContribute = (goalId: string) => {
    const amount = Number.parseFloat(contributeAmount)
    if (amount > 0) {
      contributeToGoal(goalId, amount)
      setContributeAmount("")
      setShowContribute(null)
    }
  }

  // Calculate totals
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const completedGoals = goals.filter((goal) => goal.currentAmount >= goal.targetAmount).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Savings Goals</h1>
          <p className="text-muted-foreground">Set and track your financial goals</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Goals</p>
            <p className="text-2xl font-bold text-foreground">{goals.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Target</p>
            <p className="text-2xl font-bold text-foreground">₹{totalTarget.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Saved</p>
            <p className="text-2xl font-bold text-success">₹{totalSaved.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-foreground">{completedGoals}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Emergency Fund, Vacation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (₹)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="Enter target amount"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingGoal ? "Update" : "Create"} Goal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            const isCompleted = goal.currentAmount >= goal.targetAmount
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )
            const amountLeft = goal.targetAmount - goal.currentAmount
            const dailyNeeded = daysLeft > 0 ? Math.ceil(amountLeft / daysLeft) : 0

            return (
              <Card key={goal.id} className={`bg-card ${isCompleted ? "border-success" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-success/20" : "bg-primary/10"
                        }`}
                      >
                        <Target className={`w-6 h-6 ${isCompleted ? "text-success" : "text-primary"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{goal.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {isCompleted ? "Completed!" : daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)} className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        ₹{goal.currentAmount.toLocaleString()} saved
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        ₹{goal.targetAmount.toLocaleString()} target
                      </span>
                    </div>

                    {!isCompleted && daysLeft > 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">
                            Save{" "}
                            <span className="font-semibold text-foreground">₹{dailyNeeded.toLocaleString()}/day</span>{" "}
                            to reach your goal
                          </span>
                        </div>
                      </div>
                    )}

                    {!isCompleted && (
                      <>
                        {showContribute === goal.id ? (
                          <div className="flex gap-2 mt-4">
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={contributeAmount}
                              onChange={(e) => setContributeAmount(e.target.value)}
                              min="1"
                              className="flex-1"
                            />
                            <Button onClick={() => handleContribute(goal.id)}>Add</Button>
                            <Button variant="outline" onClick={() => setShowContribute(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full mt-4 gap-2 bg-transparent"
                            onClick={() => setShowContribute(goal.id)}
                          >
                            <Coins className="w-4 h-4" />
                            Add Savings
                          </Button>
                        )}
                      </>
                    )}

                    {isCompleted && (
                      <div className="p-3 bg-success/10 rounded-lg text-center mt-4">
                        <p className="text-success font-medium">🎉 Congratulations! Goal achieved!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Savings Goals Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first savings goal to start tracking your progress toward financial milestones.
            </p>
            <Button onClick={() => setShowForm(true)}>Create Your First Goal</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
