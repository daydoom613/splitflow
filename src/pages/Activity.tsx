
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { expenses, getUserById, getGroupById } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Activity = () => {
  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Group expenses by month for display
  const expensesByMonth: Record<string, typeof expenses> = {};
  sortedExpenses.forEach((expense) => {
    const date = new Date(expense.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!expensesByMonth[monthYear]) {
      expensesByMonth[monthYear] = [];
    }
    
    expensesByMonth[monthYear].push(expense);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Activity</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
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
                      const paidBy = getUserById(expense.paidBy);
                      const group = getGroupById(expense.groupId);
                      const date = new Date(expense.date);
                      const formattedDate = formatDistanceToNow(date, { addSuffix: true });
                      const splitCount = expense.splitAmong.length;
                      const amountPerPerson = expense.amount / splitCount;

                      return (
                        <div key={expense.id} className="flex items-start space-x-4">
                          <Avatar className="mt-0.5">
                            <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                              {paidBy?.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {paidBy?.name} paid <span className="text-splitflow-primary">₹{expense.amount.toLocaleString()}</span>
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
                                {group?.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Split {splitCount} ways • ₹{amountPerPerson.toLocaleString()} per person
                              </span>
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
              <p>Filter for expenses will be implemented in the full version.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settlements">
          <Card>
            <CardContent className="pt-6 text-center py-10">
              <p>Filter for settlements will be implemented in the full version.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Activity;
