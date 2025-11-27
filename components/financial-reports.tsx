"use client"

import { useFinance } from "@/contexts/finance-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Download, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Target } from "lucide-react"
import { useState } from "react"

interface MonthlyReport {
  month: string
  expenses: number
  savings: number
  income: number
}

interface CategoryReport {
  category: string
  amount: number
  percentage: number
  trend: "up" | "down" | "stable"
}

export function FinancialReports() {
  const { expenses, income, goals } = useFinance()
  const [selectedMonth, setSelectedMonth] = useState("all")

  // Calculate monthly data
  const monthlyData = expenses.reduce(
    (acc, exp) => {
      const date = new Date(exp.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })

      const existing = acc.find((item) => item.key === monthKey)
      if (existing) {
        existing.amount += exp.amount
      } else {
        acc.push({ key: monthKey, month: monthName, amount: exp.amount })
      }
      return acc
    },
    [] as { key: string; month: string; amount: number }[],
  )

  monthlyData.sort((a, b) => a.key.localeCompare(b.key))

  // Generate monthly reports with income data
  const monthlyReports: MonthlyReport[] = monthlyData.map((m) => ({
    month: m.month,
    expenses: m.amount,
    savings: Math.max(0, income - m.amount),
    income: income,
  }))

  // Calculate category reports
  const categoryBreakdown = expenses.reduce(
    (acc, exp) => {
      const existing = acc.find((item) => item.category === exp.category)
      if (existing) {
        existing.amount += exp.amount
      } else {
        acc.push({ category: exp.category, amount: exp.amount })
      }
      return acc
    },
    [] as { category: string; amount: number }[],
  )

  categoryBreakdown.sort((a, b) => b.amount - a.amount)
  const totalExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0)

  const categoryReports: CategoryReport[] = categoryBreakdown.map((cat) => ({
    category: cat.category,
    amount: cat.amount,
    percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0,
    trend: Math.random() > 0.5 ? "up" : "down",
  }))

  // Calculate key metrics
  const now = new Date()
  const thisMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date)
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const lastMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date)
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear
  })
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const monthlyChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0
  const savingsRate = income > 0 ? ((income - thisMonthTotal) / income) * 100 : 0
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const completedGoals = goals.filter((goal) => goal.currentAmount >= goal.targetAmount).length

  // Report generation function
  const generatePDFReport = () => {
    const reportContent = `
PAISAPAL - FINANCIAL REPORT
Generated: ${new Date().toLocaleDateString()}

MONTHLY SUMMARY
===============
Current Month Expenses: ₹${thisMonthTotal.toLocaleString()}
Last Month Expenses: ₹${lastMonthTotal.toLocaleString()}
Change: ${monthlyChange > 0 ? "+" : ""}${monthlyChange.toFixed(1)}%

Monthly Income: ₹${income.toLocaleString()}
Savings Rate: ${savingsRate.toFixed(1)}%

FINANCIAL GOALS
===============
Total Goals: ${goals.length}
Completed Goals: ${completedGoals}
Total Saved: ₹${totalSaved.toLocaleString()}

EXPENSE BREAKDOWN
=================
${categoryReports.map((cat) => `${cat.category}: ₹${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`).join("\n")}

KEY METRICS
===========
Total Transactions: ${expenses.length}
Average Transaction: ₹${Math.round(expenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(expenses.length, 1)).toLocaleString()}
Highest Spending Category: ${categoryReports[0]?.category || "N/A"}
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `paisapal-report-${new Date().getTime()}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground">Detailed analysis and downloadable reports of your finances</p>
        </div>
        <Button onClick={generatePDFReport} className="gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Monthly Income</p>
            <p className="text-2xl font-bold text-foreground">₹{income.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Month Spent</p>
            <p className="text-2xl font-bold text-destructive">₹{thisMonthTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Savings Rate</p>
            <p className={`text-2xl font-bold ${savingsRate >= 20 ? "text-success" : "text-warning"}`}>
              {savingsRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Goals Completed</p>
            <p className="text-2xl font-bold text-primary">
              {completedGoals} of {goals.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
          <TabsTrigger value="category">Category Report</TabsTrigger>
          <TabsTrigger value="goals">Goals Progress</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Monthly Analysis */}
        <TabsContent value="monthly" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Monthly Spending & Savings Trend</CardTitle>
              <CardDescription>Income vs Expenses over time with calculated savings</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyReports.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyReports}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="income"
                        stackId="a"
                        fill="hsl(var(--chart-2))"
                        name="Income"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="savings"
                        stackId="a"
                        fill="hsl(var(--success))"
                        name="Savings"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expenses"
                        stackId="b"
                        fill="hsl(var(--destructive))"
                        name="Expenses"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Monthly Breakdown */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Month</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground">Income</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground">Expenses</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground">Savings</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReports.map((report, idx) => {
                      const rate = report.income > 0 ? (report.savings / report.income) * 100 : 0
                      return (
                        <tr key={idx} className="border-b border-border hover:bg-muted/50">
                          <td className="py-2 px-3 text-foreground">{report.month}</td>
                          <td className="py-2 px-3 text-right text-foreground">₹{report.income.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-destructive">₹{report.expenses.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-success">₹{report.savings.toLocaleString()}</td>
                          <td
                            className={`py-2 px-3 text-right font-medium ${rate >= 20 ? "text-success" : "text-warning"}`}
                          >
                            {rate.toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Report */}
        <TabsContent value="category" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Spending by Category Report</CardTitle>
              <CardDescription>Detailed breakdown of expenses across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryReports.length > 0 ? (
                  categoryReports.map((cat, idx) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor: `hsl(${(idx * 50) % 360}, 70%, 60%)`,
                            }}
                          />
                          <span className="font-medium text-foreground">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">₹{cat.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: `hsl(${(idx * 50) % 360}, 70%, 60%)`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No expense data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Progress */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Savings Goals Progress Report</CardTitle>
              <CardDescription>Track your progress towards all financial goals</CardDescription>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-6">
                  {goals.map((goal) => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                    const isCompleted = goal.currentAmount >= goal.targetAmount
                    const daysLeft = Math.ceil(
                      (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                    )

                    return (
                      <div key={goal.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{goal.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {isCompleted
                                ? "Completed!"
                                : daysLeft > 0
                                  ? `${daysLeft} days remaining`
                                  : "Deadline passed"}
                            </p>
                          </div>
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-success" />}
                        </div>

                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>₹{goal.currentAmount.toLocaleString()} saved</span>
                          <span>of ₹{goal.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No savings goals created yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Report */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Financial Summary Report</CardTitle>
              <CardDescription>Overview of your complete financial situation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Sections */}
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Income & Expense Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Monthly Income</p>
                      <p className="text-lg font-semibold text-foreground">₹{income.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">This Month Expenses</p>
                      <p className="text-lg font-semibold text-destructive">₹{thisMonthTotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total All-time Spent</p>
                      <p className="text-lg font-semibold text-foreground">₹{totalExpenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Savings Rate</p>
                      <p className={`text-lg font-semibold ${savingsRate >= 20 ? "text-success" : "text-warning"}`}>
                        {savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-success" />
                    Savings Goals
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Active Goals</p>
                      <p className="text-lg font-semibold text-foreground">{goals.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed Goals</p>
                      <p className="text-lg font-semibold text-success">{completedGoals}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Saved</p>
                      <p className="text-lg font-semibold text-foreground">₹{totalSaved.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Target</p>
                      <p className="text-lg font-semibold text-foreground">
                        ₹{goals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {savingsRate < 20 && income > 0 && (
                  <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Alert: Below Target Savings Rate
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your savings rate is {savingsRate.toFixed(1)}%, below the recommended 20%. To reach the target,
                      reduce monthly expenses by ₹
                      {Math.round(income * 0.2 - (income - thisMonthTotal)).toLocaleString()}.
                    </p>
                  </div>
                )}

                {monthlyChange > 10 && lastMonthTotal > 0 && (
                  <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-warning" />
                      Spending Increased
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your spending increased by {monthlyChange.toFixed(1)}% compared to last month. Review your top
                      expense categories to identify areas for optimization.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
