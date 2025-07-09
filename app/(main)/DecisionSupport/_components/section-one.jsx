"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Box from "@mui/material/Box";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CalendarCheck, CalendarClock, ChartLine, CircleCheck, ListCheck, Pin, Users } from "lucide-react";
import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line } from 'recharts';
import { useFinancialData } from '../_context/FinancialDataContext';
import { PieChart } from '@mui/x-charts';



function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    // No value to display
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="red" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="red"
        strokeWidth={3}
      />
    </g>
  );
}

const PIE_COLORS = ["#4ade80", "#22d3ee", "#facc15", "#f472b6", "#818cf8"];

function formatDateYYYYMMDD(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const SectionOne = ({accounts, transactions, tasks, AllTransactions, inflows, outflows}) => {
const barChartData = React.useMemo(() => {
  const categoryMap = {};
  tasks.forEach(task => {
    const category = task.taskCategory || "Uncategorized";
    const urgency = task.urgency || "LOW";
    if (!categoryMap[category]) {
      categoryMap[category] = { taskCategory: category, Low: 0, Medium: 0, High: 0 };
    }
    if (urgency === "LOW") categoryMap[category].Low += 1;
    else if (urgency === "MEDIUM") categoryMap[category].Medium += 1;
    else if (urgency === "HIGH") categoryMap[category].High += 1;
  });
  return Object.values(categoryMap);
}, [tasks]);

  
  

  const { selectedAccountId, setSelectedAccountId } = useFinancialData();

    useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId, setSelectedAccountId]);


  const accountTransaction = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

useEffect(() => {
  if (accounts.length > 0 && !selectedAccountId) {
    setSelectedAccountId(accounts[0].id);
  }
}, [accounts, selectedAccountId]);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const utcYear = date.getUTCFullYear();
        const utcMonth = date.getUTCMonth(); // Month is zero-based
        const utcDay = date.getUTCDate();
      
        // Format the date as "Month Day, Year"
        return new Date(Date.UTC(utcYear, utcMonth, utcDay)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    };

