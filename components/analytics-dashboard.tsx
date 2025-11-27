"use client"

import { useFinance } from "@/contexts/finance-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Lightbulb, Brain, Target, Zap } from "lucide-react"

const VIBRANT_PIE_COLORS = [
  "#FF6B6B", // Vibrant Red
  "#4ECDC4", // Vibrant Teal
  "#45B7D1", // Vibrant Blue
  "#FFA502", // Vibrant Orange
  "#9B59B6", // Vibrant Purple
  "#E74C3C", // Bright Red
  "#3498DB", // Bright Blue
  "#2ECC71", // Bright Green
  "#F39C12", // Golden Orange
  "#E91E63", // Pink
]

const DISTINCT_BAR_COLORS = [
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
]

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍔",
  Travel: "✈️",
  Shopping: "🛒",
  Bills: "📄",
  Entertainment: "🎬",
  Health: "💊",
  Education: "📚",
  Others: "📦",
}

export function AnalyticsDashboard() {
  const { expenses, income, goals } = useFinance()

  // Calculate category breakdown
  const categoryData = expenses.reduce(
    (acc, exp) => {
      const existing = acc.find((item) => item.name === exp.category)
      if (existing) {
        existing.value += exp.amount
      } else {
        acc.push({ name: exp.category, value: exp.amount })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  // Sort by value descending
  categoryData.sort((a, b) => b.value - a.value)

  // Calculate monthly trends
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

  // Get last 6 months
  const last6Months = monthlyData.slice(-6)

  // Weekly data for current month
  const now = new Date()
  const currentMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date)
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
  })

  const weeklyData = currentMonthExpenses.reduce(
    (acc, exp) => {
      const date = new Date(exp.date)
      const weekNum = Math.ceil(date.getDate() / 7)
      const weekKey = `Week ${weekNum}`

      const existing = acc.find((item) => item.week === weekKey)
      if (existing) {
        existing.amount += exp.amount
      } else {
        acc.push({ week: weekKey, amount: exp.amount })
      }
      return acc
    },
    [] as { week: string; amount: number }[],
  )

  weeklyData.sort((a, b) => a.week.localeCompare(b.week))

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const thisMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const lastMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date)
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear
  })
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Calculate change percentage
  const monthlyChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0

  // Generate AI Insights
  const aiInsights = generateAIInsights(expenses, income, goals, categoryData, thisMonthTotal, lastMonthTotal)

  const monthlyInsights = generateMonthlyInsights(monthlyData, categoryData, income)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Understand your spending patterns with AI-powered insights</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Spent (All Time)</p>
            <p className="text-2xl font-bold text-foreground">₹{totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-foreground">₹{thisMonthTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Monthly Change</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${monthlyChange >= 0 ? "text-destructive" : "text-success"}`}>
                {monthlyChange >= 0 ? "+" : ""}
                {monthlyChange.toFixed(1)}%
              </p>
              {monthlyChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-destructive" />
              ) : (
                <TrendingDown className="w-5 h-5 text-success" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Daily Spend</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{Math.round(thisMonthTotal / now.getDate()).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI-Powered Financial Insights
          </CardTitle>
          <CardDescription>
            Detailed analysis of your spending patterns with personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiInsights.length > 0 ? (
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === "warning"
                      ? "bg-warning/10 border-warning/20"
                      : insight.type === "success"
                        ? "bg-success/10 border-success/20"
                        : insight.type === "tip"
                          ? "bg-primary/10 border-primary/20"
                          : "bg-muted border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        insight.type === "warning"
                          ? "bg-warning/20"
                          : insight.type === "success"
                            ? "bg-success/20"
                            : insight.type === "tip"
                              ? "bg-primary/20"
                              : "bg-muted"
                      }`}
                    >
                      {insight.type === "warning" ? (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      ) : insight.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : insight.type === "tip" ? (
                        <Lightbulb className="w-5 h-5 text-primary" />
                      ) : (
                        <Zap className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{insight.description}</p>
                      {insight.recommendation && (
                        <div className="mt-3 p-3 bg-background/50 rounded-lg">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Recommendation
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{insight.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No insights yet</h3>
              <p className="text-muted-foreground">
                Add more expenses to unlock personalized AI insights and recommendations
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Tabs defaultValue="category" className="space-y-4">
        <TabsList>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
        </TabsList>

        <TabsContent value="category">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Visual breakdown with vibrant colors for easy distinction</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={VIBRANT_PIE_COLORS[index % VIBRANT_PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expense data to display
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown List */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div className="space-y-3">
                    {categoryData.map((cat, index) => {
                      const percentage = (cat.value / totalExpenses) * 100
                      return (
                        <div key={cat.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{CATEGORY_ICONS[cat.name] || "📦"}</span>
                              <span className="font-medium text-foreground">{cat.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">₹{cat.value.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                backgroundColor: VIBRANT_PIE_COLORS[index % VIBRANT_PIE_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">No expense data to display</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="lg:col-span-2">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle>Monthly Spending Trends</CardTitle>
                  <CardDescription>Your spending over the last 6 months with distinct colors</CardDescription>
                </CardHeader>
                <CardContent>
                  {last6Months.length > 0 ? (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={last6Months}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" className="text-muted-foreground" />
                          <YAxis className="text-muted-foreground" />
                          <Tooltip
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {last6Months.map((entry, index) => (
                              <Cell
                                key={`bar-${index}`}
                                fill={DISTINCT_BAR_COLORS[index % DISTINCT_BAR_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      No monthly data to display
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-4 h-4 text-primary" />
                  Monthly Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyInsights.length > 0 ? (
                  <div className="space-y-3">
                    {monthlyInsights.map((insight, index) => (
                      <div key={index} className="text-sm p-3 bg-background/50 rounded-lg border border-border/50">
                        <h4 className="font-semibold text-foreground mb-1 text-xs">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">Add more monthly data to see detailed insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Weekly Spending (This Month)</CardTitle>
              <CardDescription>Track your weekly spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="week" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No weekly data to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// AIInsight interface
interface AIInsight {
  type: "warning" | "success" | "tip" | "info"
  title: string
  description: string
  recommendation?: string
}

// Function to generate AI Insights
function generateAIInsights(
  expenses: any[],
  income: number,
  goals: any[],
  categoryData: { name: string; value: number }[],
  thisMonthTotal: number,
  lastMonthTotal: number,
): AIInsight[] {
  const insights: AIInsight[] = []

  if (expenses.length === 0) return insights

  // Insight 1: Monthly spending comparison
  if (lastMonthTotal > 0 && thisMonthTotal > lastMonthTotal) {
    const increase = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
    insights.push({
      type: "warning",
      title: "Increased Spending Detected",
      description: `Your spending this month (₹${thisMonthTotal.toLocaleString()}) is ${increase.toFixed(1)}% higher than last month (₹${lastMonthTotal.toLocaleString()}). This indicates an upward trend in your expenses that may impact your savings goals.`,
      recommendation: `To bring your spending back to last month's level, try reducing expenses by ₹${(thisMonthTotal - lastMonthTotal).toLocaleString()} over the remaining days. Focus on non-essential categories.`,
    })
  } else if (lastMonthTotal > 0 && thisMonthTotal < lastMonthTotal) {
    const decrease = ((lastMonthTotal - thisMonthTotal) / lastMonthTotal) * 100
    insights.push({
      type: "success",
      title: "Great Spending Control!",
      description: `Excellent work! Your spending this month is ${decrease.toFixed(1)}% lower than last month. You've saved approximately ₹${(lastMonthTotal - thisMonthTotal).toLocaleString()} compared to your previous spending pattern.`,
      recommendation:
        "Consider allocating the saved amount to your savings goals or emergency fund to maximize the benefit of your improved spending habits.",
    })
  }

  // Insight 2: Top spending category analysis
  if (categoryData.length > 0) {
    const topCategory = categoryData[0]
    const totalSpent = categoryData.reduce((sum, cat) => sum + cat.value, 0)
    const topPercentage = (topCategory.value / totalSpent) * 100

    if (topPercentage > 40) {
      insights.push({
        type: "warning",
        title: `High Concentration in ${topCategory.name}`,
        description: `${topCategory.name} accounts for ${topPercentage.toFixed(1)}% of your total spending (₹${topCategory.value.toLocaleString()}). This high concentration in a single category may indicate an area where cost optimization is possible.\n\nBreaking down further:\n- Amount spent: ₹${topCategory.value.toLocaleString()}\n- Percentage of total: ${topPercentage.toFixed(1)}%\n- Compared to other categories, this is significantly higher`,
        recommendation: `Review your ${topCategory.name} expenses in detail. Look for subscriptions you can cancel, cheaper alternatives, or ways to reduce frequency. Even a 20% reduction could save you ₹${Math.round(topCategory.value * 0.2).toLocaleString()}.`,
      })
    } else {
      insights.push({
        type: "success",
        title: "Well-Balanced Spending Distribution",
        description: `Your spending is well-distributed across categories, with ${topCategory.name} being your highest at ${topPercentage.toFixed(1)}%. This balanced approach indicates healthy financial management.\n\nTop 3 categories:\n${categoryData
          .slice(0, 3)
          .map(
            (cat, i) =>
              `${i + 1}. ${cat.name}: ₹${cat.value.toLocaleString()} (${((cat.value / totalSpent) * 100).toFixed(1)}%)`,
          )
          .join("\n")}`,
        recommendation:
          "Maintain this balanced approach while looking for small optimizations in each category. Consider setting specific budgets for your top 3 categories.",
      })
    }
  }

  // Insight 3: Income vs Expense analysis
  if (income > 0) {
    const savingsRate = ((income - thisMonthTotal) / income) * 100
    const remaining = income - thisMonthTotal

    if (savingsRate >= 20) {
      insights.push({
        type: "success",
        title: "Healthy Savings Rate Achieved!",
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%, which exceeds the recommended 20% savings target. You're saving ₹${remaining.toLocaleString()} this month.\n\nFinancial health indicators:\n- Monthly income: ₹${income.toLocaleString()}\n- Monthly expenses: ₹${thisMonthTotal.toLocaleString()}\n- Savings: ₹${remaining.toLocaleString()}\n- Savings rate: ${savingsRate.toFixed(1)}%`,
        recommendation:
          "Consider diversifying your savings into different instruments - emergency fund (3-6 months expenses), short-term goals, and long-term investments like SIPs or PPF.",
      })
    } else if (savingsRate > 0 && savingsRate < 20) {
      insights.push({
        type: "tip",
        title: "Room for Savings Improvement",
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%, which is below the recommended 20% target. To reach the ideal savings rate, you'd need to save an additional ₹${Math.round(income * 0.2 - remaining).toLocaleString()} per month.\n\nCurrent breakdown:\n- Monthly income: ₹${income.toLocaleString()}\n- Monthly expenses: ₹${thisMonthTotal.toLocaleString()}\n- Current savings: ₹${remaining.toLocaleString()}\n- Target savings (20%): ₹${Math.round(income * 0.2).toLocaleString()}`,
        recommendation:
          "Try the 50-30-20 budgeting rule: 50% for needs (₹${Math.round(income * 0.5).toLocaleString()}), 30% for wants (₹${Math.round(income * 0.3).toLocaleString()}), and 20% for savings (₹${Math.round(income * 0.2).toLocaleString()}).",
      })
    } else if (remaining < 0) {
      insights.push({
        type: "warning",
        title: "Spending Exceeds Income!",
        description: `Critical alert: Your expenses (₹${thisMonthTotal.toLocaleString()}) exceed your income (₹${income.toLocaleString()}) by ₹${Math.abs(remaining).toLocaleString()}. This unsustainable pattern can lead to debt accumulation.\n\nUrgent action required:\n- Overspending amount: ₹${Math.abs(remaining).toLocaleString()}\n- Percentage over budget: ${Math.abs(savingsRate).toFixed(1)}%`,
        recommendation:
          "Immediately identify non-essential expenses to cut. Prioritize bills and essentials first. Consider finding additional income sources or using the expense tracker to monitor daily spending.",
      })
    }
  }

  // Insight 4: Goals progress
  if (goals.length > 0) {
    const atRiskGoals = goals.filter((goal) => {
      const deadline = new Date(goal.deadline)
      const now = new Date()
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const amountNeeded = goal.targetAmount - goal.currentAmount
      const dailyNeeded = amountNeeded / Math.max(daysLeft, 1)
      const monthlyNeeded = dailyNeeded * 30
      return income > 0 && monthlyNeeded > income * 0.3 && daysLeft > 0
    })

    if (atRiskGoals.length > 0) {
      const goalDetails = atRiskGoals
        .map((goal) => {
          const deadline = new Date(goal.deadline)
          const now = new Date()
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          const amountNeeded = goal.targetAmount - goal.currentAmount
          const dailyNeeded = Math.round(amountNeeded / Math.max(daysLeft, 1))
          return `- ${goal.name}: ₹${amountNeeded.toLocaleString()} needed in ${daysLeft} days (₹${dailyNeeded}/day)`
        })
        .join("\n")

      insights.push({
        type: "warning",
        title: "Savings Goals at Risk",
        description: `${atRiskGoals.length} of your savings goals may be difficult to achieve with current spending patterns:\n\n${goalDetails}`,
        recommendation:
          "Consider extending deadlines, increasing monthly contributions, or temporarily pausing non-essential expenses to fast-track these goals.",
      })
    }
  }

  // Insight 5: Spending pattern tip
  if (expenses.length >= 5) {
    const avgTransaction = expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length
    insights.push({
      type: "tip",
      title: "Spending Pattern Analysis",
      description: `Based on your ${expenses.length} transactions, your average transaction size is ₹${Math.round(avgTransaction).toLocaleString()}. Understanding your typical transaction size can help identify unusual expenses.\n\nPattern details:\n- Total transactions: ${expenses.length}\n- Average transaction: ₹${Math.round(avgTransaction).toLocaleString()}\n- Largest expense: ₹${Math.max(...expenses.map((e) => e.amount)).toLocaleString()}\n- Smallest expense: ₹${Math.min(...expenses.map((e) => e.amount)).toLocaleString()}`,
      recommendation:
        "Set a mental 'pause threshold' at 2x your average (₹${Math.round(avgTransaction * 2).toLocaleString()}). For any purchase above this, take 24 hours to decide if it's truly necessary.",
    })
  }

  return insights
}

