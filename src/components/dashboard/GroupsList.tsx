
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/hooks/useGroups";

export function GroupsList() {
  const { toast } = useToast();
  const { data: groups = [], isLoading } = useGroups();

  const handleGroupClick = (groupId: string, groupName: string) => {
    console.log('Opening group:', groupId, groupName);
    toast({
      title: "Group details",
      description: `Opening ${groupName} - Group details page will be implemented soon.`,
    });
  };

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

            return (
              <div
                key={group.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleGroupClick(group.id, group.name)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {members.slice(0, 3).map((member) => (
                      <Avatar key={member.profiles?.id} className="border-2 border-background h-8 w-8">
                        <AvatarFallback className="bg-splitflow-light text-splitflow-primary text-xs">
                          {member.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 3 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                        +{members.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {members.length} members • ₹{totalExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm text-muted-foreground">
                You're not in any groups yet.
              </p>
              <CreateGroupModal>
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Group
                </Button>
              </CreateGroupModal>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
