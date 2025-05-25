
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { expenses, getUserById } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export function RecentExpenses() {
  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedExpenses.slice(0, 5).map((expense) => {
            const paidBy = getUserById(expense.paidBy);
            const date = new Date(expense.date);
            const formattedDate = formatDistanceToNow(date, { addSuffix: true });

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-splitflow-light text-splitflow-primary text-xs">
                      {paidBy?.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-muted-foreground">
                        {paidBy?.name} paid
                      </span>
                      <span className="text-xs">•</span>
                      <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium">₹{expense.amount.toLocaleString()}</div>
              </div>
            );
          })}
          {expenses.length === 0 && (
            <div className="flex items-center justify-center h-40 text-center">
              <p className="text-sm text-muted-foreground">No recent expenses.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
