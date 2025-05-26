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
import { useAuth } from "@/contexts/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddExpenseModalProps {
  children?: React.ReactNode;
  groupId?: string;
}

type SplitType = 'equal' | 'ratio';

interface MemberSplit {
  userId: string;
  name: string;
  value: number; // ratio value
  amount: number; // calculated amount
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
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [memberSplits, setMemberSplits] = useState<MemberSplit[]>([]);
  
  const { toast } = useToast();
  const { data: groups = [] } = useGroups();
  const createExpenseMutation = useCreateExpense();
  const { user } = useAuth();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setDescription("");
      setAmount("");
      if (!groupId) setSelectedGroup("");
      setSelectedMembers([]);
      setCategory("");
      setSplitType("equal");
      setMemberSplits([]);
    }
  }, [open, groupId]);

  // Update member splits when members are selected or split type changes
  React.useEffect(() => {
    const selectedGroupData = groups.find(g => g.id === (selectedGroup || groupId));
    const members = selectedGroupData?.group_members || [];
    const selectedMemberDetails = members.filter(m => selectedMembers.includes(m.user_id));
    
    if (selectedMemberDetails.length === 0) {
      setMemberSplits([]);
      return;
    }

    const parsedAmount = parseFloat(amount) || 0;

    switch (splitType) {
      case 'equal':
        const equalShare = parsedAmount / selectedMemberDetails.length;
        setMemberSplits(selectedMemberDetails.map(member => ({
          userId: member.user_id,
          name: member.profiles.full_name,
          value: 1, // Everyone has equal ratio
          amount: equalShare
        })));
        break;

      case 'ratio':
        // Maintain existing ratios if possible, otherwise use 1:1:1...
        const existingRatios = new Map(memberSplits.map(m => [m.userId, m.value]));
        const members = selectedMemberDetails.map(member => ({
          userId: member.user_id,
          name: member.profiles.full_name,
          value: existingRatios.get(member.user_id) || 1
        }));
        const totalRatio = members.reduce((sum, m) => sum + m.value, 0);
        
        setMemberSplits(members.map(member => ({
          ...member,
          amount: (parsedAmount * member.value) / totalRatio
        })));
        break;
    }
  }, [selectedMembers, splitType, amount, groups, selectedGroup, groupId]);

  const updateMemberSplit = (userId: string, newValue: number) => {
    setMemberSplits(prev => {
      const updatedSplits = prev.map(split => 
        split.userId === userId ? { ...split, value: newValue } : split
      );

      const parsedAmount = parseFloat(amount) || 0;
      const totalRatio = updatedSplits.reduce((sum, split) => sum + split.value, 0);
      
      return updatedSplits.map(split => ({
        ...split,
        amount: (parsedAmount * split.value) / totalRatio
      }));
    });
  };

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

    // Validate that all ratios are positive numbers when using ratio split
    if (splitType === 'ratio') {
      const hasInvalidRatio = memberSplits.some(split => split.value <= 0);
      if (hasInvalidRatio) {
        toast({
          title: "Invalid split",
          description: "All ratios must be positive numbers.",
          variant: "destructive",
        });
        return;
      }
    }

    // Ensure the payer is included in the splits
    if (!selectedMembers.includes(user?.id || '')) {
      toast({
        title: "Invalid split",
        description: "The person who paid must be included in the split.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedAmount = parseFloat(amount);
      const splits = memberSplits.map(split => ({
        userId: split.userId,
        amount: split.amount
      }));

      // Validate total split amount
      const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplit - parsedAmount) > 0.01) {
        toast({
          title: "Invalid split",
          description: "The total split amount must equal the expense amount.",
          variant: "destructive",
        });
        return;
      }

      const result = await createExpenseMutation.mutateAsync({
        groupId: selectedGroup,
        description: description.trim(),
        amount: parsedAmount,
        category: category || undefined,
        splitAmong: splits
      });

      if (result) {
        toast({
          title: "Expense added",
          description: `Added ₹${parsedAmount.toLocaleString()} for "${description}"`,
        });
        setOpen(false);
      }
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error adding expense",
        description: error?.message || "Failed to add the expense. Please try again.",
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

          <div className="space-y-2">
            <Label>Split Type</Label>
            <RadioGroup
              value={splitType}
              onValueChange={(value: SplitType) => setSplitType(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="equal" />
                <Label htmlFor="equal">Equal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ratio" id="ratio" />
                <Label htmlFor="ratio">Ratio</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Split With</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleAllMembers}
                className="h-auto py-1"
              >
                {selectedMembers.length === groupMembers.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {groupMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={member.user_id}
                        checked={selectedMembers.includes(member.user_id)}
                        onCheckedChange={() => toggleMember(member.user_id)}
                      />
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.profiles.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor={member.user_id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {member.profiles.full_name}
                          {member.user_id === user?.id && " (You)"}
                        </label>
                      </div>
                    </div>
                    {selectedMembers.includes(member.user_id) && splitType !== 'equal' && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={memberSplits.find(s => s.userId === member.user_id)?.value || 0}
                          onChange={(e) => updateMemberSplit(member.user_id, parseFloat(e.target.value) || 0)}
                          className="w-20 text-right"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            {amount && selectedMembers.length > 0 && (
              <div className="mt-2 space-y-1">
                {memberSplits.map(split => (
                  <div key={split.userId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{split.name}</span>
                    <span>₹{split.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
