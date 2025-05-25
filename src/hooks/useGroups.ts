import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Group {
  id: string;
  name: string;
  description?: string;
  category?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  group_members?: Array<{
    user_id: string;
    profiles: {
      id: string;
      full_name: string;
      email: string;
    };
  }>;
  expenses?: Array<{
    id: string;
    amount: number;
  }>;
}

export function useGroups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner (
            user_id,
            profiles (
              id,
              full_name,
              email
            )
          ),
          expenses (
            id,
            amount
          )
        `)
        .eq('group_members.user_id', user.id);

      if (error) throw error;
      return data as Group[];
    },
    enabled: !!user,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, description, category }: { name: string; description?: string; category?: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating group with:', { name, description, category, userId: user.id });

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          category,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        throw groupError;
      }

      console.log('Group created successfully:', group);

      // Add the creator as a member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) {
        console.error('Error adding member to group:', memberError);
        throw memberError;
      }

      console.log('Added creator as member successfully');

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
