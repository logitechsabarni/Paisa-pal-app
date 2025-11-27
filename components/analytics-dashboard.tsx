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
  Legend,
} from "recharts"
import { Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Info } from "lucide-react"
import { useState } from "react"

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

const CATEGORY_COLORS: { [key: string]: string } = {
  Food: "#FF6B6B",
  Travel: "#4ECDC4",
  Entertainment: "#FFE66D",
  Shopping: "#FF85A2",
  Bills: "#7B68EE",
  Healthcare: "#00D9FF",
  Education: "#95E1D3",
  Other: "#A8DADC",
}

interface AIInsight {
  type: "warning" | "success" | "tip" | "info"
  title: string
  description: string
  recommendation?: string
}

interface BarShapeProps {
  x: number
  y: number
  width: number
  height: number
  category: string
  colors: { [key: string]: string }
}

function BarShape(props: BarShapeProps) {
  const { x, y, width, height, category, colors } = props
  const fill = colors[category] || "#999"

  return <rect x={x} y={y} width={width} height={height} fill={fill} radius={[4, 4, 0, 0]} />
}

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

function generateMonthlyInsights(
  monthlyData: { key: string; month: string; amount: number }[],
  categoryData: { name: string; value: number }[],
  income: number,
): { title: string; description: string }[] {
  const insights: { title: string; description: string }[] = []

  try {
    if (!monthlyData || monthlyData.length === 0) {
      insights.push({
        title: "Getting Started with Your Financial Journey",
        description: `You're just beginning to track your finances, which is an excellent first step toward financial awareness. Start by recording your regular monthly expenses such as rent, utilities, groceries, and transportation. Once you have at least 2-3 months of data, you'll begin to see spending patterns emerge. The more transactions you log, the more accurate and personalized your AI insights will become. Consider setting up categories that reflect your lifestyle (food, entertainment, healthcare, etc.) to better understand where your money is going. Track every expense, no matter how small, as these small purchases often add up to significant amounts over time. By maintaining consistent tracking, you'll unlock detailed analytics about your spending habits and receive personalized recommendations to improve your financial health.`,
      })
      return insights
    }

    // Insight 1: Overall monthly trend (paragraph form)
    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1]
      const previousMonth = monthlyData[monthlyData.length - 2]
      const currentAmount = currentMonth?.amount ?? 0
      const previousAmount = previousMonth?.amount ?? 0
      const percentageChange = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0
      const avgMonthlySpend = Math.round(monthlyData.reduce((sum, m) => sum + (m?.amount ?? 0), 0) / monthlyData.length)
      const trendDirection = percentageChange > 0 ? "increasing" : "decreasing"
      const trendEmoji = percentageChange > 0 ? "📈" : "📉"

      insights.push({
        title: "Your Monthly Spending Trajectory",
        description: `${trendEmoji} Your spending pattern shows a ${trendDirection} trend. In ${currentMonth?.month || "the current month"}, you spent ₹${currentAmount.toLocaleString()}, which represents a ${Math.abs(percentageChange).toFixed(1)}% ${percentageChange > 0 ? "increase" : "decrease"} compared to ${previousMonth?.month || "the previous month"} when you spent ₹${previousAmount.toLocaleString()}. Your average monthly spending across all recorded months is ₹${avgMonthlySpend.toLocaleString()}, which provides a good baseline for understanding your typical financial commitments. ${percentageChange > 5 ? `The notable increase in spending this month suggests you may have had additional expenses or a lifestyle change. Monitor this closely to ensure it aligns with your financial goals and doesn't strain your savings capacity.` : percentageChange < -5 ? `The decrease in spending is encouraging and shows you're taking control of your finances. This could be due to deliberate cost-cutting or simply fewer large purchases this month. Either way, it's a positive sign of financial awareness.` : `Your spending has remained relatively stable, which indicates consistent financial behavior. This stability makes it easier to plan and budget for the future.`}`,
      })
    } else if (monthlyData.length === 1) {
      const singleMonth = monthlyData[0]
      const singleAmount = singleMonth?.amount ?? 0
      insights.push({
        title: "Your First Month of Financial Tracking",
        description: `Congratulations on starting your financial tracking journey! In ${singleMonth?.month || "your first recorded month"}, you spent ₹${singleAmount.toLocaleString()}. This is your baseline month, and it's important to understand what drove this spending. As you continue tracking in the coming months, you'll be able to compare your expenses and identify patterns. Some months may have higher spending due to seasonal expenses, one-time purchases, or unexpected costs. The key is to maintain consistent tracking so you can build an accurate picture of your financial habits over time. Come back once you have data for 2-3 more months, and you'll unlock deeper insights about your spending trends and behavioral patterns.`,
      })
    }

    // Insight 2: Highest and lowest spending months (paragraph form)
    const sortedByAmount = [...monthlyData].sort((a, b) => (b?.amount ?? 0) - (a?.amount ?? 0))
    if (sortedByAmount.length > 0) {
      const highest = sortedByAmount[0]
      const lowest = sortedByAmount[sortedByAmount.length - 1]
      const highestAmount = highest?.amount ?? 0
      const lowestAmount = lowest?.amount ?? 0
      const difference = highestAmount - lowestAmount
      const variationPercent = lowestAmount > 0 ? (highestAmount / lowestAmount - 1) * 100 : 0

      insights.push({
        title: "Your Peak and Low Spending Analysis",
        description: `Your highest spending month was ${highest?.month || "a previous month"} with expenses totaling ₹${highestAmount.toLocaleString()}, while your lowest spending occurred in ${lowest?.month || "another month"} at ₹${lowestAmount.toLocaleString()}. The difference between these two months is ₹${difference.toLocaleString()}, representing a ${variationPercent.toFixed(1)}% variation. This significant fluctuation reveals important insights about your financial behavior: it indicates that your expenses are not uniform across months, which is common due to seasonal factors (higher spending during festivals, vacations, or specific seasons), occasional large purchases (vehicles maintenance, gifts), or lifestyle changes. Understanding what caused the spike in your highest spending month can help you anticipate similar expenses in the future and better plan your budget. By identifying patterns in your peak spending months, you can build contingency reserves or adjust your savings goals accordingly.`,
      })
    }

    // Insight 3: Average monthly spending (paragraph form)
    if (monthlyData.length > 0) {
      const avgMonthly = monthlyData.reduce((sum, m) => sum + (m?.amount ?? 0), 0) / monthlyData.length
      const currentMonth = monthlyData[monthlyData.length - 1]
      const currentAmount = currentMonth?.amount ?? 0
      const diff = currentAmount - avgMonthly
      const diffPercent = avgMonthly > 0 ? (Math.abs(diff) / avgMonthly) * 100 : 0

      insights.push({
        title: "How Your Current Month Compares to Average",
        description: `Your average monthly spending across all tracked months is ₹${Math.round(avgMonthly).toLocaleString()}, while your current month spending stands at ₹${currentAmount.toLocaleString()}. This means you are currently ${currentAmount > avgMonthly ? "above" : "below"} your average by ₹${Math.round(Math.abs(diff)).toLocaleString()}, which represents a ${diffPercent.toFixed(1)}% ${currentAmount > avgMonthly ? "increase" : "decrease"} from your typical spending. ${currentAmount > avgMonthly ? `Spending above your average may be due to one-time expenses, seasonal factors, or increased discretionary spending. If this trend continues, it could impact your ability to save and reach your financial goals. Consider reviewing your recent transactions to identify where the extra money is going and whether these expenses were necessary.` : `Spending below your average is a positive sign that you're exercising good financial control. This lower spending could translate into higher savings this month, giving you more flexibility to contribute toward your financial goals or build your emergency fund.`}`,
      })
    }

    // Insight 4: Category contribution to monthly expenses (paragraph form)
    if (categoryData && categoryData.length > 0 && monthlyData.length > 0) {
      const topCategory = categoryData[0]
      const currentMonthAmount = monthlyData[monthlyData.length - 1]?.amount ?? 0
      const topCategoryValue = topCategory?.value ?? 0
      const topCategoryPercentage = currentMonthAmount > 0 ? (topCategoryValue / currentMonthAmount) * 100 : 0

      let categoryAdvice = ""
      if (topCategoryPercentage > 40) {
        categoryAdvice = `${topCategory?.name || "Your top category"} is consuming a large portion of your budget. This concentration warrants careful review to identify opportunities for cost reduction. Consider whether you can switch to more affordable alternatives, reduce consumption frequency, or consolidate services to lower costs in this category.`
      } else if (topCategoryPercentage > 25) {
        categoryAdvice = `While ${topCategory?.name || "your top category"} is significant, it represents a reasonable portion of your budget. You still have good diversification in your spending, which suggests a balanced lifestyle. However, even small improvements in this area could yield meaningful savings.`
      } else {
        categoryAdvice = `Your spending is well-distributed, with no single category dominating your budget. This balanced approach is healthy and suggests you're maintaining variety in your lifestyle while keeping control over individual expense areas.`
      }

      insights.push({
        title: "What's Driving Your Monthly Expenses",
        description: `${topCategory?.name || "Your top spending category"} is your primary expense driver, accounting for ₹${topCategoryValue.toLocaleString()} or ${topCategoryPercentage.toFixed(1)}% of your current month's total expenses. In absolute terms, this means nearly 1 out of every ₹${Math.round(currentMonthAmount / topCategoryValue)} you spend goes toward ${topCategory?.name?.toLowerCase() || "this category"}. ${categoryAdvice} By focusing on optimizing your highest spending category, you can achieve the most significant impact on your overall budget. Even a 10-15% reduction in this area could free up ₹${Math.round(topCategoryValue * 0.1).toLocaleString()} to ₹${Math.round(topCategoryValue * 0.15).toLocaleString()} per month for savings or other priorities.`,
      })
    }
  } catch (error) {
    console.error("[v0] Error generating monthly insights:", error)
    insights.push({
      title: "Insights Coming Soon",
      description:
        "We encountered a temporary issue while analyzing your spending data. This is likely due to incomplete or inconsistent data in your records. Please ensure your expense entries are accurate and up-to-date. Once more data is available, comprehensive insights will be generated automatically. In the meantime, review your recent transactions using the expense tracker to manually identify spending patterns.",
    })
  }

  return insights
}

