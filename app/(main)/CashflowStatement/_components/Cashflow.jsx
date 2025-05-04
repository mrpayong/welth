// 'use client';

// import { useRouter } from 'next/navigation';
// import { useMemo, useState } from 'react';
// import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
// import {
//     Card,
//     CardContent,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from '@/components/ui/card';

// function CashflowList({ cashflows }) {
//     const router = useRouter(); // For navigation
//     const [sortConfig, setSortConfig] = useState({
//         field: 'createdAt',
//         direction: 'desc',
//     });

//     const handleSort = (field) => {
//         setSortConfig((current) => ({
//             field,
//             direction:
//                 current.field === field && current.direction === 'asc'
//                     ? 'desc'
//                     : 'asc',
//         }));
//     };

//     const sortedCashflows = useMemo(() => {
//         let result = [...cashflows];

//         // Apply Sorting
//         result.sort((a, b) => {
//             let comparison = 0;

//             switch (sortConfig.field) {
//                 case 'createdAt':
//                     comparison = new Date(a.createdAt) - new Date(b.createdAt);
//                     break;

//                 default:
//                     comparison = 0;
//             }

//             return sortConfig.direction === 'asc' ? comparison : -comparison;
//         });

//         return result;
//     }, [cashflows, sortConfig]);

//     if (!cashflows || cashflows.length === 0) {
//         return <p>No cashflow statements found.</p>;
//     }

//     return (
//         <div className="p-4">
//             <div
//                 className="cursor-pointer flex items-center gap-2 mb-4"
//                 onClick={() => handleSort('createdAt')}
//             >
//                 <span>Sort Date Created</span>
//                 {sortConfig.field === 'createdAt' &&
//                     (sortConfig.direction === 'asc' ? (
//                         <ArrowUpWideNarrow className="h-4 w-4" />
//                     ) : (
//                         <ArrowDownWideNarrow className="h-4 w-4" />
//                     ))}
//             </div>
//             {sortedCashflows.map((cfs) => (
//                 <div
//                     key={cfs.id}
//                     onClick={() => router.push(`/CashflowStatement/${cfs.accountId}/${cfs.id}`)} // Navigate to cashflow details
//                     className="mb-2"
//                 >
//                     <Card className="p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-gray-100 flex flex-col sm:flex-row justify-between">
//                         <CardHeader className="flex-1">
//                             <CardTitle className="text-base sm:text-lg">
//                                 {cfs.account.name}
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="mt-2 sm:mt-0 flex-1">
//                             <span className="text-sm">Cashflow ID: {cfs.id}</span>
//                         </CardContent>
//                         <CardFooter className="mt-2 sm:mt-0 flex-1">
//                             <span className="text-xs sm:text-sm">
//                                 Created On: {new Date(cfs.createdAt).toLocaleDateString()}
//                             </span>
//                         </CardFooter>
//                     </Card>
//                 </div>
//             ))}
//         </div>
//     );
// }

// export default CashflowList;













// // The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";
// import {
//   Calendar,
//   ChevronDown,
//   Download,
//   Filter,
//   LineChart,
//   Plus,
//   RefreshCcw,
// } from "lucide-react";

// const CashflowList = (cashflows) => {
//   const [activeTab, setActiveTab] = useState("daily");

//   const timeframes = [
//     { id: "daily", label: "Daily", icon: Calendar },
//     { id: "weekly", label: "Weekly", icon: Calendar },
//     { id: "monthly", label: "Monthly", icon: Calendar },
//     { id: "annual", label: "Annual", icon: Calendar },
//     { id: "fiscal", label: "Fiscal", icon: Calendar },
//   ];