// Client Income Summary Line Chart Data filtering
const monthlyRevenue = inflows
  .filter(t => t.accountId === selectedAccountId &&
      t.type === "INCOME" && // Only INCOME transactions
      t.date // Ensure date exists
      )
  .reduce((acc, t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {});

const monthlyRevenueData = Object.entries(monthlyRevenue)
  .map(([key, amount]) => {
    // Format for display, e.g., "Jun 2025"
    const [year, month] = key.split("-");
    const displayMonth = new Date(year, month - 1).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    return {
      month: displayMonth,
      Income: amount,
      _sort: key,
    };
  })
  .sort((a, b) => a._sort.localeCompare(b._sort))
  .map(({ _sort, ...rest }) => rest);


  const todayStr = formatDateYYYYMMDD(new Date());
  const yesterdayStr = formatDateYYYYMMDD(new Date(Date.now() - 86400000));

  const transactionsToday = AllTransactions.filter(
    t => formatDateYYYYMMDD(t.createdAt) === todayStr
  ).length;

  const transactionsYesterday = AllTransactions.filter(
    t => formatDateYYYYMMDD(t.createdAt) === yesterdayStr
  ).length;


  // top 5 CHART DATA
const [barType, setBarType] = useState("INCOME");

const getTopBarCategories = (data) => {
  if (!Array.isArray(data)) return [];
  const map = {};
  data.forEach((t) => {
    const accName = t.account?.name || "Unknown";
    const key = `${t.category}|||${accName}`;
    map[key] = (map[key] || 0) + Number(t.amount);
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => {
      const [category, accountName] = key.split("|||");
      return {
        category,
        accountName,
        amount: value,
      };
    });
};

const barData =
  barType === "INCOME"
    ? getTopBarCategories(inflows)
    : getTopBarCategories(outflows);


















  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
             <div className='flex items-center flex-row justify-between px-2 py-2'>
              <div>
                <CardHeader className="pb-0 px-4">
                  <CardTitle>
                    Clients
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    All clients of the firm
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4">
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{accounts.data.length}</h3>
                </CardContent>
              </div>
                <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Users 
                    className="h-8 w-8 text-cyan-600"
                  />
                </div>
            </div>
          </Card>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className='flex items-center flex-row justify-between px-2 py-2'>
              <div>
                <CardHeader className="pb-0 px-4">
                  <CardTitle>
                    Tasks
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Tasks that need to be done
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4">
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{tasks.length}</h3>
                </CardContent>
              </div>
              <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <ListCheck 
                    className="h-8 w-8 text-amber-500"
                  />
                </div>
            </div>
          </Card>
         
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className='flex items-center flex-row justify-between px-2 py-2'>
              <div>
                <CardHeader className="pb-0 px-4">
                  <CardTitle>
                    Today's Entries
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Entries from all accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4">
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{transactionsToday}</h3>
                </CardContent>
              </div>
              <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CalendarCheck className='h-8 w-8 text-emerald-600'/>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className='flex items-center flex-row justify-between px-2 py-2'>
              <div>
                <CardHeader className="pb-0 px-4">
                  <CardTitle>
                    Yesterday's Entries
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Entries from all accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4">
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{transactionsYesterday}</h3>
                </CardContent>
              </div>
              <div className="h-14 w-14 bg-violet-200 rounded-full flex items-center justify-center text-violet-600">
                <CalendarClock className='h-8 w-8 text-violet-700'/>
              </div>
            </div>
          </Card>
        </div>

        {/* pie chart and bar graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-stretch">
          {/* Bar Chart Card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full min-h-[320px] flex flex-col">
            <CardHeader>
              <CardTitle>
                Top 5 {barType === "INCOME" ? "Income" : "Expense"}
              </CardTitle>
              <CardDescription>
                Account titles across all accounts with largest accumulated amounts.
              </CardDescription>
              <div className="mt-2 flex gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    barType === "INCOME"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500 hover:bg-green-50"
                  }`}
                  onClick={() => setBarType("INCOME")}
                >
                  Income
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    barType === "EXPENSE"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-500 hover:bg-red-50"
                  }`}
                  onClick={() => setBarType("EXPENSE")}
                >
                  Expense
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="w-full h-[320px]"> {/* Increased height */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 14, fill: "#4B5563" }}
                      interval={0}
                      angle={0} // Make labels horizontal
                      textAnchor="middle"
                      height={40} // Adjust for label space
                    />
                    <YAxis
                      tickFormatter={(value) => formatAmount(value)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const { accountName, amount } = payload[0].payload;
                          return (
                            <div className="bg-white rounded shadow px-3 py-2 text-xs">
                              <div className="font-semibold">{accountName}</div>
                              <div>
                                amount: <span className="font-bold">{formatAmount(amount)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill={barType === "INCOME" ? "#4ade80" : "#ef4444"}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Task Summary Card */}
          <Card className="border-none shadow-md overflow-hidden h-full min-h-[320px] flex flex-col">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle>Task Summary</CardTitle>
              <CardDescription>
                Quantity of tasks per account with the respect to urgency levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end pt-6 pb-4">
              <div className="w-full h-[320px]"> {/* Match height with other chart */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={barChartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="taskCategory"
            tick={{ fontSize: 12, fill: '#4B5563' }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="Low" stackId="a" fill="#22c55e" name="Low" />
          <Bar dataKey="Medium" stackId="a" fill="#fde047" name="Medium" />
          <Bar dataKey="High" stackId="a" fill="#ef4444" name="High" />
        </BarChart>
      </ResponsiveContainer>
    </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Financial Summary */}
        <Card className="mb-8 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Client Income Summary</CardTitle>
                <CardDescription>
                  Total income per month
                </CardDescription>
              </div>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}>

                  <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select Account"/>
                  </SelectTrigger>

                  <SelectContent>

                      {accounts.data.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                              {account.name} 
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div
              className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
            >
              {monthlyRevenueData.length > 0 
              ? (<ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyRevenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}/>
                  <YAxis 
                    tickFormatter={(value) => formatAmount(value)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                  formatter={(value) => formatAmount(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Income" 
                    stroke="#4ade80" 
                    dot={false}
                    />
                </LineChart>
              </ResponsiveContainer>) 
              : ( <div className="flex items-center justify-center h-full text-gray-400">
                  No data available for this account.
                </div>)}
              
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

export default SectionOne;
