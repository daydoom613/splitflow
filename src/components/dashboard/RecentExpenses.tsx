import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Receipt } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export function RecentExpenses() {
  const { data: expenses = [] } = useExpenses();
  const { user } = useAuth();

  // Get all expenses where the user is involved (either paid or is part of the split)
  const userExpenses = React.useMemo(() => {
    return expenses.filter(expense => {
      // Include if user paid for it
      if (expense.paid_by === user?.id) return true;
      // Include if user is part of the split
      return expense.expense_splits.some(split => split.user_id === user?.id);
    });
  }, [expenses, user?.id]);

  // Sort expenses by date (newest first)
  const sortedExpenses = [...userExpenses].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Take only the 5 most recent expenses
  const recentExpenses = sortedExpenses.slice(0, 5);

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentExpenses.map((expense) => {
            const date = new Date(expense.created_at);
            const formattedDate = formatDistanceToNow(date, { addSuffix: true });
            const userSplit = expense.expense_splits.find(split => split.user_id === user?.id);
            const isPayee = expense.paid_by === user?.id;
            const userAmount = userSplit?.amount || 0;

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-splitflow-light text-splitflow-primary text-xs">
                      {expense.profiles.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{expense.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {expense.groups.name}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-muted-foreground">
                        {expense.profiles.full_name} paid
                      </span>
                      <span className="text-xs">•</span>
                      <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{expense.amount.toLocaleString()}</p>
                  {isPayee ? (
                    <p className="text-xs text-green-600">
                      you lent ₹{(expense.amount - userAmount).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">
                      you owe ₹{userAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {recentExpenses.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No expenses yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your first expense from any of your groups.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