//   console.log("Cashflow Data:", cashflows);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Cashflow Management
//             </h1>
//             <p className="text-gray-600 mt-2">
//               Track and analyze your financial flows
//             </p>
//           </div>
//           <div className="flex space-x-4">
//             <Button
//               variant="outline"
//               className="border-blue-200 text-blue-700 hover:bg-blue-50 !rounded-button whitespace-nowrap cursor-pointer"
//             >
//               <Filter className="w-4 h-4 mr-2" />
//               Filters
//             </Button>
//             <Button
//               variant="outline"
//               className="border-blue-200 text-blue-700 hover:bg-blue-50 !rounded-button whitespace-nowrap cursor-pointer"
//             >
//               <Download className="w-4 h-4 mr-2" />
//               Export
//             </Button>
//             <Button className="bg-blue-600 hover:bg-blue-700 text-white !rounded-button whitespace-nowrap cursor-pointer">
//               <Plus className="w-4 h-4 mr-2" />
//               New Record
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
//             <CardHeader>
//               <CardTitle className="text-lg">Total Income</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">$128,450</div>
//               <div className="flex items-center mt-2 text-blue-100">
//                 <LineChart className="w-4 h-4 mr-1" />
//                 <span>+12.5% vs last period</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
//             <CardHeader>
//               <CardTitle className="text-lg">Total Expenses</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">$85,240</div>
//               <div className="flex items-center mt-2 text-amber-100">
//                 <LineChart className="w-4 h-4 mr-1" />
//                 <span>-8.3% vs last period</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
//             <CardHeader>
//               <CardTitle className="text-lg">Net Cash Flow</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">$43,210</div>
//               <div className="flex items-center mt-2 text-emerald-100">
//                 <LineChart className="w-4 h-4 mr-1" />
//                 <span>+15.2% vs last period</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
//             <CardHeader>
//               <CardTitle className="text-lg">Pending Transactions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">12</div>
//               <div className="flex items-center mt-2 text-purple-100">
//                 <RefreshCcw className="w-4 h-4 mr-1" />
//                 <span>Updated 5 min ago</span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <Card className="mb-8">
//           <CardHeader className="border-b">
//             <div className="flex justify-between items-center">
//               <CardTitle>Cashflow Records</CardTitle>
//               <Tabs value={activeTab} onValueChange={setActiveTab}>
//                 <TabsList className="grid grid-cols-5 w-[600px]">
//                   {timeframes.map((timeframe) => (
//                     <TabsTrigger
//                       key={timeframe.id}
//                       value={timeframe.id}
//                       className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
//                     >
//                       <timeframe.icon className="w-4 h-4 mr-2" />
//                       {timeframe.label}
//                     </TabsTrigger>
//                   ))}
//                 </TabsList>
//               </Tabs>
//             </div>
//           </CardHeader>
//           <CardContent className="p-6">
//             <ScrollArea className="h-[400px]">
//               <div className="space-y-4">
//                 {Array.from({ length: 10 }).map((_, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div
//                         className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                           index % 2 === 0
//                             ? "bg-blue-100 text-blue-600"
//                             : "bg-amber-100 text-amber-600"
//                         }`}
//                       >
//                         <LineChart className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium text-gray-900">
//                           {index % 2 === 0
//                             ? "Income Payment"
//                             : "Expense Payment"}{" "}
//                           #{index + 1}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Transaction ID: TRX-{index + 1000}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <Badge
//                         variant={index % 2 === 0 ? "default" : "destructive"}
//                       >
//                         {index % 2 === 0 ? "+$1,250.00" : "-$850.00"}
//                       </Badge>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="cursor-pointer"
//                       >
//                         <ChevronDown className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>
//           </CardContent>
//           <CardFooter className="border-t bg-gray-50">
//             <div className="flex justify-between items-center w-full text-sm text-gray-500">
//               <span>Showing 10 of 50 records</span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="!rounded-button whitespace-nowrap cursor-pointer"
//               >
//                 Load More
//               </Button>
//             </div>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CashflowList;


// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.






"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, ArrowUp, ChartLine, CircleArrowUp, Plus, SquareArrowDown, SquareArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// interface CashflowRecord {
//   id: string;
//   period: string;
//   date: string;
//   amount: number;
//   description: string;
//   category: string;
//   status: "completed" | "pending" | "failed";
// }

