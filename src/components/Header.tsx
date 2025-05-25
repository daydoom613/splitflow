
import React from "react";
import { MainNav } from "./MainNav";
import { MobileMenu } from "./MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserNav } from "./UserNav";
import { AddExpenseModal } from "./AddExpenseModal";

export function Header() {
  const isMobile = useIsMobile();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4 flex items-center">
          <img 
            src="/logo.svg" 
            alt="Splitflow" 
            className="h-8 w-8 mr-2" 
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%230099ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z'%3E%3C/path%3E%3Cpath d='M7 7h.01'%3E%3C/path%3E%3C/svg%3E";
            }}
          />
          <h1 className="text-xl font-bold text-splitflow-primary">Splitflow</h1>
        </div>
        
        {!isMobile && (
          <div className="mx-6 flex-1">
            <MainNav />
          </div>
        )}
        
        <div className="ml-auto flex items-center space-x-4">
          <AddExpenseModal />
          
          {isMobile ? <MobileMenu /> : <UserNav />}
        </div>
      </div>
    </div>
  );
}
