
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  totalExpenses: number;
  createdAt: string;
  category?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  splitAmong: string[];
  groupId: string;
  category?: string;
}

export interface Balance {
  userId: string;
  amount: number;
}

export const users: User[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
    initials: "JD",
  },
  {
    id: "u2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "",
    initials: "JS",
  },
  {
    id: "u3",
    name: "Alex Wong",
    email: "alex@example.com",
    avatar: "",
    initials: "AW",
  },
  {
    id: "u4",
    name: "Priya Patel",
    email: "priya@example.com",
    avatar: "",
    initials: "PP",
  },
];

export const groups: Group[] = [
  {
    id: "g1",
    name: "Apartment 304",
    members: ["u1", "u2", "u3"],
    totalExpenses: 5600,
    createdAt: "2023-09-15",
    category: "Home",
  },
  {
    id: "g2",
    name: "Goa Trip",
    members: ["u1", "u2", "u3", "u4"],
    totalExpenses: 12400,
    createdAt: "2023-11-20",
    category: "Travel",
  },
  {
    id: "g3",
    name: "Dinner Club",
    members: ["u1", "u4"],
    totalExpenses: 2800,
    createdAt: "2023-12-05",
    category: "Food",
  },
];

export const expenses: Expense[] = [
  {
    id: "e1",
    description: "Monthly Rent",
    amount: 3000,
    paidBy: "u1",
    date: "2023-12-01",
    splitAmong: ["u1", "u2", "u3"],
    groupId: "g1",
    category: "Housing",
  },
  {
    id: "e2",
    description: "Electricity Bill",
    amount: 600,
    paidBy: "u2",
    date: "2023-12-02",
    splitAmong: ["u1", "u2", "u3"],
    groupId: "g1",
    category: "Utilities",
  },
  {
    id: "e3",
    description: "Hotel Booking",
    amount: 8400,
    paidBy: "u3",
    date: "2023-11-20",
    splitAmong: ["u1", "u2", "u3", "u4"],
    groupId: "g2",
    category: "Accommodation",
  },
  {
    id: "e4",
    description: "Scuba Diving",
    amount: 4000,
    paidBy: "u4",
    date: "2023-11-22",
    splitAmong: ["u1", "u2", "u3", "u4"],
    groupId: "g2",
    category: "Activity",
  },
  {
    id: "e5",
    description: "Italian Dinner",
    amount: 1800,
    paidBy: "u1",
    date: "2023-12-05",
    splitAmong: ["u1", "u4"],
    groupId: "g3",
    category: "Food",
  },
  {
    id: "e6",
    description: "Movie Night",
    amount: 1000,
    paidBy: "u4",
    date: "2023-12-10",
    splitAmong: ["u1", "u4"],
    groupId: "g3",
    category: "Entertainment",
  },
];

export const balances: Record<string, Balance[]> = {
  u1: [
    { userId: "u2", amount: 1000 }, // u2 owes u1
    { userId: "u3", amount: 800 }, // u3 owes u1
    { userId: "u4", amount: -300 }, // u1 owes u4
  ],
  u2: [
    { userId: "u1", amount: -1000 }, // u2 owes u1
    { userId: "u3", amount: 200 }, // u3 owes u2
    { userId: "u4", amount: -600 }, // u2 owes u4
  ],
  u3: [
    { userId: "u1", amount: -800 }, // u3 owes u1
    { userId: "u2", amount: -200 }, // u3 owes u2
    { userId: "u4", amount: 1600 }, // u4 owes u3
  ],
  u4: [
    { userId: "u1", amount: 300 }, // u1 owes u4
    { userId: "u2", amount: 600 }, // u2 owes u4
    { userId: "u3", amount: -1600 }, // u4 owes u3
  ],
};

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getGroupById = (id: string): Group | undefined => {
  return groups.find(group => group.id === id);
};

export const getExpensesByGroupId = (groupId: string): Expense[] => {
  return expenses.filter(expense => expense.groupId === groupId);
};

export const getUserBalances = (userId: string): Balance[] => {
  return balances[userId] || [];
};

export const getNetBalance = (userId: string): number => {
  const userBalances = balances[userId] || [];
  return userBalances.reduce((sum, balance) => sum + balance.amount, 0);
};
