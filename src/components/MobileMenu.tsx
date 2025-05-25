
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Users,
  Calendar,
  Menu,
  Settings,
  User,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export function MobileMenu() {
  const { toast } = useToast();
  
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You would be logged out here in the full app.",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-6 mt-4">
            <img 
              src="/logo.svg" 
              alt="Splitflow" 
              className="h-8 w-8 mr-2" 
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%230099ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z'%3E%3C/path%3E%3Cpath d='M7 7h.01'%3E%3C/path%3E%3C/svg%3E";
              }}
            />
            <h2 className="text-xl font-bold text-splitflow-primary">Splitflow</h2>
          </div>
          
          <nav className="space-y-4">
            <Link to="/" className="flex items-center py-2 px-3 rounded-md hover:bg-muted">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/groups" className="flex items-center py-2 px-3 rounded-md hover:bg-muted">
              <Users className="mr-2 h-4 w-4" />
              <span>Groups</span>
            </Link>
            <Link to="/activity" className="flex items-center py-2 px-3 rounded-md hover:bg-muted">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Activity</span>
            </Link>
          </nav>
          
          <div className="mt-auto mb-4">
            <div className="flex items-center justify-between px-3 py-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-splitflow-light text-splitflow-primary">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
