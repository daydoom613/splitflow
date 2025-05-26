import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExpensesList } from "@/components/ExpensesList";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data: groups = [], isLoading: isLoadingGroup } = useGroups();
  const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses();
  const { user } = useAuth();
  const group = groups.find(g => g.id === groupId);
  const groupExpenses = expenses.filter(e => e.group_id === groupId);
  const isAdmin = group?.created_by === user?.id;

  if (isLoadingGroup || isLoadingExpenses) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-7 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-100 rounded mt-2"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-7 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-100 rounded mt-2"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
            <div className="h-7 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-100 rounded mt-2"></div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Group not found</h2>
        <p className="text-muted-foreground">This group doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate("/groups")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>
      </div>
    );
  }

  const totalExpenses = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate balances for each member
  const memberBalances = React.useMemo(() => {
    const balances: { [key: string]: { paid: number; owes: number; name: string } } = {};

    // Initialize balances for all members
    group.group_members?.forEach(member => {
      balances[member.user_id] = {
        paid: 0,
        owes: 0,
        name: member.profiles.full_name
      };
    });

    // Calculate paid amounts and owed amounts
    groupExpenses.forEach(expense => {
      // Add amount paid
      if (balances[expense.paid_by]) {
        balances[expense.paid_by].paid += expense.amount;
      }

      // Add split amounts
      expense.expense_splits?.forEach(split => {
        if (balances[split.user_id]) {
          balances[split.user_id].owes += split.amount;
        }
      });
    });

    return balances;
  }, [groupExpenses, group.group_members]);

  // Calculate debt matrix between members
  const debtMatrix = React.useMemo(() => {
    const matrix: { [key: string]: { [key: string]: number } } = {};
    
    // Initialize matrix with all members
    group.group_members?.forEach(member1 => {
      matrix[member1.user_id] = {};
      group.group_members?.forEach(member2 => {
        if (member1.user_id !== member2.user_id) {
          matrix[member1.user_id][member2.user_id] = 0;
        }
      });
    });

    // Calculate debts from expenses
    groupExpenses.forEach(expense => {
      const paidBy = expense.paid_by;
      const totalAmount = expense.amount;
      const splits = expense.expense_splits || [];
      
      splits.forEach(split => {
        if (split.user_id !== paidBy) {
          // Add to what they owe the payer
          matrix[split.user_id][paidBy] = (matrix[split.user_id][paidBy] || 0) + split.amount;
          // Subtract from what the payer owes them
          matrix[paidBy][split.user_id] = (matrix[paidBy][split.user_id] || 0) - split.amount;
        }
      });
    });

    return matrix;
  }, [groupExpenses, group.group_members]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/groups")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            {group.category && (
              <Badge variant="outline" className="mt-1 capitalize">
                {group.category}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAdmin && <AddMemberModal groupId={groupId} />}
        <AddExpenseModal groupId={groupId}>
          <Button size="lg" className="bg-splitflow-primary hover:bg-splitflow-dark">
            <Plus className="mr-2 h-4 w-4" />
            Add Group Expense
          </Button>
        </AddExpenseModal>
        </div>
      </div>

      {group.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{group.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total group spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const userBalance = memberBalances[user?.id || ""];
              if (!userBalance) return null;

              const netBalance = userBalance.paid - userBalance.owes;
              const isPositive = netBalance > 0;

              return (
                <>
                  <div className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "+" : ""}₹{netBalance.toLocaleString()}
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-muted-foreground">
                      You paid: ₹{userBalance.paid.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your share: ₹{userBalance.owes.toLocaleString()}
                    </p>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Members' Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(memberBalances).map(([userId, balance]) => {
                const netBalance = balance.paid - balance.owes;
                const isPositive = netBalance > 0;
                const isCurrentUser = userId === user?.id;

                return (
                  <div key={userId} className="flex justify-between items-center text-sm">
                    <span className={isCurrentUser ? "font-medium" : ""}>
                      {balance.name}
                    </span>
                    <span className={`${isCurrentUser ? "font-medium" : ""} ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}>
                      {isPositive ? "+" : ""}₹{netBalance.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesList expenses={groupExpenses} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Debt Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Member</TableHead>
                    {group.group_members?.map(member => (
                      <TableHead key={member.user_id} className="text-right">
                        {member.profiles.full_name.split(' ')[0]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.group_members?.map(member1 => (
                    <TableRow key={member1.user_id}>
                      <TableCell className="font-medium">
                        {member1.profiles.full_name}
                        {member1.user_id === user?.id && " (You)"}
                      </TableCell>
                      {group.group_members?.map(member2 => (
                        <TableCell key={member2.user_id} className="text-right">
                          {member1.user_id === member2.user_id ? (
                            "-"
                          ) : (
                            <>
                              {debtMatrix[member1.user_id][member2.user_id] > 0 ? (
                                <span className="text-red-600">
                                  ₹{debtMatrix[member1.user_id][member2.user_id].toLocaleString()}
                                </span>
                              ) : debtMatrix[member1.user_id][member2.user_id] < 0 ? (
                                <span className="text-green-600">
                                  ₹{Math.abs(debtMatrix[member1.user_id][member2.user_id]).toLocaleString()}
                                </span>
                              ) : (
                                "₹0"
                              )}
                            </>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-4">
              • Red numbers show how much you owe to others<br />
              • Green numbers show how much others owe you
            </p>
          </CardContent>
        </Card>
      </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Members</CardTitle>
          {isAdmin && (
            <AddMemberModal groupId={groupId}>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </AddMemberModal>
          )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            {group.group_members?.map((member) => (
                <div key={member.profiles.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                        {member.profiles.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default GroupDetails; 