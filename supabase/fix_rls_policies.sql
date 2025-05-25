-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can manage their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view group members for their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view expenses from their groups" ON public.expenses;
DROP POLICY IF EXISTS "Group members can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view expense splits for their groups" ON public.expense_splits;
DROP POLICY IF EXISTS "Users can insert expense splits for their groups" ON public.expense_splits;

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_groups()
RETURNS SETOF UUID AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_group_admin(group_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.groups 
    WHERE id = group_uuid AND created_by = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can view their groups" ON public.groups
  FOR SELECT USING (auth.uid() = created_by OR public.is_group_member(id));

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members for their groups" ON public.group_members
  FOR SELECT USING (public.is_group_member(group_id));

CREATE POLICY "Group admins can add members" ON public.group_members
  FOR INSERT WITH CHECK (public.is_group_admin(group_id));

-- Expenses policies
CREATE POLICY "Users can view expenses from their groups" ON public.expenses
  FOR SELECT USING (public.is_group_member(group_id));

CREATE POLICY "Group members can create expenses" ON public.expenses
  FOR INSERT WITH CHECK (public.is_group_member(group_id));

-- Expense splits policies
CREATE POLICY "Users can view expense splits for their groups" ON public.expense_splits
  FOR SELECT USING (
    expense_id IN (
      SELECT id FROM public.expenses WHERE public.is_group_member(group_id)
    )
  );

CREATE POLICY "Users can insert expense splits for their groups" ON public.expense_splits
  FOR INSERT WITH CHECK (
    expense_id IN (
      SELECT id FROM public.expenses WHERE public.is_group_member(group_id)
    )
  );

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add role column to group_members if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'group_members' 
    AND column_name = 'role') 
  THEN
    ALTER TABLE public.group_members ADD COLUMN role text DEFAULT 'member';
  END IF;
END $$; 