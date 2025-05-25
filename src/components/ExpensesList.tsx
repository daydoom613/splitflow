import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Receipt, ChevronRight } from "lucide-react";
import type { Expense } from "@/hooks/useExpenses";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";

interface ExpensesListProps {
  expenses: Expense[];
  onExpenseClick?: (expense: Expense) => void;
}

export function ExpensesList({ expenses, onExpenseClick }: ExpensesListProps) {
  const { user } = useAuth();

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center p-4">
        <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No expenses yet</h3>
        <p className="text-sm text-muted-foreground">
          Add your first expense using the button above.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {sortedExpenses.map((expense) => {
          const date = new Date(expense.created_at);
          const formattedDate = formatDistanceToNow(date, { addSuffix: true });
          
          // Calculate what the current user owes or is owed
          const userSplit = expense.expense_splits.find(split => split.user_id === user?.id);
          const isPayee = expense.paid_by === user?.id;
          const userAmount = userSplit?.amount || 0;
          
          // Calculate total number of people involved
          const totalPeople = expense.expense_splits.length;

          return (
            <Card 
              key={expense.id} 
              className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => onExpenseClick?.(expense)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 mt-1">
                      <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                        {expense.profiles.full_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{expense.description}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {expense.profiles.full_name} paid
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {expense.category && (
                          <Badge variant="secondary" className="capitalize">
                            {expense.category}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-medium">₹{expense.amount.toLocaleString()}</p>
                      {isPayee ? (
                        <p className="text-sm text-green-600">
                          you lent ₹{(expense.amount - userAmount).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">
                          you owe ₹{userAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
} 