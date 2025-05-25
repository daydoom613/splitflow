
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserBalances, getUserById } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function FriendBalances() {
  const userId = "u1"; // In a real app, this would come from auth context
  const userBalances = getUserBalances(userId);
  const { toast } = useToast();

  const handleSettleUp = (friendName: string, amount: number, isOwed: boolean) => {
    if (isOwed) {
      toast({
        title: "Reminder sent",
        description: `Sent payment reminder to ${friendName} for ₹${amount.toLocaleString()}`,
      });
    } else {
      toast({
        title: "Payment initiated",
        description: `Redirecting to payment gateway to pay ₹${amount.toLocaleString()} to ${friendName}`,
      });
      // In a real app, this would redirect to UPI payment or payment gateway
      setTimeout(() => {
        toast({
          title: "Payment successful",
          description: `Successfully paid ₹${amount.toLocaleString()} to ${friendName}`,
        });
      }, 2000);
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Friend Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userBalances.map((balance) => {
            const friend = getUserById(balance.userId);
            const isPositive = balance.amount > 0;
            const isNegative = balance.amount < 0;
            const absAmount = Math.abs(balance.amount);
            
            // For visualization purposes
            const maxAmount = 2000; // Consider this the full width of the progress bar
            const progressValue = Math.min(absAmount / maxAmount * 100, 100);

            return (
              <div key={balance.userId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-splitflow-light text-splitflow-primary text-xs">
                        {friend?.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{friend?.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSettleUp(friend?.name || '', absAmount, isPositive)}
                    className={isNegative ? "text-destructive hover:text-destructive" : "text-splitflow-secondary hover:text-splitflow-dark"}
                  >
                    {isPositive && "Remind"}
                    {isNegative && "Pay"}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  {isPositive && <ArrowLeft className="h-3 w-3 text-splitflow-secondary" />}
                  {isNegative && <ArrowRight className="h-3 w-3 text-destructive" />}
                  <Progress 
                    value={progressValue} 
                    className={`h-2 ${isPositive ? "bg-splitflow-light" : "bg-red-50"}`}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  {isPositive && (
                    <>
                      <span className="text-muted-foreground">Owes you</span>
                      <span className="font-medium text-splitflow-secondary">₹{absAmount.toLocaleString()}</span>
                    </>
                  )}
                  {isNegative && (
                    <>
                      <span className="text-muted-foreground">You owe</span>
                      <span className="font-medium text-destructive">₹{absAmount.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {userBalances.length === 0 && (
            <div className="flex items-center justify-center h-40 text-center">
              <p className="text-sm text-muted-foreground">No friend balances to show.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
