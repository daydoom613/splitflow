import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AddMemberModalProps {
  groupId: string;
  children?: React.ReactNode;
}

export function AddMemberModal({ groupId, children }: AddMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log('Searching for email:', trimmedEmail);

      // First try to find user in profiles
      const { data: existingProfile, error: profileError } = await supabase
        .rpc('find_user_by_email', { 
          email_to_find: trimmedEmail 
        });

      if (profileError) {
        throw profileError;
      }

      let userProfile = existingProfile?.[0];

      // If no profile found, check auth.users
      if (!userProfile) {
        const { data: authUser, error: authError } = await supabase
          .rpc('get_user_by_email', { 
            search_email: trimmedEmail 
          });

        if (authError) {
          throw authError;
        }

        if (!authUser?.[0]) {
          toast({
            title: "User not found",
            description: "No user found with this email address. They need to sign up first.",
            variant: "destructive",
          });
          return;
        }

        // Create profile for the auth user
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser[0].id,
            email: trimmedEmail,
            full_name: trimmedEmail.split('@')[0], // Use part before @ as temporary name
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createProfileError) {
          throw createProfileError;
        }

        userProfile = newProfile;
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (memberCheckError) {
        throw memberCheckError;
      }

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "This user is already a member of the group.",
          variant: "destructive",
        });
        return;
      }

      // Add user to group as a regular member
      const { error: addError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userProfile.id,
          role: 'member'
        });

      if (addError) {
        throw addError;
      }

      toast({
        title: "Member added",
        description: `${userProfile.full_name || userProfile.email} has been added to the group.`,
      });

      // Reset form and close modal
      setEmail("");
      setOpen(false);

      // Refresh groups data
      queryClient.invalidateQueries({ queryKey: ['groups'] });

    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Group Member</DialogTitle>
          <DialogDescription>
            Add a member to your group by entering their email address. They must have already signed up for Splitflow.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-splitflow-primary hover:bg-splitflow-dark"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 