// Function to generate detailed monthly insights
function generateMonthlyInsights(
  monthlyData: { key: string; month: string; amount: number }[],
  categoryData: { name: string; value: number }[],
  income: number,
): { title: string; description: string }[] {
  const insights: { title: string; description: string }[] = []

  if (monthlyData.length === 0) return insights

  // Insight 1: Overall monthly trend
  if (monthlyData.length >= 2) {
    const currentMonth = monthlyData[monthlyData.length - 1]
    const previousMonth = monthlyData[monthlyData.length - 2]
    const percentageChange = ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100

    insights.push({
      title: "Monthly Trend",
      description: `${currentMonth.month}: ₹${currentMonth.amount.toLocaleString()}\nChange from ${previousMonth.month}: ${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}%\n\nYour spending is ${percentageChange > 0 ? "increasing" : "decreasing"} month over month. Average monthly spend: ₹${Math.round(monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length).toLocaleString()}`,
    })
  }

  // Insight 2: Highest and lowest spending months
  const sortedByAmount = [...monthlyData].sort((a, b) => b.amount - a.amount)
  if (sortedByAmount.length > 0) {
    const highest = sortedByAmount[0]
    const lowest = sortedByAmount[sortedByAmount.length - 1]

    insights.push({
      title: "Peak Analysis",
      description: `Highest: ${highest.month} (₹${highest.amount.toLocaleString()})\nLowest: ${lowest.month} (₹${lowest.amount.toLocaleString()})\nDifference: ₹${(highest.amount - lowest.amount).toLocaleString()}\n\nThis ${((highest.amount / lowest.amount - 1) * 100).toFixed(1)}% variation shows seasonal or lifestyle patterns.`,
    })
  }

  // Insight 3: Average monthly spending
  if (monthlyData.length > 0) {
    const avgMonthly = monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length
    const currentMonth = monthlyData[monthlyData.length - 1]

    insights.push({
      title: "Monthly Average",
      description: `Average spend: ₹${Math.round(avgMonthly).toLocaleString()}\nCurrent month: ₹${currentMonth.amount.toLocaleString()}\nDifference: ${currentMonth.amount > avgMonthly ? "+" : ""}₹${Math.round(currentMonth.amount - avgMonthly).toLocaleString()}\n\nYou're ${currentMonth.amount > avgMonthly ? "above" : "below"} your average by ${((Math.abs(currentMonth.amount - avgMonthly) / avgMonthly) * 100).toFixed(1)}%`,
    })
  }

  // Insight 4: Category contribution to monthly expenses
  if (categoryData.length > 0 && monthlyData.length > 0) {
    const topCategory = categoryData[0]
    const currentMonthAmount = monthlyData[monthlyData.length - 1].amount
    const topCategoryPercentage = (topCategory.value / currentMonthAmount) * 100

    insights.push({
      title: "Top Category Impact",
      description: `${topCategory.name} accounts for ${topCategoryPercentage.toFixed(1)}% of current month expenses.\nAmount: ₹${topCategory.value.toLocaleString()}\n\nFocusing on this category alone could have the biggest impact on your budget.`,
    })
  }

  return insights
}
