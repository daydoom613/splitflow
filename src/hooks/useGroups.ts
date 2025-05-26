import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

      // First get all groups where the user is a member
      const { data: userGroups, error: groupError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (groupError) throw groupError;
      
      if (!userGroups?.length) return [];

      // Then fetch full details of those groups including all members
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members (
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
        .in('id', userGroups.map(g => g.group_id));

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

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate('/groups');
    },
  });
}
