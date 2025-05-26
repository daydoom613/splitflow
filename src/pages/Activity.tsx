import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";

const Activity = () => {
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

  // Group expenses by month for display
  const expensesByMonth = React.useMemo(() => {
    const grouped: Record<string, typeof expenses> = {};
    
    sortedExpenses.forEach((expense) => {
      const date = new Date(expense.created_at);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(expense);
    });

    return grouped;
  }, [sortedExpenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Activity</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="expenses">My Expenses</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(expensesByMonth).map(([monthYear, monthExpenses]) => (
            <div key={monthYear} className="space-y-4">
              <h2 className="text-lg font-semibold">{monthYear}</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {monthExpenses.map((expense) => {
                      const date = new Date(expense.created_at);
                      const formattedDate = formatDistanceToNow(date, { addSuffix: true });
                      const splitCount = expense.expense_splits.length;
                      const userSplit = expense.expense_splits.find(split => split.user_id === user?.id);
                      const isPayee = expense.paid_by === user?.id;
                      const userAmount = userSplit?.amount || 0;

                      return (
                        <div key={expense.id} className="flex items-start space-x-4">
                          <Avatar className="mt-0.5">
                            <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                              {expense.profiles.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {expense.profiles.full_name} paid <span className="text-splitflow-primary">₹{expense.amount.toLocaleString()}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formattedDate}
                              </span>
                            </div>
                            <p className="text-sm">
                              {expense.description} {expense.category && `(${expense.category})`}
                            </p>
                            <div className="flex flex-wrap items-center text-sm gap-2">
                              <Badge variant="outline" className="text-xs">
                                {expense.groups.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Split {splitCount} ways
                              </span>
                              {isPayee ? (
                                <span className="text-xs text-green-600">
                                  you lent ₹{(expense.amount - userAmount).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-xs text-red-600">
                                  you owe ₹{userAmount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          {Object.keys(expensesByMonth).length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-10">
                <p className="text-muted-foreground">No activity to show yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="pt-6 text-center py-10">
              <p className="text-muted-foreground">Filter for expenses will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <CardContent className="pt-6 text-center py-10">
              <p className="text-muted-foreground">Filter for settlements will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Activity;
