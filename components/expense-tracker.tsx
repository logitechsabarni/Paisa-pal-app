"use client"

import type React from "react"

import { useState } from "react"
import { useFinance, type Expense } from "@/contexts/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, X, Search, Filter, Calendar } from "lucide-react"

const CATEGORIES = [
  { value: "Food", label: "Food", icon: "🍔" },
  { value: "Travel", label: "Travel", icon: "✈️" },
  { value: "Shopping", label: "Shopping", icon: "🛒" },
  { value: "Bills", label: "Bills", icon: "📄" },
  { value: "Entertainment", label: "Entertainment", icon: "🎬" },
  { value: "Health", label: "Health", icon: "💊" },
  { value: "Education", label: "Education", icon: "📚" },
  { value: "Others", label: "Others", icon: "📦" },
]

export function ExpenseTracker() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Form state
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const resetForm = () => {
    setAmount("")
    setCategory("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
    setEditingExpense(null)
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !date) return

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        amount: Number.parseFloat(amount),
        category,
        description,
        date,
      })
    } else {
      addExpense({
        amount: Number.parseFloat(amount),
        category,
        description,
        date,
      })
    }

    resetForm()
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setAmount(expense.amount.toString())
    setCategory(expense.category)
    setDescription(expense.description)
    setDate(expense.date)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id)
    }
  }

  // Filter and search expenses
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === "all" || exp.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const thisMonthTotal = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expense Tracker</h1>
          <p className="text-muted-foreground">Track and manage your daily expenses</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-foreground">₹{thisMonthTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold text-foreground">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a note about this expense"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingExpense ? "Update" : "Add"} Expense
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transactions</span>
            {filteredExpenses.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                Total: ₹{totalExpenses.toLocaleString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => {
                const categoryInfo = CATEGORIES.find((c) => c.value === expense.category)
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                        {categoryInfo?.icon || "📦"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.description || expense.category}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(expense.date)}</span>
                          <span className="px-2 py-0.5 bg-secondary rounded text-xs">{expense.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-destructive text-lg">-₹{expense.amount.toLocaleString()}</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)} className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No expenses yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterCategory !== "all"
                  ? "No expenses match your search criteria"
                  : "Start tracking by adding your first expense"}
              </p>
              {!searchQuery && filterCategory === "all" && (
                <Button onClick={() => setShowForm(true)}>Add Your First Expense</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
