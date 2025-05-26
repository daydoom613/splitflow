import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroups, useDeleteGroup } from "@/hooks/useGroups";
import { useExpenses } from "@/hooks/useExpenses";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { ExpensesList } from "@/components/ExpensesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Group() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: groups = [], isLoading: isLoadingGroup } = useGroups();
  const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses();
  const { user } = useAuth();
  const deleteGroup = useDeleteGroup();
  const { toast } = useToast();

  const group = groups.find(g => g.id === groupId);
  const groupExpenses = expenses.filter(e => e.group_id === groupId);
  const isAdmin = group?.created_by === user?.id;

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup.mutateAsync(groupId);
      toast({
        title: "Group deleted",
        description: "The group has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the group. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingGroup || isLoadingExpenses) {
    return <GroupSkeleton />;
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h1 className="text-2xl font-bold mb-2">Group not found</h1>
        <p className="text-muted-foreground">This group doesn't exist or you don't have access to it.</p>
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

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground mb-2">{group.description}</p>
          )}
          <div className="flex items-center space-x-2">
            {group.category && (
              <Badge variant="secondary" className="capitalize">
                {group.category}
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{group.group_members?.length || 0} members</span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && <AddMemberModal groupId={groupId} />}
          {isAdmin ? (
            <AddExpenseModal groupId={groupId} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Only group admin can add expenses
            </p>
          )}
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon"
                  className="h-10 w-10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Group</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this group? This action cannot be undone.
                    All expenses and splits associated with this group will be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGroup}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

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

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesList expenses={groupExpenses} />
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {group.group_members?.map((member) => {
                  const isGroupAdmin = group.created_by === member.user_id;
                  const initials = member.profiles.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();

                  console.log('Member:', {
                    name: member.profiles.full_name,
                    isAdmin: isGroupAdmin,
                    userId: member.user_id,
                    groupCreator: group.created_by
                  });

                  return (
                    <div key={member.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Avatar className="h-8 w-8 bg-splitflow-light text-splitflow-primary">
                            <AvatarFallback>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{member.profiles.full_name}</p>
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                              {isGroupAdmin ? 'ADMIN' : 'MEMBER'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[100px]" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
      </div>
    </div>
  );
} 