import React from "react";
import { BalanceSummary } from "@/components/dashboard/BalanceSummary";
import { GroupsList } from "@/components/dashboard/GroupsList";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { MonthlySummary } from "@/components/dashboard/MonthlySummary";

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <BalanceSummary />
          <MonthlySummary />
        </div>
        
        <div className="col-span-1 md:col-span-3 space-y-6">
          <RecentExpenses />
          <GroupsList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