function Cashflow ({cashflows, name}) {
  const router = useRouter(); // For navigation
  const [activeTab, setActiveTab] = useState("DAILY");
  const [isLoading, setIsLoading] = useState(false);

//   const cashflowRecords = (cashflow) = [
//     {
//       id: "1",
//       period: "May 2, 2025",
//       date: "2025-05-02",
//       amount: 2500.0,
//       description: "Client payment - Project Alpha",
//       category: "Income",
//       status: "completed",
//     },
//     {
//       id: "2",
//       period: "May 2, 2025",
//       date: "2025-05-02",
//       amount: -450.75,
//       description: "Office supplies",
//       category: "Expense",
//       status: "completed",
//     },
//     {
//       id: "3",
//       period: "May 1, 2025",
//       date: "2025-05-01",
//       amount: -1200.0,
//       description: "Rent payment",
//       category: "Expense",
//       status: "completed",
//     },
//     {
//       id: "4",
//       period: "April 30, 2025",
//       date: "2025-04-30",
//       amount: 3750.5,
//       description: "Consulting services",
//       category: "Income",
//       status: "completed",
//     },
//     {
//       id: "5",
//       period: "April 29, 2025",
//       date: "2025-04-29",
//       amount: -320.25,
//       description: "Utility bills",
//       category: "Expense",
//       status: "pending",
//     },
//   ];
const cashflowRecords = cashflows;
const Name = name; // Fallback to a default name if not available


const accumulatedAmounts = cashflowRecords.reduce(
    (totals, record) => {
      if (record.activityTotal && Array.isArray(record.activityTotal)) {
        totals.operating += record.activityTotal[0] || 0; // Operating
        totals.investing += record.activityTotal[1] || 0; // Investing
        totals.financing += record.activityTotal[2] || 0; // Financing
      }
      return totals;
    },
    { operating: 0, investing: 0, financing: 0 }
  );
  const filteredRecords = cashflowRecords.filter(
    (record) => record.periodCashFlow === activeTab
  );



  const handleTabChange = (value) => {
    console.log("tab change: ", value)
    setIsLoading(true);
    setActiveTab(value);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleRecordClick = (id) => {
    console.log(`Navigating to record ${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


      const formatAmount = (amount) => {
          return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PHP",
          }).format(amount);
      };

      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

  return (
    // <div className="min-h-screen">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    //     <div className="mb-8">
    //       <h1 className="text-4xl font-bold text-blue-900 mb-2">
    //         Financial Dashboard
    //       </h1>
    //       <p className="text-blue-600">
    //         Track your cashflow with real-time insights
    //       </p>
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    //       <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-all duration-300">
    //         <h3 className="text-sm font-medium text-blue-600 mb-2">
    //           Accumulated Investing activities
    //         </h3>
    //         <p className="text-3xl font-bold text-blue-900">$8,050.50</p>
    //         <div className="flex items-center mt-3 text-sm text-blue-600">
    //           <i className="fas fa-chart-line mr-2"></i>
    //           <span>+12.5% from last period</span>
    //         </div>
    //       </Card>

    //       <Card className="p-6 border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-white transform hover:scale-105 transition-all duration-300">
    //         <h3 className="text-sm font-medium text-amber-600 mb-2">
    //           Accumulated Operating activities
    //         </h3>
    //         <p className="text-3xl font-bold text-amber-900">$2,236.49</p>
    //         <div className="flex items-center mt-3 text-sm text-amber-600">
    //           <i className="fas fa-chart-bar mr-2"></i>
    //           <span>+8.3% from last period</span>
    //         </div>
    //       </Card>

    //       <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-white transform hover:scale-105 transition-all duration-300">
    //         <h3 className="text-sm font-medium text-blue-700 mb-2">
    //           Accumulated Financing activities
    //         </h3>
    //         <p className="text-3xl font-bold text-blue-900">$5,814.01</p>
    //         <div className="flex items-center mt-3 text-sm text-blue-700">
    //           <i className="fas fa-arrow-trend-up mr-2"></i>
    //           <span>+15.2% from last period</span>
    //         </div>
    //       </Card>
    //     </div>

    //     <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
    //       <div className="flex items-center justify-between mb-6">
    //         <div>
    //           <h2 className="text-2xl font-bold text-blue-900 capitalize">
    //             {activeTab} Transactions
    //           </h2>
    //           <p className="text-blue-600">Manage your financial activities</p>
    //         </div>
    //         <div className="flex gap-4">
    //           <Button className="!rounded-button whitespace-nowrap cursor-pointer bg-blue-600 hover:bg-blue-700">
    //             <Plus className="w-4 h-4 mr-2" />
    //             New Transaction
    //           </Button>
    //           <Button
    //             className="!rounded-button whitespace-nowrap cursor-pointer"
    //             variant="outline"
    //           >
    //             <i className="fas fa-download mr-2"></i>
    //             Export
    //           </Button>
    //         </div>
    //       </div>

    //       <Tabs
    //         defaultValue="daily"
    //         value={activeTab}
    //         onValueChange={handleTabChange}
    //         className="w-full"
    //       >
    //         <TabsList className="grid grid-cols-5 gap-2 bg-blue-50 p-1 rounded-lg mb-6">
    //           <TabsTrigger
    //             value="daily"
    //             className="!rounded-button whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white"
    //           >
    //             Daily
    //           </TabsTrigger>
    //           <TabsTrigger
    //             value="weekly"
    //             className="!rounded-button whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white"
    //           >
    //             Weekly
    //           </TabsTrigger>
    //           <TabsTrigger
    //             value="monthly"
    //             className="!rounded-button whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white"
    //           >
    //             Monthly
    //           </TabsTrigger>
    //           <TabsTrigger
    //             value="yearly"
    //             className="!rounded-button whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white"
    //           >
    //             Yearly
    //           </TabsTrigger>
    //           <TabsTrigger
    //             value="fiscal"
    //             className="!rounded-button whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white"
    //           >
    //             Fiscal
    //           </TabsTrigger>
    //         </TabsList>
    //       </Tabs>

    //       {isLoading ? (
    //         <div className="space-y-4">
    //           {[1, 2, 3].map((item) => (
    //             <div
    //               key={item}
    //               className="flex items-center space-x-4 p-4 border border-blue-100 rounded-lg"
    //             >
    //               <Skeleton className="h-12 w-12 rounded-full" />
    //               <div className="space-y-2 flex-1">
    //                 <Skeleton className="h-4 w-[250px]" />
    //                 <Skeleton className="h-4 w-[200px]" />
    //               </div>
    //               <Skeleton className="h-8 w-[100px]" />
    //             </div>
    //           ))}
    //         </div>
    //       ) : (
    //         <ScrollArea className="h-[500px] pr-4">
    //           <div className="space-y-4">
    //             {cashflowRecords.map((record) => (
    //               <Card
    //                 key={record.id}
    //                 className="p-6 transition-all duration-300 hover:shadow-lg cursor-pointer border border-blue-100 hover:border-blue-300 bg-white"
    //                 onClick={() => handleRecordClick(record.id)}
    //               >
    //                 <div className="flex items-center justify-between">
    //                   <div className="flex items-start space-x-4">
    //                     <div
    //                       className={`w-12 h-12 rounded-full flex items-center justify-center ${record.amount > 0 ? "bg-blue-100" : "bg-amber-100"}`}
    //                     >
    //                       <i
    //                         className={`fas ${record.amount > 0 ? "fa-arrow-up text-blue-600" : "fa-arrow-down text-amber-600"}`}
    //                       ></i>
    //                     </div>
    //                     <div>
    //                       <h3 className="font-medium text-blue-900">
    //                         {record.description}
    //                       </h3>
    //                       <div className="flex items-center space-x-3 mt-1">
    //                         <span className="text-sm text-blue-600">
    //                           {record.period}
    //                         </span>
    //                         <span className="text-sm text-blue-300">•</span>
    //                         <span className="text-sm text-blue-600">
    //                           {record.category}
    //                         </span>
    //                       </div>
    //                     </div>
    //                   </div>
    //                   <div className="flex items-center space-x-4">
    //                     <Badge
    //                       className={`${getStatusColor(record.status)} capitalize`}
    //                     >
    //                       {record.status}
    //                     </Badge>
    //                     <span
    //                       className={`font-semibold text-lg ${record.amount > 0 ? "text-blue-600" : "text-amber-600"}`}
    //                     >
    //                       {record.amount > 0 ? "+" : ""}
    //                       {formatAmount(record.amount)}
    //                     </span>
    //                   </div>
    //                 </div>
    //               </Card>
    //             ))}
    //           </div>
    //         </ScrollArea>
    //       )}
    //     </div>
    //   </div>
    // </div>

    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Cashflow Statements
          </h1>
          <p className="text-blue-600">
            These are cashflow statements of {Name}
          </p>
        </div>

        {/* Accumulated Amounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-all duration-300">
            <h3 className="text-sm font-medium text-blue-600 mb-2">
              Accumulated Operating Activities
            </h3>
            <p className="text-3xl font-bold text-blue-900">
                {formatAmount(accumulatedAmounts.operating)}
            </p>
          </Card>

          <Card className="p-6 border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-white transform hover:scale-105 transition-all duration-300">
            <h3 className="text-sm font-medium text-amber-600 mb-2">
              Accumulated Investing Activities
            </h3>
            <p className="text-3xl font-bold text-amber-900">
            {formatAmount(accumulatedAmounts.investing)}
            </p>
          </Card>

          <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-white transform hover:scale-105 transition-all duration-300">
            <h3 className="text-sm font-medium text-blue-700 mb-2">
              Accumulated Financing Activities
            </h3>
            <p className="text-3xl font-bold text-blue-900">
                {formatAmount(accumulatedAmounts.financing)}
            </p>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 capitalize">
                {activeTab} Transactions
              </h2>
              <p className="text-blue-600">Manage your financial activities</p>
            </div>
          </div>

          <Tabs
            defaultValue="daily"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 gap-2 bg-blue-50 p-1 rounded-lg mb-6">
              {["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "FISCAL"].map(
                (period) => (
                  <TabsTrigger
                    key={period}
                    value={period}
                    className="!rounded-button whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-4 p-4 border border-blue-100 rounded-lg"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  // <Link >
                    <Card
                      key={record.id}
                      onClick={() => router.push(`/CashflowStatement/${record.accountId}/${record.id}`)}
                      className="p-6 transition-all duration-300 hover:shadow-lg cursor-pointer border border-blue-100 hover:border-blue-300 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center bg-sky-100`}
                          >
                            <i
                              className={`fas ${
                                record.netChange > 0
                                  ? "fa-arrow-up text-blue-600"
                                  : "fa-arrow-down text-amber-600"
                              }`}
                            ></i>
                              {/* <ChartLine  className={`fas ${
                                record.netChange > 0
                                  ? "fa-arrow-up text-green-600"
                                  : "fa-arrow-down text-red-600"
                              }`} /> */}
                              {record.netChange > 0
                                ? (<SquareArrowUp className="fa-arrow-down text-green-600"/>)
                                : (<SquareArrowDown className="fa-arrow-down text-red-600"/>)}
                              

                          </div>
                          <div>
                            <h3 className="font-medium text-blue-900">
                              {record.description}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-blue-600">
                                {formatDate(record.date)}
                              </span>
                              <span className="text-sm text-blue-300">•</span>
                              <span className="text-sm text-blue-600">
                                {record.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-lg cursor-pointer">
                                {formatAmount(record.startBalance)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gradient-to-br from-blue-50 to-blue-200 text-blue-900 p-4 rounded-lg shadow-md border border-blue-300">
                              <p className="text-sm font-medium">
                                <strong className="text-gold-600">Beginning Balance:</strong> {formatAmount(record.startBalance)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Tooltip for Ending Balance */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-lg cursor-pointer">
                                {formatAmount(record.endBalance)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gradient-to-br from-blue-50 to-blue-200 text-blue-900 p-4 rounded-lg shadow-md border border-blue-300">
                              <p className="text-sm font-medium">
                                <strong className="text-gold-600">Ending Balance:</strong> {formatAmount(record.endBalance)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                          <span
                            className={`font-semibold text-lg ${
                              record.netChange > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {record.netChange > 0 ? "+" : ""}
                            {formatAmount(record.netChange)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  // </Link>
                  
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cashflow;
