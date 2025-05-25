import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/hooks/useGroups";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const { toast } = useToast();
  const { data: groups = [], isLoading } = useGroups();
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      toast({
        title: "Search functionality",
        description: "Group search will be implemented with real data integration.",
      });
    }
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
            <p className="text-muted-foreground">
              Manage your shared expenses in groups
            </p>
          </div>
          <CreateGroupModal />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groups..."
              className="w-full pl-8"
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-3 w-full bg-gray-200" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                  </div>
                  <div className="bg-gray-200 rounded-full p-2 h-9 w-9"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Manage your shared expenses in groups
          </p>
        </div>
        <CreateGroupModal />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search groups..."
            className="w-full pl-8"
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const members = group.group_members || [];
          const totalExpenses = group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

          return (
            <div 
              key={group.id} 
              className="block cursor-pointer" 
              onClick={() => handleGroupClick(group.id)}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className={`h-3 w-full ${
                  group.category === "home" ? "bg-splitflow-primary" : 
                  group.category === "travel" ? "bg-splitflow-accent" : 
                  "bg-splitflow-secondary"
                }`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      {group.category && (
                        <Badge variant="outline" className="mt-1 capitalize">
                          {group.category}
                        </Badge>
                      )}
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                      )}
                    </div>
                    <div className="bg-muted rounded-full p-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {members.slice(0, 4).map((member) => (
                        <Avatar key={member.profiles?.id} className="border-2 border-background">
                          <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                            {member.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {members.length > 4 && (
                        <Avatar className="border-2 border-background">
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            +{members.length - 4}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{totalExpenses.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Total expenses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center h-60 border rounded-lg p-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No groups yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first group to start tracking shared expenses
            </p>
            <CreateGroupModal>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Group
              </Button>
            </CreateGroupModal>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
