import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Expense {
  id: string;
  group_id: string;
  paid_by: string;
  description: string;
  amount: number;
  category?: string;
  date: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  groups: {
    name: string;
  };
  expense_splits: Array<{
    user_id: string;
    amount: number;
    settled: boolean;
  }>;
}

export function useExpenses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the user's groups
      const { data: userGroups, error: groupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (groupsError) throw groupsError;
      if (!userGroups || userGroups.length === 0) return [];

      const groupIds = userGroups.map(g => g.group_id);

      // Then get expenses for those groups
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          profiles!expenses_paid_by_fkey (
            full_name,
            email
          ),
          groups (
            name
          ),
          expense_splits (
            user_id,
            amount,
            settled
          )
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      groupId, 
      description, 
      amount, 
      category, 
      splitAmong 
    }: { 
      groupId: string; 
      description: string; 
      amount: number; 
      category?: string; 
      splitAmong: Array<{ userId: string; amount: number }>; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        // Create the expense
        const { data: expense, error: expenseError } = await supabase
          .from('expenses')
          .insert({
            group_id: groupId,
            paid_by: user.id,
            description,
            amount,
            category,
          })
          .select()
          .single();

        if (expenseError) throw expenseError;

        // Create expense splits using the provided split amounts
        const splits = splitAmong.map(split => ({
          expense_id: expense.id,
          user_id: split.userId,
          amount: split.amount,
          settled: false
        }));

        // Also add a split for the payer
        const payerSplit = splitAmong.find(split => split.userId === user.id);
        if (!payerSplit) {
          splits.push({
            expense_id: expense.id,
            user_id: user.id,
            amount: 0, // The payer's share is handled through others' splits
            settled: true // Payer's split is always settled
          });
        }

        const { error: splitsError } = await supabase
          .from('expense_splits')
          .insert(splits);

        if (splitsError) {
          // If splits creation fails, delete the expense
          await supabase.from('expenses').delete().eq('id', expense.id);
          throw splitsError;
        }

        return expense;
      } catch (error: any) {
        console.error('Error in expense creation:', error);
        throw new Error(error.message || 'Failed to create expense');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
