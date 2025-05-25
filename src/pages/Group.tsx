import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroups } from "@/hooks/useGroups";
import { useExpenses } from "@/hooks/useExpenses";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { ExpensesList } from "@/components/ExpensesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useAuth } from "@/contexts/AuthContext";

export default function Group() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: groups = [], isLoading: isLoadingGroup } = useGroups();
  const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses();
  const { user } = useAuth();

  const group = groups.find(g => g.id === groupId);
  const groupExpenses = expenses.filter(e => e.group_id === groupId);
  const isAdmin = group?.created_by === user?.id;

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
          <AddExpenseModal groupId={groupId} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
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
                  return (
                    <div key={member.user_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                            {member.profiles.full_name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{member.profiles.full_name}</p>
                            {isGroupAdmin && (
                              <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
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