import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Receipt, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/hooks/useGroups";
import { useCreateExpense } from "@/hooks/useExpenses";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AddExpenseModalProps {
  children?: React.ReactNode;
  groupId?: string;
}

const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "transport", label: "Transportation" },
  { value: "housing", label: "Housing" },
  { value: "utilities", label: "Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "travel", label: "Travel" },
  { value: "health", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" }
] as const;

export function AddExpenseModal({ children, groupId }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groupId || "");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const { toast } = useToast();
  const { data: groups = [] } = useGroups();
  const createExpenseMutation = useCreateExpense();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setDescription("");
      setAmount("");
      if (!groupId) setSelectedGroup("");
      setSelectedMembers([]);
      setCategory("");
    }
  }, [open, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !selectedGroup || selectedMembers.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select at least one member.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        groupId: selectedGroup,
        description: description.trim(),
        amount: parseFloat(amount),
        category: category || undefined,
        splitAmong: selectedMembers,
      });

      toast({
        title: "Expense added",
        description: `Added ₹${parseFloat(amount).toLocaleString()} for "${description}"`,
      });

      setOpen(false);
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error adding expense",
        description: "Failed to add the expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedGroupData = groups.find(g => g.id === (selectedGroup || groupId));
  const groupMembers = selectedGroupData?.group_members || [];

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllMembers = () => {
    if (selectedMembers.length === groupMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(groupMembers.map(member => member.user_id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-splitflow-primary hover:bg-splitflow-dark">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add an expense to split among group members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <Receipt className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          {!groupId && (
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedGroup || groupId) && groupMembers.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Split With</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAllMembers}
                >
                  {selectedMembers.length === groupMembers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <ScrollArea className="h-[120px] border rounded-md p-2">
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div key={member.user_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.user_id}
                        checked={selectedMembers.includes(member.user_id)}
                        onCheckedChange={() => toggleMember(member.user_id)}
                      />
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-splitflow-light text-splitflow-primary text-xs">
                            {member.profiles.full_name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Label
                          htmlFor={member.user_id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {member.profiles.full_name}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedMembers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Splitting ₹{amount ? (parseFloat(amount) / selectedMembers.length).toFixed(2) : '0.00'} per person
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-splitflow-primary hover:bg-splitflow-dark"
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