export default function AnalyticsDashboard() {
  const { expenses, income } = useFinance()

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const thisMonthTotal = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  // Calculate category data
  const categoryData = expenses
    .reduce(
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
    .sort((a, b) => b.value - a.value)

  // Calculate monthly category data for the last 6 months
  const categoryMonthlyData = expenses.reduce(
    (acc, exp) => {
      const date = new Date(exp.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })

      const monthEntry = acc.find((item) => item.key === monthKey)
      if (monthEntry) {
        const categoryEntry = monthEntry.categories.find((c) => c.name === exp.category)
        if (categoryEntry) {
          categoryEntry.value += exp.amount
        } else {
          monthEntry.categories.push({ name: exp.category, value: exp.amount })
        }
      } else {
        acc.push({
          key: monthKey,
          month: monthName,
          categories: [{ name: exp.category, value: exp.amount }],
        })
      }
      return acc
    },
    [] as { key: string; month: string; categories: { name: string; value: number }[] }[],
  )

  categoryMonthlyData.sort((a, b) => a.key.localeCompare(b.key))
  const last6MonthsCategory = categoryMonthlyData.slice(-6)

  // Calculate AI Insights
  // Placeholder for lastMonthTotal, as it's not directly available from useFinance hook in this scope.
  // For a real-time calculation, this would need to be derived from previous month's data.
  // Here, we pass 0 as a placeholder as per the original code's structure.
  const aiInsights = generateAIInsights(
    expenses,
    income,
    [], // Assuming goals are not directly passed or needed for this specific insight generation
    categoryData.slice(0, 5), // Pass top 5 categories for general insights
    thisMonthTotal,
    0, // Placeholder for lastMonthTotal
  )

  // Calculate Monthly Insights
  const monthlyInsights = generateMonthlyInsights(categoryMonthlyData, categoryData, income)

  // Prepare data for the monthly spending bar chart
  const monthlyChartData = last6MonthsCategory.map((monthData) => {
    const dataPoint: { [key: string]: any } = {
      month: monthData.month,
    }

    // Create flat structure where each category is a separate property
    monthData.categories.forEach((cat) => {
      dataPoint[cat.name] = cat.value
    })

    return dataPoint
  })

  // Get all unique categories across all months for consistent bar rendering in the chart
  const allCategories = Array.from(
    new Set(last6MonthsCategory.flatMap((month) => month.categories.map((cat) => cat.name))),
  )

  const [selectedCategories, setSelectedCategories] = useState<string[]>(allCategories)
  const [trendsTimeRange, setTrendsTimeRange] = useState<"3m" | "6m" | "1y" | "all">("all")
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Helper function to get filtered category data based on selected time range
  const getFilteredCategoryData = () => {
    let filtered = categoryMonthlyData

    // Apply time range filter
    if (trendsTimeRange !== "all") {
      const monthsToShow = trendsTimeRange === "3m" ? 3 : trendsTimeRange === "6m" ? 6 : 12
      filtered = filtered.slice(-monthsToShow)
    }

    return filtered
      .map((month) => ({
        month: month.month,
        categories: month.categories.filter((cat) => selectedCategories.includes(cat.name)),
      }))
      .filter((month) => month.categories.length > 0)
  }

  const filteredTrendsData = getFilteredCategoryData()

  const uniqueTrendsCategories = Array.from(
    new Set(filteredTrendsData.flatMap((month) => month.categories.map((cat) => cat.name))),
  )

  return (
    <div className="w-full space-y-6">
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
        {/* Removed Monthly Change and Avg Daily Spend for brevity */}
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
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {aiInsights.length > 0 ? (
                aiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === "warning"
                        ? "bg-red-50 border-l-red-500 dark:bg-red-950/30"
                        : insight.type === "success"
                          ? "bg-green-50 border-l-green-500 dark:bg-green-950/30"
                          : insight.type === "tip"
                            ? "bg-blue-50 border-l-blue-500 dark:bg-blue-950/30"
                            : "bg-amber-50 border-l-amber-500 dark:bg-amber-950/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {insight.type === "warning" && <AlertCircle className="w-5 h-5 text-red-600" />}
                        {insight.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {insight.type === "tip" && <Lightbulb className="w-5 h-5 text-blue-600" />}
                        {insight.type === "info" && <Info className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{insight.description}</p>
                        {insight.recommendation && (
                          <div className="bg-background/60 p-3 rounded border border-border/60 mt-2">
                            <p className="text-xs font-medium text-foreground mb-1">💡 Recommendation:</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{insight.recommendation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    You've started tracking your expenses, which is the first and most important step toward financial
                    management. While your data is still being collected, here are some general insights based on what
                    you have so far:
                  </p>
                  <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                    <p className="font-medium text-foreground mb-2">📊 What we're learning about you:</p>
                    <p className="text-xs leading-relaxed mb-3">
                      Your expense tracking shows {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}{" "}
                      recorded so far. As you continue tracking, patterns will emerge that help us provide more targeted
                      recommendations. The most valuable insights come after 2-3 months of consistent tracking, so keep
                      up the good work!
                    </p>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                    <p className="font-medium text-foreground mb-2">🎯 Next steps to unlock insights:</p>
                    <ul className="text-xs space-y-2 list-disc list-inside">
                      <li>Continue logging all your daily expenses consistently</li>
                      <li>Ensure your monthly income is set for accurate savings rate calculations</li>
                      <li>Create 2-3 savings goals to start building a clearer financial picture</li>
                      <li>Review your spending categories to ensure they match your lifestyle</li>
                    </ul>
                  </div>
                  <p className="text-xs">
                    Once you have more data, you'll receive detailed insights about spending patterns, recommendations
                    for optimization, alerts about unusual spending, and personalized strategies to reach your financial
                    goals.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Financial Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No expenses recorded yet. Begin by adding your first expense to unlock AI-powered insights.
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Getting Started:</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Start by adding your regular monthly expenses. Think about your biggest spending categories like
                    food, transportation, utilities, entertainment, and shopping. Once you've logged 5-10 transactions
                    across different categories, you'll see initial patterns emerge. The AI engine will then analyze
                    your spending behavior and provide actionable recommendations.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-900 dark:text-green-100 mb-2">
                    ✅ What insights you'll receive:
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                    Personalized analysis of your spending patterns, alerts when you're spending above your average,
                    category recommendations, savings rate tracking, goal achievement projections, and actionable tips
                    to optimize your budget. These insights are delivered in easy-to-understand language with specific
                    numbers and percentages.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">🎯 Pro tip:</p>
                  <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    Set your monthly income in your profile for the most accurate financial recommendations. This allows
                    the system to calculate your savings rate, identify when spending exceeds income, and suggest budget
                    allocations based on best practices like the 50-30-20 rule.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Tabs defaultValue="monthly" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="monthly">By Month</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
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
                  <CardTitle>Monthly Spending by Category</CardTitle>
                  <CardDescription>Track how each category's spending changes month-to-month</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyChartData.length > 0 ? (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" className="text-muted-foreground" />
                          <YAxis className="text-muted-foreground" />
                          <Tooltip
                            formatter={(value: number) => `₹${value.toLocaleString()}`}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: "20px" }} />
                          {allCategories.map((category) => (
                            <Bar
                              key={category}
                              dataKey={category}
                              stackId="categories"
                              fill={CATEGORY_COLORS[category] || "#999"}
                              name={category}
                              radius={[4, 4, 0, 0]}
                            />
                          ))}
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

            {/* Category Trends */}
            <Card className="bg-primary/5 border-primary/20 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-4 h-4 text-primary" />
                  Category Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div className="space-y-3">
                    {categoryData.map((cat, index) => {
                      // Calculate trend for each category
                      const categoryMonths = last6MonthsCategory
                        .map((month) => {
                          const catData = month.categories.find((c) => c.name === cat.name)
                          return { month: month.month, amount: catData?.value || 0 }
                        })
                        .filter((m) => m.amount > 0)

                      const isIncreasing =
                        categoryMonths.length >= 2
                          ? categoryMonths[categoryMonths.length - 1].amount >
                            categoryMonths[categoryMonths.length - 2].amount
                          : false

                      return (
                        <div
                          key={index}
                          className="text-sm p-3 bg-background/50 rounded-lg border border-border/50"
                          style={{
                            borderLeftColor: CATEGORY_COLORS[cat.name],
                            borderLeftWidth: "3px",
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground">{cat.name}</h4>
                            <span className={`text-xs ${isIncreasing ? "text-red-500" : "text-green-500"}`}>
                              {isIncreasing ? "↑" : "↓"} Trend
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total: ₹{cat.value.toLocaleString()} | Avg/Month: ₹
                            {Math.round(cat.value / (last6MonthsCategory.length || 1)).toLocaleString()}
                          </p>
                          {categoryMonths.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Latest: ₹{categoryMonths[categoryMonths.length - 1].amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">Add expenses to see category trends</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-3 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Customize Your Trends View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Time Range Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Time Range</label>
                    <div className="flex gap-2">
                      {["3m", "6m", "1y", "all"].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTrendsTimeRange(range as "3m" | "6m" | "1y" | "all")}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                            trendsTimeRange === range
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {range === "all" ? "All" : range.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
                            )
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all border ${
                            selectedCategories.includes(category)
                              ? "border-current bg-current text-background"
                              : "border-border text-muted-foreground hover:border-foreground/50"
                          }`}
                          style={{
                            backgroundColor: selectedCategories.includes(category)
                              ? CATEGORY_COLORS[category]
                              : "transparent",
                            borderColor: CATEGORY_COLORS[category],
                            color: selectedCategories.includes(category) ? "#fff" : CATEGORY_COLORS[category],
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>
                  {selectedCategories.length > 0
                    ? `Tracking ${selectedCategories.length} categor${selectedCategories.length !== 1 ? "ies" : "y"} over time`
                    : "Select categories to view trends"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTrendsData.length > 0 && selectedCategories.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={filteredTrendsData.map((month) => {
                          const monthData: any = { month: month.month }
                          month.categories.forEach((cat) => {
                            monthData[cat.name] = cat.value
                          })
                          return monthData
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-muted-foreground text-xs" />
                        <YAxis className="text-muted-foreground text-xs" />
                        <Tooltip
                          formatter={(value: number) => `₹${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "2px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "8px 12px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          onMouseEnter={(e) => setHoveredCategory(e.dataKey as string)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        />
                        {uniqueTrendsCategories.map((category) => (
                          <Line
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stroke={CATEGORY_COLORS[category] || "#999"}
                            strokeWidth={hoveredCategory === category ? 4 : 2}
                            dot={{
                              fill: CATEGORY_COLORS[category] || "#999",
                              r: hoveredCategory === category ? 6 : 4,
                              strokeWidth: 2,
                            }}
                            activeDot={{ r: 8, strokeWidth: 3 }}
                            name={category}
                            isAnimationActive={true}
                            animationDuration={500}
                            opacity={!hoveredCategory || hoveredCategory === category ? 1 : 0.3}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">
                        {selectedCategories.length === 0
                          ? "Select at least one category to view trends"
                          : "No data available for selected filters"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCategories.length > 0 ? (
                  uniqueTrendsCategories.map((category) => {
                    const categoryData = filteredTrendsData
                      .flatMap((month) => month.categories.filter((cat) => cat.name === category))
                      .map((cat) => cat.value)

                    if (categoryData.length === 0) return null

                    const current = categoryData[categoryData.length - 1]
                    const previous = categoryData[categoryData.length - 2] || current
                    const trend = current - previous
                    const trendPercent = previous > 0 ? (trend / previous) * 100 : 0
                    const avg = categoryData.reduce((a, b) => a + b, 0) / categoryData.length

                    return (
                      <div
                        key={category}
                        className="p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[category] }}
                            />
                            <span className="text-xs font-semibold">{category}</span>
                          </div>
                          <span className={`text-xs font-semibold ${trend >= 0 ? "text-red-500" : "text-green-500"}`}>
                            {trend >= 0 ? "↑" : "↓"} {Math.abs(trendPercent).toFixed(1)}%
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Current:</span>
                            <span className="font-medium text-foreground">₹{current.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Average:</span>
                            <span className="font-medium text-foreground">₹{Math.round(avg).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min((current / Math.max(...categoryData)) * 100, 100)}%`,
                                backgroundColor: CATEGORY_COLORS[category],
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Select categories above to see performance details
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-4 h-4 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyInsights.length > 0 ? (
                  <div className="space-y-3">
                    {monthlyInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="text-sm p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/40 transition-colors cursor-pointer group"
                      >
                        <h4 className="font-semibold text-foreground mb-1 text-xs group-hover:text-primary transition-colors">
                          {insight.title}
                        </h4>
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
      </Tabs>
    </div>
  )
}

export { AnalyticsDashboard }
