import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGroups, useDeleteGroup } from "@/hooks/useGroups";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function DeleteGroupDropdown() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { data: groups = [] } = useGroups();
  const { user } = useAuth();
  const deleteGroup = useDeleteGroup();
  const { toast } = useToast();

  // Filter groups where user is admin
  const adminGroups = groups.filter(group => group.created_by === user?.id);

  const handleDelete = async () => {
    if (!selectedGroup) return;

    try {
      await deleteGroup.mutateAsync(selectedGroup);
      toast({
        title: "Group deleted",
        description: "The group has been successfully deleted.",
      });
      setIsAlertOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the group. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (adminGroups.length === 0) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Group
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {adminGroups.map((group) => (
            <DropdownMenuItem
              key={group.id}
              onClick={() => {
                setSelectedGroup(group.id);
                setIsAlertOpen(true);
              }}
            >
              {group.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this group? This action cannot be undone.
              All expenses and splits associated with this group will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedGroup(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 