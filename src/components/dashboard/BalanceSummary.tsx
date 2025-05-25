
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";

export function BalanceSummary() {
  const { user } = useAuth();
  const { data: expenses = [] } = useExpenses();

  // Calculate balances
  const { totalOwed, totalOwing, netBalance } = React.useMemo(() => {
    let totalOwed = 0;
    let totalOwing = 0;

    expenses.forEach(expense => {
      expense.expense_splits.forEach(split => {
        if (split.user_id === user?.id && !split.settled) {
          if (expense.paid_by === user?.id) {
            // User paid, others owe them
            totalOwed += (expense.amount - split.amount);
          } else {
            // User owes someone else
            totalOwing += split.amount;
          }
        }
      });
    });

    return {
      totalOwed,
      totalOwing,
      netBalance: totalOwed - totalOwing
    };
  }, [expenses, user?.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">You are owed</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ₹{totalOwed.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            From your friends
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">You owe</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            ₹{totalOwing.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            To your friends
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Math.abs(netBalance).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {netBalance >= 0 ? 'You are owed overall' : 'You owe overall'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
