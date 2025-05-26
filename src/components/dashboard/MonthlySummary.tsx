import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ChartPie } from "lucide-react";

export function MonthlySummary() {
  const { data: expenses = [] } = useExpenses();
  const { user } = useAuth();

  // Get current month's expenses
  const currentMonthExpenses = React.useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return expenseDate >= firstDayOfMonth && 
             expense.expense_splits.some(split => split.user_id === user?.id);
    });
  }, [expenses, user?.id]);

  // Calculate category-wise spending
  const categorySpending = React.useMemo(() => {
    const spending: Record<string, number> = {};
    
    currentMonthExpenses.forEach(expense => {
      const userSplit = expense.expense_splits.find(split => split.user_id === user?.id);
      if (!userSplit) return;

      const category = expense.category || "Other";
      spending[category] = (spending[category] || 0) + userSplit.amount;
    });

    // Sort categories by amount
    return Object.entries(spending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Show top 5 categories
  }, [currentMonthExpenses, user?.id]);

  // Calculate total spending for the month
  const totalMonthlySpending = React.useMemo(() => {
    return currentMonthExpenses.reduce((total, expense) => {
      const userSplit = expense.expense_splits.find(split => split.user_id === user?.id);
      return total + (userSplit?.amount || 0);
    }, 0);
  }, [currentMonthExpenses, user?.id]);

  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">₹{totalMonthlySpending.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{currentMonth} spending</p>
          </div>

          {categorySpending.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Top Categories</p>
              {categorySpending.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="capitalize">
                      {category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {((amount / totalMonthlySpending) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-sm">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ChartPie className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-sm font-medium">No expenses this month</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add expenses to see your spending patterns
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 