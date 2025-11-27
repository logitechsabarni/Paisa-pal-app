"use client"

import { useState, useRef, useEffect } from "react"
import { useFinance } from "@/contexts/finance-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Brain, User, Loader2, Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  "How much did I spend this month?",
  "What's my biggest expense category?",
  "Am I on track with my savings goals?",
  "Give me tips to save more money",
  "Analyze my spending patterns",
  "How can I improve my financial health?",
]

export function AIChatbot() {
  const { user } = useAuth()
  const { expenses, goals, income } = useFinance()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Calculate user's financial data
    const now = new Date()
    const thisMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date)
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Category breakdown
    const categoryBreakdown = expenses.reduce(
      (acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Goals analysis
    const activeGoals = goals.length
    const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
    const totalGoalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const goalsProgress = totalGoalTarget > 0 ? (totalGoalSaved / totalGoalTarget) * 100 : 0

    // Balance calculation
    const balance = income - thisMonthTotal
    const savingsRate = income > 0 ? ((income - thisMonthTotal) / income) * 100 : 0

    const lowerMessage = userMessage.toLowerCase()

    // Generate contextual response based on user's question
    let response = ""

    if (lowerMessage.includes("spent this month") || lowerMessage.includes("monthly spending")) {
      response = `📊 **Your Monthly Spending Analysis**

**Total Spent This Month:** ₹${thisMonthTotal.toLocaleString()}

${
  income > 0
    ? `**Monthly Income:** ₹${income.toLocaleString()}
**Remaining Balance:** ₹${balance.toLocaleString()}
**Savings Rate:** ${savingsRate.toFixed(1)}%`
    : "💡 *Tip: Set your monthly income in Profile to get better insights!*"
}

**Breakdown by Category:**
${
  sortedCategories.length > 0
    ? sortedCategories
        .map(
          ([cat, amount]) => `• ${cat}: ₹${amount.toLocaleString()} (${((amount / thisMonthTotal) * 100).toFixed(1)}%)`,
        )
        .join("\n")
    : "No expenses recorded this month yet."
}

**My Analysis:**
${
  thisMonthTotal === 0
    ? "You haven't recorded any expenses this month. Start tracking to get personalized insights!"
    : income > 0 && savingsRate >= 20
      ? "Excellent! You're maintaining a healthy savings rate above 20%. Keep up the great financial discipline!"
      : income > 0 && savingsRate < 20 && savingsRate > 0
        ? `You're saving ${savingsRate.toFixed(1)}% of your income. The recommended savings rate is 20%. Consider reducing expenses in your top spending categories.`
        : income > 0 && savingsRate <= 0
          ? "⚠️ Warning: Your expenses are exceeding your income. This is unsustainable. Review your spending and identify non-essential expenses to cut."
          : "Good job tracking your expenses! Set your income to get a complete financial picture."
}`
    } else if (
      lowerMessage.includes("biggest expense") ||
      lowerMessage.includes("top category") ||
      lowerMessage.includes("spending category")
    ) {
      if (sortedCategories.length === 0) {
        response =
          "You haven't recorded any expenses yet. Start tracking your spending to see which categories consume most of your budget!"
      } else {
        const [topCat, topAmount] = sortedCategories[0]
        const topPercentage = totalExpenses > 0 ? (topAmount / totalExpenses) * 100 : 0

        response = `🎯 **Your Top Spending Categories**

**#1 ${topCat}:** ₹${topAmount.toLocaleString()} (${topPercentage.toFixed(1)}% of total)

**Full Category Ranking:**
${sortedCategories
  .map(
    ([cat, amount], idx) =>
      `${idx + 1}. **${cat}**: ₹${amount.toLocaleString()} (${((amount / totalExpenses) * 100).toFixed(1)}%)`,
  )
  .join("\n")}

**My Analysis:**
${
  topPercentage > 40
    ? `Your ${topCat} spending is quite high at ${topPercentage.toFixed(1)}% of total expenses. Here are some suggestions:\n\n• Review individual ${topCat} transactions for unnecessary spending\n• Set a specific budget limit for ${topCat}\n• Look for alternatives or discounts\n• Track ${topCat} expenses more closely for a week`
    : `Your spending is well-distributed across categories. ${topCat} leads at ${topPercentage.toFixed(1)}%, which is reasonable. Consider setting category-specific budgets to maintain this balance.`
}`
      }
    } else if (
      lowerMessage.includes("savings goal") ||
      lowerMessage.includes("goal") ||
      lowerMessage.includes("on track")
    ) {
      if (goals.length === 0) {
        response = `🎯 **Savings Goals Status**

You don't have any savings goals set up yet!

**Why Set Savings Goals?**
• Gives your money a purpose
• Motivates consistent saving
• Helps prioritize spending decisions
• Tracks progress toward dreams

**Recommended First Goals:**
1. **Emergency Fund** - 3-6 months of expenses
2. **Short-term Goal** - Something achievable in 3-6 months
3. **Long-term Goal** - Major purchase or investment

Click on the "Goals" tab to create your first savings goal!`
      } else {
        const goalsDetails = goals
          .map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const amountNeeded = goal.targetAmount - goal.currentAmount
            const dailyNeeded = daysLeft > 0 ? Math.ceil(amountNeeded / daysLeft) : 0
            const status =
              progress >= 100
                ? "✅ Completed"
                : daysLeft < 0
                  ? "⚠️ Overdue"
                  : progress >= 75
                    ? "🔥 Almost there"
                    : "📈 In progress"

            return `**${goal.name}** ${status}
   • Progress: ${progress.toFixed(1)}% (₹${goal.currentAmount.toLocaleString()} / ₹${goal.targetAmount.toLocaleString()})
   • ${daysLeft > 0 ? `Days left: ${daysLeft}` : daysLeft === 0 ? "Due today!" : `Overdue by ${Math.abs(daysLeft)} days`}
   ${progress < 100 && daysLeft > 0 ? `• Daily savings needed: ₹${dailyNeeded.toLocaleString()}` : ""}`
          })
          .join("\n\n")

        response = `🎯 **Savings Goals Analysis**

**Overall Progress:** ${goalsProgress.toFixed(1)}%
**Total Saved:** ₹${totalGoalSaved.toLocaleString()} / ₹${totalGoalTarget.toLocaleString()}

**Your Goals:**
${goalsDetails}

**My Recommendations:**
${
  goalsProgress >= 75
    ? "Fantastic progress! You're very close to achieving your goals. Stay consistent and you'll reach them soon!"
    : goalsProgress >= 50
      ? "Good progress! You're halfway there. Consider increasing your monthly contributions to accelerate your savings."
      : goalsProgress >= 25
        ? "You've made a start! To improve your progress, try automating a fixed savings amount each month."
        : "Your savings journey has just begun. Focus on one goal at a time and make regular contributions, even if small."
}`
      }
    } else if (lowerMessage.includes("tips") || lowerMessage.includes("save more") || lowerMessage.includes("advice")) {
      response = `💡 **Personalized Money-Saving Tips**

Based on your financial profile, here are tailored recommendations:

**Immediate Actions:**
${
  sortedCategories.length > 0
    ? `1. **Review ${sortedCategories[0][0]} spending** - Your top category. Even 10% reduction saves ₹${Math.round(sortedCategories[0][1] * 0.1).toLocaleString()}`
    : "1. **Start tracking expenses** - You can't improve what you don't measure"
}
2. **Apply the 24-hour rule** - Wait a day before non-essential purchases over ₹500
3. **Use cash for discretionary spending** - Physical money makes spending feel more real

**Weekly Habits:**
• Review all subscriptions and cancel unused ones
• Plan meals to reduce food waste and dining out
• Compare prices before making purchases
• Set specific "no-spend" days

**Monthly Strategies:**
${
  income > 0
    ? `• Follow 50-30-20 rule: ₹${Math.round(income * 0.5).toLocaleString()} needs, ₹${Math.round(income * 0.3).toLocaleString()} wants, ₹${Math.round(income * 0.2).toLocaleString()} savings`
    : "• Set your income to get personalized budget recommendations"
}
• Automate savings transfers on salary day
• Review and adjust budgets based on actual spending
• Track your net worth monthly

**Long-term Wealth Building:**
• Build emergency fund (3-6 months expenses)
• Start SIP investments for long-term goals
• Increase savings rate by 1% every quarter
• Learn about tax-saving investments

${
  income > 0 && savingsRate < 20
    ? `\n**Your Priority:** Increase savings rate from ${savingsRate.toFixed(1)}% to 20% by reducing spending by ₹${Math.round(income * 0.2 - (income - thisMonthTotal)).toLocaleString()}/month`
    : ""
}`
    } else if (
      lowerMessage.includes("pattern") ||
      lowerMessage.includes("analyze") ||
      lowerMessage.includes("analysis")
    ) {
      const avgTransaction = expenses.length > 0 ? totalExpenses / expenses.length : 0
      const maxExpense = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0
      const minExpense = expenses.length > 0 ? Math.min(...expenses.map((e) => e.amount)) : 0

      response = `📈 **Detailed Spending Pattern Analysis**

**Transaction Statistics:**
• Total transactions: ${expenses.length}
• Average transaction: ₹${Math.round(avgTransaction).toLocaleString()}
• Largest expense: ₹${maxExpense.toLocaleString()}
• Smallest expense: ₹${minExpense.toLocaleString()}
• Total spent (all time): ₹${totalExpenses.toLocaleString()}

**Category Distribution:**
${
  sortedCategories.length > 0
    ? sortedCategories
        .map(
          ([cat, amount]) =>
            `• **${cat}**: ₹${amount.toLocaleString()} (${expenses.filter((e) => e.category === cat).length} transactions)`,
        )
        .join("\n")
    : "No expense data available yet."
}

**Behavioral Insights:**
${
  expenses.length >= 5
    ? `• Your typical spend per transaction is around ₹${Math.round(avgTransaction).toLocaleString()}
• Transactions above ₹${Math.round(avgTransaction * 2).toLocaleString()} should trigger a "think twice" moment
• ${sortedCategories.length > 0 ? `${sortedCategories[0][0]} dominates your spending - focus optimization here` : ""}
${maxExpense > avgTransaction * 5 ? `• You have some large outlier expenses (₹${maxExpense.toLocaleString()}) - review if these were necessary` : ""}`
    : "Add more expenses to unlock detailed pattern analysis!"
}

**Recommendations:**
${
  expenses.length === 0
    ? "Start tracking your expenses to get personalized insights!"
    : `1. Set a daily spending limit of ₹${Math.round(avgTransaction * 1.5).toLocaleString()}
2. Review transactions in your top category weekly
3. Flag any expense above ₹${Math.round(avgTransaction * 3).toLocaleString()} for review`
}`
    } else if (
      lowerMessage.includes("financial health") ||
      lowerMessage.includes("improve") ||
      lowerMessage.includes("better")
    ) {
      const healthScore = calculateFinancialHealthScore(income, thisMonthTotal, goals, expenses)

      response = `🏥 **Your Financial Health Report**

**Overall Health Score: ${healthScore.score}/100** ${healthScore.emoji}

**Score Breakdown:**
${healthScore.breakdown.map((item) => `• ${item}`).join("\n")}

**Strengths:**
${
  healthScore.strengths.length > 0
    ? healthScore.strengths.map((s) => `✅ ${s}`).join("\n")
    : "Start tracking to identify your strengths!"
}

**Areas for Improvement:**
${
  healthScore.improvements.length > 0
    ? healthScore.improvements.map((i) => `⚠️ ${i}`).join("\n")
    : "Great job! Keep maintaining your current habits."
}

**Action Plan:**
${healthScore.actionPlan.map((action, idx) => `${idx + 1}. ${action}`).join("\n")}

**Next Steps:**
• Review your spending weekly using the Analytics dashboard
• Set specific, measurable financial goals
• Use the AI chatbot regularly for personalized advice
• Celebrate small wins to stay motivated!`
    } else {
      // Default response for general questions
      response = `👋 **Hello ${user?.name?.split(" ")[0] || "there"}!**

I'm your AI Financial Advisor. Here's a quick overview of your finances:

**This Month:**
• Spent: ₹${thisMonthTotal.toLocaleString()}
${income > 0 ? `• Income: ₹${income.toLocaleString()}\n• Balance: ₹${balance.toLocaleString()}` : "• Set your income in Profile for better insights"}

**Goals:** ${goals.length > 0 ? `${goals.length} active (${goalsProgress.toFixed(0)}% overall progress)` : "None set yet"}

**How can I help you today?**
• Ask about your spending patterns
• Get savings tips and advice
• Check your goals progress
• Analyze your financial health

Try asking: "${SUGGESTED_QUESTIONS[Math.floor(Math.random() * SUGGESTED_QUESTIONS.length)]}"`
    }

    return response
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate AI thinking time
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

      const response = await generateAIResponse(userMessage.content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Financial Advisor</h1>
        <p className="text-muted-foreground">Get personalized financial insights and advice</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-3 bg-card flex flex-col h-[600px]">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Chat with PaisaPal AI
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to PaisaPal AI!</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I can analyze your spending, provide savings tips, track your goals, and give personalized financial
                    advice.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTED_QUESTIONS.slice(0, 3).map((question) => (
                      <Button
                        key={question}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Brain className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`text-sm whitespace-pre-wrap ${
                            message.role === "assistant" ? "prose prose-sm max-w-none text-foreground" : ""
                          }`}
                        >
                          {message.content.split("\n").map((line, i) => (
                            <span key={i}>
                              {line.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
                              {i < message.content.split("\n").length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Ask me anything about your finances..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Questions Sidebar */}
        <Card className="bg-card h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <Button
                key={question}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function calculateFinancialHealthScore(
  income: number,
  monthlyExpenses: number,
  goals: any[],
  expenses: any[],
): {
  score: number
  emoji: string
  breakdown: string[]
  strengths: string[]
  improvements: string[]
  actionPlan: string[]
} {
  let score = 50 // Base score
  const breakdown: string[] = []
  const strengths: string[] = []
  const improvements: string[] = []
  const actionPlan: string[] = []

  // Savings rate (max 25 points)
  if (income > 0) {
    const savingsRate = ((income - monthlyExpenses) / income) * 100
    if (savingsRate >= 20) {
      score += 25
      breakdown.push(`Savings Rate: +25 (${savingsRate.toFixed(1)}% - Excellent!)`)
      strengths.push("Maintaining healthy savings rate above 20%")
    } else if (savingsRate >= 10) {
      score += 15
      breakdown.push(`Savings Rate: +15 (${savingsRate.toFixed(1)}% - Good)`)
      improvements.push("Increase savings rate to 20%")
      actionPlan.push("Reduce discretionary spending by 10%")
    } else if (savingsRate > 0) {
      score += 5
      breakdown.push(`Savings Rate: +5 (${savingsRate.toFixed(1)}% - Needs work)`)
      improvements.push("Savings rate is below recommended 10%")
      actionPlan.push("Set up automatic savings transfer on payday")
    } else {
      score -= 10
      breakdown.push(`Savings Rate: -10 (Spending exceeds income!)`)
      improvements.push("Critical: Expenses exceed income")
      actionPlan.push("Immediately review and cut non-essential expenses")
    }
  } else {
    breakdown.push("Savings Rate: 0 (Income not set)")
    actionPlan.push("Set your monthly income in Profile")
  }

  // Expense tracking (max 15 points)
  if (expenses.length >= 20) {
    score += 15
    breakdown.push("Expense Tracking: +15 (Excellent tracking!)")
    strengths.push("Consistent expense tracking habit")
  } else if (expenses.length >= 10) {
    score += 10
    breakdown.push("Expense Tracking: +10 (Good tracking)")
  } else if (expenses.length >= 5) {
    score += 5
    breakdown.push("Expense Tracking: +5 (Getting started)")
    improvements.push("Track expenses more consistently")
    actionPlan.push("Log every expense, no matter how small")
  } else {
    breakdown.push("Expense Tracking: 0 (Limited data)")
    actionPlan.push("Start tracking all your daily expenses")
  }

  // Goals (max 10 points)
  if (goals.length >= 3) {
    score += 10
    breakdown.push("Financial Goals: +10 (Multiple goals set)")
    strengths.push("Clear financial goals established")
  } else if (goals.length >= 1) {
    score += 5
    breakdown.push("Financial Goals: +5 (Goals in progress)")
    actionPlan.push("Add more savings goals for different timeframes")
  } else {
    breakdown.push("Financial Goals: 0 (No goals set)")
    improvements.push("No savings goals defined")
    actionPlan.push("Create at least one savings goal")
  }

  // Determine emoji based on score
  let emoji = ""
  if (score >= 80) emoji = "🌟"
  else if (score >= 60) emoji = "😊"
  else if (score >= 40) emoji = "😐"
  else emoji = "😟"

  return { score: Math.min(100, Math.max(0, score)), emoji, breakdown, strengths, improvements, actionPlan }
}
