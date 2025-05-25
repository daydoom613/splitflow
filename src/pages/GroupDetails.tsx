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

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data: groups = [], isLoading } = useGroups();
  const group = groups.find(g => g.id === groupId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-7 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-100 rounded mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

  const totalExpenses = group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const members = group.group_members || [];

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
        
        <AddExpenseModal groupId={groupId}>
          <Button size="lg" className="bg-splitflow-primary hover:bg-splitflow-dark">
            <Plus className="mr-2 h-4 w-4" />
            Add Group Expense
          </Button>
        </AddExpenseModal>
      </div>

      {group.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{group.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Members</CardTitle>
            <AddMemberModal groupId={groupId}>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </AddMemberModal>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Group Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Total Expenses</dt>
                <dd className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Member Count</dt>
                <dd className="text-2xl font-bold">{members.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Created On</dt>
                <dd className="text-2xl font-bold">
                  {new Date(group.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupDetails; 