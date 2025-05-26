import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { useGroups } from "@/hooks/useGroups";
import { useAuth } from "@/contexts/AuthContext";

export function GroupsList() {
  const { data: groups = [], isLoading } = useGroups();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Your Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Your Groups</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/groups">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.slice(0, 3).map((group) => {
            const members = group.group_members || [];
            const totalExpenses = group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
            const isAdmin = group.created_by === user?.id;

            return (
              <div
                key={group.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {members.slice(0, 3).map((member) => (
                      <Avatar key={member.profiles?.id} className="border-2 border-background">
                        <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                          {member.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 3 && (
                      <Avatar className="border-2 border-background">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          +{members.length - 3}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{group.name}</p>
                      {isAdmin && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {members.length} {members.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{totalExpenses.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total expenses</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <h3 className="text-sm font-medium">No groups yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Visit the groups page to create and manage your groups
              </p>
              <Button size="sm" className="mt-4" asChild>
                <Link to="/groups">View Groups</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
